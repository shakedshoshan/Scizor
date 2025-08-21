#!/usr/bin/env python3
"""
Settings window for Scizor Desktop Application
Allows users to customize feature organization on the main window
"""

from PyQt6.QtWidgets import (
    QDialog, QVBoxLayout, QHBoxLayout, QWidget, QLabel, 
    QPushButton, QDialogButtonBox, QMessageBox, QTabWidget
)
from PyQt6.QtCore import Qt, pyqtSignal
from PyQt6.QtGui import QFont
from database.db_connection import get_database
from ui.settings.app_settings_tab import AppSettingsTab
from ui.settings.user_tab import UserTab
from ui.settings.hotkeys_tab import HotkeysTab
import sys


class SettingsWindow(QDialog):
    """Settings window matching SnapPad - Settings design"""
    
    # Signal emitted when settings are applied
    settings_applied = pyqtSignal(dict)
    
    def __init__(self, parent=None):
        """Initialize the settings window"""
        super().__init__(parent)
        self.db = get_database()
        self.init_ui()
        self.load_settings_from_database()
        
    def init_ui(self):
        """Initialize the user interface"""
        self.setWindowTitle("SnapPad - Settings")
        self.setMinimumSize(600, 700)  # Increased window size for tabs
        self.setModal(True)
        
        # Create main layout
        layout = QVBoxLayout(self)
        layout.setSpacing(15)
        layout.setContentsMargins(20, 20, 20, 20)
        
        # Header with gear icon and shutdown button
        header_layout = QHBoxLayout()
        gear_label = QLabel("⚙️")
        gear_label.setFont(QFont("Arial", 16))
        header_layout.addWidget(gear_label)
        
        title_label = QLabel("Settings")
        title_label.setFont(QFont("Arial", 14, QFont.Weight.Bold))
        header_layout.addWidget(title_label)
        header_layout.addStretch()
        
        # Small shutdown button in top-right corner
        self.shutdown_btn = QPushButton("⏻")
        self.shutdown_btn.setToolTip("Shutdown Application")
        self.shutdown_btn.setFixedSize(32, 32)
        self.shutdown_btn.setStyleSheet("""
            QPushButton {
                background-color: #f44336;
                color: white;
                border: none;
                border-radius: 16px;
                font-weight: bold;
                font-size: 14px;
            }
            QPushButton:hover {
                background-color: #d32f2f;
            }
            QPushButton:pressed {
                background-color: #b71c1c;
            }
        """)
        header_layout.addWidget(self.shutdown_btn)
        
        layout.addLayout(header_layout)
        
        # Create tab widget
        self.tab_widget = QTabWidget()
        self.tab_widget.setStyleSheet("""
            QTabWidget::pane {
                border: 1px solid #d1d5db;
                border-radius: 6px;
                background-color: white;
            }
            QTabBar::tab {
                background-color: #f3f4f6;
                color: #374151;
                padding: 8px 16px;
                margin-right: 2px;
                border: 1px solid #d1d5db;
                border-bottom: none;
                border-top-left-radius: 4px;
                border-top-right-radius: 4px;
                font-weight: bold;
            }
            QTabBar::tab:selected {
                background-color: white;
                color: #1f2937;
                border-bottom: 2px solid #3B82F6;
            }
            QTabBar::tab:hover {
                background-color: #e5e7eb;
            }
            .scrollable-tab {
                background-color: white;
                border: none;
            }
        """)
        
        # Create App Settings tab
        self.app_settings_tab = AppSettingsTab()
        self.tab_widget.addTab(self.app_settings_tab, "App Settings")
        
        # Create User tab
        self.user_tab = UserTab()
        self.tab_widget.addTab(self.user_tab, "User")
        
        # Create Hotkeys tab
        self.hotkeys_tab = HotkeysTab()
        self.tab_widget.addTab(self.hotkeys_tab, "Hotkeys")
        
        layout.addWidget(self.tab_widget)
        
        # Dialog buttons
        button_box = QDialogButtonBox(
            QDialogButtonBox.StandardButton.Ok | 
            QDialogButtonBox.StandardButton.Cancel
        )
        button_box.accepted.connect(self.apply_settings)
        button_box.rejected.connect(self.reject)
        layout.addWidget(button_box)
        
        # Connect signals
        self.shutdown_btn.clicked.connect(self.shutdown_application)
        
        # Initialize features
        self.app_settings_tab.init_features()
        self.app_settings_tab.update_layout_info()
        
    def get_settings(self):
        """Get current settings as a dictionary"""
        return self.app_settings_tab.get_settings()
        
    def apply_settings(self):
        """Apply the current settings"""
        settings = self.get_settings()
        
        # Save settings to database
        try:
            self.db.save_layout_settings(settings)
            # Save translation language separately
            self.db.save_translation_language(settings.get('translation_language', 'Spanish'))
        except Exception as e:
            QMessageBox.warning(self, "Warning", f"Failed to save settings: {e}")
            return
            
        # Emit settings to parent
        self.settings_applied.emit(settings)
        self.accept()
        
    def load_settings(self, settings):
        """Load settings from a dictionary"""
        self.app_settings_tab.load_settings(settings)
    
    def load_settings_from_database(self):
        """Load settings from database"""
        self.app_settings_tab.load_settings_from_database(self.db)

    def shutdown_application(self):
        """Shutdown the application completely"""
        # Show confirmation dialog
        reply = QMessageBox.question(
            self, 
            "Confirm Shutdown", 
            "Are you sure you want to shutdown the application?\n\nThis will close all windows and terminate the application completely.",
            QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No,
            QMessageBox.StandardButton.No
        )
        
        if reply == QMessageBox.StandardButton.Yes:
            # Close the settings window first
            self.accept()
            
            # Get the main application instance and quit
            app = self.parent().parent() if self.parent() else None
            if app:
                app.quit()
            else:
                # Fallback: quit the entire application
                sys.exit(0)
