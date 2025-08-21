#!/usr/bin/env python3
"""
Hotkeys tab for Scizor Desktop Application
Displays available hotkeys and usage instructions
"""

from PyQt6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QGroupBox, QFrame,
    QScrollArea, QSizePolicy
)
from PyQt6.QtCore import Qt
from PyQt6.QtGui import QFont


class HotkeysTab(QWidget):
    """Hotkeys tab widget"""
    
    def __init__(self, parent=None):
        super().__init__(parent)
        self.init_ui()
        
    def init_ui(self):
        """Initialize the Hotkeys tab UI"""
        main_layout = QVBoxLayout(self)
        main_layout.setSpacing(15)
        main_layout.setContentsMargins(15, 15, 15, 15)
        
        # Create scroll area
        scroll_area = QScrollArea()
        scroll_area.setWidgetResizable(True)
        scroll_area.setFrameShape(QFrame.Shape.NoFrame)
        scroll_area.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
        scroll_area.setVerticalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAsNeeded)
        
        # Create container widget for scroll area
        scroll_content = QWidget()
        scroll_layout = QVBoxLayout(scroll_content)
        scroll_layout.setSpacing(20)
        scroll_layout.setContentsMargins(10, 10, 10, 10)
        
        # Hotkey Group
        hotkey_group = QGroupBox("⌨️ Available Hotkeys")
        hotkey_group.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Expanding)
        hotkey_layout = QVBoxLayout(hotkey_group)
        hotkey_layout.setSpacing(12)
        hotkey_layout.setContentsMargins(15, 15, 15, 15)
        
        # Dashboard Toggle Hotkey
        self.add_hotkey_item(
            hotkey_layout,
            "🎛️", 
            "Toggle Dashboard", 
            "Show/hide the main Scizor dashboard",
            "Ctrl+Alt+S"
        )
        
        # Add separator
        self.add_separator(hotkey_layout)
        
        # Notes Hotkey
        self.add_hotkey_item(
            hotkey_layout,
            "📝", 
            "Create Note", 
            "Create a new note from selected text",
            "Ctrl+Alt+N"
        )
        
        # Add separator
        self.add_separator(hotkey_layout)
        
        # AI Prompt Enhancement Hotkey
        self.add_hotkey_item(
            hotkey_layout,
            "🤖", 
            "AI Prompt Enhancement", 
            "Enhance selected text using AI and replace it",
            "Ctrl+Alt+H"
        )
        
        # Add separator
        self.add_separator(hotkey_layout)
        
        # AI Smart Response Hotkey
        self.add_hotkey_item(
            hotkey_layout,
            "🧠", 
            "AI Smart Response", 
            "Generate AI response for selected text (shows in popup)",
            "Ctrl+Alt+G"
        )
        
        # Add separator
        self.add_separator(hotkey_layout)
        
        # AI Translation Hotkey
        self.add_hotkey_item(
            hotkey_layout,
            "🌍", 
            "AI Translation", 
            "Translate selected text to Spanish",
            "Ctrl+Alt+T"
        )
        
        # Add separator
        self.add_separator(hotkey_layout)
        
        # Text-to-Speech Hotkey
        self.add_hotkey_item(
            hotkey_layout,
            "🔊", 
            "Text-to-Speech", 
            "Convert selected text to speech and play audio",
            "Ctrl+Alt+R"
        )
        
        scroll_layout.addWidget(hotkey_group)
        
        # Usage instructions section
        instructions_group = QGroupBox("📖 How to Use")
        instructions_layout = QVBoxLayout(instructions_group)
        instructions_layout.setSpacing(12)
        instructions_layout.setContentsMargins(15, 15, 15, 15)
        
        instructions = [
            "1. <b>Select text</b> in any application (for AI features)",
            "2. <b>Press the hotkey</b> combination",
            "3. <b>Wait for processing</b> (spinner will appear)",
            "4. <b>View results</b> in popup or clipboard"
        ]
        
        for instruction in instructions:
            instruction_label = QLabel(instruction)
            instruction_label.setStyleSheet("color: #374151; font-size: 12px; margin: 3px 0px; line-height: 1.4;")
            instruction_label.setTextFormat(Qt.TextFormat.RichText)
            instructions_layout.addWidget(instruction_label)
        
        scroll_layout.addWidget(instructions_group)
        scroll_layout.addStretch()
        
        # Set the scroll content
        scroll_area.setWidget(scroll_content)
        main_layout.addWidget(scroll_area)
    
    def add_hotkey_item(self, parent_layout, icon_text, name, description, hotkey):
        """Add a hotkey item to the layout"""
        # Create container widget
        hotkey_item = QWidget()
        hotkey_item.setObjectName("hotkey-item")
        hotkey_item.setStyleSheet("""
            #hotkey-item {
                background-color: #f9fafb;
                border-radius: 8px;
                padding: 5px;
            }
        """)
        hotkey_item.setMinimumHeight(60)
        
        # Create layout
        hotkey_layout = QHBoxLayout(hotkey_item)
        hotkey_layout.setContentsMargins(10, 10, 10, 10)
        hotkey_layout.setSpacing(15)
        
        # Icon
        icon = QLabel(icon_text)
        icon.setFont(QFont("Arial", 18))
        hotkey_layout.addWidget(icon)
        
        # Text layout
        text_layout = QVBoxLayout()
        text_layout.setSpacing(2)
        
        # Name
        name_label = QLabel(name)
        name_label.setFont(QFont("Arial", 11, QFont.Weight.Bold))
        text_layout.addWidget(name_label)
        
        # Description
        desc_label = QLabel(description)
        desc_label.setStyleSheet("color: #6b7280; font-size: 10px; font-style: italic; line-height: 1.3;")
        desc_label.setWordWrap(True)
        text_layout.addWidget(desc_label)
        
        hotkey_layout.addLayout(text_layout)
        hotkey_layout.addStretch()
        
        # Hotkey frame
        key_frame = QFrame()
        key_frame.setStyleSheet("""
            QFrame {
                background-color: #e0f2fe;
                border: 1px solid #38bdf8;
                border-radius: 6px;
                padding: 6px 12px;
                box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
            }
        """)
        
        key_layout = QHBoxLayout(key_frame)
        key_layout.setContentsMargins(0, 0, 0, 0)
        key_layout.setSpacing(4)
        
        key_label = QLabel(hotkey)
        key_label.setFont(QFont("Consolas", 11, QFont.Weight.Bold))
        key_label.setStyleSheet("color: #0369a1; font-weight: bold;")
        key_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        key_label.setMinimumWidth(100)
        key_layout.addWidget(key_label)
        
        hotkey_layout.addWidget(key_frame)
        parent_layout.addWidget(hotkey_item)
        
    def add_separator(self, parent_layout):
        """Add a separator line"""
        separator = QFrame()
        separator.setFrameShape(QFrame.Shape.HLine)
        separator.setStyleSheet("background-color: #d1d5db; margin: 4px 0px;")
        separator.setFixedHeight(2)
        parent_layout.addWidget(separator)