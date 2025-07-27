#!/usr/bin/env python3
"""
Enhanced Notes Panel Feature Module
Enhanced notes management with advanced features and better organization
"""

from PyQt6.QtWidgets import (
    QGroupBox, QVBoxLayout, QHBoxLayout, QTextEdit, 
    QPushButton, QFileDialog, QMessageBox, QListWidget,
    QListWidgetItem, QLabel, QComboBox, QLineEdit, QDialog,
    QFormLayout, QSpinBox, QDialogButtonBox, QScrollArea,
    QWidget, QFrame, QSizePolicy, QCheckBox, QSplitter,
    QTabWidget, QTableWidget, QTableWidgetItem, QHeaderView
)
from PyQt6.QtCore import Qt, pyqtSignal, QSize, QTimer
from PyQt6.QtGui import QFont, QPalette, QColor, QTextCursor, QSyntaxHighlighter, QTextCharFormat

from core import get_notes_manager


class EnhancedNoteCard(QFrame):
    """Enhanced individual note card widget with better styling"""
    
    def __init__(self, note_data, notes_panel, parent=None):
        super().__init__(parent)
        self.note_data = note_data
        self.notes_panel = notes_panel
        self.setup_ui()
        self.setup_connections()
        
    def setup_ui(self):
        """Setup the enhanced note card UI"""
        self.setFrameStyle(QFrame.Shape.StyledPanel)
        self.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)
        self.setMinimumHeight(140)
        self.setMaximumHeight(200)
        
        # Enhanced card styling
        self.setStyleSheet("""
            QFrame {
                background: qlineargradient(x1:0, y1:0, x2:0, y2:1,
                    stop:0 #ffffff, stop:1 #f8f9fa);
                border: 2px solid #e9ecef;
                border-radius: 10px;
                margin: 6px;
            }
            QFrame:hover {
                border-color: #3498db;
                background: qlineargradient(x1:0, y1:0, x2:0, y2:1,
                    stop:0 #ffffff, stop:1 #e3f2fd);
            }
        """)
        
        layout = QVBoxLayout(self)
        layout.setContentsMargins(16, 16, 16, 16)
        layout.setSpacing(10)
        
        # Header with title, priority, and actions
        header_layout = QHBoxLayout()
        
        # Title with better truncation
        title = self.note_data.get('title') or 'Untitled'
        if len(title) > 40:
            title = title[:37] + "..."
        
        title_label = QLabel(title)
        title_label.setFont(QFont("Segoe UI", 11, QFont.Weight.Bold))
        title_label.setStyleSheet("color: #2c3e50;")
        title_label.setWordWrap(True)
        
        # Priority badge with enhanced styling
        priority = self.note_data.get('priority', 1)
        priority_label = QLabel(str(priority))
        priority_label.setFixedSize(24, 24)
        priority_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        priority_label.setStyleSheet(f"""
            background-color: {self.get_priority_color(priority)};
            color: white;
            border-radius: 12px;
            font-weight: bold;
            font-size: 11px;
            border: 2px solid {self.get_priority_border_color(priority)};
        """)
        
        # Action buttons
        edit_btn = QPushButton("✏️")
        edit_btn.setFixedSize(24, 24)
        edit_btn.setStyleSheet("""
            QPushButton {
                background-color: #3498db;
                color: white;
                border: none;
                border-radius: 12px;
                font-size: 10px;
            }
            QPushButton:hover {
                background-color: #2980b9;
            }
        """)
        edit_btn.clicked.connect(lambda: self.notes_panel.edit_note(self.note_data.get('id')))
        
        delete_btn = QPushButton("🗑️")
        delete_btn.setFixedSize(24, 24)
        delete_btn.setStyleSheet("""
            QPushButton {
                background-color: #e74c3c;
                color: white;
                border: none;
                border-radius: 12px;
                font-size: 10px;
            }
            QPushButton:hover {
                background-color: #c0392b;
            }
        """)
        delete_btn.clicked.connect(lambda: self.notes_panel.delete_note(self.note_data.get('id')))
        
        header_layout.addWidget(title_label, 1)
        header_layout.addWidget(priority_label)
        header_layout.addWidget(edit_btn)
        header_layout.addWidget(delete_btn)
        
        # Content preview with better formatting
        content = self.note_data.get('content', '')
        # Show first 2 lines or 100 characters
        lines = content.split('\n')
        preview_content = '\n'.join(lines[:2]) if len(lines) > 1 else content[:100]
        if len(content) > 100:
            preview_content += "..."
        
        content_label = QLabel(preview_content)
        content_label.setWordWrap(True)
        content_label.setStyleSheet("""
            color: #34495e;
            font-size: 11px;
            line-height: 1.4;
            padding: 4px 0;
            background-color: transparent;
        """)
        
        # Enhanced metadata
        created_at = self.note_data.get('created_at', '')
        updated_at = self.note_data.get('updated_at', '')
        
        metadata_text = f"📅 Created: {created_at[:10] if created_at else 'Unknown'}"
        if updated_at and updated_at != created_at:
            metadata_text += f" | ✏️ Updated: {updated_at[:10]}"
        
        metadata_label = QLabel(metadata_text)
        metadata_label.setStyleSheet("""
            color: #7f8c8d;
            font-size: 9px;
            font-style: italic;
        """)
        
        # Add widgets to layout
        layout.addLayout(header_layout)
        layout.addWidget(content_label, 1)
        layout.addWidget(metadata_label)
        
    def setup_connections(self):
        """Setup signal connections"""
        self.mouseDoubleClickEvent = lambda event: self.notes_panel.edit_note(self.note_data.get('id'))
        
    def get_priority_color(self, priority):
        """Get color for priority level"""
        colors = {
            1: "#95a5a6",  # Gray
            2: "#3498db",  # Blue
            3: "#f39c12",  # Orange
            4: "#e74c3c",  # Red
            5: "#9b59b6"   # Purple
        }
        return colors.get(priority, "#95a5a6")
        
    def get_priority_border_color(self, priority):
        """Get border color for priority level"""
        colors = {
            1: "#7f8c8d",
            2: "#2980b9",
            3: "#e67e22",
            4: "#c0392b",
            5: "#8e44ad"
        }
        return colors.get(priority, "#7f8c8d")


