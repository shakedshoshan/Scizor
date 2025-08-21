#!/usr/bin/env python3
"""
Compact authentication widget for Scizor Desktop Application
Handles user authentication in a compact format
"""

from PyQt6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton, 
    QFrame, QLineEdit, QProgressBar, QMessageBox
)
from PyQt6.QtCore import Qt, pyqtSignal
from PyQt6.QtGui import QFont
from auth.device_auth import DeviceAuthManager


class CompactAuthWidget(QWidget):
    """Compact authentication widget for settings window"""
    
    # Signals
    auth_success = pyqtSignal(dict)  # Emitted when authentication succeeds
    auth_failed = pyqtSignal(str)    # Emitted when authentication fails
    
    def __init__(self):
        super().__init__()
        self.auth_manager = DeviceAuthManager()
        self.init_ui()
        self.setup_connections()
        
    def init_ui(self):
        """Initialize the compact UI components"""
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(8)
        
        # Main auth frame
        self.auth_frame = QFrame()
        self.auth_frame.setStyleSheet("""
            QFrame {
                background-color: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 6px;
                padding: 12px;
            }
        """)
        
        auth_layout = QVBoxLayout(self.auth_frame)
        auth_layout.setSpacing(8)
        
        # Header with icon and title
        header_layout = QHBoxLayout()
        auth_icon = QLabel("🔐")
        auth_icon.setFont(QFont("Arial", 12))
        header_layout.addWidget(auth_icon)
        
        self.auth_title = QLabel("Authentication")
        self.auth_title.setFont(QFont("Arial", 11, QFont.Weight.Bold))
        header_layout.addWidget(self.auth_title)
        header_layout.addStretch()
        
        auth_layout.addLayout(header_layout)
        
        # Status and action area
        self.status_area = QWidget()
        status_layout = QVBoxLayout(self.status_area)
        status_layout.setSpacing(6)
        
        # Status label
        self.status_label = QLabel("")
        self.status_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.status_label.setStyleSheet("color: #6b7280; font-size: 10px;")
        self.status_label.setWordWrap(True)
        status_layout.addWidget(self.status_label)
        
        # Action buttons
        self.action_layout = QHBoxLayout()
        
        # Sign in button
        self.sign_in_btn = QPushButton("Sign In")
        self.sign_in_btn.setStyleSheet("""
            QPushButton {
                background-color: #3B82F6;
                color: white;
                border: none;
                border-radius: 4px;
                padding: 6px 12px;
                font-size: 10px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #2563EB;
            }
            QPushButton:disabled {
                background-color: #9CA3AF;
            }
        """)
        self.action_layout.addWidget(self.sign_in_btn)
        
        # Sign out button
        self.sign_out_btn = QPushButton("Sign Out")
        self.sign_out_btn.setVisible(False)
        self.sign_out_btn.setStyleSheet("""
            QPushButton {
                background-color: #EF4444;
                color: white;
                border: none;
                border-radius: 4px;
                padding: 6px 12px;
                font-size: 10px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #DC2626;
            }
        """)
        self.action_layout.addWidget(self.sign_out_btn)
        
        status_layout.addLayout(self.action_layout)
        
        # Token input (hidden initially)
        self.token_frame = QFrame()
        self.token_frame.setVisible(False)
        self.token_frame.setStyleSheet("""
            QFrame {
                background-color: #ffffff;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                padding: 16px;
                margin: 8px 0px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
        """)
        
        token_layout = QVBoxLayout(self.token_frame)
        token_layout.setSpacing(6)
        
        # Token input
        self.token_input = QLineEdit()
        self.token_input.setPlaceholderText("Paste token from website...")
        self.token_input.setMinimumHeight(30)  # Increased height for better usability
        self.token_input.setStyleSheet("""
            QLineEdit {
                padding: 8px 12px;
                border: 2px solid #d1d5db;
                border-radius: 6px;
                font-size: 12px;
                background-color: white;
                color: #374151;
                font-weight: normal;
            }
            QLineEdit:focus {
                border-color: #3B82F6;
                border-width: 2px;
                background-color: #f8fafc;
            }
            QLineEdit:hover {
                border-color: #9ca3af;
            }
            QLineEdit:disabled {
                background-color: #f3f4f6;
                color: #9ca3af;
            }
        """)
        token_layout.addWidget(self.token_input)
        
        # Exchange button
        self.exchange_btn = QPushButton("Exchange Token")
        self.exchange_btn.setMinimumHeight(35)  # Increased height for better usability
        self.exchange_btn.setStyleSheet("""
            QPushButton {
                background-color: #10B981;
                color: white;
                border: none;
                border-radius: 6px;
                padding: 8px 16px;
                font-size: 12px;
                font-weight: bold;
                margin-top: 4px;
            }
            QPushButton:hover {
                background-color: #059669;
                transform: translateY(-1px);
            }
            QPushButton:pressed {
                background-color: #047857;
                transform: translateY(0px);
            }
            QPushButton:disabled {
                background-color: #9CA3AF;
                color: #6b7280;
            }
        """)
        token_layout.addWidget(self.exchange_btn)
        
        status_layout.addWidget(self.token_frame)
        
        # Progress bar
        self.progress_bar = QProgressBar()
        self.progress_bar.setVisible(False)
        self.progress_bar.setRange(0, 0)  # Indeterminate progress
        self.progress_bar.setMaximumHeight(4)
        self.progress_bar.setStyleSheet("""
            QProgressBar {
                border: none;
                background-color: #f1f5f9;
                border-radius: 2px;
            }
            QProgressBar::chunk {
                background-color: #3B82F6;
                border-radius: 2px;
            }
        """)
        status_layout.addWidget(self.progress_bar)
        
        auth_layout.addWidget(self.status_area)
        layout.addWidget(self.auth_frame)
        
        # Check if already authenticated
        self.check_auth_status()
    
    def setup_connections(self):
        """Setup signal connections"""
        self.sign_in_btn.clicked.connect(self.start_auth_flow)
        self.sign_out_btn.clicked.connect(self.logout)
        self.exchange_btn.clicked.connect(self.exchange_auth_code)
        
        # Connect token input to exchange button on Enter key
        self.token_input.returnPressed.connect(self.exchange_auth_code)
        
        # Connect auth manager signals
        self.auth_manager.auth_code_received.connect(self.on_auth_code_received)
        self.auth_manager.auth_error.connect(self.on_auth_error)
        self.auth_manager.token_received.connect(self.on_token_received)
        self.auth_manager.token_error.connect(self.on_token_error)
        self.auth_manager.auth_completed.connect(self.on_auth_completed)
    
    def exchange_auth_code(self):
        """Exchange the manually entered token"""
        token = self.token_input.text().strip()
        if not token:
            QMessageBox.warning(
                self,
                "Token Required",
                "Please enter the token from the website.",
                QMessageBox.StandardButton.Ok
            )
            return
        
        # Disable input and button during processing
        self.token_input.setEnabled(False)
        self.exchange_btn.setEnabled(False)
        self.progress_bar.setVisible(True)
        self.status_label.setText("Processing token...")
        
        # Update frame styling for loading state
        self.auth_frame.setStyleSheet("""
            QFrame {
                background-color: #dbeafe;
                border: 1px solid #3b82f6;
                border-radius: 6px;
                padding: 12px;
            }
        """)
        
        # Process the token
        success = self.auth_manager.exchange_token_or_code(token)
        if not success:
            self.on_token_error("Failed to process token")
    
    def show_token_input(self):
        """Show the token input"""
        self.sign_in_btn.setVisible(False)
        self.token_frame.setVisible(True)
        self.status_label.setText("Enter token from website")
        
        # Ensure token input is enabled and focusable
        self.token_input.setEnabled(True)
        self.token_input.setReadOnly(False)
        self.token_input.clear()
        self.token_input.setFocus()  # Set focus to the input field
        
        # Make sure the exchange button is visible and enabled
        self.exchange_btn.setVisible(True)
        self.exchange_btn.setEnabled(True)
    
    def hide_token_input(self):
        """Hide the token input"""
        self.token_frame.setVisible(False)
        self.token_input.clear()
        self.exchange_btn.setVisible(False)
    
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
        self.sign_out_btn.setVisible(False)
        self.progress_bar.setVisible(False)
        self.hide_token_input()
        self.status_label.setText("Not signed in")
        self.auth_title.setText("Authentication")
        
        # Make sure exchange button is hidden
        self.exchange_btn.setVisible(False)
        
        # Update frame styling
        self.auth_frame.setStyleSheet("""
            QFrame {
                background-color: #fef3c7;
                border: 1px solid #f59e0b;
                border-radius: 6px;
                padding: 12px;
            }
        """)
    
    def show_authenticated_state(self):
        """Show the authenticated state"""
        self.sign_in_btn.setVisible(False)
        self.sign_out_btn.setVisible(True)
        self.progress_bar.setVisible(False)
        self.hide_token_input()
        
        # Make sure exchange button is hidden
        self.exchange_btn.setVisible(False)
        
        # Get user info from database
        try:
            from database.db_connection import get_database
            db = get_database()
            user_info = db.get_current_authenticated_user()
            
            if user_info:
                email = user_info.get('email', 'Unknown')
                name = user_info.get('name', 'Unknown')
                display_name = name if name and name != 'Unknown' else email
                self.status_label.setText(f"Signed in as: {display_name}")
            else:
                # Fallback to auth manager
                user_info = self.auth_manager.get_user_info()
                if user_info:
                    email = user_info.get('email', 'Unknown')
                    self.status_label.setText(f"Signed in as: {email}")
                else:
                    self.status_label.setText("Signed in successfully")
        except Exception as e:
            print(f"Error getting user info: {e}")
            self.status_label.setText("Signed in successfully")
        
        self.auth_title.setText("✅ Authenticated")
        
        # Update frame styling
        self.auth_frame.setStyleSheet("""
            QFrame {
                background-color: #d1fae5;
                border: 1px solid #10b981;
                border-radius: 6px;
                padding: 12px;
            }
        """)
    
    def start_auth_flow(self):
        """Start the device flow authentication"""
        self.sign_in_btn.setEnabled(False)
        self.progress_bar.setVisible(True)
        self.status_label.setText("Opening browser...")
        
        # Update frame styling for loading state
        self.auth_frame.setStyleSheet("""
            QFrame {
                background-color: #dbeafe;
                border: 1px solid #3b82f6;
                border-radius: 6px;
                padding: 12px;
            }
        """)
        
        # Start the auth flow
        success = self.auth_manager.start_auth_flow()
        if success:
            # Show token input after opening browser
            self.show_token_input()
        else:
            self.on_auth_error("Failed to start authentication flow")
    
    def on_auth_code_received(self, auth_code: str):
        """Handle received authorization code"""
        self.status_label.setText("Code received, exchanging...")
    
    def on_auth_error(self, error: str):
        """Handle authentication errors"""
        self.sign_in_btn.setEnabled(True)
        self.progress_bar.setVisible(False)
        self.hide_token_input()
        self.status_label.setText(f"Error: {error}")
        
        # Reset frame styling
        self.auth_frame.setStyleSheet("""
            QFrame {
                background-color: #fef3c7;
                border: 1px solid #f59e0b;
                border-radius: 6px;
                padding: 12px;
            }
        """)
    
    def on_token_received(self, token_data: dict):
        """Handle received tokens"""
        self.status_label.setText("Authentication successful!")
        self.hide_token_input()
        self.auth_success.emit(token_data)
        self.show_authenticated_state()
    
    def on_token_error(self, error: str):
        """Handle token exchange errors"""
        self.sign_in_btn.setEnabled(True)
        self.progress_bar.setVisible(False)
        self.token_input.setEnabled(True)
        self.exchange_btn.setEnabled(True)
        self.status_label.setText(f"Token error: {error}")
        
        # Reset frame styling
        self.auth_frame.setStyleSheet("""
            QFrame {
                background-color: #fef3c7;
                border: 1px solid #f59e0b;
                border-radius: 6px;
                padding: 12px;
            }
        """)
    
    def on_auth_completed(self, success: bool):
        """Handle authentication completion"""
        if not success:
            self.sign_in_btn.setEnabled(True)
            self.progress_bar.setVisible(False)
    
    def logout(self):
        """Logout the user"""
        try:
            # Logout from auth manager
            self.auth_manager.logout()
            
            # Clear the token input
            self.token_input.clear()
            
            # Show unauthenticated state
            self.show_unauthenticated_state()
            
            # Emit logout signal
            self.auth_failed.emit("User logged out")
            
            print("✅ User logged out successfully")
            
        except Exception as e:
            print(f"Error during logout: {e}")
            # Still show unauthenticated state even if there's an error
            self.show_unauthenticated_state()
    
    def is_authenticated(self) -> bool:
        """Check if user is authenticated"""
        return self.auth_manager.is_authenticated()
    
    def get_auth_manager(self) -> DeviceAuthManager:
        """Get the auth manager instance"""
        return self.auth_manager
