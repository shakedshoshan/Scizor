"""
Test file for device authentication flow
"""

import unittest
import tempfile
import os
import json
from unittest.mock import patch, MagicMock
from pathlib import Path

# Add the src directory to the path
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from auth.device_auth import DeviceAuthManager


class TestDeviceAuthManager(unittest.TestCase):
    """Test cases for DeviceAuthManager"""
    
    def setUp(self):
        """Set up test fixtures"""
        # Create a temporary directory for tokens
        self.temp_dir = tempfile.mkdtemp()
        self.tokens_file = Path(self.temp_dir) / "tokens.json"
        
        # Mock the tokens file path
        with patch.object(DeviceAuthManager, '_get_tokens_file_path', return_value=self.tokens_file):
            self.auth_manager = DeviceAuthManager()
    
    def tearDown(self):
        """Clean up test fixtures"""
        # Remove temporary directory
        import shutil
        shutil.rmtree(self.temp_dir)
    
    def test_generate_pkce_params(self):
        """Test PKCE parameter generation"""
        self.auth_manager._generate_pkce_params()
        
        # Check that code verifier and challenge are generated
        self.assertIsNotNone(self.auth_manager.code_verifier)
        self.assertIsNotNone(self.auth_manager.code_challenge)
        
        # Check that they are strings
        self.assertIsInstance(self.auth_manager.code_verifier, str)
        self.assertIsInstance(self.auth_manager.code_challenge, str)
        
        # Check that they are not empty
        self.assertGreater(len(self.auth_manager.code_verifier), 0)
        self.assertGreater(len(self.auth_manager.code_challenge), 0)
    
    def test_save_and_load_tokens(self):
        """Test token saving and loading"""
        # Set test tokens
        self.auth_manager.access_token = "test_access_token"
        self.auth_manager.refresh_token = "test_refresh_token"
        self.auth_manager.user_id = "test_user_id"
        self.auth_manager.token_expiry = 1234567890
        
        # Save tokens
        self.auth_manager._save_tokens()
        
        # Verify file was created
        self.assertTrue(self.tokens_file.exists())
        
        # Load tokens
        self.auth_manager._load_tokens()
        
        # Verify tokens were loaded correctly
        self.assertEqual(self.auth_manager.access_token, "test_access_token")
        self.assertEqual(self.auth_manager.refresh_token, "test_refresh_token")
        self.assertEqual(self.auth_manager.user_id, "test_user_id")
        self.assertEqual(self.auth_manager.token_expiry, 1234567890)
    
    def test_is_authenticated(self):
        """Test authentication status checking"""
        # Initially not authenticated
        self.assertFalse(self.auth_manager.is_authenticated())
        
        # Set access token
        self.auth_manager.access_token = "test_token"
        self.auth_manager.token_expiry = 9999999999  # Future timestamp
        
        # Should be authenticated
        self.assertTrue(self.auth_manager.is_authenticated())
        
        # Set expired token
        self.auth_manager.token_expiry = 0  # Past timestamp
        
        # Should not be authenticated (expired)
        self.assertFalse(self.auth_manager.is_authenticated())
    
    def test_logout(self):
        """Test logout functionality"""
        # Set test tokens
        self.auth_manager.access_token = "test_token"
        self.auth_manager.refresh_token = "test_refresh"
        self.auth_manager.user_id = "test_user"
        self.auth_manager.token_expiry = 1234567890
        
        # Save tokens
        self.auth_manager._save_tokens()
        
        # Logout
        self.auth_manager.logout()
        
        # Verify tokens are cleared
        self.assertIsNone(self.auth_manager.access_token)
        self.assertIsNone(self.auth_manager.refresh_token)
        self.assertIsNone(self.auth_manager.user_id)
        self.assertIsNone(self.auth_manager.token_expiry)
        
        # Verify tokens file is removed
        self.assertFalse(self.tokens_file.exists())
    
    @patch('webbrowser.open')
    @patch('auth.device_auth.HTTPServer')
    def test_start_auth_flow(self, mock_server, mock_webbrowser):
        """Test starting the authentication flow"""
        # Mock the server
        mock_server_instance = MagicMock()
        mock_server.return_value = mock_server_instance
        
        # Start auth flow
        result = self.auth_manager.start_auth_flow()
        
        # Verify flow started successfully
        self.assertTrue(result)
        
        # Verify PKCE parameters were generated
        self.assertIsNotNone(self.auth_manager.code_verifier)
        self.assertIsNotNone(self.auth_manager.code_challenge)
        
        # Verify server was started
        mock_server.assert_called_once()
        mock_server_instance.serve_forever.assert_called_once()
    
    def test_get_authenticated_request_headers(self):
        """Test getting authenticated request headers"""
        # Not authenticated
        headers = self.auth_manager.get_authenticated_request_headers()
        self.assertEqual(headers, {})
        
        # Authenticated
        self.auth_manager.access_token = "test_token"
        headers = self.auth_manager.get_authenticated_request_headers()
        self.assertEqual(headers, {
            'Authorization': 'Bearer test_token',
            'Content-Type': 'application/json'
        })


if __name__ == '__main__':
    unittest.main() 