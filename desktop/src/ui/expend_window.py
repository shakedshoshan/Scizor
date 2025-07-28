#!/usr/bin/env python3
"""
Expanded Window for Scizor Desktop Application
Provides a larger, more feature-rich interface for easier feature access
"""

from PyQt6.QtWidgets import (
    QMainWindow, QWidget, QVBoxLayout, QHBoxLayout, 
    QTabWidget, QSplitter, QFrame, QLabel, QPushButton,
    QMessageBox, QStatusBar, QProgressBar, QSizePolicy
)
from PyQt6.QtCore import Qt, QTimer, QSize
from PyQt6.QtGui import QFont, QIcon, QPalette, QColor

# Import enhanced feature components
from .features.expend import (
    EnhancedHeaderPanel, EnhancedClipboardPanel, EnhancedNotesPanel, EnhancedEnhancePromptPanel, EnhancedGenerateResponsePanel
)
from core.clipboard_manager import get_clipboard_manager, start_clipboard_monitoring, stop_clipboard_monitoring
from core import start_hotkey_manager, stop_hotkey_manager, get_hotkey_manager


class ExpandedWindow(QMainWindow):
    """Expanded window with enhanced features for easier access"""
    
    def __init__(self, parent=None):
        """Initialize the expanded window"""
        super().__init__(parent)
        self.parent_window = parent
        self.setup_ui()
        self.setup_layout()
        self.setup_connections()
        self.setup_hotkeys()
        self.setup_status_bar()
        
    def setup_ui(self):
        """Initialize the UI components"""
        # Set window properties for a larger, more accessible interface
        self.setWindowTitle("Scizor Enhanced Dashboard")
        self.setMinimumSize(900, 700)
        self.resize(1200, 800)
        
        # Center the window on screen
        self.center_on_screen()
        
        # Set window flags for a modern application window
        self.setWindowFlags(
            Qt.WindowType.Window |  # Regular window
            Qt.WindowType.WindowMinMaxButtonsHint |  # Min/Max buttons
            Qt.WindowType.WindowCloseButtonHint  # Close button
        )
        
        # Set application icon and styling
        self.setStyleSheet("""
            QMainWindow {
                background-color: #f8f9fa;
            }
        """)
        
        # Create central widget
        self.central_widget = QWidget()
        self.setCentralWidget(self.central_widget)
        
        # Create main layout
        self.main_layout = QVBoxLayout(self.central_widget)
        self.main_layout.setContentsMargins(0, 0, 0, 0)
        self.main_layout.setSpacing(0)
        
    def setup_layout(self):
        """Setup the main layout with enhanced feature components"""
        # Create enhanced header
        self.header = EnhancedHeaderPanel()
        
        # Create main content area with tabs
        self.content_tabs = QTabWidget()
        self.content_tabs.setStyleSheet("""
            QTabWidget::pane {
                border: 1px solid #bdc3c7;
                border-radius: 5px;
                background-color: white;
            }
            QTabBar::tab {
                background-color: #ecf0f1;
                border: 1px solid #bdc3c7;
                border-bottom: none;
                border-radius: 5px 5px 0px 0px;
                padding: 8px 16px;
                margin-right: 2px;
                font-weight: bold;
                color: #2c3e50;
            }
            QTabBar::tab:selected {
                background-color: white;
                border-bottom: 1px solid white;
            }
            QTabBar::tab:hover {
                background-color: #d5dbdb;
            }
        """)
        
        # Create enhanced feature panels
        self.clipboard_panel = EnhancedClipboardPanel()
        self.enhance_prompt_panel = EnhancedEnhancePromptPanel()
        self.generate_response_panel = EnhancedGenerateResponsePanel()
        self.notes_panel = EnhancedNotesPanel()
        
        # Create tab pages
        self.setup_clipboard_tab()
        self.setup_enhance_prompt_tab()
        self.setup_generate_response_tab()
        self.setup_notes_tab()
        
        # Add widgets to main layout
        self.main_layout.addWidget(self.header)
        self.main_layout.addWidget(self.content_tabs, 1)
        
    def setup_clipboard_tab(self):
        """Setup the enhanced clipboard tab"""
        clipboard_widget = QWidget()
        clipboard_layout = QVBoxLayout(clipboard_widget)
        clipboard_layout.setContentsMargins(10, 10, 10, 10)
        
        # Add clipboard panel
        clipboard_layout.addWidget(self.clipboard_panel)
        
        self.content_tabs.addTab(clipboard_widget, "📋 Enhanced Clipboard")
        
    def setup_notes_tab(self):
        """Setup the enhanced notes tab"""
        notes_widget = QWidget()
        notes_layout = QVBoxLayout(notes_widget)
        notes_layout.setContentsMargins(15, 15, 15, 15)
        notes_layout.setSpacing(10)
        
        # Add notes panel with proper sizing
        self.notes_panel.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Expanding)
        notes_layout.addWidget(self.notes_panel)
        
        self.content_tabs.addTab(notes_widget, "📝 Enhanced Notes")
        
    def setup_enhance_prompt_tab(self):
        """Setup the enhanced prompt enhancement tab"""
        enhance_prompt_widget = QWidget()
        enhance_prompt_layout = QVBoxLayout(enhance_prompt_widget)
        enhance_prompt_layout.setContentsMargins(10, 10, 10, 10)
        
        # Add enhance prompt panel with proper sizing
        self.enhance_prompt_panel.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Expanding)
        enhance_prompt_layout.addWidget(self.enhance_prompt_panel)
        
        self.content_tabs.addTab(enhance_prompt_widget, "🚀 AI Prompt Enhancement")
        
    def setup_generate_response_tab(self):
        """Setup the enhanced response generation tab"""
        generate_response_widget = QWidget()
        generate_response_layout = QVBoxLayout(generate_response_widget)
        generate_response_layout.setContentsMargins(10, 10, 10, 10)
        
        # Add generate response panel with proper sizing
        self.generate_response_panel.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Expanding)
        generate_response_layout.addWidget(self.generate_response_panel)
        
        self.content_tabs.addTab(generate_response_widget, "🤖 AI Response Generation")
       
    def setup_connections(self):
        """Setup signal connections between components"""
        # Header connections
        self.header.settings_requested.connect(self.show_settings)
        
        # Clipboard connections
        self.clipboard_panel.clipboard_cleared.connect(self.on_clipboard_cleared)
        self.clipboard_panel.item_selected.connect(self.on_clipboard_item_selected)
        self.clipboard_panel.item_copied.connect(self.on_clipboard_item_copied)
        
        # Notes connections
        self.notes_panel.note_created.connect(self.on_note_created)
        self.notes_panel.note_updated.connect(self.on_note_updated)
        self.notes_panel.note_deleted.connect(self.on_note_deleted)
        self.notes_panel.notes_loaded.connect(self.on_notes_loaded)
        self.notes_panel.error_occurred.connect(self.on_notes_error)
        
        # Enhance Prompt connections
        self.enhance_prompt_panel.prompt_enhanced.connect(self.on_prompt_enhanced)
        self.enhance_prompt_panel.error_occurred.connect(self.on_enhance_prompt_error)
        
        # Generate Response connections
        self.generate_response_panel.response_generated.connect(self.on_response_generated)
        self.generate_response_panel.error_occurred.connect(self.on_generate_response_error)
        
    def setup_hotkeys(self):
        """Setup global hotkeys for expanded window control"""
        # Start the hotkey manager if not already running
        start_hotkey_manager()
        
        # Start clipboard monitoring if not already running
        start_clipboard_monitoring()
        
        # Connect to hotkey manager signals
        hotkey_manager = get_hotkey_manager()
        hotkey_manager.toggle_requested.connect(self.toggle_visibility)
        hotkey_manager.create_note_requested.connect(self.create_note_from_text)
        
    def setup_status_bar(self):
        """Setup the status bar with useful information"""
        self.status_bar = QStatusBar()
        self.setStatusBar(self.status_bar)
        
        # Add progress bar for operations
        self.progress_bar = QProgressBar()
        self.progress_bar.setVisible(False)
        self.progress_bar.setMaximumWidth(200)
        
        # Add status labels
        self.status_label = QLabel("Ready")
        self.status_label.setStyleSheet("color: #2c3e50;")
        
        self.status_bar.addWidget(self.status_label)
        self.status_bar.addPermanentWidget(self.progress_bar)
        
    def center_on_screen(self):
        """Center the window on the screen"""
        screen = self.screen()
        screen_geometry = screen.geometry()
        window_geometry = self.geometry()
        
        x = (screen_geometry.width() - window_geometry.width()) // 2
        y = (screen_geometry.height() - window_geometry.height()) // 2
        
        self.move(x, y)
        
    def toggle_visibility(self):
        """Toggle window visibility with hotkey"""
        if self.isVisible():
            self.hide()
        else:
            self.show()
            self.raise_()
            self.activateWindow()
            
    def create_note_from_text(self, selected_text: str):
        """Create note from selected text with hotkey"""
        if not self.isVisible():
            self.show()
            self.raise_()
            self.activateWindow()
        
        # Switch to notes tab and create note
        self.content_tabs.setCurrentIndex(1)
        self.notes_panel.create_note_from_text(selected_text)
        
    def show_settings(self):
        """Show settings dialog (placeholder)"""
        QMessageBox.information(self, "Settings", "Settings dialog will be implemented in future versions.")
        
    def change_theme(self, theme_name: str):
        """Change application theme"""
        # Placeholder for theme implementation
        self.status_label.setText(f"Theme changed to: {theme_name}")
        
            
    # Event handlers for feature components
    def on_clipboard_cleared(self):
        """Handle clipboard cleared event"""
        self.status_label.setText("Clipboard history cleared")
        
    def on_clipboard_item_selected(self, item_text):
        """Handle clipboard item selection"""
        self.status_label.setText(f"Selected: {item_text[:30]}...")
        
    def on_clipboard_item_copied(self, item_text):
        """Handle clipboard item copied"""
        self.status_label.setText(f"Copied to clipboard: {item_text[:30]}...")
        
    def on_note_created(self, note_data):
        """Handle note created event"""
        self.status_label.setText(f"Note created: {note_data.get('title', 'Untitled')}")
        
    def on_note_updated(self, note_data):
        """Handle note updated event"""
        self.status_label.setText(f"Note updated: {note_data.get('title', 'Untitled')}")
        
    def on_note_deleted(self, note_id):
        """Handle note deleted event"""
        self.status_label.setText(f"Note deleted")
        
    def on_notes_loaded(self, notes_list):
        """Handle notes loaded event"""
        self.status_label.setText(f"Loaded {len(notes_list)} notes")
        
    def on_notes_error(self, error_message):
        """Handle notes error event"""
        self.status_label.setText(f"Error: {error_message}")
        
    def on_prompt_enhanced(self, result_data):
        """Handle prompt enhanced event"""
        enhanced_prompt = result_data.get('enhancedPrompt', '')
        self.status_label.setText(f"Prompt enhanced: {enhanced_prompt[:50]}...")
        
    def on_enhance_prompt_error(self, error_message):
        """Handle enhance prompt error event"""
        self.status_label.setText(f"Enhance prompt error: {error_message}")
        
    def on_response_generated(self, result_data):
        """Handle response generated event"""
        generated_response = result_data.get('response', '')
        self.status_label.setText(f"Response generated: {generated_response[:50]}...")
        
    def on_generate_response_error(self, error_message):
        """Handle generate response error event"""
        self.status_label.setText(f"Generate response error: {error_message}")
        
        
    def showEvent(self, event):
        """Handle window show event"""
        super().showEvent(event)
