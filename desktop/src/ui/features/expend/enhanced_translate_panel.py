#!/usr/bin/env python3
"""
Enhanced Translate Panel
Advanced UI component for translating text using AI in the expanded window
"""

from PyQt6.QtWidgets import (
    QGroupBox, QVBoxLayout, QHBoxLayout, QTextEdit, 
    QPushButton, QComboBox, QLabel, QLineEdit,
    QProgressBar, QMessageBox, QFrame, QScrollArea,
    QWidget, QSizePolicy, QSplitter, QTabWidget,
    QCheckBox, QSpinBox
)
from PyQt6.QtCore import Qt, QThread, pyqtSignal, QTimer
from PyQt6.QtGui import QFont, QPalette, QColor
import sys
import os

# Add the src directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))

from core.translate import TranslateService


class EnhancedTranslateWorker(QThread):
    """Enhanced worker thread for translating text"""
    
    # Signals
    translated = pyqtSignal(dict)  # Translation result
    error = pyqtSignal(str)        # Error message
    finished = pyqtSignal()        # Thread finished
    
    def __init__(self, service: TranslateService, text: str, to_language: str, user_id: str):
        super().__init__()
        self.service = service
        self.text = text
        self.to_language = to_language
        self.user_id = user_id
        
    def run(self):
        """Run the translation in background thread"""
        try:
            result = self.service.translate_text(
                text=self.text,
                to_language=self.to_language,
                user_id=self.user_id,
            )
            self.translated.emit(result)
        except Exception as e:
            self.error.emit(str(e))
        finally:
            self.finished.emit()


class EnhancedTranslationCard(QFrame):
    """Enhanced card widget to display translation results with more features"""
    
    def __init__(self, translated_text: str, original_text: str, target_language: str, parent=None):
        super().__init__(parent)
        self.translated_text = translated_text
        self.original_text = original_text
        self.target_language = target_language
        self.setup_ui()
        
    def setup_ui(self):
        """Setup the enhanced translation card UI"""
        self.setFrameStyle(QFrame.Shape.StyledPanel)
        self.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)
        self.setMinimumHeight(160)
        self.setMaximumHeight(250)
        
        # Enhanced card styling
        self.setStyleSheet("""
            QFrame {
                background-color: white;
                border: none;
                border-radius: 12px;
                margin: 6px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
        """)
        
        layout = QVBoxLayout(self)
        layout.setContentsMargins(20, 20, 20, 20)
        layout.setSpacing(12)
        
        # Header with title, language, and actions
        header_layout = QHBoxLayout()
        
        # Language badge
        lang_badge = QLabel(self.target_language)
        lang_badge.setStyleSheet("""
            QLabel {
                background-color: #3498db;
                color: white;
                border-radius: 12px;
                padding: 4px 12px;
                font-size: 10px;
                font-weight: bold;
            }
        """)
        lang_badge.setMaximumWidth(100)
        
        # Action buttons
        actions_layout = QHBoxLayout()
        actions_layout.setSpacing(6)
        
        copy_btn = QPushButton("Copy")
        copy_btn.setFixedSize(60, 28)
        copy_btn.setStyleSheet("""
            QPushButton {
                background-color: #3498db;
                color: white;
                border: none;
                border-radius: 6px;
                font-size: 10px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #2980b9;
            }
        """)
        copy_btn.clicked.connect(self.copy_translation)
        
        edit_btn = QPushButton("Edit")
        edit_btn.setFixedSize(60, 28)
        edit_btn.setStyleSheet("""
            QPushButton {
                background-color: #95a5a6;
                color: white;
                border: none;
                border-radius: 6px;
                font-size: 10px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #7f8c8d;
            }
        """)
        edit_btn.clicked.connect(self.edit_translation)
        
        actions_layout.addWidget(copy_btn)
        actions_layout.addWidget(edit_btn)
        
        header_layout.addWidget(lang_badge)
        header_layout.addStretch()
        header_layout.addLayout(actions_layout)
        
        # Translation content with larger font
        content_label = QLabel(self.translated_text)
        content_label.setWordWrap(True)
        content_label.setStyleSheet("""
            QLabel {
                color: #2c3e50;
                font-size: 13px;
                line-height: 1.5;
                background-color: #f8f9fa;
                border: 1px solid #e9ecef;
                border-radius: 8px;
                padding: 12px;
            }
        """)
        
        # Separator line
        separator = QFrame()
        separator.setFrameShape(QFrame.Shape.HLine)
        separator.setStyleSheet("border: 1px solid #dee2e6;")
        
        # Original text with better formatting
        original_header = QLabel("Original Text:")
        original_header.setStyleSheet("""
            QLabel {
                color: #6c757d;
                font-size: 10px;
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
        """)
        
        original_label = QLabel(self.original_text)
        original_label.setWordWrap(True)
        original_label.setStyleSheet("""
            QLabel {
                color: #6c757d;
                font-size: 11px;
                line-height: 1.4;
                background-color: #ffffff;
                border: 1px solid #e9ecef;
                border-radius: 6px;
                padding: 8px;
            }
        """)
        
        # Add all widgets to layout
        layout.addLayout(header_layout)
        layout.addWidget(content_label)
        layout.addWidget(separator)
        layout.addWidget(original_header)
        layout.addWidget(original_label)
        
    def copy_translation(self):
        """Copy translation to clipboard"""
        from PyQt6.QtWidgets import QApplication
        QApplication.clipboard().setText(self.translated_text)
        
        # Show brief feedback
        QMessageBox.information(self, "Copied", "Translation copied to clipboard!")
        
    def edit_translation(self):
        """Edit the translation (placeholder for future implementation)"""
        # This could open an edit dialog
        QMessageBox.information(self, "Edit", "Edit functionality coming soon!")


