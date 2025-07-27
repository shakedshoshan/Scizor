#!/usr/bin/env python3
"""
Enhanced Clipboard Panel Feature Module
Enhanced clipboard history with search, categories, and better organization
"""

from PyQt6.QtWidgets import (
    QGroupBox, QVBoxLayout, QHBoxLayout, QListWidget, 
    QPushButton, QLabel, QListWidgetItem, QLineEdit,
    QComboBox, QSplitter, QTextEdit, QFrame, QScrollArea
)
from PyQt6.QtCore import Qt, pyqtSignal, QTimer
from PyQt6.QtGui import QFont, QTextCursor

from core.clipboard_manager import get_clipboard_manager


class EnhancedClipboardPanel(QGroupBox):
    """Enhanced clipboard history panel with advanced features"""
    
    # Signals
    clipboard_cleared = pyqtSignal()
    item_selected = pyqtSignal(str)
    item_copied = pyqtSignal(str)
    
    def __init__(self, parent=None):
        """Initialize the enhanced clipboard panel"""
        super().__init__("📋 Enhanced Clipboard", parent)
        self.clipboard_manager = get_clipboard_manager()
        self.search_timer = QTimer()
        self.search_timer.setSingleShot(True)
        self.search_timer.setInterval(300)
        
        self.setup_ui()
        self.setup_connections()
        self.load_clipboard_history()
        
    def setup_ui(self):
        """Setup the UI components"""
        self.setStyleSheet("""
            QGroupBox {
                font-weight: bold;
                border: 2px solid #3498db;
                border-radius: 8px;
                margin-top: 15px;
                padding-top: 15px;
                background-color: #f8f9fa;
            }
            QGroupBox::title {
                subcontrol-origin: margin;
                left: 15px;
                padding: 0 8px 0 8px;
                color: #2c3e50;
            }
        """)
        
        layout = QVBoxLayout(self)
        layout.setContentsMargins(10, 20, 10, 10)
        layout.setSpacing(10)
        
        # Search and filter section
        search_frame = QFrame()
        search_frame.setStyleSheet("""
            QFrame {
                background-color: white;
                border: 1px solid #bdc3c7;
                border-radius: 5px;
                padding: 5px;
            }
        """)
        search_layout = QVBoxLayout(search_frame)
        search_layout.setContentsMargins(8, 8, 8, 8)
        
        # Search bar
        search_layout_h = QHBoxLayout()
        search_label = QLabel("🔍 Search:")
        search_label.setStyleSheet("color: #2c3e50; font-weight: bold;")
        
        self.search_input = QLineEdit()
        self.search_input.setPlaceholderText("Search clipboard history...")
        self.search_input.setStyleSheet("""
            QLineEdit {
                border: 1px solid #bdc3c7;
                border-radius: 4px;
                padding: 6px;
                background-color: white;
                font-size: 11px;
            }
            QLineEdit:focus {
                border-color: #3498db;
            }
        """)
        
        # Filter dropdown
        self.filter_combo = QComboBox()
        self.filter_combo.addItems(["All", "Text", "URLs", "Code", "Recent"])
        self.filter_combo.setStyleSheet("""
            QComboBox {
                border: 1px solid #bdc3c7;
                border-radius: 4px;
                padding: 6px;
                background-color: white;
                font-size: 11px;
            }
        """)
        
        search_layout_h.addWidget(search_label)
        search_layout_h.addWidget(self.search_input, 1)
        search_layout_h.addWidget(self.filter_combo)
        search_layout.addLayout(search_layout_h)
        
        # Splitter for list and preview
        splitter = QSplitter(Qt.Orientation.Horizontal)
        
        # Clipboard list with enhanced styling
        list_frame = QFrame()
        list_frame.setStyleSheet("""
            QFrame {
                background-color: white;
                border: 1px solid #bdc3c7;
                border-radius: 5px;
            }
        """)
        list_layout = QVBoxLayout(list_frame)
        list_layout.setContentsMargins(5, 5, 5, 5)
        
        self.clipboard_list = QListWidget()
        self.clipboard_list.setMinimumHeight(400)
        self.clipboard_list.setAlternatingRowColors(True)
        self.clipboard_list.setSelectionMode(QListWidget.SelectionMode.SingleSelection)
        self.clipboard_list.setStyleSheet("""
            QListWidget {
                border: none;
                background-color: white;
                font-size: 11px;
            }
            QListWidget::item {
                padding: 8px;
                border-bottom: 1px solid #ecf0f1;
                border-radius: 3px;
                margin: 1px;
            }
            QListWidget::item:selected {
                background-color: #3498db;
                color: white;
                border: 1px solid #2980b9;
            }
            QListWidget::item:hover {
                background-color: #ecf0f1;
            }
        """)
        
        # Controls for clipboard list
        controls_layout = QHBoxLayout()
        
        self.copy_btn = QPushButton("📋 Copy")
        self.copy_btn.setStyleSheet("""
            QPushButton {
                background-color: #27ae60;
                color: white;
                border: none;
                border-radius: 4px;
                padding: 6px 12px;
                font-size: 11px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #229954;
            }
            QPushButton:pressed {
                background-color: #1e8449;
            }
        """)
        
        self.delete_btn = QPushButton("🗑️ Delete")
        self.delete_btn.setStyleSheet("""
            QPushButton {
                background-color: #e74c3c;
                color: white;
                border: none;
                border-radius: 4px;
                padding: 6px 12px;
                font-size: 11px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #c0392b;
            }
            QPushButton:pressed {
                background-color: #a93226;
            }
        """)
        
        self.clear_btn = QPushButton("🗑️ Clear All")
        self.clear_btn.setStyleSheet("""
            QPushButton {
                background-color: #95a5a6;
                color: white;
                border: none;
                border-radius: 4px;
                padding: 6px 12px;
                font-size: 11px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #7f8c8d;
            }
            QPushButton:pressed {
                background-color: #6c7b7d;
            }
        """)
        
        controls_layout.addWidget(self.copy_btn)
        controls_layout.addWidget(self.delete_btn)
        controls_layout.addStretch()
        controls_layout.addWidget(self.clear_btn)
        
        list_layout.addWidget(self.clipboard_list)
        list_layout.addLayout(controls_layout)
        
        # Preview panel
        preview_frame = QFrame()
        preview_frame.setStyleSheet("""
            QFrame {
                background-color: white;
                border: 1px solid #bdc3c7;
                border-radius: 5px;
            }
        """)
        preview_layout = QVBoxLayout(preview_frame)
        preview_layout.setContentsMargins(5, 5, 5, 5)
        
        preview_label = QLabel("📄 Preview")
        preview_label.setStyleSheet("color: #2c3e50; font-weight: bold; font-size: 12px;")
        
        self.preview_text = QTextEdit()
        self.preview_text.setReadOnly(True)
        self.preview_text.setMaximumHeight(300)
        self.preview_text.setStyleSheet("""
            QTextEdit {
                border: 1px solid #bdc3c7;
                border-radius: 4px;
                background-color: #f8f9fa;
                font-family: 'Consolas', 'Monaco', monospace;
                font-size: 10px;
                padding: 8px;
            }
        """)
        
        preview_layout.addWidget(preview_label)
        preview_layout.addWidget(self.preview_text)
        
        # Add frames to splitter
        splitter.addWidget(list_frame)
        splitter.addWidget(preview_frame)
        splitter.setSizes([300, 200])
        
        # Add widgets to main layout
        layout.addWidget(search_frame)
        layout.addWidget(splitter)
        
    def setup_connections(self):
        """Setup signal connections"""
        self.clipboard_manager.clipboard_history_updated.connect(self.update_clipboard_list)
        self.clipboard_list.itemClicked.connect(self.on_item_selected)
        self.clipboard_list.itemDoubleClicked.connect(self.on_item_double_clicked)
        
        self.copy_btn.clicked.connect(self.copy_selected_item)
        self.delete_btn.clicked.connect(self.delete_selected_item)
        self.clear_btn.clicked.connect(self.clear_clipboard)
        
        self.search_input.textChanged.connect(self.on_search_changed)
        self.filter_combo.currentTextChanged.connect(self.on_filter_changed)
        self.search_timer.timeout.connect(self.perform_search)
        
    def load_clipboard_history(self):
        """Load clipboard history from manager"""
        history = self.clipboard_manager.get_clipboard_history()
        self.update_clipboard_list(history)
        
    def update_clipboard_list(self, history_items):
        """Update the clipboard list with new items"""
        self.clipboard_list.clear()
        
        for item in history_items:
            content = item.get('content', '')
            if content:
                # Create a more detailed item display
                preview = content[:50] + "..." if len(content) > 50 else content
                timestamp = item.get('created_at', '')[:19] if item.get('created_at') else ''
                
                display_text = f"{preview}\n📅 {timestamp}"
                
                list_item = QListWidgetItem(display_text)
                list_item.setData(Qt.ItemDataRole.UserRole, item)
                self.clipboard_list.addItem(list_item)
                
    def on_item_selected(self, item):
        """Handle item selection"""
        item_data = item.data(Qt.ItemDataRole.UserRole)
        if item_data:
            content = item_data.get('content', '')
            self.preview_text.setPlainText(content)
            self.item_selected.emit(content)
            
    def on_item_double_clicked(self, item):
        """Handle item double click - copy to clipboard"""
        item_data = item.data(Qt.ItemDataRole.UserRole)
        if item_data:
            content = item_data.get('content', '')
            self.clipboard_manager.set_clipboard(content)
            self.item_copied.emit(content)
            
    def copy_selected_item(self):
        """Copy selected item to clipboard"""
        current_item = self.clipboard_list.currentItem()
        if current_item:
            self.on_item_double_clicked(current_item)
            
    def delete_selected_item(self):
        """Delete selected item"""
        current_item = self.clipboard_list.currentItem()
        if current_item:
            item_data = current_item.data(Qt.ItemDataRole.UserRole)
            if item_data:
                item_id = item_data.get('id')
                if item_id:
                    self.clipboard_manager.delete_item(item_id)
                    
    def clear_clipboard(self):
        """Clear all clipboard history"""
        self.clipboard_manager.clear_history()
        self.clipboard_cleared.emit()
        
    def on_search_changed(self):
        """Handle search input changes"""
        self.search_timer.start()
        
    def on_filter_changed(self):
        """Handle filter changes"""
        self.perform_search()
        
    def perform_search(self):
        """Perform search and filter operation"""
        search_term = self.search_input.text().lower()
        filter_type = self.filter_combo.currentText()
        
        # Get all items and filter them
        history = self.clipboard_manager.get_clipboard_history()
        filtered_items = []
        
        for item in history:
            content = item.get('content', '').lower()
            
            # Apply search filter
            if search_term and search_term not in content:
                continue
                
            # Apply type filter
            if filter_type == "URLs" and not (content.startswith('http://') or content.startswith('https://')):
                continue
            elif filter_type == "Code" and not any(keyword in content for keyword in ['def ', 'class ', 'import ', 'function', 'var ', 'const ']):
                continue
            elif filter_type == "Recent":
                # Show only items from last 24 hours (simplified)
                pass  # For now, show all items
                
            filtered_items.append(item)
            
        self.update_clipboard_list(filtered_items)
        
    def add_item(self, text):
        """Add a new item to the clipboard"""
        self.clipboard_manager.add_to_history(text)
        
    def get_selected_item(self):
        """Get the currently selected item text"""
        current_item = self.clipboard_list.currentItem()
        if current_item:
            item_data = current_item.data(Qt.ItemDataRole.UserRole)
            return item_data.get('content', '') if item_data else ''
        return ''
        
    def get_all_items(self):
        """Get all clipboard items"""
        return self.clipboard_manager.get_clipboard_history() 