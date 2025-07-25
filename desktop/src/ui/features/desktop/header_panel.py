#!/usr/bin/env python3
"""
Header Panel Feature Module
Handles the dashboard header with title and close button
"""

from PyQt6.QtWidgets import QFrame, QHBoxLayout, QLabel, QPushButton
from PyQt6.QtCore import Qt, pyqtSignal


class HeaderPanel(QFrame):
    """Header panel with title and close button"""
    
    # Signals
    close_requested = pyqtSignal()
    
    def __init__(self, parent=None):
        """Initialize the header panel"""
        super().__init__(parent)
        self.setup_ui()
        self.setup_connections()
        
    def setup_ui(self):
        """Setup the UI components"""
        self.setStyleSheet("""
            QFrame {
                background-color: #2c3e50;
                border-radius: 5px;
                padding: 5px;
            }
        """)
        
        layout = QHBoxLayout(self)
        layout.setContentsMargins(10, 5, 10, 5)
        
        # Title
        self.title_label = QLabel("Scizor")
        self.title_label.setStyleSheet("""
            QLabel {
                color: white;
                font-size: 16px;
                font-weight: bold;
            }
        """)
        
        # Close button
        self.close_btn = QPushButton("×")
        self.close_btn.setFixedSize(25, 25)
        self.close_btn.setStyleSheet("""
            QPushButton {
                background-color: #e74c3c;
                color: white;
                border: none;
                border-radius: 12px;
                font-size: 16px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #c0392b;
            }
        """)
        
        layout.addWidget(self.title_label)
        layout.addStretch()
        layout.addWidget(self.close_btn)
        
    def setup_connections(self):
        """Setup signal connections"""
        self.close_btn.clicked.connect(self.close_requested.emit)
        
    def set_title(self, title):
        """Set the header title"""
        self.title_label.setText(title)
        
    def set_close_button_visible(self, visible):
        """Show or hide the close button"""
        self.close_btn.setVisible(visible) 