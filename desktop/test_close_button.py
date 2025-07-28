#!/usr/bin/env python3
"""
Test script for close button functionality
Run this to test the X button in the header panel
"""

import sys
import os

# Add the src directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from PyQt6.QtWidgets import QApplication
from ui.main_window import MainWindow

def main():
    """Test the close button functionality"""
    print("Starting Scizor Dashboard Close Button Test...")
    print("Click the X button in the header to hide the dashboard")
    print("Press Ctrl+Alt+S to show it again")
    print("Press Ctrl+C in terminal to exit")
    
    # Create QApplication
    app = QApplication(sys.argv)
    
    # Create main window (visible initially)
    window = MainWindow()
    window.show()
    
    print("Dashboard is now visible. Click the X button to test hiding!")
    
    # Start the event loop
    return app.exec()

if __name__ == "__main__":
    main() 