class EnhancedTranslatePanel(QGroupBox):
    """Enhanced panel for translating text using AI with advanced features"""
    
    # Signals
    translation_copied = pyqtSignal(str)  # When translation is copied to clipboard
    
    def __init__(self, parent=None):
        super().__init__("🌍 Enhanced AI Translation Studio", parent)
        self.service = TranslateService()
        self.worker = None
        self.translations = []
        self.translation_cards = {}
        self.setup_ui()
        self.setup_connections()
        
        # Timer for auto-save
        self.auto_save_timer = QTimer()
        self.auto_save_timer.timeout.connect(self.auto_save_content)
        self.auto_save_timer.setSingleShot(True)
        
    def setup_ui(self):
        """Setup the enhanced UI components"""
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
        
        # Input section
        input_frame = QFrame()
        input_frame.setStyleSheet("""
            QFrame {
                background-color: white;
                border: 1px solid #bdc3c7;
                border-radius: 5px;
                padding: 8px;
            }
        """)
        input_layout = QVBoxLayout(input_frame)
        input_layout.setContentsMargins(8, 8, 8, 8)
        
        # Text input
        input_label = QLabel("🌍 Enter text to translate:")
        input_label.setStyleSheet("color: #2c3e50; font-weight: bold; font-size: 11px;")
        
        self.text_input = QTextEdit()
        self.text_input.setPlaceholderText("Type your text here...")
        self.text_input.setMaximumHeight(100)
        self.text_input.setStyleSheet("""
            QTextEdit {
                border: 1px solid #bdc3c7;
                border-radius: 4px;
                padding: 8px;
                font-size: 11px;
                background-color: white;
            }
            QTextEdit:focus {
                border-color: #3498db;
            }
        """)
        
        # Language selection
        lang_label = QLabel("Target Language:")
        lang_label.setStyleSheet("color: #2c3e50; font-weight: bold; font-size: 11px;")
        
        self.language_combo = QComboBox()
        self.language_combo.addItems([
            "Spanish", "French", "German", "Italian", "Portuguese", 
            "Chinese (Simplified)", "Chinese (Traditional)", "Japanese", 
            "Korean", "Russian", "Arabic", "Hindi", "Hebrew", "Dutch", 
            "Swedish", "Norwegian", "Danish", "Polish", "Czech", "Hungarian", 
            "Romanian", "Turkish", "Greek", "Bulgarian", "Croatian", "Serbian",
            "Ukrainian", "Finnish", "Estonian", "Latvian", "Lithuanian",
            "Thai", "Vietnamese", "Indonesian", "Malay", "Filipino", 
            "Urdu", "Persian (Farsi)", "Bengali", "Tamil", "Telugu",
            "Gujarati", "Marathi", "Punjabi", "Kannada", "Malayalam",
            "Swahili", "Amharic", "Yoruba", "Igbo", "Zulu", "Afrikaans",
            "Slovenian", "Slovak", "Belarusian", "Macedonian", "Albanian",
            "Basque", "Catalan", "Galician", "Welsh", "Irish", "Scots Gaelic",
            "Icelandic", "Faroese", "Luxembourgish", "Maltese", "Esperanto"
        ])
        self.language_combo.setCurrentText("Spanish")
        self.language_combo.setStyleSheet("""
            QComboBox {
                border: 1px solid #bdc3c7;
                border-radius: 4px;
                padding: 6px;
                font-size: 11px;
                background-color: white;
            }
            QComboBox:focus {
                border-color: #3498db;
            }
        """)
        
        # Action buttons
        button_layout = QHBoxLayout()
        
        self.translate_button = QPushButton("🚀 Translate")
        self.translate_button.setStyleSheet("""
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
            QPushButton:disabled {
                background-color: #bdc3c7;
                color: #7f8c8d;
            }
        """)
        
        self.clear_button = QPushButton("🗑️ Clear")
        self.clear_button.setStyleSheet("""
            QPushButton {
                background-color: #e74c3c;
                color: white;
                border: none;
                border-radius: 4px;
                padding: 8px 12px;
                font-size: 11px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #c0392b;
            }
        """)
        
        button_layout.addWidget(self.translate_button)
        button_layout.addWidget(self.clear_button)
        button_layout.addStretch()
        
        # Progress bar
        self.progress_bar = QProgressBar()
        self.progress_bar.setVisible(False)
        self.progress_bar.setRange(0, 0)  # Indeterminate progress
        self.progress_bar.setStyleSheet("""
            QProgressBar {
                border: 1px solid #bdc3c7;
                border-radius: 4px;
                text-align: center;
                background-color: #ecf0f1;
            }
            QProgressBar::chunk {
                background-color: #3498db;
                border-radius: 3px;
            }
        """)
        
        input_layout.addWidget(input_label)
        input_layout.addWidget(self.text_input)
        input_layout.addWidget(lang_label)
        input_layout.addWidget(self.language_combo)
        input_layout.addLayout(button_layout)
        input_layout.addWidget(self.progress_bar)
        
        # Enhanced translations scroll area
        self.translations_scroll = QScrollArea()
        self.translations_scroll.setWidgetResizable(True)
        self.translations_scroll.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
        self.translations_scroll.setVerticalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAsNeeded)
        self.translations_scroll.setStyleSheet("""
            QScrollArea {
                border: none;
                background-color: transparent;
            }
            QScrollBar:vertical {
                background-color: #f1f1f1;
                width: 12px;
                border-radius: 6px;
            }
            QScrollBar::handle:vertical {
                background-color: #c1c1c1;
                border-radius: 6px;
                min-height: 20px;
            }
            QScrollBar::handle:vertical:hover {
                background-color: #a8a8a8;
            }
            QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {
                height: 0px;
            }
        """)
        
        # Enhanced translations container widget
        self.translations_widget = QWidget()
        self.translations_layout = QVBoxLayout(self.translations_widget)
        self.translations_layout.setAlignment(Qt.AlignmentFlag.AlignTop)
        self.translations_layout.setSpacing(8)
        self.translations_layout.setContentsMargins(8, 8, 8, 8)
        
        self.translations_scroll.setWidget(self.translations_widget)
        
        # Add widgets to main layout
        layout.addWidget(input_frame)
        layout.addWidget(self.translations_scroll, 1)
        
    def setup_connections(self):
        """Setup signal connections"""
        self.translate_button.clicked.connect(self.translate_text)
        self.clear_button.clicked.connect(self.clear_all)
        self.text_input.textChanged.connect(self.on_text_changed)
        
    def on_text_changed(self):
        """Handle text input changes"""
        has_text = bool(self.text_input.toPlainText().strip())
        self.translate_button.setEnabled(has_text)
        
        # Start auto-save timer
        self.auto_save_timer.start(1000)  # 1 second delay for normal auto-save
        
    def auto_save_content(self):
        """Auto-save content (placeholder for future implementation)"""
        # This could save to a temporary file or database
        pass
        
    def translate_text(self):
        """Translate the input text"""
        text = self.text_input.toPlainText().strip()
        target_language = self.language_combo.currentText()
        
        if not text:
            QMessageBox.warning(self, "Empty Text", "Please enter text to translate.")
            return
            
        # Get user ID (placeholder - should be from authentication)
        try:
            from auth.auth_checker import get_authenticated_user
            user_info = get_authenticated_user()
            user_id = (user_info or {}).get('user_id', 'demo_user')
        except:
            user_id = 'demo_user'
            
        # Disable UI during processing
        self.set_processing_state(True)
        
        # Start worker thread
        self.worker = EnhancedTranslateWorker(self.service, text, target_language, user_id)
        self.worker.translated.connect(self.on_translation_complete)
        self.worker.error.connect(self.on_translation_error)
        self.worker.finished.connect(self.on_worker_finished)
        self.worker.start()
        
    def on_translation_complete(self, result):
        """Handle successful translation"""
        translated_text = result.get('translatedText', '')
        if translated_text:
            # Add to translations list
            translation_data = {
                'id': len(self.translations) + 1,
                'translated_text': translated_text,
                'original_text': self.text_input.toPlainText().strip(),
                'target_language': self.language_combo.currentText()
            }
            self.translations.append(translation_data)
            
            # Update display
            self.update_translations_display()
            
            # Auto-copy to clipboard
            from PyQt6.QtWidgets import QApplication
            QApplication.clipboard().setText(translated_text)
            self.translation_copied.emit(translated_text)
            
            # Clear input
            self.text_input.clear()
        else:
            self.on_translation_error("No translation received from API")
            
    def on_translation_error(self, error_message):
        """Handle translation error"""
        # Show error dialog
        QMessageBox.critical(self, "Translation Error", f"Failed to translate text:\n{error_message}")
        
    def on_worker_finished(self):
        """Handle worker thread completion"""
        self.set_processing_state(False)
        if self.worker:
            self.worker.deleteLater()
            self.worker = None
            
    def set_processing_state(self, processing: bool):
        """Set UI to processing state"""
        self.translate_button.setEnabled(not processing)
        self.text_input.setEnabled(not processing)
        self.progress_bar.setVisible(processing)
            
    def clear_all(self):
        """Clear all inputs and results"""
        self.text_input.clear()
        self.translations.clear()
        self.update_translations_display()
        
    def update_translations_display(self):
        """Update the translations display with cards"""
        # Clear existing cards
        for card in self.translation_cards.values():
            self.translations_layout.removeWidget(card)
            card.deleteLater()
        self.translation_cards.clear()
        
        # Remove any existing stretch widget
        for i in reversed(range(self.translations_layout.count())):
            item = self.translations_layout.itemAt(i)
            if item.widget() and item.widget().sizePolicy().verticalPolicy() == QSizePolicy.Policy.Expanding:
                self.translations_layout.removeItem(item)
                item.widget().deleteLater()
        
        # Add new cards
        for translation_data in self.translations:
            card = EnhancedTranslationCard(
                translation_data['translated_text'],
                translation_data['original_text'],
                translation_data['target_language'],
                self.translations_widget
            )
            self.translation_cards[translation_data['id']] = card
            self.translations_layout.addWidget(card)
        
        # Add stretch to push cards to top if there are translations
        if self.translations:
            stretch = QWidget()
            stretch.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Expanding)
            self.translations_layout.addWidget(stretch)
            
    def set_text_from_clipboard(self, text: str):
        """Set text from clipboard"""
        if text and text.strip():
            self.text_input.setPlainText(text.strip())
            
    def test_connection(self) -> bool:
        """Test connection to backend API"""
        return self.service.test_connection()
