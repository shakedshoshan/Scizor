#!/usr/bin/env python3
"""
App Settings tab for Scizor Desktop Application
Handles feature management and layout settings
"""

from PyQt6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QListWidget, 
    QPushButton, QGroupBox, QComboBox, QFormLayout, QListWidgetItem
)
from PyQt6.QtCore import Qt
from PyQt6.QtGui import QFont
from ui.settings.feature_list_item import FeatureListItem


class AppSettingsTab(QWidget):
    """App Settings tab widget"""
    
    def __init__(self, parent=None):
        super().__init__(parent)
        self.feature_items = {}
        self.init_ui()
        
    def init_ui(self):
        """Initialize the App Settings tab UI"""
        layout = QVBoxLayout(self)
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
    
    def load_settings_from_database(self, db):
        """Load settings from database"""
        try:
            settings = db.load_layout_settings()
            
            # Load translation language from database
            translation_language = db.get_translation_language("Spanish")
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
