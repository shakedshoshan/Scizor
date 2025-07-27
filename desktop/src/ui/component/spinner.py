import sys
from PyQt6.QtWidgets import (QWidget, QVBoxLayout, QHBoxLayout, 
                             QLabel, QApplication, QFrame)
from PyQt6.QtCore import Qt, QTimer, QPropertyAnimation, QEasingCurve, pyqtProperty
from PyQt6.QtGui import QPainter, QColor, QPen, QFont, QPixmap, QPainterPath


class SpinnerWidget(QWidget):
    """
    Custom widget for the spinner animation that properly handles painting.
    """
    
    def __init__(self, parent=None, size=60, color="#3498DB"):
        super().__init__(parent)
        self._size = size
        self._color = QColor(color)
        self._rotation = 0
        self.setFixedSize(size, size)
    
    def set_rotation(self, rotation):
        """Set the rotation angle and trigger repaint."""
        self._rotation = rotation
        self.update()
    
    def paintEvent(self, event):
        """Custom paint event for the spinner animation."""
        painter = QPainter(self)
        painter.setRenderHint(QPainter.RenderHint.Antialiasing)
        
        # Calculate center and radius
        center_x = self.width() // 2
        center_y = self.height() // 2
        radius = min(center_x, center_y) - 10
        
        # Draw spinner dots
        num_dots = 8
        for i in range(num_dots):
            angle = (self._rotation + i * 360 // num_dots) % 360
            x = center_x + radius * (angle / 360) * 0.8 * (1 if angle < 180 else -1)
            y = center_y - radius * 0.6 * (1 if angle < 90 or angle > 270 else -1)
            
            # Calculate opacity based on position
            opacity = 0.3 + 0.7 * (i / num_dots)
            color = QColor(self._color)
            color.setAlpha(int(255 * opacity))
            
            painter.setPen(QPen(color, 4))
            painter.setBrush(color)
            painter.drawEllipse(int(x - 3), int(y - 3), 6, 6)


class WaitingSpinner(QWidget):
    """
    A customizable waiting spinner component with animated rotation,
    customizable text, and background colors.
    """
    
    def __init__(self, parent=None, text="Loading...", 
                 text_color="#FFFFFF", background_color="#2C3E50",
                 spinner_color="#3498DB", spinner_size=60, 
                 text_size=14, center_on_parent=True,
                 disable_parent_when_spinning=False):
        super().__init__(parent)
        
        # Configuration
        self._text = text
        self._text_color = QColor(text_color)
        self._background_color = QColor(background_color)
        self._spinner_color = QColor(spinner_color)
        self._spinner_size = spinner_size
        self._text_size = text_size
        self._center_on_parent = center_on_parent
        self._disable_parent_when_spinning = disable_parent_when_spinning
        
        # Animation properties
        self._current_rotation = 0
        self._animation_timer = QTimer()
        self._animation_timer.timeout.connect(self._rotate)
        self._animation_speed = 50  # milliseconds between rotations
        
        # Setup UI
        self._setup_ui()
        self._setup_style()
        
        # Hide by default
        self.hide()
    
    def _setup_ui(self):
        """Setup the user interface layout."""
        # Main layout
        main_layout = QVBoxLayout(self)
        main_layout.setAlignment(Qt.AlignmentFlag.AlignCenter)
        main_layout.setSpacing(20)
        main_layout.setContentsMargins(20, 20, 20, 20)
        
        # Use custom spinner widget instead of QFrame
        self._spinner_widget = SpinnerWidget(self, self._spinner_size, self._spinner_color.name())
        
        # Text label
        self._text_label = QLabel(self._text)
        self._text_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self._text_label.setWordWrap(True)
        
        # Add widgets to layout
        main_layout.addWidget(self._spinner_widget, alignment=Qt.AlignmentFlag.AlignCenter)
        main_layout.addWidget(self._text_label, alignment=Qt.AlignmentFlag.AlignCenter)
        
        # Set widget properties
        self.setFixedSize(self._spinner_size + 100, self._spinner_size + 80)
        self.setWindowFlags(Qt.WindowType.FramelessWindowHint)
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground)
    
    def _setup_style(self):
        """Setup the styling for the spinner and text."""
        # Text styling
        font = QFont()
        font.setPointSize(self._text_size)
        font.setWeight(QFont.Weight.Medium)
        self._text_label.setFont(font)
        self._text_label.setStyleSheet(f"""
            QLabel {{
                color: {self._text_color.name()};
                background: transparent;
                padding: 5px;
                border-radius: 5px;
            }}
        """)
        
        # Background styling
        self.setStyleSheet(f"""
            QWidget {{
                background-color: {self._background_color.name()};
                border-radius: 15px;
                border: 2px solid {self._spinner_color.name()};
            }}
        """)
    
    def _rotate(self):
        """Rotate the spinner by updating the rotation angle."""
        self._current_rotation = (self._current_rotation + 30) % 360
        self._spinner_widget.set_rotation(self._current_rotation)
    
    def start(self):
        """Start the spinner animation."""
        if self.parent() and self._center_on_parent:
            self._center_on_parent_widget()
        
        if self._disable_parent_when_spinning and self.parent():
            self.parent().setEnabled(False)
        
        self.show()
        # Ensure timer is started in the main thread
        if QApplication.instance():
            self._animation_timer.start(self._animation_speed)
    
    def stop(self):
        """Stop the spinner animation."""
        self._animation_timer.stop()
        self.hide()
        
        if self._disable_parent_when_spinning and self.parent():
            self.parent().setEnabled(True)
    
    def _center_on_parent_widget(self):
        """Center the spinner on its parent widget."""
        if not self.parent():
            return
        
        parent_rect = self.parent().rect()
        x = (parent_rect.width() - self.width()) // 2
        y = (parent_rect.height() - self.height()) // 2
        self.move(x, y)
    
    def set_text(self, text):
        """Set the spinner text."""
        self._text = text
        self._text_label.setText(text)
    
    def set_text_color(self, color):
        """Set the text color."""
        self._text_color = QColor(color)
        self._text_label.setStyleSheet(f"""
            QLabel {{
                color: {self._text_color.name()};
                background: transparent;
                padding: 5px;
                border-radius: 5px;
            }}
        """)
    
    def set_background_color(self, color):
        """Set the background color."""
        self._background_color = QColor(color)
        self.setStyleSheet(f"""
            QWidget {{
                background-color: {self._background_color.name()};
                border-radius: 15px;
                border: 2px solid {self._spinner_color.name()};
            }}
        """)
    
    def set_spinner_color(self, color):
        """Set the spinner color."""
        self._spinner_color = QColor(color)
        self._spinner_widget._color = self._spinner_color
        self.setStyleSheet(f"""
            QWidget {{
                background-color: {self._background_color.name()};
                border-radius: 15px;
                border: 2px solid {self._spinner_color.name()};
            }}
        """)
    
    def set_animation_speed(self, speed):
        """Set the animation speed in milliseconds."""
        self._animation_speed = speed
        if self._animation_timer.isActive():
            self._animation_timer.setInterval(speed)



