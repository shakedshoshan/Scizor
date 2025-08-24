#!/usr/bin/env python3
"""
Alert Component for Scizor Desktop Application
Modern Material Design-inspired alerts with light color scheme
"""

from PyQt6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, 
    QPushButton, QFrame, QApplication, QGraphicsDropShadowEffect
)
from PyQt6.QtCore import Qt, QTimer, QPropertyAnimation, QEasingCurve, pyqtSignal, QRect
from PyQt6.QtGui import QFont, QIcon, QPixmap, QPainter, QColor, QPalette
import time
from typing import Optional


class AlertWidget(QWidget):
    """Compact alert widget for displaying failure messages and notifications"""
    
    # Signal emitted when the alert is closed
    closed = pyqtSignal()
    
    # Alert types
    ERROR = "error"
    WARNING = "warning"
    INFO = "info"
    SUCCESS = "success"
    
    def __init__(self, message: str, alert_type: str = ERROR, duration: int = 4000, parent=None):
        """
        Initialize the alert widget
        
        Args:
            message (str): Alert message to display
            alert_type (str): Type of alert (error, warning, info, success)
            duration (int): Duration to show alert in milliseconds (0 = no auto-hide)
            parent: Parent widget
        """
        super().__init__(parent)
        self.message = message
        self.alert_type = alert_type
        self.duration = duration
        self._is_closing = False
        
        self.init_ui()
        self.setup_styling()
        self.setup_animations()
        
        # Auto-hide timer
        if self.duration > 0:
            self.auto_hide_timer = QTimer()
            self.auto_hide_timer.timeout.connect(self.hide_alert)
            self.auto_hide_timer.setSingleShot(True)
            self.auto_hide_timer.start(self.duration)
        
    def init_ui(self):
        """Initialize the UI components with modern Material Design styling"""
        # Set window properties for floating alert
        self.setWindowFlags(
            Qt.WindowType.Tool |
            Qt.WindowType.FramelessWindowHint |
            Qt.WindowType.WindowStaysOnTopHint
        )
        
        # Set fixed size for modern compact design
        self.setFixedSize(360, 90)
        
        # Enable auto-fill background for proper color rendering
        self.setAutoFillBackground(True)
        
        # Position near top-right of screen
        self.position_alert()
        
        # Create main layout with better spacing
        self.main_layout = QHBoxLayout(self)
        self.main_layout.setContentsMargins(20, 16, 20, 16)
        self.main_layout.setSpacing(16)
        
        # Create icon label
        self.create_icon()
        
        # Create message area
        self.create_message_area()
        
        # Create close button
        self.create_close_button()
        
        # Add modern drop shadow effect
        self.add_shadow_effect()
        
    def create_icon(self):
        """Create the modern alert type icon with circular background"""
        self.icon_container = QWidget()
        self.icon_container.setFixedSize(40, 40)
        
        # Create circular icon background
        icon_text, icon_color, bg_color = self.get_icon_properties()
        
        self.icon_container.setStyleSheet(f"""
            QWidget {{
                background-color: {bg_color};
                border-radius: 20px;
                border: none;
            }}
        """)
        
        # Create icon label inside container
        icon_layout = QHBoxLayout(self.icon_container)
        icon_layout.setContentsMargins(0, 0, 0, 0)
        
        self.icon_label = QLabel(icon_text)
        self.icon_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.icon_label.setFont(QFont("Segoe UI", 18, QFont.Weight.Bold))
        self.icon_label.setStyleSheet(f"color: {icon_color}; background: transparent;")
        
        icon_layout.addWidget(self.icon_label)
        self.main_layout.addWidget(self.icon_container)
        
    def create_message_area(self):
        """Create the modern message display area"""
        self.message_label = QLabel(self.message)
        self.message_label.setFont(QFont("Segoe UI", 13, QFont.Weight.Medium))
        self.message_label.setWordWrap(True)
        self.message_label.setAlignment(Qt.AlignmentFlag.AlignLeft | Qt.AlignmentFlag.AlignVCenter)
        self.message_label.setStyleSheet("""
            QLabel {
                color: #37474f;
                background: transparent;
                padding: 0px;
                line-height: 1.4;
            }
        """)
        
        # Allow message to expand
        self.main_layout.addWidget(self.message_label, 1)
        
    def create_close_button(self):
        """Create the modern close button"""
        self.close_button = QPushButton("✕")
        self.close_button.setFixedSize(28, 28)
        self.close_button.setFont(QFont("Segoe UI", 12, QFont.Weight.Bold))
        self.close_button.setStyleSheet("""
            QPushButton {
                background-color: transparent;
                color: #78909c;
                border: none;
                border-radius: 14px;
                padding: 0px;
            }
            QPushButton:hover {
                background-color: #eceff1;
                color: #455a64;
            }
            QPushButton:pressed {
                background-color: #cfd8dc;
                color: #37474f;
            }
        """)
        self.close_button.clicked.connect(self.hide_alert)
        
        self.main_layout.addWidget(self.close_button)
        
    def get_icon_properties(self):
        """Get modern icon text, color and background based on alert type"""
        # Returns (icon_text, icon_color, background_color)
        icons = {
            self.ERROR: ("!", "#ffffff", "#f44336"),
            self.WARNING: ("!", "#ffffff", "#ff9800"), 
            self.INFO: ("i", "#ffffff", "#2196f3"),
            self.SUCCESS: ("✓", "#ffffff", "#4caf50")
        }
        return icons.get(self.alert_type, icons[self.ERROR])
        
    def setup_styling(self):
        """Setup the modern Material Design styling"""
        # Pure white background with subtle colored left border
        bg_color = "#ffffff"
        
        # Modern accent colors for left border
        accent_colors = {
            self.ERROR: "#f44336",
            self.WARNING: "#ff9800", 
            self.INFO: "#2196f3",
            self.SUCCESS: "#4caf50"
        }
        
        accent_color = accent_colors.get(self.alert_type, accent_colors[self.ERROR])
        
        # Set palette for proper background rendering
        palette = self.palette()
        palette.setColor(QPalette.ColorRole.Window, QColor(bg_color))
        self.setPalette(palette)
        
        # Modern styling with left accent border
        self.setStyleSheet(f"""
            QWidget {{
                background-color: {bg_color};
                border: none;
                border-left: 4px solid {accent_color};
                border-radius: 12px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }}
        """)
        
    def add_shadow_effect(self):
        """Add modern, subtle drop shadow effect"""
        shadow = QGraphicsDropShadowEffect()
        shadow.setBlurRadius(20)
        shadow.setXOffset(0)
        shadow.setYOffset(4)
        shadow.setColor(QColor(0, 0, 0, 25))  # Very subtle shadow
        self.setGraphicsEffect(shadow)
        
    def setup_animations(self):
        """Setup slide-in and slide-out animations"""
        # Slide-in animation (from right)
        self.slide_in_animation = QPropertyAnimation(self, b"geometry")
        self.slide_in_animation.setDuration(300)
        self.slide_in_animation.setEasingCurve(QEasingCurve.Type.OutCubic)
        
        # Slide-out animation (to right)
        self.slide_out_animation = QPropertyAnimation(self, b"geometry")
        self.slide_out_animation.setDuration(250)
        self.slide_out_animation.setEasingCurve(QEasingCurve.Type.InCubic)
        self.slide_out_animation.finished.connect(self._on_animation_finished)
        
    def position_alert(self):
        """Position the alert in the top-right area of the screen"""
        try:
            app = QApplication.instance()
            if app:
                screen = app.primaryScreen()
                if screen:
                    screen_geometry = screen.geometry()
                    # Position in top-right area with some margin
                    x = screen_geometry.width() - self.width() - 24
                    y = 80  # Below the top of screen with more space
                    self.move(x, y)
        except Exception as e:
            print(f"Error positioning alert: {e}")
            # Fallback position
            self.move(100, 100)
            
    def show_alert(self):
        """Show the alert with slide-in animation"""
        if self._is_closing:
            return
            
        # Show the widget first
        self.show()
        
        # Setup slide-in animation from right side
        try:
            app = QApplication.instance()
            if app:
                screen = app.primaryScreen()
                if screen:
                    screen_geometry = screen.geometry()
                    
                    # Start position (off-screen to the right)
                    start_x = screen_geometry.width()
                    start_y = 80
                    
                    # End position (visible on screen)
                    end_x = screen_geometry.width() - self.width() - 24
                    end_y = 80
                    
                    # Set start position
                    self.setGeometry(start_x, start_y, self.width(), self.height())
                    
                    # Configure and start animation
                    self.slide_in_animation.setStartValue(QRect(start_x, start_y, self.width(), self.height()))
                    self.slide_in_animation.setEndValue(QRect(end_x, end_y, self.width(), self.height()))
                    self.slide_in_animation.start()
        except Exception as e:
            print(f"Error in slide-in animation: {e}")
            
    def hide_alert(self):
        """Hide the alert with slide-out animation"""
        if self._is_closing:
            return
            
        self._is_closing = True
        
        # Stop auto-hide timer if running
        if hasattr(self, 'auto_hide_timer'):
            self.auto_hide_timer.stop()
            
        # Setup slide-out animation to right side
        try:
            app = QApplication.instance()
            if app:
                screen = app.primaryScreen()
                if screen:
                    screen_geometry = screen.geometry()
                    
                    # Current position
                    current_rect = self.geometry()
                    
                    # End position (off-screen to the right)
                    end_x = screen_geometry.width()
                    end_y = current_rect.y()
                    
                    # Configure and start animation
                    self.slide_out_animation.setStartValue(current_rect)
                    self.slide_out_animation.setEndValue(QRect(end_x, end_y, self.width(), self.height()))
                    self.slide_out_animation.start()
        except Exception as e:
            print(f"Error in slide-out animation: {e}")
            self._on_animation_finished()  # Fallback to direct close
            
    def _on_animation_finished(self):
        """Called when slide-out animation finishes"""
        self.closed.emit()
        self.close()
        
    def set_message(self, message: str):
        """Update the alert message"""
        self.message = message
        self.message_label.setText(message)
        
    def mousePressEvent(self, event):
        """Handle mouse press for window dragging"""
        if event.button() == Qt.MouseButton.LeftButton and not self._is_closing:
            self.drag_position = event.globalPosition().toPoint() - self.frameGeometry().topLeft()
            event.accept()
            
    def mouseMoveEvent(self, event):
        """Handle mouse move for window dragging"""
        if (event.buttons() == Qt.MouseButton.LeftButton and 
            hasattr(self, 'drag_position') and not self._is_closing):
            self.move(event.globalPosition().toPoint() - self.drag_position)
            event.accept()


