"""
Device Flow Authentication Manager for Scizor Desktop Application
Implements PKCE (Proof Key for Code Exchange) flow for secure desktop authentication
"""

import os
import json
import base64
import hashlib
import secrets
import webbrowser
import threading
import time
from typing import Optional, Dict, Any
from urllib.parse import urlencode, parse_qs, urlparse
from http.server import HTTPServer, BaseHTTPRequestHandler
import requests
from PyQt6.QtCore import QObject, pyqtSignal
from pathlib import Path
import jwt
from database.db_connection import get_database


class AuthCallbackHandler(BaseHTTPRequestHandler):
    """HTTP server handler for receiving authorization codes"""
    
    def __init__(self, auth_manager, *args, **kwargs):
        self.auth_manager = auth_manager
        super().__init__(*args, **kwargs)
    
    def do_GET(self):
        """Handle GET requests from the website callback"""
        try:
            # Parse the callback URL
            parsed_url = urlparse(self.path)
            query_params = parse_qs(parsed_url.query)
            
            # Check if this is the auth callback
            if parsed_url.path == '/callback':
                code = query_params.get('code', [None])[0]
                error = query_params.get('error', [None])[0]
                
                if code:
                    # Store the authorization code
                    self.auth_manager.auth_code = code
                    self.auth_manager.auth_code_received.emit(code)
                    
                    # Send success response
                    self.send_response(200)
                    self.send_header('Content-type', 'text/html')
                    self.end_headers()
                    
                    success_html = """
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Authentication Successful</title>
                        <style>
                            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                            .success { color: #28a745; }
                            .message { margin: 20px 0; }
                        </style>
                    </head>
                    <body>
                        <h1 class="success">✅ Authentication Successful!</h1>
                        <div class="message">
                            <p>You have successfully authenticated with Scizor.</p>
                            <p>You can now close this window and return to the desktop application.</p>
                        </div>
                    </body>
                    </html>
                    """
                    self.wfile.write(success_html.encode())
                    
                elif error:
                    self.auth_manager.auth_error.emit(error)
                    
                    # Send error response
                    self.send_response(400)
                    self.send_header('Content-type', 'text/html')
                    self.end_headers()
                    
                    error_html = f"""
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Authentication Error</title>
                        <style>
                            body {{ font-family: Arial, sans-serif; text-align: center; padding: 50px; }}
                            .error {{ color: #dc3545; }}
                        </style>
                    </head>
                    <body>
                        <h1 class="error">❌ Authentication Error</h1>
                        <p>Error: {error}</p>
                        <p>Please try again.</p>
                    </body>
                    </html>
                    """
                    self.wfile.write(error_html.encode())
                else:
                    self.send_response(400)
                    self.send_header('Content-type', 'text/plain')
                    self.end_headers()
                    self.wfile.write(b'Invalid callback parameters')
            else:
                self.send_response(404)
                self.send_header('Content-type', 'text/plain')
                self.end_headers()
                self.wfile.write(b'Not found')
                
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'text/plain')
            self.end_headers()
            self.wfile.write(f'Server error: {str(e)}'.encode())
    
    def log_message(self, format, *args):
        """Suppress server logs"""
        pass