class EnhancedNoteDialog(QDialog):
    """Enhanced note dialog with better editing features"""
    
    def __init__(self, parent=None, note_data=None):
        super().__init__(parent)
        self.note_data = note_data
        self.setup_ui()
        self.setup_connections()
        if note_data:
            self.populate_fields()
            
    def setup_ui(self):
        """Setup the enhanced dialog UI"""
        self.setWindowTitle("Enhanced Note Editor")
        self.setMinimumSize(600, 500)
        self.setStyleSheet("""
            QDialog {
                background-color: #f8f9fa;
            }
        """)
        
        layout = QVBoxLayout(self)
        layout.setSpacing(15)
        
        # Title field
        title_layout = QHBoxLayout()
        title_label = QLabel("📝 Title:")
        title_label.setStyleSheet("font-weight: bold; color: #2c3e50;")
        
        self.title_input = QLineEdit()
        self.title_input.setStyleSheet("""
            QLineEdit {
                border: 2px solid #bdc3c7;
                border-radius: 6px;
                padding: 8px;
                font-size: 12px;
                background-color: white;
            }
            QLineEdit:focus {
                border-color: #3498db;
            }
        """)
        
        title_layout.addWidget(title_label)
        title_layout.addWidget(self.title_input)
        
        # Priority and metadata
        meta_layout = QHBoxLayout()
        
        priority_label = QLabel("🎯 Priority:")
        priority_label.setStyleSheet("font-weight: bold; color: #2c3e50;")
        
        self.priority_spin = QSpinBox()
        self.priority_spin.setRange(1, 5)
        self.priority_spin.setValue(1)
        self.priority_spin.setStyleSheet("""
            QSpinBox {
                border: 2px solid #bdc3c7;
                border-radius: 6px;
                padding: 6px;
                background-color: white;
            }
        """)
        
        meta_layout.addWidget(priority_label)
        meta_layout.addWidget(self.priority_spin)
        meta_layout.addStretch()
        
        # Content editor
        content_label = QLabel("📄 Content:")
        content_label.setStyleSheet("font-weight: bold; color: #2c3e50;")
        
        self.content_edit = QTextEdit()
        self.content_edit.setStyleSheet("""
            QTextEdit {
                border: 2px solid #bdc3c7;
                border-radius: 6px;
                padding: 10px;
                background-color: white;
                font-family: 'Segoe UI', sans-serif;
                font-size: 11px;
                line-height: 1.4;
            }
            QTextEdit:focus {
                border-color: #3498db;
            }
        """)
        
        # Buttons
        button_layout = QHBoxLayout()
        
        self.save_btn = QPushButton("💾 Save")
        self.save_btn.setStyleSheet("""
            QPushButton {
                background-color: #27ae60;
                color: white;
                border: none;
                border-radius: 6px;
                padding: 8px 16px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #229954;
            }
        """)
        
        self.cancel_btn = QPushButton("❌ Cancel")
        self.cancel_btn.setStyleSheet("""
            QPushButton {
                background-color: #95a5a6;
                color: white;
                border: none;
                border-radius: 6px;
                padding: 8px 16px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #7f8c8d;
            }
        """)
        
        button_layout.addStretch()
        button_layout.addWidget(self.save_btn)
        button_layout.addWidget(self.cancel_btn)
        
        # Add all layouts
        layout.addLayout(title_layout)
        layout.addLayout(meta_layout)
        layout.addWidget(content_label)
        layout.addWidget(self.content_edit, 1)
        layout.addLayout(button_layout)
        
    def setup_connections(self):
        """Setup signal connections"""
        self.save_btn.clicked.connect(self.accept)
        self.cancel_btn.clicked.connect(self.reject)
        
    def populate_fields(self):
        """Populate fields with existing note data"""
        if self.note_data:
            self.title_input.setText(self.note_data.get('title', ''))
            self.content_edit.setPlainText(self.note_data.get('content', ''))
            self.priority_spin.setValue(self.note_data.get('priority', 1))
            
    def get_note_data(self):
        """Get note data from form"""
        return {
            'title': self.title_input.text().strip(),
            'content': self.content_edit.toPlainText().strip(),
            'priority': self.priority_spin.value()
        }


