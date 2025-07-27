#!/usr/bin/env python3
"""
Notes Panel Feature Module
Handles quick notes and text editing with database integration
"""

from PyQt6.QtWidgets import (
    QGroupBox, QVBoxLayout, QHBoxLayout, QTextEdit, 
    QPushButton, QFileDialog, QMessageBox, QListWidget,
    QListWidgetItem, QLabel, QComboBox, QLineEdit, QDialog,
    QFormLayout, QSpinBox, QDialogButtonBox, QScrollArea,
    QWidget, QFrame, QSizePolicy, QCheckBox
)
from PyQt6.QtCore import Qt, pyqtSignal, QSize
from PyQt6.QtGui import QFont, QPalette, QColor
import os
import sys

# Import the core modules using absolute imports
from core import get_notes_manager


class NoteCard(QFrame):
    """Individual note card widget"""
    
    def __init__(self, note_data, notes_panel, parent=None):
        super().__init__(parent)
        self.note_data = note_data
        self.notes_panel = notes_panel
        self.setup_ui()
        self.setup_connections()
        
    def setup_ui(self):
        """Setup the note card UI"""
        self.setFrameStyle(QFrame.Shape.StyledPanel)
        self.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)
        self.setMinimumHeight(120)
        self.setMaximumHeight(180)
        
        # Card styling to match the image
        self.setStyleSheet("""
            QFrame {
                background-color: white;
                border: none;
                border-radius: 8px;
                margin: 4px;
            }
        """)
        
        layout = QVBoxLayout(self)
        layout.setContentsMargins(16, 16, 16, 16)
        layout.setSpacing(8)
        
        # Header with title and priority
        header_layout = QHBoxLayout()
        
        # Title (truncated)
        title = self.note_data.get('title') or 'Untitled'
        if len(title) > 35:
            title = title[:32] + "..."
        
        title_label = QLabel(title)
        title_label.setFont(QFont("Segoe UI", 10, QFont.Weight.Bold))
        title_label.setStyleSheet("color: #2c3e50;")
        title_label.setWordWrap(True)
        
        # Priority tag (orange badge as shown in image)
        priority = self.note_data.get('priority', 1)
        priority_label = QLabel(str(priority))
        priority_label.setFixedSize(20, 20)
        priority_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        priority_label.setStyleSheet(f"""
            background-color: {self.get_priority_color(priority)};
            color: white;
            border-radius: 10px;
            font-weight: bold;
            font-size: 10px;
        """)
        
        header_layout.addWidget(title_label, 1)
        header_layout.addWidget(priority_label)
        
        # Full content (not truncated)
        content = self.note_data.get('content', '')
        content_label = QLabel(content)
        content_label.setWordWrap(True)
        content_label.setStyleSheet("""
            color: #34495e;
            font-size: 11px;
            line-height: 1.4;
            padding: 4px 0;
        """)
        
        # Metadata with both creation and update dates
        created_at = self.note_data.get('created_at', '')
        updated_at = self.note_data.get('updated_at', '')
        
        metadata_text = f"Created: {created_at[:10] if created_at else 'Unknown'}"
        if updated_at and updated_at != created_at:
            metadata_text += f" | Updated: {updated_at[:10]}"
        
        metadata_label = QLabel(metadata_text)
        metadata_label.setStyleSheet("""
            color: #7f8c8d;
            font-size: 10px;
            font-style: italic;
        """)
        
        # Action buttons (left side: Edit, Del, right side: Copy)
        actions_layout = QHBoxLayout()
        
        # Left side buttons
        left_buttons_layout = QHBoxLayout()
        
        edit_btn = QPushButton("Edit")
        edit_btn.setFixedSize(50, 25)
        edit_btn.setStyleSheet("""
            QPushButton {
                background-color: #3498db;
                color: white;
                border: none;
                border-radius: 4px;
                font-size: 10px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #2980b9;
            }
        """)
        
        delete_btn = QPushButton("Del")
        delete_btn.setFixedSize(40, 25)
        delete_btn.setStyleSheet("""
            QPushButton {
                background-color: #e74c3c;
                color: white;
                border: none;
                border-radius: 4px;
                font-size: 10px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #c0392b;
            }
        """)
        
        left_buttons_layout.addWidget(edit_btn)
        left_buttons_layout.addWidget(delete_btn)
        left_buttons_layout.addStretch()
        
        # Right side button
        copy_btn = QPushButton("Copy")
        copy_btn.setFixedSize(50, 25)
        copy_btn.setStyleSheet("""
            QPushButton {
                background-color: #9b59b6;
                color: white;
                border: none;
                border-radius: 4px;
                font-size: 10px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #8e44ad;
            }
        """)
        
        actions_layout.addLayout(left_buttons_layout)
        actions_layout.addWidget(copy_btn)
        
        # Store button references
        self.edit_btn = edit_btn
        self.delete_btn = delete_btn
        self.copy_btn = copy_btn
        
        # Add all widgets to layout
        layout.addLayout(header_layout)
        layout.addWidget(content_label, 1)
        layout.addWidget(metadata_label)
        layout.addLayout(actions_layout)
        
    def setup_connections(self):
        """Setup button connections"""
        self.edit_btn.clicked.connect(lambda: self.notes_panel.edit_note(self.note_data['id']))
        self.delete_btn.clicked.connect(lambda: self.notes_panel.delete_note(self.note_data['id']))
        self.copy_btn.clicked.connect(lambda: self.notes_panel.copy_note_content(self.note_data))
        
    def get_priority_color(self, priority):
        """Get color for priority tag - orange for priority 2 as shown in image"""
        colors = {
            1: "#95a5a6",  # Gray
            2: "#f39c12",  # Orange (as shown in image)
            3: "#f1c40f",  # Yellow
            4: "#e67e22",  # Dark Orange
            5: "#e74c3c"   # Red
        }
        return colors.get(priority, "#95a5a6")


