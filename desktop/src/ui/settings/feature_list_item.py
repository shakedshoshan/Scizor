#!/usr/bin/env python3
"""
Feature list item widget for Scizor Desktop Application
Custom widget for feature list items with icon and checkbox
"""

from PyQt6.QtWidgets import QWidget, QHBoxLayout, QLabel
from PyQt6.QtCore import Qt
from PyQt6.QtGui import QFont, QPixmap


class FeatureListItem(QWidget):
    """Custom widget for feature list items with icon and checkbox"""
    
    def __init__(self, feature_name, icon_path=None, enabled=True):
        super().__init__()
        self.feature_name = feature_name
        self.enabled = enabled
        self.init_ui(icon_path)
        
    def init_ui(self, icon_path):
        layout = QHBoxLayout(self)
        layout.setContentsMargins(10, 8, 10, 8)  # Increased margins
        layout.setSpacing(12)  # Increased spacing
        
        # Icon
        icon_label = QLabel()
        if icon_path:
            pixmap = QPixmap(icon_path)
            if not pixmap.isNull():
                icon_label.setPixmap(pixmap.scaled(24, 24, Qt.AspectRatioMode.KeepAspectRatio))  # Increased size
        else:
            # Default icon based on feature name
            icon_label.setText(self.get_default_icon(self.feature_name))
            icon_label.setStyleSheet("font-size: 18px;")  # Increased font size
        icon_label.setFixedSize(24, 24)  # Fixed size for consistency
        layout.addWidget(icon_label)
        
        # Feature name
        name_label = QLabel(self.feature_name)
        name_label.setFont(QFont("Arial", 11))  # Increased font size
        name_label.setWordWrap(True)  # Allow word wrapping
        name_label.setMinimumWidth(200)  # Set minimum width
        layout.addWidget(name_label)
        layout.addStretch()
        
        # Status indicator (checkbox-like)
        self.status_label = QLabel()
        self.status_label.setFixedSize(24, 24)  # Increased size
        self.status_label.setAlignment(Qt.AlignmentFlag.AlignCenter)  # Center alignment
        self.update_status()
        layout.addWidget(self.status_label)
        
    def get_default_icon(self, feature_name):
        """Get default icon text for feature"""
        icons = {
            "Clipboard History": "📋",
            "Notes": "📝", 
            "AI Prompt Enhancement": "🤖",
            "AI Smart Response": "🧠",
            "AI Translation": "🌍"
        }
        return icons.get(feature_name, "📄")
        
    def update_status(self):
        """Update the status indicator"""
        if self.enabled:
            self.status_label.setText("✓")
            self.status_label.setStyleSheet("color: green; font-weight: bold; font-size: 16px;")  # Increased font size
        else:
            self.status_label.setText("✗")
            self.status_label.setStyleSheet("color: red; font-weight: bold; font-size: 16px;")  # Increased font size
            
    def set_enabled(self, enabled):
        """Set the enabled status"""
        self.enabled = enabled
        self.update_status()
        
    def is_enabled(self):
        """Get the enabled status"""
        return self.enabled
