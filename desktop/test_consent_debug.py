#!/usr/bin/env python3
"""
Test script to debug the consent page authorization code issue
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from PyQt6.QtWidgets import QApplication
from ui.main_window import MainWindow

def main():
    """Test the consent page with debug logging"""
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
    print("🐛 DEBUGGING CONSENT PAGE ISSUE:")
    print("1. Click '🌐 Sign In with Browser' button")
    print("2. Backend connection check will run")
    print("3. Browser should open to: http://localhost:3000/auth")
    print("4. Sign in with email/password or Google")
    print("5. You'll be redirected to consent page")
    print("6. 🔍 OPEN BROWSER DEVELOPER TOOLS (F12)")
    print("7. 🔍 CHECK CONSOLE FOR DEBUG LOGS:")
    print("   - Look for '🔍 Consent Page Debug' messages")
    print("   - Check if all URL parameters are present")
    print("   - Verify 'handleGrantPermission called' appears")
    print("   - Look for 'Generated auth code' message")
    print("8. Click 'Grant Permission' button")
    print("9. 🔍 CHECK CONSOLE AGAIN:")
    print("   - Should see '✅ Generated auth code:' message")
    print("   - Should see '✅ Auth code state updated' message")
    print("10. 🔍 CHECK IF AUTHORIZATION CODE APPEARS ON PAGE")
    print("")
    print("🔧 POSSIBLE ISSUES TO CHECK:")
    print("  - Are all URL parameters present? (client_id, redirect_uri, etc.)")
    print("  - Is the 'Grant Permission' button clickable?")
    print("  - Are there any JavaScript errors in console?")
    print("  - Is the authCode state being set correctly?")
    print("  - Is showAuthCode being set to true?")
    print("")
    print("📋 DEBUG STEPS:")
    print("  1. Open browser developer tools (F12)")
    print("  2. Go to Console tab")
    print("  3. Follow the authentication flow")
    print("  4. Check all debug messages")
    print("  5. Report any errors or missing messages")
    
    # Run the application
    sys.exit(app.exec())

if __name__ == "__main__":
    main() 