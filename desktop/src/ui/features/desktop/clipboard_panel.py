#!/usr/bin/env python3
"""
Clipboard Panel Feature Module
Handles clipboard history and management
"""

from PyQt6.QtWidgets import (
    QGroupBox, QVBoxLayout, QHBoxLayout, QListWidget, 
    QPushButton, QLabel, QListWidgetItem
)
from PyQt6.QtCore import Qt, pyqtSignal
from PyQt6.QtGui import QFont

from core.clipboard_manager import get_clipboard_manager


class ClipboardPanel(QGroupBox):
    """Clipboard history panel with management features"""
    
    # Signals
    clipboard_cleared = pyqtSignal()
    item_selected = pyqtSignal(str)
    
    def __init__(self, parent=None):
        """Initialize the clipboard panel"""
        super().__init__("📋 Clipboard", parent)
        self.clipboard_manager = get_clipboard_manager()
        self.setup_ui()
        self.setup_connections()
        self.load_clipboard_history()
        
    def setup_ui(self):
        """Setup the UI components"""
        self.setStyleSheet("""
            QGroupBox {
                font-weight: bold;
                border: 2px solid #bdc3c7;
                border-radius: 5px;
                margin-top: 10px;
                padding-top: 10px;
            }
            QGroupBox::title {
                subcontrol-origin: margin;
                left: 10px;
                padding: 0 5px 0 5px;
            }
        """)
        
        layout = QVBoxLayout(self)
        layout.setContentsMargins(5, 15, 5, 5)
        
     
        
        # Clipboard list
        self.clipboard_list = QListWidget()
        self.clipboard_list.setMaximumHeight(120)
        self.clipboard_list.setAlternatingRowColors(True)
        self.clipboard_list.setSelectionMode(QListWidget.SelectionMode.SingleSelection)
        self.clipboard_list.setStyleSheet("""
            QListWidget {
                border: 1px solid #bdc3c7;
                border-radius: 3px;
                background-color: white;
            }
            QListWidget::item {
                padding: 3px;
                border-bottom: 1px solid #ecf0f1;
            }
            QListWidget::item:selected {
                background-color: #3498db;
                color: white;
            }
        """)
        
        # Controls
        controls_layout = QHBoxLayout()
        self.clear_btn = QPushButton("Clear")
        
        self.clear_btn.setMaximumHeight(25)
        self.clear_btn.setStyleSheet("""
            QPushButton {
                background-color: #95a5a6;
                color: white;
                border: none;
                border-radius: 3px;
                padding: 3px 8px;
                font-size: 11px;
            }
            QPushButton:hover {
                background-color: #7f8c8d;
            }
            QPushButton:pressed {
                background-color: #6c7b7d;
            }
        """)
        
        controls_layout.addWidget(self.clear_btn)
        
        # Add widgets to layout
        layout.addWidget(self.clipboard_list)
        layout.addLayout(controls_layout)
        
    def setup_connections(self):
        """Setup signal connections"""
        self.clear_btn.clicked.connect(self.clear_clipboard)
        self.clipboard_list.itemClicked.connect(self.on_item_selected)
        
        # Connect to clipboard manager signals
        self.clipboard_manager.clipboard_history_updated.connect(self.on_clipboard_history_updated)
        
    def load_clipboard_history(self):
        """Load clipboard history from database"""
        history = self.clipboard_manager.get_clipboard_history()
        self.update_clipboard_list(history)
        
    def update_clipboard_list(self, history_items):
        """Update the clipboard list with history items"""
        self.clipboard_list.clear()
        
        for item in history_items:
            content = item.get('content', '')
            if content:
                # Truncate long content for display
                display_text = content[:50] + "..." if len(content) > 50 else content
                
                list_item = QListWidgetItem(display_text)
                list_item.setData(Qt.ItemDataRole.UserRole, item)  # Store full item data
                list_item.setToolTip(content)  # Show full content on hover
                
                self.clipboard_list.addItem(list_item)
        

        
    def on_clipboard_history_updated(self, history_items):
        """Handle clipboard history update signal"""
        # Refresh the history from database
        self.load_clipboard_history()
        
        
    def clear_clipboard(self):
        """Clear all clipboard items"""
        if self.clipboard_manager.clear_history():
            self.clipboard_list.clear()
            self.clipboard_cleared.emit()
            
        
    def on_item_selected(self, item):
        """Handle item selection"""
        item_data = item.data(Qt.ItemDataRole.UserRole)
        if item_data:
            content = item_data.get('content', '')
            self.item_selected.emit(content)
            
            # Set the selected content to clipboard
            self.clipboard_manager.set_clipboard(content)
        
    def add_item(self, text):
        """Add a new item to clipboard history"""
        if text and text.strip():
            self.clipboard_manager.add_to_history(text.strip())
            
    def get_selected_item(self):
        """Get the currently selected item text"""
        current_item = self.clipboard_list.currentItem()
        if current_item:
            item_data = current_item.data(Qt.ItemDataRole.UserRole)
            return item_data.get('content', '') if item_data else None
        return None
        
    def get_all_items(self):
        """Get all clipboard items as a list"""
        items = []
        for i in range(self.clipboard_list.count()):
            item = self.clipboard_list.item(i)
            item_data = item.data(Qt.ItemDataRole.UserRole)
            if item_data:
                items.append(item_data.get('content', ''))
        return items 