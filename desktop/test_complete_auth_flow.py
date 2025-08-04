#!/usr/bin/env python3
"""
Test script to verify the complete authentication flow
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from PyQt6.QtWidgets import QApplication
from ui.main_window import MainWindow

def main():
    """Test the complete authentication flow"""
    app = QApplication(sys.argv)
    
    # Create main window
    window = MainWindow()
    
    # Show the window
    window.show()
    window.raise_()
    window.activateWindow()
    
    print("✅ Main window created successfully!")
    print("🔐 Authentication panel should be visible at the top")
    print("")
    print("📋 Complete Authentication Flow Test:")
    print("1. Click '🌐 Sign In with Browser' button")
    print("2. Browser should open to: http://localhost:3000/auth")
    print("3. You should see PKCE parameters in the URL")
    print("4. Sign in with email/password or Google")
    print("5. You'll be redirected to consent page")
    print("6. Click 'Grant Permission'")
    print("7. You'll be redirected back to desktop app")
    print("8. Desktop app should show authenticated state")
    print("")
    print("🎯 Expected URL format:")
    print("http://localhost:3000/auth?client_id=scizor-desktop-app&redirect_uri=http://localhost:8080/callback&code_challenge=...&code_challenge_method=S256&state=...&scope=openid email profile")
    print("")
    print("🔧 Make sure your website and backend are running:")
    print("  - Website: http://localhost:3000")
    print("  - Backend: http://localhost:3001")
    
    # Run the application
    sys.exit(app.exec())

if __name__ == "__main__":
    main() 