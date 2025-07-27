#!/usr/bin/env python3
"""
Test script for fixed hotkey functionality
Run this to test Ctrl+Alt+S and Ctrl+Alt+N hotkeys
"""

import sys
import os

# Add the src directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from PyQt6.QtWidgets import QApplication
from ui.main_window import MainWindow

def main():
    """Test the fixed hotkey functionality"""
    print("Starting Scizor Dashboard Test (Fixed)...")
    print("Press Ctrl+Alt+S to show/hide the dashboard")
    print("Select text, copy it (Ctrl+C), then press Ctrl+Alt+N to create a note")
    print("Press Ctrl+C in terminal to exit")
    
    # Create QApplication
    app = QApplication(sys.argv)
    
    # Create main window (hidden initially)
    window = MainWindow()
    
    # Show window initially for testing
    window.show()
    
    print("Dashboard is now visible. Test the hotkeys!")
    
    # Start the event loop
    return app.exec()

if __name__ == "__main__":
    sys.exit(main()) 