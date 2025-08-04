#!/usr/bin/env python3
"""
Test script to verify the new authentication flow without local server
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from PyQt6.QtWidgets import QApplication
from ui.main_window import MainWindow

def main():
    """Test the new authentication flow without local server"""
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
    print("📋 New Authentication Flow Test (No Local Server):")
    print("1. Click '🌐 Sign In with Browser' button")
    print("2. Backend connection check will run")
    print("3. Browser should open to: http://localhost:3000/auth")
    print("4. Sign in with email/password or Google")
    print("5. You'll be redirected to consent page")
    print("6. Click 'Grant Permission'")
    print("7. Copy the authorization code from the alert")
    print("8. Paste the code in the desktop app input field")
    print("9. Click '🔐 Exchange Code' button")
    print("10. Desktop app should show authenticated state")
    print("")
    print("🔧 Backend Health Check:")
    print("  - Uses: http://localhost:3001/ai/health")
    print("  - Ensures backend is running before auth")
    print("")
    print("🎯 Benefits of New Flow:")
    print("  - No local server required")
    print("  - Simple connection check")
    print("  - Manual authorization code entry")
    print("  - More reliable and secure")
    
    # Run the application
    sys.exit(app.exec())

if __name__ == "__main__":
    main() 