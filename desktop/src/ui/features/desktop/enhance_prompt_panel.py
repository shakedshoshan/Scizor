#!/usr/bin/env python3
"""
Enhance Prompt Panel
UI component for enhancing prompts using AI
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

from core.enhance_prompt import EnhancePromptService


class EnhancePromptWorker(QThread):
    """Worker thread for enhancing prompts"""
    
    # Signals
    enhanced = pyqtSignal(dict)  # Enhanced prompt result
    error = pyqtSignal(str)      # Error message
    finished = pyqtSignal()      # Thread finished
    
    def __init__(self, service: EnhancePromptService, prompt: str):
        super().__init__()
        self.service = service
        self.prompt = prompt
        
    def run(self):
        """Run the enhancement in background thread"""
        try:
            result = self.service.enhance_prompt(
                self.prompt,
            )
            self.enhanced.emit(result)
        except Exception as e:
            self.error.emit(str(e))
        finally:
            self.finished.emit()


class EnhancedPromptCard(QFrame):
    """Card widget to display enhanced prompt results"""
    
    def __init__(self, enhanced_prompt: str, original_prompt: str, parent=None):
        super().__init__(parent)
        self.enhanced_prompt = enhanced_prompt
        self.original_prompt = original_prompt
        self.setup_ui()
        
    def setup_ui(self):
        """Setup the enhanced prompt card UI"""
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
        
        # Header with title
        header_layout = QHBoxLayout()
        
        title_label = QLabel("Enhanced Prompt")
        title_label.setFont(QFont("Segoe UI", 10, QFont.Weight.Bold))
        title_label.setStyleSheet("color: #2c3e50;")
        
        # Copy button
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
        copy_btn.clicked.connect(self.copy_enhanced_prompt)
        
        header_layout.addWidget(title_label, 1)
        header_layout.addWidget(copy_btn)
        
        # Enhanced prompt content
        content_label = QLabel(self.enhanced_prompt)
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
        
        # Original prompt reference
        original_text = f"Original: {self.original_prompt[:50]}{'...' if len(self.original_prompt) > 50 else ''}"
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
        
    def copy_enhanced_prompt(self):
        """Copy enhanced prompt to clipboard"""
        from PyQt6.QtWidgets import QApplication
        QApplication.clipboard().setText(self.enhanced_prompt)
        
        # Show brief feedback
        QMessageBox.information(self, "Copied", "Enhanced prompt copied to clipboard!")


class EnhancePromptPanel(QGroupBox):
    """Panel for enhancing prompts using AI"""
    
    # Signals
    prompt_enhanced = pyqtSignal(dict)  # Enhanced prompt result
    error_occurred = pyqtSignal(str)    # Error message
    
    def __init__(self, parent=None):
        super().__init__("🤖 AI Prompt Enhancer", parent)
        self.enhance_service = EnhancePromptService()
        self.worker = None
        self.setup_ui()
        self.setup_connections()
        
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
        
        # Prompt input area
        prompt_label = QLabel("Enter your prompt:")
        prompt_label.setStyleSheet("font-weight: bold; color: #333; font-size: 11px;")
        
        self.prompt_input = QTextEdit()
        self.prompt_input.setPlaceholderText("Type your prompt here...")
        self.prompt_input.setMaximumHeight(80)
        self.prompt_input.setStyleSheet("""
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
        
        # Enhance button (positioned between input and results)
        self.enhance_button = QPushButton("Enhance")
        self.enhance_button.setMinimumHeight(32)
        self.enhance_button.setStyleSheet("""
            QPushButton {
                background-color: #28a745;
                color: white;
                border: none;
                border-radius: 4px;
                padding: 6px 16px;
                font-size: 12px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #218838;
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
        result_label = QLabel("Enhanced Result:")
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
                background-color: #9b59b6;
                color: white;
                border: none;
                border-radius: 4px;
                padding: 4px 12px;
                font-size: 11px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #8e44ad;
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
        layout.addWidget(prompt_label)
        layout.addWidget(self.prompt_input)
        layout.addWidget(self.enhance_button)
        layout.addWidget(self.progress_bar)
        layout.addWidget(result_label)
        layout.addWidget(self.result_display)
        layout.addWidget(self.copy_button)
        layout.addWidget(self.status_label)
        
    def setup_connections(self):
        """Setup signal connections"""
        self.enhance_button.clicked.connect(self.enhance_prompt)
        self.copy_button.clicked.connect(self.copy_result)
        
    def enhance_prompt(self):
        """Enhance the current prompt"""
        prompt = self.prompt_input.toPlainText().strip()
        
        if not prompt:
            QMessageBox.warning(self, "Empty Prompt", "Please enter a prompt to enhance.")
            return
            
        
        
        # Disable UI during processing
        self.set_processing_state(True)
        
        # Create and start worker thread
        self.worker = EnhancePromptWorker(
            self.enhance_service,
            prompt,
        )
        
        self.worker.enhanced.connect(self.on_enhancement_complete)
        self.worker.error.connect(self.on_enhancement_error)
        self.worker.finished.connect(self.on_worker_finished)
        
        self.worker.start()
        
    def on_enhancement_complete(self, result: dict):
        """Handle successful enhancement"""
        enhanced_prompt = result.get('enhancedPrompt', '')
        if enhanced_prompt:
            self.result_display.setPlainText(enhanced_prompt)
            self.copy_button.setEnabled(True)
            
            # Emit signal
            self.prompt_enhanced.emit(result)
        else:
            self.on_enhancement_error("No enhanced prompt received from API")
            
    def on_enhancement_error(self, error_message: str):
        """Handle enhancement error"""
        self.result_display.clear()
        self.copy_button.setEnabled(False)
        self.status_label.setText(f"Error: {error_message}")
        self.status_label.setStyleSheet("color: #dc3545; font-size: 10px;")
        
        # Show error dialog
        QMessageBox.critical(self, "Enhancement Error", f"Failed to enhance prompt:\n{error_message}")
        
        # Emit signal
        self.error_occurred.emit(error_message)
        
    def on_worker_finished(self):
        """Handle worker thread completion"""
        self.set_processing_state(False)
        if self.worker:
            self.worker.deleteLater()
            self.worker = None
            
    def set_processing_state(self, processing: bool):
        """Set UI to processing state"""
        self.enhance_button.setEnabled(not processing)
        self.prompt_input.setEnabled(not processing)
        self.progress_bar.setVisible(processing)
        
        if processing:
            self.status_label.setText("Enhancing prompt...")
            self.status_label.setStyleSheet("color: #007bff; font-size: 10px;")
            
    def copy_result(self):
        """Copy enhanced prompt to clipboard"""
        enhanced_text = self.result_display.toPlainText()
        if enhanced_text:
            from PyQt6.QtWidgets import QApplication
            QApplication.clipboard().setText(enhanced_text)
            self.status_label.setText("Enhanced prompt copied to clipboard!")
            self.status_label.setStyleSheet("color: #28a745; font-size: 10px;")
            
            # Clear status after 2 seconds
            QTimer.singleShot(2000, lambda: self.status_label.clear())
            
    def set_prompt_from_clipboard(self, text: str):
        """Set prompt from clipboard text"""
        if text and text.strip():
            self.prompt_input.setPlainText(text.strip())
            
    def test_connection(self) -> bool:
        """Test connection to backend API"""
        return self.enhance_service.test_connection()