class EnhancedNotesPanel(QGroupBox):
    """Enhanced notes panel with advanced features"""
    
    # Signals
    note_created = pyqtSignal(dict)
    note_updated = pyqtSignal(dict)
    note_deleted = pyqtSignal(int)
    notes_loaded = pyqtSignal(list)
    error_occurred = pyqtSignal(str)
    
    def __init__(self, parent=None):
        super().__init__("📝 Enhanced Notes", parent)
        self.notes_manager = get_notes_manager()
        self.current_notes = []
        self.search_timer = QTimer()
        self.search_timer.setSingleShot(True)
        self.search_timer.setInterval(300)
        
        self.setup_ui()
        self.setup_connections()
        self.load_notes()
        
    def setup_ui(self):
        """Setup the enhanced UI components"""
        self.setStyleSheet("""
            QGroupBox {
                font-weight: bold;
                border: 2px solid #27ae60;
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
        
        # Search and controls section
        controls_frame = QFrame()
        controls_frame.setStyleSheet("""
            QFrame {
                background-color: white;
                border: 1px solid #bdc3c7;
                border-radius: 5px;
                padding: 8px;
            }
        """)
        controls_layout = QVBoxLayout(controls_frame)
        controls_layout.setContentsMargins(8, 8, 8, 8)
        
        # Top row: Search and sort
        top_row = QHBoxLayout()
        
        search_label = QLabel("🔍 Search:")
        search_label.setStyleSheet("color: #2c3e50; font-weight: bold;")
        
        self.search_input = QLineEdit()
        self.search_input.setPlaceholderText("Search notes...")
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
        
        sort_label = QLabel("📊 Sort by:")
        sort_label.setStyleSheet("color: #2c3e50; font-weight: bold;")
        
        self.sort_combo = QComboBox()
        self.sort_combo.addItems(["Priority", "Name", "Time Created", "Time Updated"])
        self.sort_combo.setStyleSheet("""
            QComboBox {
                border: 1px solid #bdc3c7;
                border-radius: 4px;
                padding: 6px;
                background-color: white;
                font-size: 11px;
            }
        """)
        
        top_row.addWidget(search_label)
        top_row.addWidget(self.search_input, 1)
        top_row.addWidget(sort_label)
        top_row.addWidget(self.sort_combo)
        
        # Bottom row: Action buttons
        bottom_row = QHBoxLayout()
        
        self.create_btn = QPushButton("➕ Create Note")
        self.create_btn.setStyleSheet("""
            QPushButton {
                background-color: #27ae60;
                color: white;
                border: none;
                border-radius: 4px;
                padding: 8px 12px;
                font-size: 11px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #229954;
            }
        """)
        
        self.export_btn = QPushButton("📤 Export")
        self.export_btn.setStyleSheet("""
            QPushButton {
                background-color: #3498db;
                color: white;
                border: none;
                border-radius: 4px;
                padding: 8px 12px;
                font-size: 11px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #2980b9;
            }
        """)
        
        self.import_btn = QPushButton("📥 Import")
        self.import_btn.setStyleSheet("""
            QPushButton {
                background-color: #f39c12;
                color: white;
                border: none;
                border-radius: 4px;
                padding: 8px 12px;
                font-size: 11px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #e67e22;
            }
        """)
        
        bottom_row.addWidget(self.create_btn)
        bottom_row.addWidget(self.export_btn)
        bottom_row.addWidget(self.import_btn)
        bottom_row.addStretch()
        
        controls_layout.addLayout(top_row)
        controls_layout.addLayout(bottom_row)
        
        # Notes display area
        self.notes_scroll = QScrollArea()
        self.notes_scroll.setWidgetResizable(True)
        self.notes_scroll.setStyleSheet("""
            QScrollArea {
                border: 1px solid #bdc3c7;
                border-radius: 5px;
                background-color: white;
            }
        """)
        
        self.notes_widget = QWidget()
        self.notes_layout = QVBoxLayout(self.notes_widget)
        self.notes_layout.setContentsMargins(10, 10, 10, 10)
        self.notes_layout.setSpacing(8)
        self.notes_layout.addStretch()
        
        self.notes_scroll.setWidget(self.notes_widget)
        
        # Add widgets to main layout
        layout.addWidget(controls_frame)
        layout.addWidget(self.notes_scroll, 1)
        
    def setup_connections(self):
        """Setup signal connections"""
        self.notes_manager.note_added.connect(self.on_note_added)
        self.notes_manager.note_updated.connect(self.on_note_updated)
        self.notes_manager.note_deleted.connect(self.on_note_deleted)
        self.notes_manager.notes_loaded.connect(self.on_notes_loaded)
        self.notes_manager.error_occurred.connect(self.on_error_occurred)
        
        self.create_btn.clicked.connect(self.create_note)
        self.export_btn.clicked.connect(self.export_notes)
        self.import_btn.clicked.connect(self.import_notes)
        
        self.search_input.textChanged.connect(self.on_search_changed)
        self.sort_combo.currentTextChanged.connect(self.on_sort_changed)
        self.search_timer.timeout.connect(self.perform_search)
        
    def load_notes(self):
        """Load notes from manager"""
        self.notes_manager.get_notes()
        
    def create_note(self):
        """Create a new note"""
        dialog = EnhancedNoteDialog(self)
        if dialog.exec() == QDialog.DialogCode.Accepted:
            note_data = dialog.get_note_data()
            if note_data['title'] and note_data['content']:
                try:
                    self.notes_manager.create_note(
                        note_data['title'],
                        note_data['content'],
                        note_data['priority']
                    )
                except Exception as e:
                    QMessageBox.warning(self, "Error", f"Failed to create note: {e}")
                    
    def create_note_from_text(self, selected_text: str):
        """Create note from selected text"""
        if not selected_text or not selected_text.strip():
            return
            
        try:
            self.notes_manager.create_note_from_text(selected_text.strip())
        except Exception as e:
            QMessageBox.warning(self, "Error", f"Failed to create note from text: {e}")
            
    def edit_note(self, note_id):
        """Edit an existing note"""
        note = self.notes_manager.get_note(note_id)
        if note:
            dialog = EnhancedNoteDialog(self, note)
            if dialog.exec() == QDialog.DialogCode.Accepted:
                note_data = dialog.get_note_data()
                if note_data['title'] and note_data['content']:
                    try:
                        self.notes_manager.update_note(
                            note_id,
                            note_data['title'],
                            note_data['content'],
                            note_data['priority']
                        )
                    except Exception as e:
                        QMessageBox.warning(self, "Error", f"Failed to update note: {e}")
                        
    def delete_note(self, note_id):
        """Delete a note"""
        reply = QMessageBox.question(
            self, "Confirm Delete", 
            "Are you sure you want to delete this note?",
            QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No
        )
        
        if reply == QMessageBox.StandardButton.Yes:
            try:
                self.notes_manager.delete_note(note_id)
            except Exception as e:
                QMessageBox.warning(self, "Error", f"Failed to delete note: {e}")
                
    def export_notes(self):
        """Export notes to file"""
        try:
            export_text = self.notes_manager.export_notes_to_text()
            file_path, _ = QFileDialog.getSaveFileName(
                self, "Export Notes", "notes_export.txt", "Text Files (*.txt)"
            )
            if file_path:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(export_text)
                QMessageBox.information(self, "Success", "Notes exported successfully!")
        except Exception as e:
            QMessageBox.warning(self, "Error", f"Failed to export notes: {e}")
            
    def import_notes(self):
        """Import notes from file"""
        file_path, _ = QFileDialog.getOpenFileName(
            self, "Import Notes", "", "Text Files (*.txt)"
        )
        if file_path:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                # Simple import - create a single note with file content
                self.notes_manager.create_note(
                    f"Imported from {file_path.split('/')[-1]}",
                    content,
                    1
                )
                QMessageBox.information(self, "Success", "Notes imported successfully!")
            except Exception as e:
                QMessageBox.warning(self, "Error", f"Failed to import notes: {e}")
                
    def on_search_changed(self):
        """Handle search input changes"""
        self.search_timer.start()
        
    def on_sort_changed(self):
        """Handle sort changes"""
        self.perform_search()
        
    def perform_search(self):
        """Perform search and sort operation"""
        search_term = self.search_input.text().strip()
        sort_by = self.sort_combo.currentText()
        
        if search_term:
            self.notes_manager.search_notes(search_term)
        else:
            # Map sort options to manager methods
            sort_mapping = {
                "Priority": "priority",
                "Name": "name", 
                "Time Created": "time_created",
                "Time Updated": "time_created"  # Using created as fallback
            }
            sort_key = sort_mapping.get(sort_by, "time_created")
            self.notes_manager.get_notes_sorted(sort_key)
            
    def on_note_added(self, note):
        """Handle note added event"""
        self.note_created.emit(note)
        self.update_notes_display()
        
    def on_note_updated(self, note):
        """Handle note updated event"""
        self.note_updated.emit(note)
        self.update_notes_display()
        
    def on_note_deleted(self, note_id):
        """Handle note deleted event"""
        self.note_deleted.emit(note_id)
        self.update_notes_display()
        
    def on_notes_loaded(self, notes):
        """Handle notes loaded event"""
        self.current_notes = notes
        self.notes_loaded.emit(notes)
        self.update_notes_display()
        
    def on_error_occurred(self, error_message):
        """Handle error event"""
        self.error_occurred.emit(error_message)
        
    def update_notes_display(self):
        """Update the notes display"""
        # Clear existing note cards
        for i in reversed(range(self.notes_layout.count() - 1)):  # Keep the stretch
            child = self.notes_layout.itemAt(i).widget()
            if child:
                child.deleteLater()
                
        # Add note cards
        for note in self.current_notes:
            note_card = EnhancedNoteCard(note, self)
            self.notes_layout.insertWidget(self.notes_layout.count() - 1, note_card)
            
    def get_selected_note(self):
        """Get the currently selected note"""
        # This would need to be implemented based on selection mechanism
        return None
        
    def get_all_notes(self):
        """Get all notes"""
        return self.current_notes 