class DeviceAuthManager(QObject):
    """
    Manages device flow authentication for the desktop application with PKCE
    """
    
    # Signals
    auth_code_received = pyqtSignal(str)  # Emitted when auth code is received
    auth_error = pyqtSignal(str)  # Emitted when auth error occurs
    token_received = pyqtSignal(dict)  # Emitted when tokens are received
    token_error = pyqtSignal(str)  # Emitted when token exchange fails
    auth_completed = pyqtSignal(bool)  # Emitted when auth process completes
    
    def __init__(self):
        super().__init__()
        
        # Configuration
        self.client_id = "scizor-desktop-app"  # Your desktop app client ID
        self.redirect_uri = "http://localhost:8080/callback"
        self.auth_server_url = "http://localhost:3000"  # Your website URL
        self.backend_url = "https://uicah08f3a.execute-api.us-east-1.amazonaws.com/prod"  # Your backend URL
        self.jwt_secret = os.getenv('JWT_SECRET', 'your-secret-key')  # Should match backend JWT secret if verifying
        
        # PKCE parameters
        self.code_verifier = None
        self.code_challenge = None
        self.auth_code = None
        
        # Local server
        self.local_server = None
        self.server_thread = None
        
        # Token storage (database only - no file storage for security)
        self.tokens_file = self._get_tokens_file_path()  # For cleanup only
        
        # Database connection
        self.db = get_database()
        
        # Connect signals
        self.auth_code_received.connect(self._exchange_code_for_tokens)
        self.auth_error.connect(self._handle_auth_error)

    def verify_consent_token(self, consent_token: str) -> bool:
        """Basic JWT format validation without decoding (backend will handle all validation)"""
        try:
            # Simple format check - JWT should have 3 parts separated by dots
            parts = consent_token.split('.')
            return len(parts) == 3 and all(len(part) > 0 for part in parts)
        except Exception as e:
            print(f"Error checking consent token format: {e}")
            return False

    def process_consent_token(self, consent_token: str) -> bool:
        """Process JWT consent token - exchange directly with backend"""
        try:
            # Basic format validation only
            if not self.verify_consent_token(consent_token):
                self.auth_error.emit("Invalid consent token format")
                return False
            
            print("✅ Consent token format is valid, proceeding to exchange")
            
            # Exchange the consent token for access tokens (backend will handle all validation)
            return self._exchange_consent_token_for_tokens(consent_token)
            
        except Exception as e:
            error_msg = f"Error processing consent token: {str(e)}"
            self.auth_error.emit(error_msg)
            return False

    def _exchange_consent_token_for_tokens(self, consent_token: str) -> bool:
        """Exchange consent token for access tokens with PKCE validation"""
        try:
            # Make request to backend to exchange consent token for tokens
            exchange_data = {
                'consent_token': consent_token,
                'code_verifier': self.code_verifier,
                'redirect_uri': self.redirect_uri
            }
            
            print(f"🔍 Exchanging consent token with PKCE validation...")
            print(f"  Code verifier: {str(self.code_verifier)[:20]}...")
            print(f"  Redirect URI: {self.redirect_uri}")
            
            response = requests.post(
                f"{self.backend_url}/auth/device/token",
                json=exchange_data,
                timeout=30
            )
            
            # Try to parse JSON regardless of status
            try:
                payload = response.json()
            except Exception:
                payload = None
            
            if response.status_code == 200 and payload and payload.get('success'):
                token_data = payload['data']
                
                # Store ONLY JWT tokens in database (no user info for security)
                self.db.save_auth_tokens(
                    access_token=token_data['access_token'],
                    refresh_token=token_data['refresh_token'],
                    token_expiry=token_data.get('expires_in')
                )
                
                # Clear any file-based token storage
                self._clear_token_files()
                
                print("✅ Token exchange successful - JWT tokens stored securely")
                
                # Emit success signal
                self.token_received.emit(token_data)
                self.auth_completed.emit(True)
                return True
            else:
                # Build rich error message
                server_msg = None
                if payload is not None:
                    server_msg = payload.get('message') or payload.get('error')
                error_msg = f"Token exchange failed ({response.status_code}){': ' + server_msg if server_msg else ''}"
                self.token_error.emit(error_msg)
                self.auth_completed.emit(False)
                return False
                
        except Exception as e:
            error_msg = f"Error exchanging consent token for tokens: {str(e)}"
            self.token_error.emit(error_msg)
            self.auth_completed.emit(False)
            return False
    
    def _get_tokens_file_path(self) -> Path:
        """Get the path for legacy token files (for cleanup only)"""
        app_data_dir = Path.home() / ".scizor"
        app_data_dir.mkdir(exist_ok=True)
        return app_data_dir / "tokens.json" 
    
    def _clear_token_files(self):
        """Clear any file-based token storage for security"""
        try:
            if self.tokens_file.exists():
                self.tokens_file.unlink()
                print("✅ File-based token storage cleared")
        except Exception as e:
            print(f"Warning: Could not clear token files: {e}")
    
    def _generate_pkce_params(self):
        """Generate PKCE code verifier and challenge"""
        # Generate a random code verifier (32-128 characters)
        self.code_verifier = base64.urlsafe_b64encode(
            secrets.token_bytes(32)
        ).decode('utf-8').rstrip('=')
        
        # Generate code challenge using SHA256
        challenge_bytes = hashlib.sha256(self.code_verifier.encode('utf-8')).digest()
        self.code_challenge = base64.urlsafe_b64encode(challenge_bytes).decode('utf-8').rstrip('=')
        
        print(f"🔍 PKCE parameters generated:")
        print(f"  Code verifier: {self.code_verifier[:20]}...")
        print(f"  Code challenge: {self.code_challenge[:20]}...")
    
    def _check_connection(self):
        """Check connection to backend using health endpoint"""
        try:
            response = requests.get(
                f"{self.backend_url}/ai/health",
                timeout=10
            )
            if response.status_code == 200:
                print("✅ Backend connection successful")
                return True
            else:
                print(f"❌ Backend health check failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Backend connection failed: {e}")
            return False
    
    def start_auth_flow(self):
        """Start the device flow authentication process with PKCE"""
        try:
            # Check backend connection first
            if not self._check_connection():
                self.auth_error.emit("Backend connection failed. Please ensure the backend is running.")
                return False
            
            # Generate PKCE parameters
            self._generate_pkce_params()
            
            # Construct authorization URL with PKCE parameters
            auth_params = {
                'client_id': self.client_id,
                'redirect_uri': self.redirect_uri,
                'response_type': 'code',
                'scope': 'openid email profile',
                'code_challenge': self.code_challenge,
                'code_challenge_method': 'S256',
                'state': secrets.token_urlsafe(16)
            }
            
            # Use the main auth page for device authentication
            auth_url = f"{self.auth_server_url}/auth?{urlencode(auth_params)}"
            print(f"🔍 Starting PKCE authentication flow:")
            print(f"  Auth URL: {auth_url}")
            print(f"  Code challenge: {self.code_challenge[:20]}...")
            
            # Open browser for authentication
            webbrowser.open(auth_url)
            
            return True
            
        except Exception as e:
            self.auth_error.emit(f"Error starting auth flow: {str(e)}")
            return False
    
    def _exchange_code_for_tokens(self, auth_code: str):
        """Exchange authorization code for tokens (legacy flow)"""
        try:
            # Make request to backend to exchange code for tokens
            exchange_data = {
                'authorization_code': auth_code,
                'code_verifier': self.code_verifier,
                'redirect_uri': self.redirect_uri
            }
            
            response = requests.post(
                f"{self.backend_url}/auth/device/token",
                json=exchange_data,
                timeout=30
            )
            
            if response.status_code == 200:
                token_data = response.json()
                
                if token_data.get('success'):
                    # Store tokens
                    self.access_token = token_data['data']['access_token']
                    self.refresh_token = token_data['data']['refresh_token']
                    self.user_id = token_data['data']['user_id']
                    self.token_expiry = token_data['data']['expires_in']
                    
                    # Save tokens
                    self._save_tokens()
                    
                    # Emit success signal
                    self.token_received.emit(token_data['data'])
                    self.auth_completed.emit(True)
                else:
                    error_msg = token_data.get('message', 'Token exchange failed')
                    self.token_error.emit(error_msg)
                    self.auth_completed.emit(False)
            else:
                error_msg = f"Token exchange failed: {response.status_code}"
                self.token_error.emit(error_msg)
                self.auth_completed.emit(False)
                
        except Exception as e:
            error_msg = f"Error exchanging code for tokens: {str(e)}"
            self.token_error.emit(error_msg)
            self.auth_completed.emit(False)
    
    def exchange_authorization_code(self, auth_code: str):
        """Manually exchange authorization code for tokens (legacy support)"""
        try:
            # Make request to backend to exchange code for tokens
            exchange_data = {
                'authorization_code': auth_code,
                'code_verifier': self.code_verifier,
                'redirect_uri': self.redirect_uri
            }
            
            response = requests.post(
                f"{self.backend_url}/auth/device/token",
                json=exchange_data,
                timeout=30
            )
            
            if response.status_code == 200:
                token_data = response.json()
                
                if token_data.get('success'):
                    # Store tokens
                    self.access_token = token_data['data']['access_token']
                    self.refresh_token = token_data['data']['refresh_token']
                    self.user_id = token_data['data']['user_id']
                    self.token_expiry = token_data['data']['expires_in']
                    
                    # Save tokens
                    self._save_tokens()
                    
                    # Emit success signal
                    self.token_received.emit(token_data['data'])
                    self.auth_completed.emit(True)
                    return True
                else:
                    error_msg = token_data.get('message', 'Token exchange failed')
                    self.token_error.emit(error_msg)
                    self.auth_completed.emit(False)
                    return False
            else:
                error_msg = f"Token exchange failed: {response.status_code}"
                self.token_error.emit(error_msg)
                self.auth_completed.emit(False)
                return False
                
        except Exception as e:
            error_msg = f"Error exchanging authorization code for tokens: {str(e)}"
            self.token_error.emit(error_msg)
            self.auth_completed.emit(False)
            return False

    def exchange_token_or_code(self, token_or_code: str):
        """Exchange either a consent token or authorization code for tokens"""
        try:
            # Check if it's a JWT format (3 parts separated by dots)
            if self.verify_consent_token(token_or_code):
                # It's a valid JWT format, process as consent token
                return self.process_consent_token(token_or_code)
            else:
                # Try as legacy authorization code
                return self.exchange_authorization_code(token_or_code)
                
        except Exception as e:
            error_msg = f"Error processing token/code: {str(e)}"
            self.token_error.emit(error_msg)
            self.auth_completed.emit(False)
            return False
    
    def _handle_auth_error(self, error: str):
        """Handle authentication errors"""
        print(f"Authentication error: {error}")
        self.auth_completed.emit(False)
    
    def is_authenticated(self) -> bool:
        """Check if user is currently authenticated"""
        return self.db.is_authenticated()
    
    def refresh_tokens(self) -> bool:
        """Refresh access token using refresh token"""
        try:
            # Get current tokens from database
            tokens = self.db.get_current_auth_tokens()
            if not tokens or not tokens.get('refresh_token'):
                return False
            
            response = requests.post(
                f"{self.backend_url}/auth/device/refresh",
                json={'refresh_token': tokens['refresh_token']},
                timeout=30
            )
            
            if response.status_code == 200:
                token_data = response.json()
                
                if token_data.get('success'):
                    # Update tokens in database
                    self.db.update_auth_tokens(
                        access_token=token_data['data']['access_token'],
                        token_expiry=token_data['data'].get('expires_in')
                    )
                    print("✅ Token refresh successful")
                    return True
                else:
                    # Refresh failed, clear tokens
                    self.logout()
                    return False
            else:
                # Refresh failed, clear tokens
                self.logout()
                return False
                
        except Exception as e:
            print(f"Error refreshing tokens: {e}")
            self.logout()
            return False
    
    def get_authenticated_request_headers(self) -> Dict[str, str]:
        """Get headers for authenticated API requests"""
        try:
            tokens = self.db.get_current_auth_tokens()
            if tokens and tokens.get('access_token'):
                return {
                    'Authorization': f"Bearer {tokens['access_token']}",
                    'Content-Type': 'application/json'
                }
            return {}
        except Exception as e:
            print(f"Error getting authenticated headers: {e}")
            return {}
    
    def logout(self):
        """Logout and clear stored tokens"""
        try:
            # Clear all JWT tokens from database
            self.db.clear_all_auth_tokens()
            
            # Clear any file-based tokens
            self._clear_token_files()
            
            print("✅ Logout successful - all tokens cleared")
        except Exception as e:
            print(f"Error during logout: {e}")
    
    def get_auth_status(self) -> Dict[str, Any]:
        """Get current authentication status"""
        return {
            'authenticated': self.is_authenticated(),
            'tokens_available': self.db.get_current_auth_tokens() is not None
        } 