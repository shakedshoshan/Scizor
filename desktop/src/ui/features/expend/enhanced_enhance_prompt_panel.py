#!/usr/bin/env python3
"""
Enhanced Enhance Prompt Panel
Advanced UI component for enhancing prompts using AI in the expanded window
"""

from PyQt6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QTextEdit, 
    QPushButton, QComboBox, QLabel, QLineEdit,
    QProgressBar, QMessageBox, QFrame, QScrollArea,
    QGroupBox, QGridLayout, QSplitter, QTabWidget
)
from PyQt6.QtCore import Qt, QThread, pyqtSignal, QTimer
from PyQt6.QtGui import QFont, QPalette, QColor, QTextCursor
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
    progress = pyqtSignal(str)   # Progress updates
    
    def __init__(self, service: EnhancePromptService, prompt: str):
        super().__init__()
        self.service = service
        self.prompt = prompt
        
    def run(self):
        """Run the enhancement in background thread"""
        try:
            self.progress.emit("Preparing enhancement request...")
            result = self.service.enhance_prompt(
                self.prompt,
            )
            self.progress.emit("Enhancement completed successfully!")
            self.enhanced.emit(result)
        except Exception as e:
            self.error.emit(str(e))
        finally:
            self.finished.emit()


class EnhancedEnhancePromptPanel(QWidget):
    """Enhanced panel for enhancing prompts using AI"""
    
    # Signals
    prompt_enhanced = pyqtSignal(dict)  # Enhanced prompt result
    error_occurred = pyqtSignal(str)    # Error message
    
    def __init__(self):
        super().__init__()
        self.enhance_service = EnhancePromptService()
        self.worker = None
        self.init_ui()
        self.setup_connections()
        
    def init_ui(self):
        """Initialize the enhanced UI components"""
        # Main layout
        main_layout = QVBoxLayout(self)
        main_layout.setContentsMargins(15, 15, 15, 15)
        main_layout.setSpacing(10)
        
        # Title
        title = QLabel("AI Prompt Enhancement")
        title.setFont(QFont("Arial", 16, QFont.Weight.Bold))
        title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        title.setStyleSheet("color: #2c3e50; margin-bottom: 10px;")
        main_layout.addWidget(title)
        
        # Create splitter for better layout
        splitter = QSplitter(Qt.Orientation.Horizontal)
        main_layout.addWidget(splitter)
        
        # Left panel - Input and controls
        left_panel = self.create_input_panel()
        splitter.addWidget(left_panel)
        
        # Right panel - Results and history
        right_panel = self.create_results_panel()
        splitter.addWidget(right_panel)
        
        # Set splitter proportions
        splitter.setSizes([400, 600])
        
        # Status bar
        self.status_label = QLabel("Ready to enhance prompts")
        self.status_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.status_label.setStyleSheet("""
            QLabel {
                color: #7f8c8d;
                font-size: 11px;
                padding: 5px;
                background-color: #ecf0f1;
                border-radius: 4px;
            }
        """)
        main_layout.addWidget(self.status_label)
        
        # Set panel style
        self.setStyleSheet("""
            QWidget {
                background-color: #ffffff;
                border: 1px solid #bdc3c7;
                border-radius: 8px;
            }
        """)
        
    def create_input_panel(self):
        """Create the input panel with controls"""
        panel = QWidget()
        layout = QVBoxLayout(panel)
        layout.setContentsMargins(10, 10, 10, 10)
        layout.setSpacing(10)
        
        # Prompt input group
        prompt_group = QGroupBox("Original Prompt")
        prompt_group.setFont(QFont("Arial", 11, QFont.Weight.Bold))
        prompt_layout = QVBoxLayout(prompt_group)
        
        self.prompt_input = QTextEdit()
        self.prompt_input.setPlaceholderText("Enter your prompt here...\n\nTips:\n• Be specific about what you want\n• Include relevant context\n• Specify your target audience")
        self.prompt_input.setMinimumHeight(150)
        self.prompt_input.setStyleSheet("""
            QTextEdit {
                border: 2px solid #bdc3c7;
                border-radius: 6px;
                padding: 10px;
                font-size: 12px;
                line-height: 1.4;
            }
            QTextEdit:focus {
                border-color: #3498db;
            }
        """)
        prompt_layout.addWidget(self.prompt_input)
        
        layout.addWidget(prompt_group)
        
        # Action buttons
        button_layout = QHBoxLayout()
        
        self.enhance_button = QPushButton("🚀 Enhance Prompt")
        self.enhance_button.setFont(QFont("Arial", 11, QFont.Weight.Bold))
        self.enhance_button.setStyleSheet("""
            QPushButton {
                background-color: #27ae60;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 6px;
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
        
        self.clear_button = QPushButton("🗑️ Clear All")
        self.clear_button.setStyleSheet("""
            QPushButton {
                background-color: #e74c3c;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 6px;
            }
            QPushButton:hover {
                background-color: #c0392b;
            }
        """)
        
        self.paste_button = QPushButton("📋 Paste from Clipboard")
        self.paste_button.setStyleSheet("""
            QPushButton {
                background-color: #3498db;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 6px;
            }
            QPushButton:hover {
                background-color: #2980b9;
            }
        """)
        
        button_layout.addWidget(self.enhance_button)
        button_layout.addWidget(self.paste_button)
        button_layout.addWidget(self.clear_button)
        layout.addLayout(button_layout)
        
        # Progress bar
        self.progress_bar = QProgressBar()
        self.progress_bar.setVisible(False)
        self.progress_bar.setRange(0, 0)  # Indeterminate progress
        self.progress_bar.setStyleSheet("""
            QProgressBar {
                border: 2px solid #bdc3c7;
                border-radius: 6px;
                text-align: center;
                background-color: #ecf0f1;
            }
            QProgressBar::chunk {
                background-color: #3498db;
                border-radius: 4px;
            }
        """)
        layout.addWidget(self.progress_bar)
        
        return panel
        
    def create_results_panel(self):
        """Create the results panel with tabs"""
        panel = QWidget()
        layout = QVBoxLayout(panel)
        layout.setContentsMargins(10, 10, 10, 10)
        
        # Create tab widget
        self.tab_widget = QTabWidget()
        self.tab_widget.setStyleSheet("""
            QTabWidget::pane {
                border: 2px solid #bdc3c7;
                border-radius: 6px;
                background-color: #ffffff;
            }
            QTabBar::tab {
                background-color: #ecf0f1;
                padding: 8px 16px;
                margin-right: 2px;
                border-top-left-radius: 4px;
                border-top-right-radius: 4px;
            }
            QTabBar::tab:selected {
                background-color: #3498db;
                color: white;
            }
        """)
        
        # Enhanced prompt tab
        self.result_display = QTextEdit()
        self.result_display.setReadOnly(True)
        self.result_display.setStyleSheet("""
            QTextEdit {
                border: none;
                padding: 15px;
                font-size: 13px;
                line-height: 1.5;
                background-color: #f8f9fa;
            }
        """)
        self.tab_widget.addTab(self.result_display, "Enhanced Prompt")
        
        
        layout.addWidget(self.tab_widget)
        
        # Action buttons for results
        result_button_layout = QHBoxLayout()
        
        self.copy_button = QPushButton("📋 Copy Enhanced Prompt")
        self.copy_button.setStyleSheet("""
            QPushButton {
                background-color: #9b59b6;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #8e44ad;
            }
            QPushButton:disabled {
                background-color: #bdc3c7;
                color: #7f8c8d;
            }
        """)
        self.copy_button.setEnabled(False)
        
        self.save_button = QPushButton("💾 Save to Notes")
        self.save_button.setStyleSheet("""
            QPushButton {
                background-color: #f39c12;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #e67e22;
            }
            QPushButton:disabled {
                background-color: #bdc3c7;
                color: #7f8c8d;
            }
        """)
        self.save_button.setEnabled(False)
        

        
        result_button_layout.addWidget(self.copy_button)
        result_button_layout.addWidget(self.save_button)
        layout.addLayout(result_button_layout)
        
        return panel
        
    def setup_connections(self):
        """Setup signal connections"""
        self.enhance_button.clicked.connect(self.enhance_prompt)
        self.clear_button.clicked.connect(self.clear_all)
        self.paste_button.clicked.connect(self.paste_from_clipboard)
        self.copy_button.clicked.connect(self.copy_result)
        self.save_button.clicked.connect(self.save_to_notes)
        
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
        self.worker.progress.connect(self.update_status)
        
        self.worker.start()
        
    def on_enhancement_complete(self, result: dict):
        """Handle successful enhancement"""
        enhanced_prompt = result.get('enhancedPrompt', '')
        if enhanced_prompt:
            # Display enhanced prompt
            self.result_display.setPlainText(enhanced_prompt)
            
            # Enable action buttons
            self.copy_button.setEnabled(True)
            self.save_button.setEnabled(True)
            
            # Switch to result tab
            self.tab_widget.setCurrentIndex(0)
            
            # Update status
            self.update_status("Prompt enhanced successfully!")
            
            # Emit signal
            self.prompt_enhanced.emit(result)
        else:
            self.on_enhancement_error("No enhanced prompt received from API")
            
    def on_enhancement_error(self, error_message: str):
        """Handle enhancement error"""
        self.result_display.setPlainText("")
        self.copy_button.setEnabled(False)
        self.save_button.setEnabled(False)
        self.update_status(f"Error: {error_message}")
        
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
            self.update_status("Enhancing prompt...")
            
    def update_status(self, message: str):
        """Update status message"""
        self.status_label.setText(message)
        if "Error" in message:
            self.status_label.setStyleSheet("color: #e74c3c; font-size: 11px; padding: 5px; background-color: #fdf2f2; border-radius: 4px;")
        elif "successfully" in message.lower():
            self.status_label.setStyleSheet("color: #27ae60; font-size: 11px; padding: 5px; background-color: #f0f9f0; border-radius: 4px;")
        else:
            self.status_label.setStyleSheet("color: #3498db; font-size: 11px; padding: 5px; background-color: #f0f8ff; border-radius: 4px;")
            
    
    def clear_all(self):
        """Clear all inputs and results"""
        self.prompt_input.clear()
        self.copy_button.setEnabled(False)
        self.save_button.setEnabled(False)
        self.update_status("Ready to enhance prompts")
        
    def paste_from_clipboard(self):
        """Paste text from clipboard"""
        clipboard = self.window().clipboard()
        text = clipboard.text()
        if text and text.strip():
            self.prompt_input.setPlainText(text.strip())
            self.update_status("Text pasted from clipboard")
        else:
            self.update_status("No text in clipboard")
            
    def copy_result(self):
        """Copy enhanced prompt to clipboard"""
        enhanced_text = self.result_display.toPlainText()
        if enhanced_text:
            clipboard = self.window().clipboard()
            clipboard.setText(enhanced_text)
            self.update_status("Enhanced prompt copied to clipboard!")
            
            # Clear status after 3 seconds
            QTimer.singleShot(3000, lambda: self.update_status("Ready to enhance prompts"))
            
    def save_to_notes(self):
        """Save enhanced prompt to notes"""
        enhanced_text = self.result_display.toPlainText()
        if enhanced_text:
            # This would integrate with the notes system
            # For now, just show a message
            QMessageBox.information(self, "Save to Notes", "This feature will integrate with the notes system.")
            self.update_status("Save to notes feature coming soon!")
            
        
    def set_prompt_from_clipboard(self, text: str):
        """Set prompt from clipboard text"""
        if text and text.strip():
            self.prompt_input.setPlainText(text.strip())
            
    def test_connection(self) -> bool:
        """Test connection to backend API"""
        return self.enhance_service.test_connection()
