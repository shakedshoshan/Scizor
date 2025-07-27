#!/usr/bin/env python3
"""
Enhanced Header Panel Feature Module
Enhanced header with additional controls for the expanded window
"""

from PyQt6.QtWidgets import (
    QHBoxLayout, QPushButton, QLabel, 
    QFrame
)
from PyQt6.QtCore import pyqtSignal
from PyQt6.QtGui import QFont


class EnhancedHeaderPanel(QFrame):
    """Enhanced header panel with additional controls"""
    
    # Signals
    settings_requested = pyqtSignal()
    
    def __init__(self, parent=None):
        """Initialize the enhanced header panel"""
        super().__init__(parent)
        self.setup_ui()
        self.setup_connections()
        
    def setup_ui(self):
        """Setup the UI components"""
        self.setFixedHeight(50)
        self.setStyleSheet("""
            QFrame {
                background: qlineargradient(x1:0, y1:0, x2:0, y2:1,
                    stop:0 #2c3e50, stop:1 #34495e);
                border: none;
                border-radius: 8px 8px 0px 0px;
            }
        """)
        
        layout = QHBoxLayout(self)
        layout.setContentsMargins(15, 10, 15, 10)
        layout.setSpacing(10)
        
        # Title
        title_label = QLabel("Scizor Enhanced Dashboard")
        title_label.setFont(QFont("Segoe UI", 12, QFont.Weight.Bold))
        title_label.setStyleSheet("color: white;")
        
        # Control buttons
        self.settings_btn = QPushButton("⚙️")
        self.settings_btn.setFixedSize(30, 30)
        self.settings_btn.setStyleSheet("""
            QPushButton {
                background-color: #3498db;
                color: white;
                border: none;
                border-radius: 15px;
                font-size: 14px;
            }
            QPushButton:hover {
                background-color: #2980b9;
            }
            QPushButton:pressed {
                background-color: #21618c;
            }
        """)
        # Add widgets to layout
        layout.addWidget(title_label)
        layout.addStretch()
        layout.addWidget(self.settings_btn)

        
    def setup_connections(self):
        """Setup signal connections"""
        self.settings_btn.clicked.connect(self.settings_requested.emit)