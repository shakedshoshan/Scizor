#!/usr/bin/env python3
"""
Run the main Scizor application with authentication panel visible
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from PyQt6.QtWidgets import QApplication
from ui.main_window import MainWindow

def main():
    """Run the main application"""
    app = QApplication(sys.argv)
    
    # Create main window
    window = MainWindow()
    
    # Force authentication to be visible
    window.current_settings['visibility']['authentication'] = True
    
    # Ensure authentication is first in the order
    if 'Authentication' not in window.current_settings['feature_order']:
        window.current_settings['feature_order'].insert(0, 'Authentication')
    
    # Rebuild layout to ensure authentication is visible
    window.rebuild_layout()
    
    # Show the window
    window.show()
    window.raise_()
    window.activateWindow()
    
    print("Main window created and shown")
    print("Authentication panel should be visible at the top")
    print("Look for:")
    print("- 🔐 Authentication title")
    print("- Yellow/orange background (unauthenticated state)")
    print("- 🌐 Sign In with Browser button")
    
    # Run the application
    sys.exit(app.exec())

if __name__ == "__main__":
    main() 