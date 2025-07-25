#!/usr/bin/env python3
"""
Main application class for Scizor Desktop
Handles QApplication setup and main window management
"""

import sys
from PyQt6.QtWidgets import QApplication
from PyQt6.QtCore import Qt
from ui.main_window import MainWindow


class ScizorApp:
    """Main application class"""
    
    def __init__(self):
        """Initialize the application"""
        self.app = None
        self.main_window = None
    
    def run(self):
        """Run the application"""
        # Create QApplication instance
        self.app = QApplication(sys.argv)
        self.app.setApplicationName("Scizor")
        self.app.setApplicationVersion("1.0.0")
        self.app.setOrganizationName("Scizor")
        
        # Set application properties (High DPI is enabled by default in Qt6)
        # Note: AA_EnableHighDpiScaling and AA_UseHighDpiPixmaps are deprecated in Qt6
        
        # Create and show main window
        self.main_window = MainWindow()
        self.main_window.show()
        
        # Start the event loop
        return self.app.exec()
    
    def quit(self):
        """Quit the application"""
        if self.app:
            self.app.quit() 