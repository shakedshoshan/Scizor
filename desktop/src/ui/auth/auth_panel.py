"""
Authentication Panel for Scizor Desktop Application
Provides UI for device flow authentication
"""

from PyQt6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QPushButton, 
    QLabel, QProgressBar, QMessageBox, QFrame, QLineEdit
)
from PyQt6.QtCore import Qt, pyqtSignal
from PyQt6.QtGui import QFont, QPixmap
from auth.device_auth import DeviceAuthManager


class AuthPanel(QWidget):
    """Authentication panel for desktop application"""
    
    # Signals
    auth_success = pyqtSignal(dict)  # Emitted when authentication succeeds
    auth_failed = pyqtSignal(str)    # Emitted when authentication fails
    
    def __init__(self):
        super().__init__()
        self.auth_manager = DeviceAuthManager()
        self.init_ui()
        self.setup_connections()
        
    def init_ui(self):
        """Initialize the UI components"""
        layout = QVBoxLayout(self)
        layout.setContentsMargins(15, 15, 15, 15)
        layout.setSpacing(12)
        
        # Set panel background and border
        self.setStyleSheet("""
            QWidget {
                background-color: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
            }
        """)
        
        # Title
        title_label = QLabel("🔐 Authentication")
        title_label.setFont(QFont("Arial", 14, QFont.Weight.Bold))
        title_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        title_label.setStyleSheet("color: #1f2937; margin-bottom: 5px;")
        layout.addWidget(title_label)
        
        # Description
        desc_label = QLabel(
            "Sign in to access AI-powered productivity tools and sync your data across devices."
        )
        desc_label.setWordWrap(True)
        desc_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        desc_label.setStyleSheet("color: #6b7280; font-size: 11px; margin-bottom: 10px;")
        layout.addWidget(desc_label)
        
        # Spacer
        layout.addStretch()
        
        # Sign in button
        self.sign_in_btn = QPushButton("🌐 Sign In with Browser")
        self.sign_in_btn.setMinimumHeight(45)
        self.sign_in_btn.setStyleSheet("""
            QPushButton {
                background-color: #3B82F6;
                color: white;
                border: none;
                border-radius: 6px;
                font-size: 13px;
                font-weight: bold;
                padding: 8px 16px;
            }
            QPushButton:hover {
                background-color: #2563EB;
            }
            QPushButton:pressed {
                background-color: #1D4ED8;
            }
            QPushButton:disabled {
                background-color: #9CA3AF;
            }
        """)
        layout.addWidget(self.sign_in_btn)
        
        # Authorization code input (hidden initially)
        self.auth_code_frame = QFrame()
        self.auth_code_frame.setVisible(False)
        self.auth_code_frame.setStyleSheet("""
            QFrame {
                background-color: #ffffff;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                padding: 12px;
            }
        """)
        
        auth_code_layout = QVBoxLayout(self.auth_code_frame)
        auth_code_layout.setSpacing(8)
        
        # Auth code label
        auth_code_label = QLabel("Enter Authorization Code:")
        auth_code_label.setStyleSheet("color: #374151; font-size: 12px; font-weight: bold;")
        auth_code_layout.addWidget(auth_code_label)
        
        # Auth code input
        self.auth_code_input = QLineEdit()
        self.auth_code_input.setPlaceholderText("Paste the authorization code here...")
        self.auth_code_input.setStyleSheet("""
            QLineEdit {
                padding: 8px;
                border: 1px solid #d1d5db;
                border-radius: 4px;
                font-size: 12px;
            }
            QLineEdit:focus {
                border-color: #3B82F6;
            }
        """)
        auth_code_layout.addWidget(self.auth_code_input)
        
        # Exchange button
        self.exchange_btn = QPushButton("🔐 Exchange Code")
        self.exchange_btn.setStyleSheet("""
            QPushButton {
                background-color: #10B981;
                color: white;
                border: none;
                border-radius: 4px;
                padding: 6px 12px;
                font-size: 11px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #059669;
            }
            QPushButton:pressed {
                background-color: #047857;
            }
        """)
        auth_code_layout.addWidget(self.exchange_btn)
        
        layout.addWidget(self.auth_code_frame)
        
        # Progress bar
        self.progress_bar = QProgressBar()
        self.progress_bar.setVisible(False)
        self.progress_bar.setRange(0, 0)  # Indeterminate progress
        self.progress_bar.setStyleSheet("""
            QProgressBar {
                border: 1px solid #e2e8f0;
                border-radius: 4px;
                text-align: center;
                background-color: #f1f5f9;
            }
            QProgressBar::chunk {
                background-color: #3B82F6;
                border-radius: 3px;
            }
        """)
        layout.addWidget(self.progress_bar)
        
        # Status label
        self.status_label = QLabel("")
        self.status_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.status_label.setStyleSheet("color: #6b7280; font-size: 11px; margin-top: 5px;")
        self.status_label.setWordWrap(True)
        layout.addWidget(self.status_label)
        
        # Spacer
        layout.addStretch()
        
        # User info frame (hidden initially)
        self.user_frame = QFrame()
        self.user_frame.setVisible(False)
        self.user_frame.setStyleSheet("""
            QFrame {
                background-color: #ffffff;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                padding: 12px;
            }
        """)
        
        user_layout = QVBoxLayout(self.user_frame)
        user_layout.setSpacing(8)
        
        # User info
        self.user_info_label = QLabel("")
        self.user_info_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.user_info_label.setStyleSheet("color: #374151; font-size: 12px; font-weight: bold;")
        user_layout.addWidget(self.user_info_label)
        
        # Sign out button
        self.sign_out_btn = QPushButton("🚪 Sign Out")
        self.sign_out_btn.setStyleSheet("""
            QPushButton {
                background-color: #EF4444;
                color: white;
                border: none;
                border-radius: 4px;
                padding: 6px 12px;
                font-size: 11px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #DC2626;
            }
            QPushButton:pressed {
                background-color: #B91C1C;
            }
        """)
        user_layout.addWidget(self.sign_out_btn)
        
        layout.addWidget(self.user_frame)
        
        # Check if already authenticated
        self.check_auth_status()
    
    def setup_connections(self):
        """Setup signal connections"""
        self.sign_in_btn.clicked.connect(self.start_auth_flow)
        self.sign_out_btn.clicked.connect(self.logout)
        self.exchange_btn.clicked.connect(self.exchange_auth_code)
        
        # Connect auth manager signals
        self.auth_manager.auth_code_received.connect(self.on_auth_code_received)
        self.auth_manager.auth_error.connect(self.on_auth_error)
        self.auth_manager.token_received.connect(self.on_token_received)
        self.auth_manager.token_error.connect(self.on_token_error)
        self.auth_manager.auth_completed.connect(self.on_auth_completed)
    
    def exchange_auth_code(self):
        """Exchange the manually entered authorization code"""
        auth_code = self.auth_code_input.text().strip()
        if not auth_code:
            QMessageBox.warning(
                self,
                "Authorization Code Required",
                "Please enter the authorization code from the website.",
                QMessageBox.StandardButton.Ok
            )
            return
        
        self.exchange_btn.setEnabled(False)
        self.progress_bar.setVisible(True)
        self.status_label.setText("Exchanging authorization code for tokens...")
        
        # Update panel styling for loading state
        self.setStyleSheet("""
            QWidget {
                background-color: #dbeafe;
                border: 1px solid #3b82f6;
                border-radius: 8px;
            }
        """)
        
        # Exchange the code
        success = self.auth_manager.exchange_authorization_code(auth_code)
        if not success:
            self.on_token_error("Failed to exchange authorization code")
    
    def show_auth_code_input(self):
        """Show the authorization code input"""
        self.sign_in_btn.setVisible(False)
        self.auth_code_frame.setVisible(True)
        self.status_label.setText("Please enter the authorization code from the website")
        
        # Update panel styling for waiting state
        self.setStyleSheet("""
            QWidget {
                background-color: #fef3c7;
                border: 1px solid #f59e0b;
                border-radius: 8px;
            }
        """)
    
    def hide_auth_code_input(self):
        """Hide the authorization code input"""
        self.auth_code_frame.setVisible(False)
        self.auth_code_input.clear()
    
    def check_auth_status(self):
        """Check if user is already authenticated"""
        if self.auth_manager.is_authenticated():
            self.show_authenticated_state()
        else:
            self.show_unauthenticated_state()
    
    def show_unauthenticated_state(self):
        """Show the unauthenticated state"""
        self.sign_in_btn.setVisible(True)
        self.sign_in_btn.setEnabled(True)
        self.progress_bar.setVisible(False)
        self.user_frame.setVisible(False)
        self.status_label.setText("")
        
        # Update panel styling for unauthenticated state
        self.setStyleSheet("""
            QWidget {
                background-color: #fef3c7;
                border: 1px solid #f59e0b;
                border-radius: 8px;
            }
        """)
    
    def show_authenticated_state(self):
        """Show the authenticated state"""
        self.sign_in_btn.setVisible(False)
        self.progress_bar.setVisible(False)
        self.user_frame.setVisible(True)
        
        # Get user info
        user_info = self.auth_manager.get_user_info()
        if user_info:
            email = user_info.get('email', 'Unknown')
            self.user_info_label.setText(f"✅ Signed in as: {email}")
        else:
            self.user_info_label.setText("✅ Signed in successfully")
        
        self.status_label.setText("")
        
        # Update panel styling for authenticated state
        self.setStyleSheet("""
            QWidget {
                background-color: #d1fae5;
                border: 1px solid #10b981;
                border-radius: 8px;
            }
        """)
    
    def start_auth_flow(self):
        """Start the device flow authentication"""
        self.sign_in_btn.setEnabled(False)
        self.progress_bar.setVisible(True)
        self.status_label.setText("Opening browser for authentication...")
        
        # Update panel styling for loading state
        self.setStyleSheet("""
            QWidget {
                background-color: #dbeafe;
                border: 1px solid #3b82f6;
                border-radius: 8px;
            }
        """)
        
        # Start the auth flow
        success = self.auth_manager.start_auth_flow()
        if success:
            # Show authorization code input after opening browser
            self.show_auth_code_input()
        else:
            self.on_auth_error("Failed to start authentication flow")
    
    def on_auth_code_received(self, auth_code: str):
        """Handle received authorization code"""
        self.status_label.setText("🔐 Authorization code received, exchanging for tokens...")
    
    def on_auth_error(self, error: str):
        """Handle authentication errors"""
        self.sign_in_btn.setEnabled(True)
        self.progress_bar.setVisible(False)
        self.hide_auth_code_input()
        self.status_label.setText(f"❌ Authentication error: {error}")
        
        # Reset panel styling
        self.setStyleSheet("""
            QWidget {
                background-color: #fef3c7;
                border: 1px solid #f59e0b;
                border-radius: 8px;
            }
        """)
        
        QMessageBox.warning(
            self,
            "Authentication Error",
            f"Failed to authenticate: {error}\n\nPlease try again.",
            QMessageBox.StandardButton.Ok
        )
    
    def on_token_received(self, token_data: dict):
        """Handle received tokens"""
        self.status_label.setText("✅ Authentication successful!")
        self.hide_auth_code_input()
        self.auth_success.emit(token_data)
        self.show_authenticated_state()
    
    def on_token_error(self, error: str):
        """Handle token exchange errors"""
        self.sign_in_btn.setEnabled(True)
        self.progress_bar.setVisible(False)
        self.exchange_btn.setEnabled(True)
        self.status_label.setText(f"❌ Token error: {error}")
        
        # Reset panel styling
        self.setStyleSheet("""
            QWidget {
                background-color: #fef3c7;
                border: 1px solid #f59e0b;
                border-radius: 8px;
            }
        """)
        
        QMessageBox.warning(
            self,
            "Token Error",
            f"Failed to exchange tokens: {error}\n\nPlease try again.",
            QMessageBox.StandardButton.Ok
        )
    
    def on_auth_completed(self, success: bool):
        """Handle authentication completion"""
        if not success:
            self.sign_in_btn.setEnabled(True)
            self.progress_bar.setVisible(False)
    
    def logout(self):
        """Logout the user"""
        self.auth_manager.logout()
        self.show_unauthenticated_state()
        self.auth_failed.emit("User logged out")
    
    def is_authenticated(self) -> bool:
        """Check if user is authenticated"""
        return self.auth_manager.is_authenticated()
    
    def get_auth_manager(self) -> DeviceAuthManager:
        """Get the auth manager instance"""
        return self.auth_manager 