class NoteDialog(QDialog):
    """Dialog for creating/editing notes"""
    
    def __init__(self, parent=None, note_data=None):
        super().__init__(parent)
        self.note_data = note_data
        self.setup_ui()
        self.setup_connections()
        
        if note_data:
            self.setWindowTitle("Edit Note")
            self.populate_fields()
        else:
            self.setWindowTitle("Create New Note")
    
    def setup_ui(self):
        """Setup the dialog UI"""
        self.setModal(True)
        self.setMinimumWidth(450)
        self.setMinimumHeight(350)
        
        layout = QVBoxLayout(self)
        
        # Form layout
        form_layout = QFormLayout()
        
        # Title field
        self.title_edit = QLineEdit()
        self.title_edit.setPlaceholderText("Enter note title (optional)")
        form_layout.addRow("Title:", self.title_edit)
        
        # Priority field
        self.priority_spin = QSpinBox()
        self.priority_spin.setRange(1, 5)
        self.priority_spin.setValue(1)
        self.priority_spin.setToolTip("1 = Low, 5 = High")
        form_layout.addRow("Priority:", self.priority_spin)
        
        # Content field
        self.content_edit = QTextEdit()
        self.content_edit.setPlaceholderText("Enter note content...")
        self.content_edit.setMinimumHeight(180)
        form_layout.addRow("Content:", self.content_edit)
        
        layout.addLayout(form_layout)
        
        # Buttons
        button_box = QDialogButtonBox(
            QDialogButtonBox.StandardButton.Ok | QDialogButtonBox.StandardButton.Cancel
        )
        layout.addWidget(button_box)
        
        self.button_box = button_box
    
    def setup_connections(self):
        """Setup signal connections"""
        self.button_box.accepted.connect(self.accept)
        self.button_box.rejected.connect(self.reject)
    
    def populate_fields(self):
        """Populate fields with existing note data"""
        if self.note_data:
            self.title_edit.setText(self.note_data.get('title', ''))
            self.content_edit.setPlainText(self.note_data.get('content', ''))
            self.priority_spin.setValue(self.note_data.get('priority', 1))
    
    def get_note_data(self):
        """Get the note data from the dialog"""
        return {
            'title': self.title_edit.text().strip() or None,
            'content': self.content_edit.toPlainText().strip(),
            'priority': self.priority_spin.value()
        }


