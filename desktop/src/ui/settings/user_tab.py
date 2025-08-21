#!/usr/bin/env python3
"""
User tab for Scizor Desktop Application
Handles user authentication and account management
"""

from PyQt6.QtWidgets import QWidget, QVBoxLayout, QGroupBox
from ui.settings.compact_auth_widget import CompactAuthWidget


class UserTab(QWidget):
    """User tab widget"""
    
    def __init__(self, parent=None):
        super().__init__(parent)
        self.init_ui()
        
    def init_ui(self):
        """Initialize the User tab UI"""
        layout = QVBoxLayout(self)
        layout.setSpacing(15)
        layout.setContentsMargins(15, 15, 15, 15)
        
        # Authentication section
        auth_group = QGroupBox("Account")
        auth_layout = QVBoxLayout(auth_group)
        
        # Add compact auth widget
        self.auth_widget = CompactAuthWidget()
        self.auth_widget.auth_success.connect(self.on_auth_success)
        self.auth_widget.auth_failed.connect(self.on_auth_failed)
        auth_layout.addWidget(self.auth_widget)
        
        layout.addWidget(auth_group)
        
        # Add some spacing at the bottom
        layout.addStretch()
        
    def on_auth_success(self, token_data: dict):
        """Handle authentication success"""
        print("✅ Authentication successful in settings")
        
    def on_auth_failed(self, error: str):
        """Handle authentication failure"""
        print(f"❌ Authentication failed in settings: {error}")
        
    def get_auth_widget(self):
        """Get the auth widget instance"""
        return self.auth_widget
