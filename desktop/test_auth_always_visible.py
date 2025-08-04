#!/usr/bin/env python3
"""
Test script to verify that the authentication panel is always visible at the top
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from PyQt6.QtWidgets import QApplication
from ui.main_window import MainWindow

def main():
    """Test that authentication is always visible at the top"""
    app = QApplication(sys.argv)
    
    # Create main window
    window = MainWindow()
    
    # Show the window
    window.show()
    window.raise_()
    window.activateWindow()
    
    print("✅ Main window created successfully!")
    print("🔐 Authentication panel should ALWAYS be visible at the top")
    print("📋 You should see:")
    print("   1. Header panel at the very top")
    print("   2. 🔐 Authentication panel right below header")
    print("   3. Other panels below authentication")
    print("")
    print("🎨 Authentication panel should have:")
    print("   - Yellow/orange background (unauthenticated)")
    print("   - '🔐 Authentication' title")
    print("   - '🌐 Sign In with Browser' button")
    print("   - Description text")
    print("")
    print("🔧 The authentication panel will:")
    print("   - Always be visible regardless of settings")
    print("   - Always be positioned at the top (after header)")
    print("   - Have a fixed height of ~200px")
    print("   - Show different colors based on auth state")
    
    # Run the application
    sys.exit(app.exec())

if __name__ == "__main__":
    main() 