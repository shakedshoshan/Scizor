#!/usr/bin/env python3
"""
Translate Panel
UI component for translating text using AI
"""

from PyQt6.QtWidgets import (
    QGroupBox, QVBoxLayout, QHBoxLayout, QTextEdit, 
    QPushButton, QComboBox, QLabel, QLineEdit,
    QProgressBar, QMessageBox, QFrame, QScrollArea,
    QWidget, QSizePolicy
)
from PyQt6.QtCore import Qt, QThread, pyqtSignal, QTimer
from PyQt6.QtGui import QFont, QPalette, QColor
import sys
import os

# Add the src directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))

from core.translate import TranslateService


class TranslateWorker(QThread):
    """Worker thread for translating text"""
    
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


class TranslationCard(QFrame):
    """Card widget to display translation results"""
    
    def __init__(self, translated_text: str, original_text: str, target_language: str, parent=None):
        super().__init__(parent)
        self.translated_text = translated_text
        self.original_text = original_text
        self.target_language = target_language
        self.setup_ui()
        
    def setup_ui(self):
        """Setup the translation card UI"""
        self.setFrameStyle(QFrame.Shape.StyledPanel)
        self.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)
        self.setMinimumHeight(120)
        self.setMaximumHeight(200)
        
        # Card styling to match notes panel
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
        
        # Header with title and language
        header_layout = QHBoxLayout()
        
        title_label = QLabel(f"Translated to {self.target_language}")
        title_label.setFont(QFont("Segoe UI", 10, QFont.Weight.Bold))
        title_label.setStyleSheet("color: #2c3e50;")
        
        # Copy button
        copy_btn = QPushButton("Copy")
        copy_btn.setFixedSize(50, 25)
        copy_btn.setStyleSheet("""
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
        copy_btn.clicked.connect(self.copy_translation)
        
        header_layout.addWidget(title_label, 1)
        header_layout.addWidget(copy_btn)
        
        # Translated text content
        content_label = QLabel(self.translated_text)
        content_label.setWordWrap(True)
        content_label.setStyleSheet("""
            color: #34495e;
            font-size: 11px;
            line-height: 1.4;
            padding: 4px 0;
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 4px;
            padding: 8px;
        """)
        
        # Original text reference
        original_text = f"Original: {self.original_text[:50]}{'...' if len(self.original_text) > 50 else ''}"
        original_label = QLabel(original_text)
        original_label.setStyleSheet("""
            color: #7f8c8d;
            font-size: 10px;
            font-style: italic;
        """)
        
        # Add all widgets to layout
        layout.addLayout(header_layout)
        layout.addWidget(content_label, 1)
        layout.addWidget(original_label)
        
    def copy_translation(self):
        """Copy translation to clipboard"""
        from PyQt6.QtWidgets import QApplication
        QApplication.clipboard().setText(self.translated_text)
        
        # Show brief feedback
        QMessageBox.information(self, "Copied", "Translation copied to clipboard!")


class TranslatePanel(QGroupBox):
    """Panel for translating text using AI"""
    
    # Signals
    translation_copied = pyqtSignal(str)  # When translation is copied to clipboard
    
    def __init__(self, parent=None):
        super().__init__("🌍 AI Translator", parent)
        self.service = TranslateService()
        self.worker = None
        self.setup_ui()
        self.setup_connections()
        
        # Timer for auto-save
        self.auto_save_timer = QTimer()
        self.auto_save_timer.timeout.connect(self.auto_save_content)
        self.auto_save_timer.setSingleShot(True)  # One-shot timer
        
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
        
        # Text input area
        input_label = QLabel("Enter text to translate:")
        input_label.setStyleSheet("font-weight: bold; color: #333; font-size: 11px;")
        
        self.text_input = QTextEdit()
        self.text_input.setPlaceholderText("Type your text here...")
        self.text_input.setMaximumHeight(80)
        self.text_input.setStyleSheet("""
            QTextEdit {
                border: 1px solid #ccc;
                border-radius: 4px;
                padding: 8px;
                font-size: 11px;
                background-color: white;
            }
            QTextEdit:focus {
                border: 1px solid #007acc;
            }
        """)
        
        # Language selection
        lang_label = QLabel("Target Language:")
        lang_label.setStyleSheet("font-weight: bold; color: #333; font-size: 11px;")
        
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
            "Swahili", "Amharic", "Yoruba", "Igbo", "Zulu", "Afrikaans"
        ])
        self.language_combo.setCurrentText("Spanish")
        self.language_combo.setStyleSheet("""
            QComboBox {
                border: 1px solid #ccc;
                border-radius: 4px;
                padding: 6px;
                font-size: 11px;
                background-color: white;
            }
            QComboBox:focus {
                border: 1px solid #007acc;
            }
        """)
        
        # Translate button (positioned between input and results)
        self.translate_button = QPushButton("Translate")
        self.translate_button.setMinimumHeight(32)
        self.translate_button.setStyleSheet("""
            QPushButton {
                background-color: #3498db;
                color: white;
                border: none;
                border-radius: 4px;
                padding: 6px 16px;
                font-size: 12px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #2980b9;
            }
            QPushButton:disabled {
                background-color: #cccccc;
                color: #666666;
            }
        """)
        
        # Progress bar
        self.progress_bar = QProgressBar()
        self.progress_bar.setVisible(False)
        self.progress_bar.setRange(0, 0)  # Indeterminate progress
        self.progress_bar.setStyleSheet("""
            QProgressBar {
                border: 1px solid #ccc;
                border-radius: 4px;
                text-align: center;
                background-color: #f8f9fa;
            }
            QProgressBar::chunk {
                background-color: #007acc;
                border-radius: 3px;
            }
        """)
        
        # Result area with simple box
        result_label = QLabel("Translation Result:")
        result_label.setStyleSheet("font-weight: bold; color: #333; font-size: 11px;")
        
        self.result_display = QTextEdit()
        self.result_display.setReadOnly(True)
        self.result_display.setMaximumHeight(120)
        self.result_display.setStyleSheet("""
            QTextEdit {
                background-color: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 4px;
                padding: 8px;
                font-size: 11px;
                color: #34495e;
            }
        """)
        
        # Copy button
        self.copy_button = QPushButton("Copy Result")
        self.copy_button.setMinimumHeight(28)
        self.copy_button.setStyleSheet("""
            QPushButton {
                background-color: #3498db;
                color: white;
                border: none;
                border-radius: 4px;
                padding: 4px 12px;
                font-size: 11px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #2980b9;
            }
            QPushButton:disabled {
                background-color: #cccccc;
                color: #666666;
            }
        """)
        self.copy_button.setEnabled(False)
        
        # Status label
        self.status_label = QLabel("")
        self.status_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.status_label.setStyleSheet("color: #666666; font-size: 10px;")
        
        # Add widgets to main layout
        layout.addWidget(input_label)
        layout.addWidget(self.text_input)
        layout.addWidget(lang_label)
        layout.addWidget(self.language_combo)
        layout.addWidget(self.translate_button)
        layout.addWidget(self.progress_bar)
        layout.addWidget(result_label)
        layout.addWidget(self.result_display)
        layout.addWidget(self.copy_button)
        layout.addWidget(self.status_label)
        
    def setup_connections(self):
        """Setup signal connections"""
        self.translate_button.clicked.connect(self.translate_text)
        self.copy_button.clicked.connect(self.copy_result)
        self.text_input.textChanged.connect(self.on_text_changed)
        
    def on_text_changed(self):
        """Handle text input changes"""
        has_text = bool(self.text_input.toPlainText().strip())
        self.translate_button.setEnabled(has_text)
        
        # Start auto-save timer
        self.auto_save_timer.start(1000)  # 1 second delay
        
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
        self.worker = TranslateWorker(self.service, text, target_language, user_id)
        self.worker.translated.connect(self.on_translation_complete)
        self.worker.error.connect(self.on_translation_error)
        self.worker.finished.connect(self.on_worker_finished)
        self.worker.start()
        
    def on_translation_complete(self, result):
        """Handle successful translation"""
        translated_text = result.get('translatedText', '')
        if translated_text:
            self.result_display.setPlainText(translated_text)
            self.copy_button.setEnabled(True)
            
            # Auto-copy to clipboard
            from PyQt6.QtWidgets import QApplication
            QApplication.clipboard().setText(translated_text)
            self.translation_copied.emit(translated_text)
            
            self.status_label.setText("Translation completed and copied to clipboard!")
            self.status_label.setStyleSheet("color: #28a745; font-size: 10px;")
            
            # Clear status after 2 seconds
            QTimer.singleShot(2000, lambda: self.status_label.clear())
        else:
            self.on_translation_error("No translation received from API")
            
    def on_translation_error(self, error_message):
        """Handle translation error"""
        self.result_display.clear()
        self.copy_button.setEnabled(False)
        self.status_label.setText(f"Error: {error_message}")
        self.status_label.setStyleSheet("color: #dc3545; font-size: 10px;")
        
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
        
        if processing:
            self.status_label.setText("Translating...")
            self.status_label.setStyleSheet("color: #007bff; font-size: 10px;")
            
    def copy_result(self):
        """Copy translation result to clipboard"""
        translated_text = self.result_display.toPlainText()
        if translated_text:
            from PyQt6.QtWidgets import QApplication
            QApplication.clipboard().setText(translated_text)
            self.status_label.setText("Translation copied to clipboard!")
            self.status_label.setStyleSheet("color: #28a745; font-size: 10px;")
            
            # Clear status after 2 seconds
            QTimer.singleShot(2000, lambda: self.status_label.clear())
            
    def set_text_from_clipboard(self, text: str):
        """Set text from clipboard"""
        if text and text.strip():
            self.text_input.setPlainText(text.strip())
            
    def test_connection(self) -> bool:
        """Test connection to backend API"""
        return self.service.test_connection()