class AlertManager:
    """Manages multiple alerts to prevent overlap and handle positioning"""
    
    _instance = None
    _active_alerts = []
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not hasattr(self, '_initialized'):
            self._active_alerts = []
            self._initialized = True
    
    def show_alert(self, message: str, alert_type: str = AlertWidget.ERROR, duration: int = 4000) -> AlertWidget:
        """
        Show a new alert, positioning it to avoid overlap with existing alerts
        
        Args:
            message (str): Alert message
            alert_type (str): Type of alert
            duration (int): Duration in milliseconds (0 = no auto-hide)
            
        Returns:
            AlertWidget: The created alert widget
        """
        # Clean up closed alerts
        self._active_alerts = [alert for alert in self._active_alerts if alert.isVisible()]
        
        # Create new alert
        alert = AlertWidget(message, alert_type, duration)
        
        # Position alert to avoid overlap
        self._position_new_alert(alert)
        
        # Connect closed signal to cleanup
        alert.closed.connect(lambda: self._remove_alert(alert))
        
        # Add to active alerts list
        self._active_alerts.append(alert)
        
        # Show the alert
        alert.show_alert()
        
        return alert
    
    def _position_new_alert(self, new_alert: AlertWidget):
        """Position a new alert to avoid overlap with existing alerts"""
        try:
            app = QApplication.instance()
            if not app:
                return
                
            screen = app.primaryScreen()
            if not screen:
                return
                
            screen_geometry = screen.geometry()
            
            # Start with default position
            x = screen_geometry.width() - new_alert.width() - 24
            y = 80
            
            # Check for overlap with existing alerts and adjust position
            for existing_alert in self._active_alerts:
                if existing_alert.isVisible():
                    existing_geometry = existing_alert.geometry()
                    
                    # If there would be overlap, move new alert down
                    if (abs(x - existing_geometry.x()) < new_alert.width() and
                        abs(y - existing_geometry.y()) < new_alert.height() + 10):
                        y = existing_geometry.y() + existing_geometry.height() + 10
            
            # Make sure alert doesn't go off screen
            if y + new_alert.height() > screen_geometry.height() - 24:
                y = 80  # Reset to top if we've run out of space
                
            new_alert.move(x, y)
            
        except Exception as e:
            print(f"Error positioning new alert: {e}")
    
    def _remove_alert(self, alert: AlertWidget):
        """Remove an alert from the active list"""
        if alert in self._active_alerts:
            self._active_alerts.remove(alert)
    
    def clear_all_alerts(self):
        """Close all active alerts"""
        for alert in self._active_alerts:
            if alert.isVisible():
                alert.hide_alert()
        self._active_alerts.clear()


