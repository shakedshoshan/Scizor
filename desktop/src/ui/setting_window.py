#!/usr/bin/env python3
"""
Settings window for Scizor Desktop Application
Allows users to customize feature organization on the main window
"""

from PyQt6.QtWidgets import (
    QDialog, QVBoxLayout, QHBoxLayout, QWidget, QLabel, 
    QListWidget, QListWidgetItem, QPushButton, QSpinBox,
    QCheckBox, QGroupBox, QFormLayout, QDialogButtonBox,
    QMessageBox, QComboBox, QFrame, QLineEdit, QProgressBar,
    QTabWidget
)
from PyQt6.QtCore import Qt, pyqtSignal
from PyQt6.QtGui import QIcon, QFont, QPixmap
import os
from database.db_connection import get_database
from auth.device_auth import DeviceAuthManager
import sys



class CompactAuthWidget(QWidget):
    """Compact authentication widget for settings window"""
    
    # Signals
    auth_success = pyqtSignal(dict)  # Emitted when authentication succeeds
    auth_failed = pyqtSignal(str)    # Emitted when authentication fails
    
    def __init__(self):
        super().__init__()
        self.auth_manager = DeviceAuthManager()
        self.init_ui()
        self.setup_connections()
        
    def init_ui(self):
        """Initialize the compact UI components"""
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(8)
        
        # Main auth frame
        self.auth_frame = QFrame()
        self.auth_frame.setStyleSheet("""
            QFrame {
                background-color: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 6px;
                padding: 12px;
            }
        """)
        
        auth_layout = QVBoxLayout(self.auth_frame)
        auth_layout.setSpacing(8)
        
        # Header with icon and title
        header_layout = QHBoxLayout()
        auth_icon = QLabel("🔐")
        auth_icon.setFont(QFont("Arial", 12))
        header_layout.addWidget(auth_icon)
        
        self.auth_title = QLabel("Authentication")
        self.auth_title.setFont(QFont("Arial", 11, QFont.Weight.Bold))
        header_layout.addWidget(self.auth_title)
        header_layout.addStretch()
        
        auth_layout.addLayout(header_layout)
        
        # Status and action area
        self.status_area = QWidget()
        status_layout = QVBoxLayout(self.status_area)
        status_layout.setSpacing(6)
        
        # Status label
        self.status_label = QLabel("")
        self.status_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.status_label.setStyleSheet("color: #6b7280; font-size: 10px;")
        self.status_label.setWordWrap(True)
        status_layout.addWidget(self.status_label)
        
        # Action buttons
        self.action_layout = QHBoxLayout()
        
        # Sign in button
        self.sign_in_btn = QPushButton("Sign In")
        self.sign_in_btn.setStyleSheet("""
            QPushButton {
                background-color: #3B82F6;
                color: white;
                border: none;
                border-radius: 4px;
                padding: 6px 12px;
                font-size: 10px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #2563EB;
            }
            QPushButton:disabled {
                background-color: #9CA3AF;
            }
        """)
        self.action_layout.addWidget(self.sign_in_btn)
        
        # Sign out button
        self.sign_out_btn = QPushButton("Sign Out")
        self.sign_out_btn.setVisible(False)
        self.sign_out_btn.setStyleSheet("""
            QPushButton {
                background-color: #EF4444;
                color: white;
                border: none;
                border-radius: 4px;
                padding: 6px 12px;
                font-size: 10px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #DC2626;
            }
        """)
        self.action_layout.addWidget(self.sign_out_btn)
        
        status_layout.addLayout(self.action_layout)
        
        # Token input (hidden initially)
        self.token_frame = QFrame()
        self.token_frame.setVisible(False)
        self.token_frame.setStyleSheet("""
            QFrame {
                background-color: #ffffff;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                padding: 16px;
                margin: 8px 0px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
        """)
        
        token_layout = QVBoxLayout(self.token_frame)
        token_layout.setSpacing(6)
        
        # Token input
        self.token_input = QLineEdit()
        self.token_input.setPlaceholderText("Paste token from website...")
        self.token_input.setMinimumHeight(30)  # Increased height for better usability
        self.token_input.setStyleSheet("""
            QLineEdit {
                padding: 8px 12px;
                border: 2px solid #d1d5db;
                border-radius: 6px;
                font-size: 12px;
                background-color: white;
                color: #374151;
                font-weight: normal;
            }
            QLineEdit:focus {
                border-color: #3B82F6;
                border-width: 2px;
                background-color: #f8fafc;
            }
            QLineEdit:hover {
                border-color: #9ca3af;
            }
            QLineEdit:disabled {
                background-color: #f3f4f6;
                color: #9ca3af;
            }
        """)
        token_layout.addWidget(self.token_input)
        
        # Exchange button
        self.exchange_btn = QPushButton("Exchange Token")
        self.exchange_btn.setMinimumHeight(35)  # Increased height for better usability
        self.exchange_btn.setStyleSheet("""
            QPushButton {
                background-color: #10B981;
                color: white;
                border: none;
                border-radius: 6px;
                padding: 8px 16px;
                font-size: 12px;
                font-weight: bold;
                margin-top: 4px;
            }
            QPushButton:hover {
                background-color: #059669;
                transform: translateY(-1px);
            }
            QPushButton:pressed {
                background-color: #047857;
                transform: translateY(0px);
            }
            QPushButton:disabled {
                background-color: #9CA3AF;
                color: #6b7280;
            }
        """)
        token_layout.addWidget(self.exchange_btn)
        
        status_layout.addWidget(self.token_frame)
        
        # Progress bar
        self.progress_bar = QProgressBar()
        self.progress_bar.setVisible(False)
        self.progress_bar.setRange(0, 0)  # Indeterminate progress
        self.progress_bar.setMaximumHeight(4)
        self.progress_bar.setStyleSheet("""
            QProgressBar {
                border: none;
                background-color: #f1f5f9;
                border-radius: 2px;
            }
            QProgressBar::chunk {
                background-color: #3B82F6;
                border-radius: 2px;
            }
        """)
        status_layout.addWidget(self.progress_bar)
        
        auth_layout.addWidget(self.status_area)
        layout.addWidget(self.auth_frame)
        
        # Check if already authenticated
        self.check_auth_status()
    
    def setup_connections(self):
        """Setup signal connections"""
        self.sign_in_btn.clicked.connect(self.start_auth_flow)
        self.sign_out_btn.clicked.connect(self.logout)
        self.exchange_btn.clicked.connect(self.exchange_auth_code)
        
        # Connect token input to exchange button on Enter key
        self.token_input.returnPressed.connect(self.exchange_auth_code)
        
        # Connect auth manager signals
        self.auth_manager.auth_code_received.connect(self.on_auth_code_received)
        self.auth_manager.auth_error.connect(self.on_auth_error)
        self.auth_manager.token_received.connect(self.on_token_received)
        self.auth_manager.token_error.connect(self.on_token_error)
        self.auth_manager.auth_completed.connect(self.on_auth_completed)
    
    def exchange_auth_code(self):
        """Exchange the manually entered token"""
        token = self.token_input.text().strip()
        if not token:
            QMessageBox.warning(
                self,
                "Token Required",
                "Please enter the token from the website.",
                QMessageBox.StandardButton.Ok
            )
            return
        
        # Disable input and button during processing
        self.token_input.setEnabled(False)
        self.exchange_btn.setEnabled(False)
        self.progress_bar.setVisible(True)
        self.status_label.setText("Processing token...")
        
        # Update frame styling for loading state
        self.auth_frame.setStyleSheet("""
            QFrame {
                background-color: #dbeafe;
                border: 1px solid #3b82f6;
                border-radius: 6px;
                padding: 12px;
            }
        """)
        
        # Process the token
        success = self.auth_manager.exchange_token_or_code(token)
        if not success:
            self.on_token_error("Failed to process token")
    
    def show_token_input(self):
        """Show the token input"""
        self.sign_in_btn.setVisible(False)
        self.token_frame.setVisible(True)
        self.status_label.setText("Enter token from website")
        
        # Ensure token input is enabled and focusable
        self.token_input.setEnabled(True)
        self.token_input.setReadOnly(False)
        self.token_input.clear()
        self.token_input.setFocus()  # Set focus to the input field
        
        # Make sure the exchange button is visible and enabled
        self.exchange_btn.setVisible(True)
        self.exchange_btn.setEnabled(True)
    
    def hide_token_input(self):
        """Hide the token input"""
        self.token_frame.setVisible(False)
        self.token_input.clear()
        self.exchange_btn.setVisible(False)
    
    def check_auth_status(self):
        """Check if user is already authenticated"""
        if self.auth_manager.is_authenticated():
            self.show_authenticated_state()
        else:
            self.show_unauthenticated_state()
    
    def show_unauthenticated_state(self):
        """Show the unauthenticated state"""
        self.sign_in_btn.setVisible(True)
        self.sign_in_btn.setEnabled(True)
        self.sign_out_btn.setVisible(False)
        self.progress_bar.setVisible(False)
        self.hide_token_input()
        self.status_label.setText("Not signed in")
        self.auth_title.setText("Authentication")
        
        # Make sure exchange button is hidden
        self.exchange_btn.setVisible(False)
        
        # Update frame styling
        self.auth_frame.setStyleSheet("""
            QFrame {
                background-color: #fef3c7;
                border: 1px solid #f59e0b;
                border-radius: 6px;
                padding: 12px;
            }
        """)
    
    def show_authenticated_state(self):
        """Show the authenticated state"""
        self.sign_in_btn.setVisible(False)
        self.sign_out_btn.setVisible(True)
        self.progress_bar.setVisible(False)
        self.hide_token_input()
        
        # Make sure exchange button is hidden
        self.exchange_btn.setVisible(False)
        
        # Get user info from database
        try:
            from database.db_connection import get_database
            db = get_database()
            user_info = db.get_current_authenticated_user()
            
            if user_info:
                email = user_info.get('email', 'Unknown')
                name = user_info.get('name', 'Unknown')
                display_name = name if name and name != 'Unknown' else email
                self.status_label.setText(f"Signed in as: {display_name}")
            else:
                # Fallback to auth manager
                user_info = self.auth_manager.get_user_info()
                if user_info:
                    email = user_info.get('email', 'Unknown')
                    self.status_label.setText(f"Signed in as: {email}")
                else:
                    self.status_label.setText("Signed in successfully")
        except Exception as e:
            print(f"Error getting user info: {e}")
            self.status_label.setText("Signed in successfully")
        
        self.auth_title.setText("✅ Authenticated")
        
        # Update frame styling
        self.auth_frame.setStyleSheet("""
            QFrame {
                background-color: #d1fae5;
                border: 1px solid #10b981;
                border-radius: 6px;
                padding: 12px;
            }
        """)
    
    def start_auth_flow(self):
        """Start the device flow authentication"""
        self.sign_in_btn.setEnabled(False)
        self.progress_bar.setVisible(True)
        self.status_label.setText("Opening browser...")
        
        # Update frame styling for loading state
        self.auth_frame.setStyleSheet("""
            QFrame {
                background-color: #dbeafe;
                border: 1px solid #3b82f6;
                border-radius: 6px;
                padding: 12px;
            }
        """)
        
        # Start the auth flow
        success = self.auth_manager.start_auth_flow()
        if success:
            # Show token input after opening browser
            self.show_token_input()
        else:
            self.on_auth_error("Failed to start authentication flow")
    
    def on_auth_code_received(self, auth_code: str):
        """Handle received authorization code"""
        self.status_label.setText("Code received, exchanging...")
    
    def on_auth_error(self, error: str):
        """Handle authentication errors"""
        self.sign_in_btn.setEnabled(True)
        self.progress_bar.setVisible(False)
        self.hide_token_input()
        self.status_label.setText(f"Error: {error}")
        
        # Reset frame styling
        self.auth_frame.setStyleSheet("""
            QFrame {
                background-color: #fef3c7;
                border: 1px solid #f59e0b;
                border-radius: 6px;
                padding: 12px;
            }
        """)
    
    def on_token_received(self, token_data: dict):
        """Handle received tokens"""
        self.status_label.setText("Authentication successful!")
        self.hide_token_input()
        self.auth_success.emit(token_data)
        self.show_authenticated_state()
    
    def on_token_error(self, error: str):
        """Handle token exchange errors"""
        self.sign_in_btn.setEnabled(True)
        self.progress_bar.setVisible(False)
        self.token_input.setEnabled(True)
        self.exchange_btn.setEnabled(True)
        self.status_label.setText(f"Token error: {error}")
        
        # Reset frame styling
        self.auth_frame.setStyleSheet("""
            QFrame {
                background-color: #fef3c7;
                border: 1px solid #f59e0b;
                border-radius: 6px;
                padding: 12px;
            }
        """)
    
    def on_auth_completed(self, success: bool):
        """Handle authentication completion"""
        if not success:
            self.sign_in_btn.setEnabled(True)
            self.progress_bar.setVisible(False)
    
    def logout(self):
        """Logout the user"""
        try:
            # Logout from auth manager
            self.auth_manager.logout()
            
            # Clear the token input
            self.token_input.clear()
            
            # Show unauthenticated state
            self.show_unauthenticated_state()
            
            # Emit logout signal
            self.auth_failed.emit("User logged out")
            
            print("✅ User logged out successfully")
            
        except Exception as e:
            print(f"Error during logout: {e}")
            # Still show unauthenticated state even if there's an error
            self.show_unauthenticated_state()
    
    def is_authenticated(self) -> bool:
        """Check if user is authenticated"""
        return self.auth_manager.is_authenticated()
    
    def get_auth_manager(self) -> DeviceAuthManager:
        """Get the auth manager instance"""
        return self.auth_manager


