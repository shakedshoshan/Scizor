#!/usr/bin/env python3
"""
Expanded Window for Scizor Desktop Application
Provides a larger, more feature-rich interface for easier feature access
"""

from PyQt6.QtWidgets import (
    QMainWindow, QWidget, QVBoxLayout, QHBoxLayout, 
    QTabWidget, QSplitter, QFrame, QLabel, QPushButton,
    QMessageBox, QStatusBar, QProgressBar
)
from PyQt6.QtCore import Qt, QTimer, QSize
from PyQt6.QtGui import QFont, QIcon, QPalette, QColor

# Import enhanced feature components
from .features.expend import (
    EnhancedHeaderPanel, EnhancedClipboardPanel, EnhancedNotesPanel
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
        self.setMinimumSize(800, 600)
        self.resize(1000, 700)
        
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
        self.notes_panel = EnhancedNotesPanel()
        
        # Create tab pages
        self.setup_clipboard_tab()
        self.setup_notes_tab()
        self.setup_dashboard_tab()
        
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
        notes_layout.setContentsMargins(10, 10, 10, 10)
        
        # Add notes panel
        notes_layout.addWidget(self.notes_panel)
        
        self.content_tabs.addTab(notes_widget, "📝 Enhanced Notes")
        
    def setup_dashboard_tab(self):
        """Setup the dashboard overview tab"""
        dashboard_widget = QWidget()
        dashboard_layout = QVBoxLayout(dashboard_widget)
        dashboard_layout.setContentsMargins(15, 15, 15, 15)
        
        # Welcome section
        welcome_frame = QFrame()
        welcome_frame.setStyleSheet("""
            QFrame {
                background: qlineargradient(x1:0, y1:0, x2:0, y2:1,
                    stop:0 #3498db, stop:1 #2980b9);
                border-radius: 10px;
                padding: 20px;
            }
        """)
        welcome_layout = QVBoxLayout(welcome_frame)
        
        welcome_title = QLabel("🚀 Welcome to Scizor Enhanced Dashboard")
        welcome_title.setFont(QFont("Segoe UI", 16, QFont.Weight.Bold))
        welcome_title.setStyleSheet("color: white; margin-bottom: 10px;")
        
        welcome_text = QLabel(
            "This enhanced interface provides easy access to all Scizor features.\n"
            "Use the tabs above to navigate between different sections."
        )
        welcome_text.setStyleSheet("color: white; font-size: 12px; line-height: 1.4;")
        welcome_text.setWordWrap(True)
        
        welcome_layout.addWidget(welcome_title)
        welcome_layout.addWidget(welcome_text)
        
        # Quick stats section
        stats_frame = QFrame()
        stats_frame.setStyleSheet("""
            QFrame {
                background-color: white;
                border: 1px solid #bdc3c7;
                border-radius: 8px;
                padding: 15px;
            }
        """)
        stats_layout = QHBoxLayout(stats_frame)
        
        # Clipboard stats
        clipboard_stats = QFrame()
        clipboard_stats.setStyleSheet("""
            QFrame {
                background-color: #e8f5e8;
                border: 1px solid #27ae60;
                border-radius: 6px;
                padding: 10px;
            }
        """)
        clipboard_stats_layout = QVBoxLayout(clipboard_stats)
        
        clipboard_count_label = QLabel("0")
        clipboard_count_label.setFont(QFont("Segoe UI", 20, QFont.Weight.Bold))
        clipboard_count_label.setStyleSheet("color: #27ae60; text-align: center;")
        clipboard_count_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        
        clipboard_desc_label = QLabel("Clipboard Items")
        clipboard_desc_label.setStyleSheet("color: #2c3e50; text-align: center; font-weight: bold;")
        clipboard_desc_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        
        clipboard_stats_layout.addWidget(clipboard_count_label)
        clipboard_stats_layout.addWidget(clipboard_desc_label)
        
        # Notes stats
        notes_stats = QFrame()
        notes_stats.setStyleSheet("""
            QFrame {
                background-color: #fff3cd;
                border: 1px solid #f39c12;
                border-radius: 6px;
                padding: 10px;
            }
        """)
        notes_stats_layout = QVBoxLayout(notes_stats)
        
        notes_count_label = QLabel("0")
        notes_count_label.setFont(QFont("Segoe UI", 20, QFont.Weight.Bold))
        notes_count_label.setStyleSheet("color: #f39c12; text-align: center;")
        notes_count_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        
        notes_desc_label = QLabel("Notes")
        notes_desc_label.setStyleSheet("color: #2c3e50; text-align: center; font-weight: bold;")
        notes_desc_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        
        notes_stats_layout.addWidget(notes_count_label)
        notes_stats_layout.addWidget(notes_desc_label)
        
        # Add stats to layout
        stats_layout.addWidget(clipboard_stats)
        stats_layout.addWidget(notes_stats)
        
        # Quick actions section
        actions_frame = QFrame()
        actions_frame.setStyleSheet("""
            QFrame {
                background-color: white;
                border: 1px solid #bdc3c7;
                border-radius: 8px;
                padding: 15px;
            }
        """)
        actions_layout = QVBoxLayout(actions_frame)
        
        actions_title = QLabel("⚡ Quick Actions")
        actions_title.setFont(QFont("Segoe UI", 12, QFont.Weight.Bold))
        actions_title.setStyleSheet("color: #2c3e50; margin-bottom: 10px;")
        
        actions_buttons_layout = QHBoxLayout()
        
        create_note_btn = QPushButton("➕ Create Note")
        create_note_btn.setStyleSheet("""
            QPushButton {
                background-color: #27ae60;
                color: white;
                border: none;
                border-radius: 6px;
                padding: 10px 16px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #229954;
            }
        """)
        create_note_btn.clicked.connect(lambda: self.content_tabs.setCurrentIndex(1))
        
        clear_clipboard_btn = QPushButton("🗑️ Clear Clipboard")
        clear_clipboard_btn.setStyleSheet("""
            QPushButton {
                background-color: #e74c3c;
                color: white;
                border: none;
                border-radius: 6px;
                padding: 10px 16px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #c0392b;
            }
        """)
        clear_clipboard_btn.clicked.connect(self.clipboard_panel.clear_clipboard)
        
        actions_buttons_layout.addWidget(create_note_btn)
        actions_buttons_layout.addWidget(clear_clipboard_btn)
        actions_buttons_layout.addStretch()
        
        actions_layout.addWidget(actions_title)
        actions_layout.addLayout(actions_buttons_layout)
        
        # Add all sections to dashboard
        dashboard_layout.addWidget(welcome_frame)
        dashboard_layout.addWidget(stats_frame)
        dashboard_layout.addWidget(actions_frame)
        dashboard_layout.addStretch()
        
        # Store references for updates
        self.clipboard_count_label = clipboard_count_label
        self.notes_count_label = notes_count_label
        
        self.content_tabs.addTab(dashboard_widget, "🏠 Dashboard")
        
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
        
        # Setup timer for stats updates
        self.stats_timer = QTimer()
        self.stats_timer.timeout.connect(self.update_stats)
        self.stats_timer.start(5000)  # Update every 5 seconds
        
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
        
    def update_stats(self):
        """Update dashboard statistics"""
        try:
            # Update clipboard count
            clipboard_items = self.clipboard_panel.get_all_items()
            self.clipboard_count_label.setText(str(len(clipboard_items)))
            
            # Update notes count
            notes_items = self.notes_panel.get_all_notes()
            self.notes_count_label.setText(str(len(notes_items)))
            
        except Exception as e:
            print(f"Error updating stats: {e}")
            
    # Event handlers for feature components
    def on_clipboard_cleared(self):
        """Handle clipboard cleared event"""
        self.status_label.setText("Clipboard history cleared")
        self.update_stats()
        
    def on_clipboard_item_selected(self, item_text):
        """Handle clipboard item selection"""
        self.status_label.setText(f"Selected: {item_text[:30]}...")
        
    def on_clipboard_item_copied(self, item_text):
        """Handle clipboard item copied"""
        self.status_label.setText(f"Copied to clipboard: {item_text[:30]}...")
        
    def on_note_created(self, note_data):
        """Handle note created event"""
        self.status_label.setText(f"Note created: {note_data.get('title', 'Untitled')}")
        self.update_stats()
        
    def on_note_updated(self, note_data):
        """Handle note updated event"""
        self.status_label.setText(f"Note updated: {note_data.get('title', 'Untitled')}")
        
    def on_note_deleted(self, note_id):
        """Handle note deleted event"""
        self.status_label.setText(f"Note deleted")
        self.update_stats()
        
    def on_notes_loaded(self, notes_list):
        """Handle notes loaded event"""
        self.status_label.setText(f"Loaded {len(notes_list)} notes")
        self.update_stats()
        
    def on_notes_error(self, error_message):
        """Handle notes error event"""
        self.status_label.setText(f"Error: {error_message}")
        
    def closeEvent(self, event):
        """Handle application close event"""
        try:
            # Stop stats timer
            if hasattr(self, 'stats_timer'):
                self.stats_timer.stop()
                
            # Note: Don't stop hotkey manager or clipboard monitoring here
            # as they might be shared with the main window
            
        except Exception as e:
            print(f"Error during cleanup: {e}")
        
        event.accept()
        
    def showEvent(self, event):
        """Handle window show event"""
        super().showEvent(event)
        self.update_stats()  # Update stats when window is shown
