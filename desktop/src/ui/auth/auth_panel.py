"""
Authentication Panel for Scizor Desktop Application
Provides UI for device flow authentication
"""

from PyQt6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QPushButton, 
    QLabel, QProgressBar, QMessageBox, QFrame
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
        layout.setContentsMargins(20, 20, 20, 20)
        layout.setSpacing(15)
        
        # Title
        title_label = QLabel("Sign In to Scizor")
        title_label.setFont(QFont("Arial", 16, QFont.Weight.Bold))
        title_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(title_label)
        
        # Description
        desc_label = QLabel(
            "Sign in to access your AI-powered productivity tools and sync your data across devices."
        )
        desc_label.setWordWrap(True)
        desc_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        desc_label.setStyleSheet("color: #666;")
        layout.addWidget(desc_label)
        
        # Spacer
        layout.addStretch()
        
        # Sign in button
        self.sign_in_btn = QPushButton("Sign In with Browser")
        self.sign_in_btn.setMinimumHeight(50)
        self.sign_in_btn.setStyleSheet("""
            QPushButton {
                background-color: #3B82F6;
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 14px;
                font-weight: bold;
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
        
        # Progress bar
        self.progress_bar = QProgressBar()
        self.progress_bar.setVisible(False)
        self.progress_bar.setRange(0, 0)  # Indeterminate progress
        layout.addWidget(self.progress_bar)
        
        # Status label
        self.status_label = QLabel("")
        self.status_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.status_label.setStyleSheet("color: #666; font-size: 12px;")
        layout.addWidget(self.status_label)
        
        # Spacer
        layout.addStretch()
        
        # User info frame (hidden initially)
        self.user_frame = QFrame()
        self.user_frame.setVisible(False)
        self.user_frame.setStyleSheet("""
            QFrame {
                background-color: #F3F4F6;
                border-radius: 8px;
                padding: 10px;
            }
        """)
        
        user_layout = QVBoxLayout(self.user_frame)
        
        # User info
        self.user_info_label = QLabel("")
        self.user_info_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        user_layout.addWidget(self.user_info_label)
        
        # Sign out button
        self.sign_out_btn = QPushButton("Sign Out")
        self.sign_out_btn.setStyleSheet("""
            QPushButton {
                background-color: #EF4444;
                color: white;
                border: none;
                border-radius: 6px;
                padding: 8px 16px;
                font-size: 12px;
            }
            QPushButton:hover {
                background-color: #DC2626;
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
        
        # Connect auth manager signals
        self.auth_manager.auth_code_received.connect(self.on_auth_code_received)
        self.auth_manager.auth_error.connect(self.on_auth_error)
        self.auth_manager.token_received.connect(self.on_token_received)
        self.auth_manager.token_error.connect(self.on_token_error)
        self.auth_manager.auth_completed.connect(self.on_auth_completed)
    
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
    
    def show_authenticated_state(self):
        """Show the authenticated state"""
        self.sign_in_btn.setVisible(False)
        self.progress_bar.setVisible(False)
        self.user_frame.setVisible(True)
        
        # Get user info
        user_info = self.auth_manager.get_user_info()
        if user_info:
            self.user_info_label.setText(f"Signed in as: {user_info.get('email', 'Unknown')}")
        else:
            self.user_info_label.setText("Signed in")
        
        self.status_label.setText("")
    
    def start_auth_flow(self):
        """Start the device flow authentication"""
        self.sign_in_btn.setEnabled(False)
        self.progress_bar.setVisible(True)
        self.status_label.setText("Opening browser for authentication...")
        
        # Start the auth flow
        success = self.auth_manager.start_auth_flow()
        if not success:
            self.on_auth_error("Failed to start authentication flow")
    
    def on_auth_code_received(self, auth_code: str):
        """Handle received authorization code"""
        self.status_label.setText("Authorization code received, exchanging for tokens...")
    
    def on_auth_error(self, error: str):
        """Handle authentication errors"""
        self.sign_in_btn.setEnabled(True)
        self.progress_bar.setVisible(False)
        self.status_label.setText(f"Authentication error: {error}")
        
        QMessageBox.warning(
            self,
            "Authentication Error",
            f"Failed to authenticate: {error}\n\nPlease try again.",
            QMessageBox.StandardButton.Ok
        )
    
    def on_token_received(self, token_data: dict):
        """Handle received tokens"""
        self.status_label.setText("Authentication successful!")
        self.auth_success.emit(token_data)
        self.show_authenticated_state()
    
    def on_token_error(self, error: str):
        """Handle token exchange errors"""
        self.sign_in_btn.setEnabled(True)
        self.progress_bar.setVisible(False)
        self.status_label.setText(f"Token error: {error}")
        
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