class FeatureListItem(QWidget):
    """Custom widget for feature list items with icon and checkbox"""
    
    def __init__(self, feature_name, icon_path=None, enabled=True):
        super().__init__()
        self.feature_name = feature_name
        self.enabled = enabled
        self.init_ui(icon_path)
        
    def init_ui(self, icon_path):
        layout = QHBoxLayout(self)
        layout.setContentsMargins(10, 8, 10, 8)  # Increased margins
        layout.setSpacing(12)  # Increased spacing
        
        # Icon
        icon_label = QLabel()
        if icon_path:
            pixmap = QPixmap(icon_path)
            if not pixmap.isNull():
                icon_label.setPixmap(pixmap.scaled(24, 24, Qt.AspectRatioMode.KeepAspectRatio))  # Increased size
        else:
            # Default icon based on feature name
            icon_label.setText(self.get_default_icon(self.feature_name))
            icon_label.setStyleSheet("font-size: 18px;")  # Increased font size
        icon_label.setFixedSize(24, 24)  # Fixed size for consistency
        layout.addWidget(icon_label)
        
        # Feature name
        name_label = QLabel(self.feature_name)
        name_label.setFont(QFont("Arial", 11))  # Increased font size
        name_label.setWordWrap(True)  # Allow word wrapping
        name_label.setMinimumWidth(200)  # Set minimum width
        layout.addWidget(name_label)
        layout.addStretch()
        
        # Status indicator (checkbox-like)
        self.status_label = QLabel()
        self.status_label.setFixedSize(24, 24)  # Increased size
        self.status_label.setAlignment(Qt.AlignmentFlag.AlignCenter)  # Center alignment
        self.update_status()
        layout.addWidget(self.status_label)
        
    def get_default_icon(self, feature_name):
        """Get default icon text for feature"""
        icons = {
            "Clipboard History": "📋",
            "Notes": "📝", 
            "AI Prompt Enhancement": "🤖",
            "AI Smart Response": "🧠",
            "AI Translation": "🌍"
        }
        return icons.get(feature_name, "📄")
        
    def update_status(self):
        """Update the status indicator"""
        if self.enabled:
            self.status_label.setText("✓")
            self.status_label.setStyleSheet("color: green; font-weight: bold; font-size: 16px;")  # Increased font size
        else:
            self.status_label.setText("✗")
            self.status_label.setStyleSheet("color: red; font-weight: bold; font-size: 16px;")  # Increased font size
            
    def set_enabled(self, enabled):
        """Set the enabled status"""
        self.enabled = enabled
        self.update_status()
        
    def is_enabled(self):
        """Get the enabled status"""
        return self.enabled


