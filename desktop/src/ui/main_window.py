#!/usr/bin/env python3
"""
Main window for Scizor Desktop Application
Uses modular feature components for better organization
"""

from PyQt6.QtWidgets import QMainWindow, QWidget, QVBoxLayout
from PyQt6.QtCore import Qt

# Import modular feature components
from .features.desktop import (
    HeaderPanel, ClipboardPanel, NotesPanel, EnhancePromptPanel
)
from core.clipboard_manager import get_clipboard_manager, start_clipboard_monitoring, stop_clipboard_monitoring
from core import start_hotkey_manager, stop_hotkey_manager, get_hotkey_manager


class MainWindow(QMainWindow):
    """Main window class with all UI components"""
    
    def __init__(self):
        """Initialize the main window"""
        super().__init__()
        self.init_ui()
        self.setup_layout()
        self.setup_connections()
        self.setup_hotkeys()
        
    def init_ui(self):
        """Initialize the UI components"""
        # Set window properties for a thin dashboard on the right side
        self.setWindowTitle("Scizor Dashboard")
        self.setMinimumSize(350, 600)
        self.resize(400, 800)
        
        # Position window on the right side of the screen
        self.position_on_right_side()
        
        # Set window flags for a dashboard-like appearance
        self.setWindowFlags(
            Qt.WindowType.WindowStaysOnTopHint |  # Keep on top
            Qt.WindowType.FramelessWindowHint     # No window frame
        )
        
        # Create central widget
        self.central_widget = QWidget()
        self.setCentralWidget(self.central_widget)
        
        # Create main layout - vertical for a tall, thin dashboard
        self.main_layout = QVBoxLayout(self.central_widget)
        self.main_layout.setContentsMargins(5, 5, 5, 5)
        self.main_layout.setSpacing(5)
        
    def setup_layout(self):
        """Setup the main layout with modular feature components"""
        # Create feature components
        self.header = HeaderPanel()
        self.clipboard_panel = ClipboardPanel()
        self.enhance_prompt_panel = EnhancePromptPanel()
        self.notes_panel = NotesPanel()
        
        # Add components to layout
        self.main_layout.addWidget(self.header)
        self.main_layout.addWidget(self.clipboard_panel)
        self.main_layout.addWidget(self.enhance_prompt_panel)
        self.main_layout.addWidget(self.notes_panel)
        
        
    def setup_connections(self):
        """Setup signal connections between feature components"""
        # Header connections
        self.header.close_requested.connect(self.close)
        self.header.expand_requested.connect(self.open_expanded_window)
        
        # Clipboard connections
        self.clipboard_panel.clipboard_cleared.connect(self.on_clipboard_cleared)
        self.clipboard_panel.item_selected.connect(self.on_clipboard_item_selected)
        
        # Notes connections
        self.notes_panel.note_created.connect(self.on_note_created)
        self.notes_panel.note_updated.connect(self.on_note_updated)
        self.notes_panel.note_deleted.connect(self.on_note_deleted)
        self.notes_panel.notes_loaded.connect(self.on_notes_loaded)
        self.notes_panel.error_occurred.connect(self.on_notes_error)
        
        # Enhance Prompt connections
        self.enhance_prompt_panel.prompt_enhanced.connect(self.on_prompt_enhanced)
        self.enhance_prompt_panel.error_occurred.connect(self.on_enhance_prompt_error)
        
    def setup_hotkeys(self):
        """Setup global hotkeys for dashboard control"""
        # Start the hotkey manager
        start_hotkey_manager()
        
        # Start clipboard monitoring
        start_clipboard_monitoring()
        
        # Connect to hotkey manager signals
        hotkey_manager = get_hotkey_manager()
        hotkey_manager.toggle_requested.connect(self.toggle_visibility)
        hotkey_manager.create_note_requested.connect(self.create_note_from_text)
        # Note: enhance_prompt_requested is handled directly in hotkey_manager for direct text replacement
        
    def toggle_visibility(self):
        """Toggle dashboard visibility with Ctrl+Alt+S"""
        if self.isVisible():
            self.hide()
        else:
            self.show()
            # Bring to front and focus
            self.raise_()
            self.activateWindow()
    
    def create_note_from_text(self, selected_text: str):
        """Create note from selected text with Ctrl+Alt+N"""
        # Show the dashboard if it's hidden
        if not self.isVisible():
            self.show()
            self.raise_()
            self.activateWindow()
        
        # Create the note using the notes panel
        self.notes_panel.create_note_from_text(selected_text)
        
    def open_expanded_window(self):
        """Open the expanded dashboard window"""
        try:
            from .expend_window import ExpandedWindow
            self.expanded_window = ExpandedWindow(self)
            self.expanded_window.show()
            self.expanded_window.raise_()
            self.expanded_window.activateWindow()
        except Exception as e:
            print(f"Error opening expanded window: {e}")
        
    def position_on_right_side(self):
        """Position the window on the right side of the screen"""
        screen = self.screen()
        screen_geometry = screen.geometry()
        window_geometry = self.geometry()
        
        # Position on the right side with some margin
        x = screen_geometry.width() - window_geometry.width() - 20
        y = (screen_geometry.height() - window_geometry.height()) // 2
        
        self.move(x, y)
        
    # # Event handlers for feature components
    def on_clipboard_cleared(self):
        """Handle clipboard cleared event"""
        print("Clipboard cleared")
        
    def on_clipboard_item_selected(self, item_text):
        """Handle clipboard item selection"""
        print(f"Selected: {item_text[:30]}...")
        
    def on_note_created(self, note_data):
        """Handle note created event"""
        print(f"Note created: {note_data.get('title', 'Untitled')}")
        
    def on_note_updated(self, note_data):
        """Handle note updated event"""
        print(f"Note updated: {note_data.get('title', 'Untitled')}")
        
    def on_note_deleted(self, note_id):
        """Handle note deleted event"""
        print(f"Note deleted: {note_id}")
        
    def on_notes_loaded(self, notes_list):
        """Handle notes loaded event"""
        print(f"Notes loaded: {len(notes_list)} notes")
        
    def on_notes_error(self, error_message):
        """Handle notes error event"""
        print(f"Notes error: {error_message}")
        
    def on_prompt_enhanced(self, result_data):
        """Handle prompt enhanced event"""
        enhanced_prompt = result_data.get('enhancedPrompt', '')
        print(f"Prompt enhanced: {enhanced_prompt[:50]}...")
        
    def on_enhance_prompt_error(self, error_message):
        """Handle enhance prompt error event"""
        print(f"Enhance prompt error: {error_message}")
        
    def closeEvent(self, event):
        """Handle application close event"""
        try:
            # Stop hotkey manager
            stop_hotkey_manager()
            
            # Stop clipboard monitoring
            stop_clipboard_monitoring()
            
            # Close clipboard manager
            from core.clipboard_manager import close_clipboard_manager
            close_clipboard_manager()
        except Exception as e:
            print(f"Error during cleanup: {e}")
        
        event.accept()
        