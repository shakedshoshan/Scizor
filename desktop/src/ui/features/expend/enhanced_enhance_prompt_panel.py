#!/usr/bin/env python3
"""
Enhanced Enhance Prompt Panel
Advanced UI component for enhancing prompts using AI in the expanded window
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


class EnhancedEnhancePromptWorker(QThread):
    """Enhanced worker thread for enhancing prompts"""
    
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


class EnhancedEnhancePromptPanel(QGroupBox):
    """Enhanced panel for enhancing prompts using AI"""
    
    # Signals
    prompt_enhanced = pyqtSignal(dict)  # Enhanced prompt result
    error_occurred = pyqtSignal(str)    # Error message
    
    def __init__(self, parent=None):
        super().__init__("🤖 Enhanced AI Prompt Enhancer", parent)
        self.enhance_service = EnhancePromptService()
        self.worker = None
        self.enhanced_prompts = []
        self.prompt_cards = {}
        self.setup_ui()
        self.setup_connections()
        
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
        
        # Prompt input
        prompt_label = QLabel("📝 Enter your prompt:")
        prompt_label.setStyleSheet("color: #2c3e50; font-weight: bold; font-size: 11px;")
        
        self.prompt_input = QTextEdit()
        self.prompt_input.setPlaceholderText("Type your prompt here...")
        self.prompt_input.setMaximumHeight(100)
        self.prompt_input.setStyleSheet("""
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
        
        # Action buttons
        button_layout = QHBoxLayout()
        
        self.enhance_button = QPushButton("🚀 Enhance")
        self.enhance_button.setStyleSheet("""
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
        
        button_layout.addWidget(self.enhance_button)
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
        
        input_layout.addWidget(prompt_label)
        input_layout.addWidget(self.prompt_input)
        input_layout.addLayout(button_layout)
        input_layout.addWidget(self.progress_bar)
        
        # Enhanced prompts scroll area
        self.prompts_scroll = QScrollArea()
        self.prompts_scroll.setWidgetResizable(True)
        self.prompts_scroll.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
        self.prompts_scroll.setVerticalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAsNeeded)
        self.prompts_scroll.setStyleSheet("""
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
        
        # Enhanced prompts container widget
        self.prompts_widget = QWidget()
        self.prompts_layout = QVBoxLayout(self.prompts_widget)
        self.prompts_layout.setAlignment(Qt.AlignmentFlag.AlignTop)
        self.prompts_layout.setSpacing(8)
        self.prompts_layout.setContentsMargins(8, 8, 8, 8)
        
        self.prompts_scroll.setWidget(self.prompts_widget)
        
        # Add widgets to main layout
        layout.addWidget(input_frame)
        layout.addWidget(self.prompts_scroll, 1)
        
    def setup_connections(self):
        """Setup signal connections"""
        self.enhance_button.clicked.connect(self.enhance_prompt)
        self.clear_button.clicked.connect(self.clear_all)
        
    def enhance_prompt(self):
        """Enhance the current prompt"""
        prompt = self.prompt_input.toPlainText().strip()
        
        if not prompt:
            QMessageBox.warning(self, "Empty Prompt", "Please enter a prompt to enhance.")
            return
            
        # Disable UI during processing
        self.set_processing_state(True)
        
        # Create and start worker thread
        self.worker = EnhancedEnhancePromptWorker(
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
            # Add to enhanced prompts list
            prompt_data = {
                'id': len(self.enhanced_prompts) + 1,
                'enhanced_prompt': enhanced_prompt,
                'original_prompt': self.prompt_input.toPlainText().strip()
            }
            self.enhanced_prompts.append(prompt_data)
            
            # Update display
            self.update_prompts_display()
            
            # Clear input
            self.prompt_input.clear()
            
            # Emit signal
            self.prompt_enhanced.emit(result)
        else:
            self.on_enhancement_error("No enhanced prompt received from API")
            
    def on_enhancement_error(self, error_message: str):
        """Handle enhancement error"""
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
            
    def clear_all(self):
        """Clear all inputs and results"""
        self.prompt_input.clear()
        self.enhanced_prompts.clear()
        self.update_prompts_display()
        
    def update_prompts_display(self):
        """Update the enhanced prompts display with cards"""
        # Clear existing cards
        for card in self.prompt_cards.values():
            self.prompts_layout.removeWidget(card)
            card.deleteLater()
        self.prompt_cards.clear()
        
        # Remove any existing stretch widget
        for i in reversed(range(self.prompts_layout.count())):
            item = self.prompts_layout.itemAt(i)
            if item.widget() and item.widget().sizePolicy().verticalPolicy() == QSizePolicy.Policy.Expanding:
                self.prompts_layout.removeItem(item)
                item.widget().deleteLater()
        
        # Add new cards
        for prompt_data in self.enhanced_prompts:
            card = EnhancedPromptCard(
                prompt_data['enhanced_prompt'],
                prompt_data['original_prompt'],
                self.prompts_widget
            )
            self.prompt_cards[prompt_data['id']] = card
            self.prompts_layout.addWidget(card)
        
        # Add stretch to push cards to top if there are prompts
        if self.enhanced_prompts:
            stretch = QWidget()
            stretch.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Expanding)
            self.prompts_layout.addWidget(stretch)
            
    def set_prompt_from_clipboard(self, text: str):
        """Set prompt from clipboard text"""
        if text and text.strip():
            self.prompt_input.setPlainText(text.strip())
            
    def test_connection(self) -> bool:
        """Test connection to backend API"""
        return self.enhance_service.test_connection()