class SettingsWindow(QDialog):
    """Settings window matching SnapPad - Settings design"""
    
    # Signal emitted when settings are applied
    settings_applied = pyqtSignal(dict)
    
    def __init__(self, parent=None):
        """Initialize the settings window"""
        super().__init__(parent)
        self.db = get_database()
        self.feature_items = {}
        self.init_ui()
        self.load_settings_from_database()
        
    def init_ui(self):
        """Initialize the user interface"""
        self.setWindowTitle("SnapPad - Settings")
        self.setMinimumSize(600, 700)  # Increased window size for tabs
        self.setModal(True)
        
        # Create main layout
        layout = QVBoxLayout(self)
        layout.setSpacing(15)
        layout.setContentsMargins(20, 20, 20, 20)
        
        # Header with gear icon and shutdown button
        header_layout = QHBoxLayout()
        gear_label = QLabel("⚙️")
        gear_label.setFont(QFont("Arial", 16))
        header_layout.addWidget(gear_label)
        
        title_label = QLabel("Settings")
        title_label.setFont(QFont("Arial", 14, QFont.Weight.Bold))
        header_layout.addWidget(title_label)
        header_layout.addStretch()
        
        # Small shutdown button in top-right corner with power icon
        icon_path = os.path.join(os.path.dirname(__file__), "..", "resources", "icons", "power_icon.svg")
        power_icon = QIcon(icon_path)
        
        self.shutdown_btn = QPushButton()
        self.shutdown_btn.setIcon(power_icon)
        self.shutdown_btn.setIconSize(QPixmap(20, 20).size())
        self.shutdown_btn.setToolTip("Shutdown Application")
        self.shutdown_btn.setFixedSize(36, 36)
        self.shutdown_btn.setStyleSheet("""
            QPushButton {
                background-color: #ef4444;
                color: white;
                border: none;
                border-radius: 18px;
                padding: 6px;
            }
            QPushButton:hover {
                background-color: #dc2626;
                transform: scale(1.05);
            }
            QPushButton:pressed {
                background-color: #b91c1c;
                transform: scale(0.95);
            }
        """)
        header_layout.addWidget(self.shutdown_btn)
        
        layout.addLayout(header_layout)
        
        # Create tab widget
        self.tab_widget = QTabWidget()
        self.tab_widget.setStyleSheet("""
            QTabWidget::pane {
                border: 1px solid #d1d5db;
                border-radius: 6px;
                background-color: white;
            }
            QTabBar::tab {
                background-color: #f3f4f6;
                color: #374151;
                padding: 8px 16px;
                margin-right: 2px;
                border: 1px solid #d1d5db;
                border-bottom: none;
                border-top-left-radius: 4px;
                border-top-right-radius: 4px;
                font-weight: bold;
            }
            QTabBar::tab:selected {
                background-color: white;
                color: #1f2937;
                border-bottom: 2px solid #3B82F6;
            }
            QTabBar::tab:hover {
                background-color: #e5e7eb;
            }
        """)
        
        # Create App Settings tab
        self.app_settings_tab = QWidget()
        self.init_app_settings_tab()
        self.tab_widget.addTab(self.app_settings_tab, "App Settings")
        
        # Create User tab
        self.user_tab = QWidget()
        self.init_user_tab()
        self.tab_widget.addTab(self.user_tab, "User")
        
        layout.addWidget(self.tab_widget)
        
        # Dialog buttons
        button_box = QDialogButtonBox(
            QDialogButtonBox.StandardButton.Ok | 
            QDialogButtonBox.StandardButton.Cancel
        )
        button_box.accepted.connect(self.apply_settings)
        button_box.rejected.connect(self.reject)
        layout.addWidget(button_box)
        
        # Connect signals
        self.shutdown_btn.clicked.connect(self.shutdown_application)
        
        # Initialize features
        self.init_features()
        self.update_layout_info()
        
    def init_app_settings_tab(self):
        """Initialize the App Settings tab"""
        layout = QVBoxLayout(self.app_settings_tab)
        layout.setSpacing(15)
        layout.setContentsMargins(15, 15, 15, 15)
        
        # Dashboard Features section
        features_group = QGroupBox("Dashboard Features")
        features_layout = QVBoxLayout(features_group)
        
        # Instruction text
        instruction_label = QLabel("Enable/disable features and reorder them by dragging:")
        instruction_label.setStyleSheet("color: #666; font-size: 10px; margin-bottom: 5px;")
        features_layout.addWidget(instruction_label)
        
        # Features list
        self.features_list = QListWidget()
        self.features_list.setStyleSheet("""
            QListWidget {
                border: 1px solid #ccc;
                border-radius: 5px;
                background-color: white;
                padding: 5px;
            }
            QListWidget::item {
                border-bottom: 1px solid #eee;
                padding: 5px;
                margin: 2px;
            }
            QListWidget::item:selected {
                background-color: #e3f2fd;
                border: 1px dotted #2196f3;
            }
        """)
        self.features_list.setMinimumHeight(150)
        self.features_list.setMinimumWidth(300)
        features_layout.addWidget(self.features_list)
        
        # Control buttons
        buttons_layout = QHBoxLayout()
        
        self.toggle_btn = QPushButton("Toggle Feature")
        self.toggle_btn.setStyleSheet("""
            QPushButton {
                background-color: #2196f3;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #1976d2;
            }
        """)
        
        self.move_up_btn = QPushButton("↑ Move Up")
        self.move_up_btn.setStyleSheet("""
            QPushButton {
                background-color: #4caf50;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #388e3c;
            }
        """)
        
        self.move_down_btn = QPushButton("↓ Move Down")
        self.move_down_btn.setStyleSheet("""
            QPushButton {
                background-color: #4caf50;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #388e3c;
            }
        """)
        
        buttons_layout.addWidget(self.toggle_btn)
        buttons_layout.addWidget(self.move_up_btn)
        buttons_layout.addWidget(self.move_down_btn)
        buttons_layout.addStretch()
        
        features_layout.addLayout(buttons_layout)
        layout.addWidget(features_group)
        
        # Layout settings
        layout_group = QGroupBox("Layout Settings")
        layout_settings = QFormLayout(layout_group)
        
        # Columns dropdown
        self.columns_combo = QComboBox()
        self.columns_combo.addItems(["1", "2", "3"])
        self.columns_combo.setCurrentText("1")
        layout_settings.addRow("Columns:", self.columns_combo)
        
        # Max per column dropdown
        self.max_per_col_combo = QComboBox()
        self.max_per_col_combo.addItems(["1", "2", "3", "4"])
        self.max_per_col_combo.setCurrentText("2")
        layout_settings.addRow("Max/col:", self.max_per_col_combo)
        
        # Layout info
        layout_info = QHBoxLayout()
        self.layout_info_label = QLabel("Single column • 360px")
        layout_info.addWidget(self.layout_info_label)
        layout_info.addStretch()
        layout_settings.addRow("", layout_info)
        
        layout.addWidget(layout_group)
        
        # Hotkey settings
        hotkey_group = QGroupBox("Hotkey Settings")
        hotkey_settings = QFormLayout(hotkey_group)
        
        # Translation language dropdown
        translation_label = QLabel("🌍 Translate to:")
        translation_label.setStyleSheet("font-weight: bold; color: #2c3e50;")
        
        self.translation_language_combo = QComboBox()
        self.translation_language_combo.setMinimumWidth(150)
        self.translation_language_combo.setStyleSheet("""
            QComboBox {
                padding: 6px 12px;
                border: 2px solid #d1d5db;
                border-radius: 6px;
                background-color: white;
                color: #374151;
                font-size: 11px;
                font-weight: medium;
            }
            QComboBox:focus {
                border-color: #3B82F6;
            }
            QComboBox:hover {
                border-color: #9ca3af;
            }
            QComboBox::drop-down {
                border: none;
                width: 20px;
            }
            QComboBox::down-arrow {
                image: none;
                border: 1px solid #9ca3af;
                width: 0;
                height: 0;
                border-left: 4px solid transparent;
                border-right: 4px solid transparent;
                border-top: 6px solid #6b7280;
            }
        """)
        
        # Add comprehensive list of languages
        languages = [
            "Spanish", "French", "German", "Italian", "Portuguese", "Russian", "Chinese", "Japanese",
            "Korean", "Arabic", "Hindi", "Bengali", "Turkish", "Dutch", "Swedish", "Norwegian",
            "Danish", "Finnish", "Polish", "Czech", "Slovak", "Hungarian", "Romanian", "Bulgarian",
            "Croatian", "Serbian", "Slovenian", "Greek", "Hebrew", "Thai", "Vietnamese", "Indonesian",
            "Malay", "Tagalog", "Ukrainian", "Lithuanian", "Latvian", "Estonian", "Maltese", "Irish",
            "Welsh", "Scots Gaelic", "Basque", "Catalan", "Galician", "Swahili", "Yoruba", "Zulu",
            "Afrikaans", "Amharic", "Armenian", "Azerbaijani", "Belarusian", "Bosnian", "Georgian",
            "Gujarati", "Icelandic", "Kannada", "Kazakh", "Kyrgyz", "Luxembourgish", "Macedonian",
            "Malayalam", "Marathi", "Mongolian", "Nepali", "Persian", "Punjabi", "Sinhala", "Tamil",
            "Telugu", "Urdu", "Uzbek", "Albanian", "Esperanto", "Latin"
        ]
        self.translation_language_combo.addItems(languages)
        self.translation_language_combo.setCurrentText("Spanish")  # Default
        
        # Help text for translation
        translation_help = QLabel("Language used when pressing Ctrl+Alt+T")
        translation_help.setStyleSheet("color: #6b7280; font-size: 9px; font-style: italic;")
        
        hotkey_settings.addRow(translation_label, self.translation_language_combo)
        hotkey_settings.addRow("", translation_help)
        
        layout.addWidget(hotkey_group)
        
        # Connect signals for app settings
        self.toggle_btn.clicked.connect(self.toggle_selected_feature)
        self.move_up_btn.clicked.connect(self.move_feature_up)
        self.move_down_btn.clicked.connect(self.move_feature_down)
        self.features_list.itemSelectionChanged.connect(self.update_button_states)
        
        # Connect layout setting changes
        self.columns_combo.currentTextChanged.connect(self.update_layout_info)
        self.max_per_col_combo.currentTextChanged.connect(self.update_layout_info)
        
    def init_user_tab(self):
        """Initialize the User tab"""
        layout = QVBoxLayout(self.user_tab)
        layout.setSpacing(15)
        layout.setContentsMargins(15, 15, 15, 15)
        
        # Authentication section
        auth_group = QGroupBox("Account")
        auth_layout = QVBoxLayout(auth_group)
        
        # Add compact auth widget
        self.auth_widget = CompactAuthWidget()
        self.auth_widget.auth_success.connect(self.on_auth_success)
        self.auth_widget.auth_failed.connect(self.on_auth_failed)
        auth_layout.addWidget(self.auth_widget)
        
        layout.addWidget(auth_group)
        
        # Add some spacing at the bottom
        layout.addStretch()
        
    def on_auth_success(self, token_data: dict):
        """Handle authentication success"""
        print("✅ Authentication successful in settings")
        
    def on_auth_failed(self, error: str):
        """Handle authentication failure"""
        print(f"❌ Authentication failed in settings: {error}")
        
    def get_default_features(self):
        """Get the list of default features"""
        return [
            ("Clipboard History", True),
            ("Notes", True),
            ("AI Prompt Enhancement", True),
            ("AI Smart Response", False),
            ("AI Translation", False)
        ]
        
    def init_features(self):
        """Initialize the features list"""
        features = self.get_default_features()
        
        for feature_name, enabled in features:
            item_widget = FeatureListItem(feature_name, enabled=enabled)
            self.feature_items[feature_name] = item_widget
            
            list_item = QListWidgetItem()
            # Ensure proper sizing for the list item
            size_hint = item_widget.sizeHint()
            list_item.setSizeHint(size_hint)
            self.features_list.addItem(list_item)
            self.features_list.setItemWidget(list_item, item_widget)
            
    def toggle_selected_feature(self):
        """Toggle the selected feature's enabled state"""
        current_item = self.features_list.currentItem()
        if current_item:
            item_widget = self.features_list.itemWidget(current_item)
            if item_widget:
                current_enabled = item_widget.is_enabled()
                item_widget.set_enabled(not current_enabled)
                
    def move_feature_up(self):
        """Move selected feature up in the list"""
        current_row = self.features_list.currentRow()
        if current_row > 0:
            # Get the current item and its widget
            current_item = self.features_list.item(current_row)
            current_widget = self.features_list.itemWidget(current_item)
            
            # Store widget data before removal
            if current_widget:
                feature_name = current_widget.feature_name
                enabled = current_widget.is_enabled()
            
            # Remove the item
            self.features_list.takeItem(current_row)
            
            # Create a new item at the target position
            new_item = QListWidgetItem()
            self.features_list.insertItem(current_row - 1, new_item)
            
            # Create a new widget with the same data
            if current_widget:
                new_widget = FeatureListItem(feature_name, enabled=enabled)
                # Update the feature_items dictionary
                self.feature_items[feature_name] = new_widget
                # Set the widget for the new item
                self.features_list.setItemWidget(new_item, new_widget)
                # Set proper size hint
                size_hint = new_widget.sizeHint()
                new_item.setSizeHint(size_hint)
            
            # Set the selection to the moved item
            self.features_list.setCurrentRow(current_row - 1)
            
            # Update button states after move
            self.update_button_states()
            
    def move_feature_down(self):
        """Move selected feature down in the list"""
        current_row = self.features_list.currentRow()
        if current_row < self.features_list.count() - 1:
            # Get the current item and its widget
            current_item = self.features_list.item(current_row)
            current_widget = self.features_list.itemWidget(current_item)
            
            # Store widget data before removal
            if current_widget:
                feature_name = current_widget.feature_name
                enabled = current_widget.is_enabled()
            
            # Remove the item
            self.features_list.takeItem(current_row)
            
            # Create a new item at the target position
            new_item = QListWidgetItem()
            self.features_list.insertItem(current_row + 1, new_item)
            
            # Create a new widget with the same data
            if current_widget:
                new_widget = FeatureListItem(feature_name, enabled=enabled)
                # Update the feature_items dictionary
                self.feature_items[feature_name] = new_widget
                # Set the widget for the new item
                self.features_list.setItemWidget(new_item, new_widget)
                # Set proper size hint
                size_hint = new_widget.sizeHint()
                new_item.setSizeHint(size_hint)
            
            # Set the selection to the moved item
            self.features_list.setCurrentRow(current_row + 1)
            
            # Update button states after move
            self.update_button_states()
            
    def update_button_states(self):
        """Update button states based on selection"""
        has_selection = self.features_list.currentRow() >= 0
        self.toggle_btn.setEnabled(has_selection)
        self.move_up_btn.setEnabled(has_selection and self.features_list.currentRow() > 0)
        self.move_down_btn.setEnabled(has_selection and self.features_list.currentRow() < self.features_list.count() - 1)
        
    def update_layout_info(self):
        """Update the layout info display"""
        columns = int(self.columns_combo.currentText())
        max_per_col = int(self.max_per_col_combo.currentText())
        
        if columns == 1:
            layout_text = f"Single column • {360}px"
        else:
            layout_text = f"{columns} columns • {360 // columns}px each"
            
        self.layout_info_label.setText(layout_text)
        
    def get_settings(self):
        """Get current settings as a dictionary"""
        # Get feature order and visibility
        feature_order = []
        visibility = {}
        
        for i in range(self.features_list.count()):
            item = self.features_list.item(i)
            item_widget = self.features_list.itemWidget(item)
            if item_widget:
                feature_name = item_widget.feature_name
                feature_order.append(feature_name)
                visibility[feature_name.lower().replace(' ', '_')] = item_widget.is_enabled()
                
        return {
            'feature_order': feature_order,
            'columns': int(self.columns_combo.currentText()),
            'features_per_column': int(self.max_per_col_combo.currentText()),
            'visibility': visibility,
            'translation_language': self.translation_language_combo.currentText()
        }
        
    def apply_settings(self):
        """Apply the current settings"""
        settings = self.get_settings()
        
        # Save settings to database
        try:
            self.db.save_layout_settings(settings)
            # Save translation language separately
            self.db.save_translation_language(settings.get('translation_language', 'Spanish'))
        except Exception as e:
            QMessageBox.warning(self, "Warning", f"Failed to save settings: {e}")
            return
            
        # Emit settings to parent
        self.settings_applied.emit(settings)
        self.accept()
        
    def load_settings(self, settings):
        """Load settings from a dictionary"""
        if not settings:
            return
            
        # Get all default features
        default_features = self.get_default_features()
        
        # Load feature order and visibility
        if 'feature_order' in settings:
            # Clear current list
            self.features_list.clear()
            self.feature_items.clear()
            
            # Create a set of features that were saved in settings
            saved_features = set(settings['feature_order'])
            
            # Add features in order from settings
            for feature_name in settings['feature_order']:
                enabled = settings.get('visibility', {}).get(feature_name.lower().replace(' ', '_'), True)
                item_widget = FeatureListItem(feature_name, enabled=enabled)
                self.feature_items[feature_name] = item_widget
                
                list_item = QListWidgetItem()
                # Ensure proper sizing for the list item
                size_hint = item_widget.sizeHint()
                list_item.setSizeHint(size_hint)
                self.features_list.addItem(list_item)
                self.features_list.setItemWidget(list_item, item_widget)
            
            # Add any missing default features that weren't in the saved settings
            for feature_name, default_enabled in default_features:
                if feature_name not in saved_features:
                    item_widget = FeatureListItem(feature_name, enabled=default_enabled)
                    self.feature_items[feature_name] = item_widget
                    
                    list_item = QListWidgetItem()
                    # Ensure proper sizing for the list item
                    size_hint = item_widget.sizeHint()
                    list_item.setSizeHint(size_hint)
                    self.features_list.addItem(list_item)
                    self.features_list.setItemWidget(list_item, item_widget)
                
        # Load column settings
        if 'columns' in settings:
            self.columns_combo.setCurrentText(str(settings['columns']))
        if 'features_per_column' in settings:
            self.max_per_col_combo.setCurrentText(str(settings['features_per_column']))
        
        # Load translation language
        if 'translation_language' in settings:
            language = settings['translation_language']
            index = self.translation_language_combo.findText(language)
            if index >= 0:
                self.translation_language_combo.setCurrentIndex(index)
            
        # Update layout info display
        self.update_layout_info()
    
    def load_settings_from_database(self):
        """Load settings from database"""
        try:
            settings = self.db.load_layout_settings()
            
            # Load translation language from database
            translation_language = self.db.get_translation_language("Spanish")
            settings['translation_language'] = translation_language
            
            self.load_settings(settings)
            
            # Ensure all default features are present
            self.ensure_all_features_present()
        except Exception as e:
            print(f"Failed to load settings from database: {e}")
            # Fall back to default settings
            self.init_features()
            # Set default translation language
            self.translation_language_combo.setCurrentText("Spanish")
            
    def ensure_all_features_present(self):
        """Ensure all default features are present in the list"""
        default_features = self.get_default_features()
        current_features = set()
        
        # Get current features in the list
        for i in range(self.features_list.count()):
            item = self.features_list.item(i)
            item_widget = self.features_list.itemWidget(item)
            if item_widget:
                current_features.add(item_widget.feature_name)
        
        # Add any missing default features
        for feature_name, default_enabled in default_features:
            if feature_name not in current_features:
                item_widget = FeatureListItem(feature_name, enabled=default_enabled)
                self.feature_items[feature_name] = item_widget
                
                list_item = QListWidgetItem()
                # Ensure proper sizing for the list item
                size_hint = item_widget.sizeHint()
                list_item.setSizeHint(size_hint)
                self.features_list.addItem(list_item)
                self.features_list.setItemWidget(list_item, item_widget)

    def shutdown_application(self):
        """Shutdown the application completely"""
        # Show confirmation dialog
        reply = QMessageBox.question(
            self, 
            "Confirm Shutdown", 
            "Are you sure you want to shutdown the application?\n\nThis will close all windows and terminate the application completely.",
            QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No,
            QMessageBox.StandardButton.No
        )
        
        if reply == QMessageBox.StandardButton.Yes:
            # Close the settings window first
            self.accept()
            
            # Get the main application instance and quit
            app = self.parent().parent() if self.parent() else None
            if app:
                app.quit()
            else:
                # Fallback: quit the entire application
                sys.exit(0)
