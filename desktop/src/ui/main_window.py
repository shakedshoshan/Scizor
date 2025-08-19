#!/usr/bin/env python3
"""
Main window for Scizor Desktop Application
Uses modular feature components for better organization
"""

from PyQt6.QtWidgets import QMainWindow, QWidget, QVBoxLayout, QSplitter, QHBoxLayout, QMenuBar, QMenu
from PyQt6.QtCore import Qt
from PyQt6.QtGui import QAction

# Import modular feature components
from .features.desktop import (
    HeaderPanel, ClipboardPanel, NotesPanel, EnhancePromptPanel, GenerateResponsePanel, TranslatePanel
)
from core.clipboard_manager import get_clipboard_manager, start_clipboard_monitoring, stop_clipboard_monitoring
from core import start_hotkey_manager, stop_hotkey_manager, get_hotkey_manager


class MainWindow(QMainWindow):
    """Main window class with all UI components"""
    
    def __init__(self, user_id: str = None):
        """Initialize the main window"""
        super().__init__()
        self.user_id = user_id
        self.current_settings = self.load_settings_from_database()
        self.init_ui()
        self.setup_layout()
        self.setup_connections()
        self.setup_hotkeys()
        
        # Apply initial layout based on settings
        self.rebuild_layout()
     
        
    def init_ui(self):
        """Initialize the UI components"""
        # Set window properties for a thin dashboard on the right side
        self.setWindowTitle("Scizor Dashboard")
        self.setMinimumSize(350, 600)
        self.resize(400, 800)
        
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
        
        # Position window on the right side of the screen
        self.position_on_right_side()
        
    def setup_layout(self):
        """Setup the main layout with modular feature components using splitters"""
        # Create feature components
        self.header = HeaderPanel()
        self.clipboard_panel = ClipboardPanel()
        self.enhance_prompt_panel = EnhancePromptPanel(user_id=self.user_id)
        self.generate_response_panel = GenerateResponsePanel(user_id=self.user_id)
        self.translate_panel = TranslatePanel()
        self.notes_panel = NotesPanel()
        
        # Create main vertical splitter
        self.main_splitter = QSplitter(Qt.Orientation.Vertical)
        self.main_splitter.setChildrenCollapsible(False)  # Prevent panels from being collapsed to zero size
        
        # Add header to main splitter
        self.main_splitter.addWidget(self.header)
        self.main_layout.addWidget(self.main_splitter)
        
        # Main splitter is already stored as self.main_splitter
        
        # Store panels for settings management
        self.panels = {
            'Header Panel': self.header,
            'Clipboard History': self.clipboard_panel,
            'Notes': self.notes_panel,
            'AI Prompt Enhancement': self.enhance_prompt_panel,
            'AI Smart Response': self.generate_response_panel,
            'AI Translation': self.translate_panel
        }
        
        # Store feature name mappings for visibility
        self.feature_visibility_mapping = {
            'Clipboard History': 'clipboard_history',
            'Notes': 'notes',
            'AI Prompt Enhancement': 'ai_prompt_enhancement',
            'AI Smart Response': 'ai_smart_response',
            'AI Translation': 'ai_translation'
        }
        
    def setup_connections(self):
        """Setup signal connections between feature components"""
        # Header connections
        self.header.close_requested.connect(self.toggle_visibility)
        self.header.expand_requested.connect(self.open_expanded_window)
        self.header.settings_requested.connect(self.open_settings)
        
        # Enhance Prompt connections
        self.enhance_prompt_panel.error_occurred.connect(self.on_enhance_prompt_error)
        
        # Translation connections
        self.translate_panel.translation_copied.connect(self.on_translation_copied)
        
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
            self.expanded_window = ExpandedWindow(self, user_id=self.user_id)
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
        
    def update_window_size_for_columns(self, columns):
        """Update window size based on number of columns"""
        base_width = 400  # Base width for single column
        column_width = 350  # Width per additional column
        min_width = 350
        max_width = 1200  # Maximum width to prevent going off-screen
        
        if columns == 1:
            new_width = base_width
        else:
            new_width = base_width + (columns - 1) * column_width
            new_width = max(min_width, min(new_width, max_width))
        
        # Update window size
        current_height = self.height()
        self.resize(new_width, current_height)
        
        # Reposition window to stay on right side
        self.position_on_right_side()
        
    def get_panel_sizes(self):
        """Get current panel sizes for saving/restoring layout"""
        return {
            'main_splitter': self.main_splitter.sizes(),
            'top_splitter': self.top_splitter.sizes(),
            'ai_splitter': self.ai_splitter.sizes()
        }
        
    def set_panel_sizes(self, sizes_dict):
        """Set panel sizes from saved layout"""
        if 'main_splitter' in sizes_dict:
            self.main_splitter.setSizes(sizes_dict['main_splitter'])
        if 'top_splitter' in sizes_dict:
            self.top_splitter.setSizes(sizes_dict['top_splitter'])
        if 'ai_splitter' in sizes_dict:
            self.ai_splitter.setSizes(sizes_dict['ai_splitter'])
        
    # Event handlers for feature components

        
    def on_enhance_prompt_error(self, error_message):
        """Handle enhance prompt error event"""
        print(f"Enhance prompt error: {error_message}")
        
        
    def on_generate_response_error(self, error_message):
        """Handle generate response error event"""
        print(f"Generate response error: {error_message}")
        
    def on_translation_copied(self, translated_text):
        """Handle translation copied to clipboard event"""
        print(f"Translation copied: {translated_text[:50]}...")
        
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
        
   
    def get_default_settings(self):
        """Get default settings for the main window"""
        return {
            'feature_order': [
                'Clipboard History',
                'Notes',
                'AI Prompt Enhancement',
                'AI Smart Response',
                'AI Translation'
            ],
            'columns': 1,
            'features_per_column': 2,
            'visibility': {
                'header': True,  # Header is always visible
                'clipboard_history': True,
                'notes': True,
                'ai_prompt_enhancement': True,
                'ai_smart_response': False,
                'ai_translation': False
            }
        }
    
    def load_settings_from_database(self):
        """Load settings from database or return defaults"""
        try:
            from database.db_connection import get_database
            db = get_database()
            settings = db.load_layout_settings()
            return settings
        except Exception as e:
            print(f"Failed to load settings from database: {e}")
            return self.get_default_settings()
        
    def open_settings(self):
        """Open the settings window"""
        try:
            from .setting_window import SettingsWindow
            settings_window = SettingsWindow(self)
            settings_window.load_settings(self.current_settings)
            settings_window.settings_applied.connect(self.apply_settings)
            settings_window.exec()
        except Exception as e:
            print(f"Error opening settings window: {e}")
            
    def apply_settings(self, settings):
        """Apply new settings to the main window"""
        self.current_settings = settings
        self.rebuild_layout()
        
        # Save settings to database
        try:
            from database.db_connection import get_database
            db = get_database()
            db.save_layout_settings(settings)
        except Exception as e:
            print(f"Failed to save settings to database: {e}")
        
    def rebuild_layout(self):
        """Rebuild the layout based on current settings"""
        # Clear existing layout - but keep the header
        # Remove all widgets except header from main splitter
        widgets_to_remove = []
        for i in range(self.main_splitter.count()):
            widget = self.main_splitter.widget(i)
            if widget != self.header:
                widgets_to_remove.append(widget)
        
        # Remove widgets safely
        for widget in widgets_to_remove:
            if widget:
                widget.setParent(None)
        
        # Get visible features in order
        visible_features = []
        for feature_name in self.current_settings['feature_order']:
            # Map feature names to visibility keys using the mapping
            visibility_key = self.feature_visibility_mapping.get(feature_name, feature_name.lower().replace(' ', '_'))
            if self.current_settings['visibility'].get(visibility_key, True):
                visible_features.append(feature_name)
                
        if not visible_features:
            return
            
        # Rebuild layout based on settings
        columns = self.current_settings['columns']
        features_per_column = self.current_settings['features_per_column']
        
        # Update window size based on number of columns
        self.update_window_size_for_columns(columns)
        
        # Create new layout structure
        if columns == 1:
            # Single column layout
            for feature_name in visible_features:
                if feature_name in self.panels:
                    panel = self.panels[feature_name]
                    self.main_splitter.addWidget(panel)
                    # Ensure the panel is visible
                    panel.setVisible(True)
                    panel.show()
        else:
            # Multi-column layout using horizontal splitter
            # Create a horizontal splitter for columns
            columns_splitter = QSplitter(Qt.Orientation.Horizontal)
            columns_splitter.setChildrenCollapsible(False)
            
            # Create vertical splitters for each column
            column_splitters = []
            for col in range(columns):
                column_splitter = QSplitter(Qt.Orientation.Vertical)
                column_splitter.setChildrenCollapsible(False)
                column_splitters.append(column_splitter)
                columns_splitter.addWidget(column_splitter)
            
            # Distribute features across columns
            for i, feature_name in enumerate(visible_features):
                if feature_name in self.panels:
                    # Calculate which column this feature should go in
                    column_index = (i // features_per_column) % columns
                    panel = self.panels[feature_name]
                    column_splitters[column_index].addWidget(panel)
                    # Ensure the panel is visible
                    panel.setVisible(True)
                    panel.show()
            
            # Add the columns splitter to main splitter
            self.main_splitter.addWidget(columns_splitter)
            
            # Set equal column widths
            column_widths = [self.width() // columns] * columns
            columns_splitter.setSizes(column_widths)
                
        # Set splitter sizes - header gets smaller size
        if self.main_splitter.count() > 0:
            total_height = self.height()
            header_height = 60  # Fixed header height
            remaining_height = total_height - header_height
            remaining_panels = self.main_splitter.count() - 1  # Exclude header
            
            if remaining_panels > 0:
                panel_height = remaining_height // remaining_panels
                sizes = [header_height] + [panel_height] * remaining_panels
                self.main_splitter.setSizes(sizes)
            else:
                # Only header
                sizes = [header_height]
                self.main_splitter.setSizes(sizes)
        