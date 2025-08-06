#!/usr/bin/env python3
"""
Main application class for Scizor Desktop
Handles QApplication setup and main window management
"""

import sys
import os

# Force single process mode for Qt
os.environ['QT_SINGLEINSTANCE'] = '1'
os.environ['QT_AUTO_SCREEN_SCALE_FACTOR'] = '1'

from PyQt6.QtWidgets import QApplication
from PyQt6.QtCore import Qt
from PyQt6.QtGui import QIcon
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
        
        # Set comprehensive application properties for Task Manager display
        self.app.setApplicationName("Scizor Desktop")
        self.app.setApplicationDisplayName("Scizor Desktop")
        self.app.setApplicationVersion("1.0.0")
        self.app.setOrganizationName("Scizor")
        self.app.setOrganizationDomain("scizor.com")
        
        # Set the process name for Task Manager (Windows-specific)
        if hasattr(self.app, 'setApplicationId'):
            self.app.setApplicationId("com.scizor.desktop")
        
        # Set application icon using the Scizor icon
        icon_path = os.path.join(os.path.dirname(__file__), "resources", "icons", "scizor_icon.png")
        if os.path.exists(icon_path):
            self.app.setWindowIcon(QIcon(icon_path))
            print(f"Scizor icon loaded from: {icon_path}")
        else:
            print(f"Icon not found at: {icon_path}")
            # Try alternative paths
            alt_paths = [
                os.path.join(os.path.dirname(__file__), "resources", "icons", "scizor icon.png"),
                os.path.join(os.path.dirname(__file__), "resources", "icons", "scizor-icon.png")
            ]
            for alt_path in alt_paths:
                if os.path.exists(alt_path):
                    self.app.setWindowIcon(QIcon(alt_path))
                    print(f"Scizor icon loaded from alternative path: {alt_path}")
                    break
        
        # Set High DPI properties (Qt6 handles this automatically)
        
        # Create and show main window
        self.main_window = MainWindow()
        self.main_window.show()
        
        # Start the event loop
        return self.app.exec()
    
    def quit(self):
        """Quit the application"""
        if self.app:
            self.app.quit() 