class NotesPanel(QGroupBox):
    """Quick notes panel with database integration"""
    
    # Signals
    note_created = pyqtSignal(dict)  # Emits the created note data
    note_updated = pyqtSignal(dict)  # Emits the updated note data
    note_deleted = pyqtSignal(int)  # Emits the deleted note ID
    notes_loaded = pyqtSignal(list)  # Emits list of notes
    error_occurred = pyqtSignal(str)  # Emits error message
    
    def __init__(self, parent=None):
        """Initialize the notes panel"""
        super().__init__("📝 Notes", parent)
        self.notes_manager = get_notes_manager()
        self.current_notes = []
        self.note_cards = {}
        self.sort_options = {
            'priority': False,
            'name': False,
            'time_created': False
        }
        self.setup_ui()
        self.setup_connections()
        self.load_notes()
        
    def setup_ui(self):
        """Setup the UI components"""
        self.setStyleSheet("""
            QGroupBox {
                font-weight: bold;
                border: 1px solid #ccc;
                border-radius: 4px;
                margin-top: 8px;
                padding-top: 8px;
                background-color: #f8f9fa;
            }
            QGroupBox::title {
                subcontrol-origin: margin;
                left: 8px;
                padding: 0 4px 0 4px;
                color: #333;
            }
        """)
        
        layout = QVBoxLayout(self)
        layout.setContentsMargins(8, 16, 8, 8)
        layout.setSpacing(8)
        
        # Header section
        header_layout = QHBoxLayout()
        
        # Search bar
        self.search_edit = QLineEdit()
        self.search_edit.setPlaceholderText("Search notes...")
        self.search_edit.setMinimumHeight(28)
        self.search_edit.setStyleSheet("""
            QLineEdit {
                border: 1px solid #ccc;
                border-radius: 4px;
                padding: 4px 8px;
                font-size: 11px;
                background-color: white;
            }
            QLineEdit:focus {
                border: 1px solid #007acc;
            }
        """)
        
        # Sort dropdown
        self.sort_combo = QComboBox()
        self.sort_combo.addItems([
            "Default",
            "Priority",
            "Name",
            "Time Created"
        ])
        self.sort_combo.setMinimumHeight(28)
        self.sort_combo.setStyleSheet("""
            QComboBox {
                border: 1px solid #ccc;
                border-radius: 4px;
                padding: 4px;
                font-size: 11px;
                background-color: white;
                min-width: 50px;
            }
            QComboBox:focus {
                border: 1px solid #007acc;
            }
            QComboBox::drop-down {
                border: none;
                width: 5px;
            }
          
        """)
        
        # Add button
        self.add_btn = QPushButton("+ Add Note")
        self.add_btn.setMinimumHeight(28)
        self.add_btn.setStyleSheet("""
            QPushButton {
                background-color: #28a745;
                color: white;
                border: none;
                border-radius: 4px;
                padding: 4px 12px;
                font-size: 11px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #218838;
            }
        """)
        
        header_layout.addWidget(self.search_edit, 1)
        header_layout.addWidget(self.sort_combo)
        header_layout.addWidget(self.add_btn)
        
        # Notes scroll area
        self.scroll_area = QScrollArea()
        self.scroll_area.setWidgetResizable(True)
        self.scroll_area.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
        self.scroll_area.setVerticalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAsNeeded)
        self.scroll_area.setStyleSheet("""
            QScrollArea {
                border: none;
                background-color: transparent;
            }
            QScrollBar:vertical {
                background-color: #f1f1f1;
                width: 10px;
                border-radius: 5px;
            }
            QScrollBar::handle:vertical {
                background-color: #c1c1c1;
                border-radius: 5px;
                min-height: 20px;
            }
            QScrollBar::handle:vertical:hover {
                background-color: #a8a8a8;
            }
        """)
        
        # Notes container widget
        self.notes_container = QWidget()
        self.notes_layout = QVBoxLayout(self.notes_container)
        self.notes_layout.setAlignment(Qt.AlignmentFlag.AlignTop)
        self.notes_layout.setSpacing(3)
        self.notes_layout.setContentsMargins(3, 3, 3, 3)
        
        self.scroll_area.setWidget(self.notes_container)
        
        # Add widgets to main layout
        layout.addLayout(header_layout)
        layout.addWidget(self.scroll_area, 1)
        
    def setup_connections(self):
        """Setup signal connections"""
        # Button connections
        self.add_btn.clicked.connect(self.create_note)
        self.sort_combo.currentIndexChanged.connect(self.on_sort_option_changed)
        
        # Search connections
        self.search_edit.textChanged.connect(self.on_search_changed)
        
        # Notes manager signal connections
        self.notes_manager.note_added.connect(self.on_note_added)
        self.notes_manager.note_updated.connect(self.on_note_updated)
        self.notes_manager.note_deleted.connect(self.on_note_deleted)
        self.notes_manager.notes_loaded.connect(self.on_notes_loaded)
        self.notes_manager.error_occurred.connect(self.on_error_occurred)
        
    def on_sort_option_changed(self):
        """Handle sort option changes"""
        selected_index = self.sort_combo.currentIndex()
        if selected_index == 1: # Priority (High to Low)
            self.notes_manager.get_notes_sorted('priority')
        elif selected_index == 2: # Name (A to Z)
            self.notes_manager.get_notes_sorted('name')
        elif selected_index == 3: # Time Created (Newest First)
            self.notes_manager.get_notes_sorted('time_created')
        else: # Default (Priority + Date)
            self.load_notes()
    
    def load_notes(self):
        """Load all notes from database"""
        self.notes_manager.get_notes()
    
    def create_note(self):
        """Create a new note"""
        dialog = NoteDialog(self)
        if dialog.exec() == QDialog.DialogCode.Accepted:
            note_data = dialog.get_note_data()
            if note_data['content']:
                self.notes_manager.create_note(
                    note_data['title'], 
                    note_data['content'], 
                    note_data['priority']
                )
            else:
                QMessageBox.warning(self, "Error", "Note content cannot be empty!")
    
    def create_note_from_text(self, selected_text: str):
        """Create a note from selected text (called by hotkey)"""
        try:
            if not selected_text or not selected_text.strip():
                # Don't show warning dialog for hotkey-triggered creation
                print("No text selected for note creation")
                return
            
            # Create note from selected text
            note_id = self.notes_manager.create_note_from_text(selected_text)
            
            # Show success message (but don't block the UI)
            print(f"Note created successfully from selected text! Note ID: {note_id}")
            
            # Refresh notes display
            self.load_notes()
            
        except Exception as e:
            print(f"Failed to create note from text: {str(e)}")
            # Don't show error dialog for hotkey-triggered creation to avoid blocking
    
    def edit_note(self, note_id):
        """Edit a note by ID"""
        # Find the note
        note_data = None
        for note in self.current_notes:
            if note['id'] == note_id:
                note_data = note
                break
        
        if note_data:
            dialog = NoteDialog(self, note_data)
            if dialog.exec() == QDialog.DialogCode.Accepted:
                updated_data = dialog.get_note_data()
                if updated_data['content']:
                    self.notes_manager.update_note(
                        note_id,
                        updated_data['title'],
                        updated_data['content'],
                        updated_data['priority']
                    )
                else:
                    QMessageBox.warning(self, "Error", "Note content cannot be empty!")
    
    def delete_note(self, note_id):
        """Delete a note by ID"""
        reply = QMessageBox.question(
            self, 
            "Confirm Delete", 
            "Are you sure you want to delete this note?",
            QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No
        )
        
        if reply == QMessageBox.StandardButton.Yes:
            self.notes_manager.delete_note(note_id)
    
    def copy_note_content(self, note_data):
        """Copy note content to clipboard"""
        from PyQt6.QtWidgets import QApplication
        content = note_data.get('content', '')
        QApplication.clipboard().setText(content)
        
        # Show brief feedback
        QMessageBox.information(self, "Copied", "Note content copied to clipboard!")
    
    def on_search_changed(self):
        """Handle search text changes"""
        search_term = self.search_edit.text().strip()
        if search_term:
            self.notes_manager.search_notes(search_term)
        else:
            self.load_notes()
    
    def on_note_added(self, note):
        """Handle note added signal"""
        self.note_created.emit(note)
        self.load_notes()
    
    def on_note_updated(self, note):
        """Handle note updated signal"""
        self.note_updated.emit(note)
        self.load_notes()
    
    def on_note_deleted(self, note_id):
        """Handle note deleted signal"""
        self.note_deleted.emit(note_id)
        self.load_notes()
    
    def on_notes_loaded(self, notes):
        """Handle notes loaded signal"""
        self.notes_loaded.emit(notes)
        self.current_notes = notes
        self.update_notes_display()
    
    def on_error_occurred(self, error_message):
        """Handle error signal"""
        self.error_occurred.emit(error_message)
        QMessageBox.warning(self, "Error", error_message)
    
    def update_notes_display(self):
        """Update the notes display with cards"""
        # Clear existing cards
        for card in self.note_cards.values():
            self.notes_layout.removeWidget(card)
            card.deleteLater()
        self.note_cards.clear()
        
        # Add new cards
        for note in self.current_notes:
            card = NoteCard(note, self, self.notes_container)
            self.note_cards[note['id']] = card
            self.notes_layout.addWidget(card)
        
        # Add stretch to push cards to top
        stretch = QWidget()
        stretch.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Expanding)
        self.notes_layout.addWidget(stretch)
    
    def get_selected_note(self):
        """Get the currently selected note"""
        # This method is kept for compatibility but may not be needed with card-based UI
        return None
    
    def get_all_notes(self):
        """Get all current notes"""
        return self.current_notes.copy() 