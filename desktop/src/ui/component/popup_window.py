#!/usr/bin/env python3
"""
Popup Window Component for Scizor Desktop Application
Provides a small popup window with title, message, copy button, and exit functionality
"""

from PyQt6.QtWidgets import (
    QDialog, QVBoxLayout, QHBoxLayout, QLabel, 
    QPushButton, QTextEdit, QFrame, QApplication
)
from PyQt6.QtCore import Qt, pyqtSignal
from PyQt6.QtGui import QFont
import pyperclip


class PopupWindow(QDialog):
    """Small popup window with title, message, copy button, and exit functionality"""
    
    # Signal emitted when the popup is closed
    closed = pyqtSignal()
    
    def __init__(self, title="Popup", message="", parent=None):
        """
        Initialize the popup window
        
        Args:
            title (str): Title of the popup window
            message (str): Message content to display
            parent: Parent widget
        """
        super().__init__(parent)
        self.title = title
        self.message = message
        print(f"Creating popup window: {title}")
        self.init_ui()
        self.setup_styling()
        print(f"Popup window created successfully: {title}")
        
    def init_ui(self):
        """Initialize the UI components"""
        # Set window properties
        self.setWindowTitle(self.title)
        self.setFixedSize(400, 300)
        
        # Set window flags for proper display
        self.setWindowFlags(
            Qt.WindowType.WindowStaysOnTopHint |  # Keep on top
            Qt.WindowType.FramelessWindowHint |   # No window frame
            Qt.WindowType.Dialog                   # Dialog window
        )
        
        # Position the window in the center of the screen
        self.center_window()
        
        # Create main layout
        self.main_layout = QVBoxLayout(self)
        self.main_layout.setContentsMargins(15, 15, 15, 15)
        self.main_layout.setSpacing(10)
        
        # Create title bar
        self.create_title_bar()
        
        # Create separator
        self.create_separator()
        
        # Create message area
        self.create_message_area()
        
        # Create button area
        self.create_button_area()
        
    def create_title_bar(self):
        """Create the title bar with title and close button"""
        title_layout = QHBoxLayout()
        title_layout.setContentsMargins(0, 0, 0, 0)
        title_layout.setSpacing(10)
        
        # Title label
        self.title_label = QLabel(self.title)
        self.title_label.setFont(QFont("Segoe UI", 12, QFont.Weight.Bold))
        self.title_label.setStyleSheet("color: #2c3e50;")
        
        # Close button
        self.close_button = QPushButton("×")
        self.close_button.setFixedSize(25, 25)
        self.close_button.setFont(QFont("Segoe UI", 14, QFont.Weight.Bold))
        self.close_button.setStyleSheet("""
            QPushButton {
                background-color: #e74c3c;
                color: white;
                border: none;
                border-radius: 12px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #c0392b;
            }
            QPushButton:pressed {
                background-color: #a93226;
            }
        """)
        self.close_button.clicked.connect(self.close_popup)
        
        title_layout.addWidget(self.title_label)
        title_layout.addStretch()
        title_layout.addWidget(self.close_button)
        
        self.main_layout.addLayout(title_layout)
        
    def create_separator(self):
        """Create a separator line"""
        separator = QFrame()
        separator.setFrameShape(QFrame.Shape.HLine)
        separator.setFrameShadow(QFrame.Shadow.Sunken)
        separator.setStyleSheet("background-color: #bdc3c7;")
        separator.setFixedHeight(1)
        self.main_layout.addWidget(separator)
        
    def create_message_area(self):
        """Create the message display area"""
        # Message label
        self.message_label = QLabel("Message:")
        self.message_label.setFont(QFont("Segoe UI", 10, QFont.Weight.Medium))
        self.message_label.setStyleSheet("color: #34495e; margin-bottom: 5px;")
        
        # Message text area
        self.message_text = QTextEdit()
        self.message_text.setPlainText(self.message)
        self.message_text.setReadOnly(True)
        self.message_text.setMaximumHeight(150)
        self.message_text.setStyleSheet("""
            QTextEdit {
                background-color: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 5px;
                padding: 8px;
                font-family: 'Segoe UI';
                font-size: 10px;
                color: #495057;
            }
            QTextEdit:focus {
                border: 1px solid #007bff;
            }
        """)
        
        self.main_layout.addWidget(self.message_label)
        self.main_layout.addWidget(self.message_text)
        
    def create_button_area(self):
        """Create the button area with copy and exit buttons"""
        button_layout = QHBoxLayout()
        button_layout.setSpacing(10)
        
        # Copy button
        self.copy_button = QPushButton("Copy Message")
        self.copy_button.setFont(QFont("Segoe UI", 10, QFont.Weight.Medium))
        self.copy_button.setStyleSheet("""
            QPushButton {
                background-color: #3498db;
                color: white;
                border: none;
                border-radius: 5px;
                padding: 8px 16px;
                font-weight: medium;
            }
            QPushButton:hover {
                background-color: #2980b9;
            }
            QPushButton:pressed {
                background-color: #21618c;
            }
        """)
        self.copy_button.clicked.connect(self.copy_message)
        
        # Exit button
        self.exit_button = QPushButton("Exit")
        self.exit_button.setFont(QFont("Segoe UI", 10, QFont.Weight.Medium))
        self.exit_button.setStyleSheet("""
            QPushButton {
                background-color: #95a5a6;
                color: white;
                border: none;
                border-radius: 5px;
                padding: 8px 16px;
                font-weight: medium;
            }
            QPushButton:hover {
                background-color: #7f8c8d;
            }
            QPushButton:pressed {
                background-color: #6c7b7d;
            }
        """)
        self.exit_button.clicked.connect(self.close_popup)
        
        button_layout.addWidget(self.copy_button)
        button_layout.addStretch()
        button_layout.addWidget(self.exit_button)
        
        self.main_layout.addLayout(button_layout)
        
    def setup_styling(self):
        """Setup the overall styling of the popup window"""
        self.setStyleSheet("""
            QDialog {
                background-color: white;
                border: 1px solid #bdc3c7;
                border-radius: 8px;
            }
        """)
        
    def copy_message(self):
        """Copy the message content to clipboard"""
        try:
            message_text = self.message_text.toPlainText()
            pyperclip.copy(message_text)
            # Temporarily change button text to show success
            original_text = self.copy_button.text()
            self.copy_button.setText("Copied!")
            self.copy_button.setStyleSheet("""
                QPushButton {
                    background-color: #27ae60;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    padding: 8px 16px;
                    font-weight: medium;
                }
            """)
            
            # Reset button after 1.5 seconds
            from PyQt6.QtCore import QTimer
            QTimer.singleShot(1500, lambda: self.reset_copy_button(original_text))
            
        except Exception as e:
            print(f"Error copying to clipboard: {e}")
            
    def reset_copy_button(self, original_text):
        """Reset the copy button to its original state"""
        self.copy_button.setText(original_text)
        self.copy_button.setStyleSheet("""
            QPushButton {
                background-color: #3498db;
                color: white;
                border: none;
                border-radius: 5px;
                padding: 8px 16px;
                font-weight: medium;
            }
            QPushButton:hover {
                background-color: #2980b9;
            }
            QPushButton:pressed {
                background-color: #21618c;
            }
        """)
        
    def close_popup(self):
        """Close the popup window"""
        self.closed.emit()
        self.accept()  # Use accept() for QDialog
        
    def set_message(self, message):
        """Update the message content"""
        self.message = message
        self.message_text.setPlainText(message)
        
    def set_title(self, title):
        """Update the title"""
        self.title = title
        self.setWindowTitle(title)
        self.title_label.setText(title)
        
    def mousePressEvent(self, event):
        """Handle mouse press for window dragging"""
        if event.button() == Qt.MouseButton.LeftButton:
            self.drag_position = event.globalPosition().toPoint() - self.frameGeometry().topLeft()
            event.accept()
            
    def mouseMoveEvent(self, event):
        """Handle mouse move for window dragging"""
        if event.buttons() == Qt.MouseButton.LeftButton:
            self.move(event.globalPosition().toPoint() - self.drag_position)
            event.accept()
    
    def center_window(self):
        """Center the window on the screen"""
        try:
            app = QApplication.instance()
            if app:
                screen = app.primaryScreen()
                if screen:
                    screen_geometry = screen.geometry()
                    x = (screen_geometry.width() - self.width()) // 2
                    y = (screen_geometry.height() - self.height()) // 2
                    self.move(x, y)
                    print(f"Window positioned at: ({x}, {y})")
        except Exception as e:
            print(f"Error centering window: {e}")
            # Fallback: move to a reasonable position
            self.move(100, 100)
            print("Using fallback position: (100, 100)")


def show_popup(title="Popup", message="", parent=None):
    """
    Convenience function to show a popup window
    
    Args:
        title (str): Title of the popup window
        message (str): Message content to display
        parent: Parent widget
        
    Returns:
        PopupWindow: The created popup window instance
    """
    # Check if QApplication exists
    app = QApplication.instance()
    if not app:
        print("Error: No QApplication instance found. Cannot show popup.")
        return None
    
    print(f"Creating popup with title: {title}")
    popup = PopupWindow(title, message, parent)
    
    # Show the popup as modal
    result = popup.exec()
    print(f"Popup closed with result: {result}")
    return popup


if __name__ == "__main__":
    # Test the popup window
    import sys
    from PyQt6.QtWidgets import QApplication
    
    app = QApplication(sys.argv)
    
    # Create and show a test popup
    popup = show_popup(
        title="Test Popup",
        message="This is a test message for the popup window.\n\nYou can copy this message using the Copy button, or close the popup using the Exit button or the × button in the top-right corner."
    )
    
    sys.exit(app.exec())