# Global alert manager instance
_alert_manager = None

def get_alert_manager() -> AlertManager:
    """Get the global alert manager instance"""
    global _alert_manager
    if _alert_manager is None:
        _alert_manager = AlertManager()
    return _alert_manager

def show_error_alert(message: str, duration: int = 4000) -> AlertWidget:
    """Show an error alert"""
    return get_alert_manager().show_alert(message, AlertWidget.ERROR, duration)

def show_warning_alert(message: str, duration: int = 4000) -> AlertWidget:
    """Show a warning alert"""
    return get_alert_manager().show_alert(message, AlertWidget.WARNING, duration)

def show_info_alert(message: str, duration: int = 3000) -> AlertWidget:
    """Show an info alert"""
    return get_alert_manager().show_alert(message, AlertWidget.INFO, duration)

def show_success_alert(message: str, duration: int = 3000) -> AlertWidget:
    """Show a success alert"""
    return get_alert_manager().show_alert(message, AlertWidget.SUCCESS, duration)


if __name__ == "__main__":
    # Test the alert component
    import sys
    from PyQt6.QtWidgets import QApplication, QMainWindow, QPushButton, QVBoxLayout, QWidget
    
    class TestWindow(QMainWindow):
        def __init__(self):
            super().__init__()
            self.setWindowTitle("Alert Component Test")
            self.setGeometry(100, 100, 400, 300)
            
            central_widget = QWidget()
            self.setCentralWidget(central_widget)
            layout = QVBoxLayout(central_widget)
            
            # Test buttons
            error_btn = QPushButton("Show Error Alert")
            error_btn.clicked.connect(lambda: show_error_alert("This is an error message!"))
            layout.addWidget(error_btn)
            
            warning_btn = QPushButton("Show Warning Alert")
            warning_btn.clicked.connect(lambda: show_warning_alert("This is a warning message!"))
            layout.addWidget(warning_btn)
            
            info_btn = QPushButton("Show Info Alert")
            info_btn.clicked.connect(lambda: show_info_alert("This is an info message!"))
            layout.addWidget(info_btn)
            
            success_btn = QPushButton("Show Success Alert")
            success_btn.clicked.connect(lambda: show_success_alert("This is a success message!"))
            layout.addWidget(success_btn)
            
            multiple_btn = QPushButton("Show Multiple Alerts")
            multiple_btn.clicked.connect(self.show_multiple_alerts)
            layout.addWidget(multiple_btn)
            
        def show_multiple_alerts(self):
            show_error_alert("First error message")
            show_warning_alert("Second warning message")
            show_info_alert("Third info message")
    
    app = QApplication(sys.argv)
    window = TestWindow()
    window.show()
    sys.exit(app.exec())
