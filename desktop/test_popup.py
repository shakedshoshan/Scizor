#!/usr/bin/env python3
"""
Test script for the popup window component
"""

import sys
from PyQt6.QtWidgets import QApplication, QMainWindow, QPushButton, QVBoxLayout, QWidget, QLabel
from src.ui.component.popup_window import show_popup


class TestWindow(QMainWindow):
    """Test window to demonstrate popup functionality"""
    
    def __init__(self):
        super().__init__()
        self.init_ui()
        
    def init_ui(self):
        """Initialize the test UI"""
        self.setWindowTitle("Popup Window Test")
        self.setGeometry(100, 100, 400, 300)
        
        # Create central widget
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        
        # Create layout
        layout = QVBoxLayout(central_widget)
        
        # Add title
        title_label = QLabel("Popup Window Test")
        title_label.setStyleSheet("font-size: 18px; font-weight: bold; margin: 10px;")
        layout.addWidget(title_label)
        
        # Add description
        desc_label = QLabel("Click the buttons below to test different popup scenarios:")
        desc_label.setStyleSheet("margin: 10px;")
        layout.addWidget(desc_label)
        
        # Test button 1 - Simple popup
        btn1 = QPushButton("Show Simple Popup")
        btn1.clicked.connect(self.show_simple_popup)
        btn1.setStyleSheet("""
            QPushButton {
                background-color: #3498db;
                color: white;
                border: none;
                border-radius: 5px;
                padding: 10px;
                margin: 5px;
                font-weight: medium;
            }
            QPushButton:hover {
                background-color: #2980b9;
            }
        """)
        layout.addWidget(btn1)
        
        # Test button 2 - Long message popup
        btn2 = QPushButton("Show Long Message Popup")
        btn2.clicked.connect(self.show_long_message_popup)
        btn2.setStyleSheet("""
            QPushButton {
                background-color: #e67e22;
                color: white;
                border: none;
                border-radius: 5px;
                padding: 10px;
                margin: 5px;
                font-weight: medium;
            }
            QPushButton:hover {
                background-color: #d35400;
            }
        """)
        layout.addWidget(btn2)
        
        # Test button 3 - Error popup
        btn3 = QPushButton("Show Error Popup")
        btn3.clicked.connect(self.show_error_popup)
        btn3.setStyleSheet("""
            QPushButton {
                background-color: #e74c3c;
                color: white;
                border: none;
                border-radius: 5px;
                padding: 10px;
                margin: 5px;
                font-weight: medium;
            }
            QPushButton:hover {
                background-color: #c0392b;
            }
        """)
        layout.addWidget(btn3)
        
        # Test button 4 - Success popup
        btn4 = QPushButton("Show Success Popup")
        btn4.clicked.connect(self.show_success_popup)
        btn4.setStyleSheet("""
            QPushButton {
                background-color: #27ae60;
                color: white;
                border: none;
                border-radius: 5px;
                padding: 10px;
                margin: 5px;
                font-weight: medium;
            }
            QPushButton:hover {
                background-color: #229954;
            }
        """)
        layout.addWidget(btn4)
        
        layout.addStretch()
        
    def show_simple_popup(self):
        """Show a simple popup with basic message"""
        show_popup(
            title="Simple Popup",
            message="This is a simple popup message.\nYou can copy this text using the Copy button."
        )
        
    def show_long_message_popup(self):
        """Show a popup with a longer message"""
        long_message = """This is a longer message that demonstrates how the popup window handles multi-line text.

Features of this popup:
• Copy button to copy the entire message
• Exit button to close the popup
• Draggable window (click and drag anywhere)
• Stays on top of other windows
• Clean, modern design

The message area will scroll if the content is too long for the available space."""
        
        show_popup(
            title="Long Message Demo",
            message=long_message
        )
        
    def show_error_popup(self):
        """Show a popup with error message"""
        error_message = """Error: Something went wrong!

Details:
• Error Code: 404
• Description: Resource not found
• Timestamp: 2024-01-15 14:30:22

Please try again or contact support if the problem persists."""
        
        show_popup(
            title="Error Notification",
            message=error_message
        )
        
    def show_success_popup(self):
        """Show a popup with success message"""
        success_message = """Success: Operation completed successfully!

Details:
• Task: Data processing
• Status: Completed
• Records processed: 1,234
• Time taken: 2.5 seconds

The operation has been completed without any errors."""
        
        show_popup(
            title="Success Notification",
            message=success_message
        )


def main():
    """Main function to run the test application"""
    app = QApplication(sys.argv)
    
    # Create and show the test window
    test_window = TestWindow()
    test_window.show()
    
    sys.exit(app.exec())


if __name__ == "__main__":
    main() 