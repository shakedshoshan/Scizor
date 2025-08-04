#!/usr/bin/env python3
"""
Test script to verify the authentication UI is working properly
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from PyQt6.QtWidgets import QApplication, QMainWindow, QVBoxLayout, QWidget
from PyQt6.QtCore import Qt
from ui.auth.auth_panel import AuthPanel

class TestAuthWindow(QMainWindow):
    """Simple test window to show the authentication panel"""
    
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Scizor Auth Test")
        self.setGeometry(100, 100, 400, 600)
        
        # Create central widget
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        
        # Create layout
        layout = QVBoxLayout(central_widget)
        layout.setContentsMargins(20, 20, 20, 20)
        
        # Add authentication panel
        self.auth_panel = AuthPanel()
        layout.addWidget(self.auth_panel)
        
        # Connect signals
        self.auth_panel.auth_success.connect(self.on_auth_success)
        self.auth_panel.auth_failed.connect(self.on_auth_failed)
        
        print("Auth test window created successfully")
        print("Authentication panel should be visible")
    
    def on_auth_success(self, token_data):
        """Handle authentication success"""
        print(f"✅ Authentication successful: {token_data}")
    
    def on_auth_failed(self, error):
        """Handle authentication failure"""
        print(f"❌ Authentication failed: {error}")

def main():
    """Main function to test the authentication UI"""
    app = QApplication(sys.argv)
    
    # Create and show the test window
    window = TestAuthWindow()
    window.show()
    
    print("Test window should now be visible with the authentication panel")
    print("You should see:")
    print("- A title '🔐 Authentication'")
    print("- A description about signing in")
    print("- A '🌐 Sign In with Browser' button")
    print("- The panel should have a yellow/orange background (unauthenticated state)")
    
    # Run the application
    sys.exit(app.exec())

if __name__ == "__main__":
    main() 