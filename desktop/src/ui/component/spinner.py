import sys
from PyQt6.QtWidgets import (QWidget, QVBoxLayout, QHBoxLayout, 
                             QLabel, QApplication, QFrame)
from PyQt6.QtCore import Qt, QTimer, QPropertyAnimation, QEasingCurve, pyqtProperty
from PyQt6.QtGui import QPainter, QColor, QPen, QFont, QPixmap, QPainterPath


class ModernSpinnerWidget(QWidget):
    """
    Modern spinner widget with smooth animations and visual effects.
    """
    
    def __init__(self, parent=None, size=40, color="#3498DB"):
        super().__init__(parent)
        self._size = size
        self._color = QColor(color)
        self._rotation = 0
        self._pulse_scale = 1.0
        self._pulse_direction = 1
        self.setFixedSize(size, size)
        
        # Pulse animation
        self._pulse_timer = QTimer()
        self._pulse_timer.timeout.connect(self._update_pulse)
        self._pulse_timer.start(50)
    
    def set_rotation(self, rotation):
        """Set the rotation angle and trigger repaint."""
        self._rotation = rotation
        self.update()
    
    def _update_pulse(self):
        """Update pulse animation."""
        self._pulse_scale += 0.02 * self._pulse_direction
        if self._pulse_scale >= 1.1:
            self._pulse_direction = -1
        elif self._pulse_scale <= 0.9:
            self._pulse_direction = 1
        self.update()
    
    def paintEvent(self, event):
        """Custom paint event with modern spinner design."""
        painter = QPainter(self)
        painter.setRenderHint(QPainter.RenderHint.Antialiasing)
        
        # Calculate center and radius
        center_x = self.width() // 2
        center_y = self.height() // 2
        radius = min(center_x, center_y) - 8
        
        # Draw modern spinner with gradient effect
        num_dots = 6
        for i in range(num_dots):
            angle = (self._rotation + i * 360 // num_dots) % 360
            
            # Calculate position with smooth curve
            angle_rad = angle * 3.14159 / 180
            x = center_x + radius * 0.7 * (angle_rad / 3.14159) * (1 if angle < 180 else -1)
            y = center_y - radius * 0.5 * (1 if angle < 90 or angle > 270 else -1)
            
            # Calculate opacity and size based on position
            opacity = 0.2 + 0.8 * (i / num_dots)
            dot_size = 3 + 2 * opacity * self._pulse_scale
            
            # Create gradient-like effect
            color = QColor(self._color)
            color.setAlpha(int(255 * opacity))
            
            # Draw dot with shadow effect
            painter.setPen(QPen(QColor(0, 0, 0, 50), 1))
            painter.setBrush(color)
            painter.drawEllipse(int(x - dot_size/2 + 1), int(y - dot_size/2 + 1), 
                              int(dot_size), int(dot_size))
            
            # Draw main dot
            painter.setPen(QPen(color, 1))
            painter.setBrush(color)
            painter.drawEllipse(int(x - dot_size/2), int(y - dot_size/2), 
                              int(dot_size), int(dot_size))


class WaitingSpinner(QWidget):
    """
    A modern, horizontally-oriented waiting spinner with smooth animations
    and improved visual design.
    """
    
    def __init__(self, parent=None, text="Loading...", 
                 text_color="#FFFFFF", background_color="#2C3E50",
                 spinner_color="#3498DB", spinner_size=40, 
                 text_size=12, center_on_parent=True,
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
        self._animation_speed = 40  # Faster animation
        
        # Fade animation
        self._fade_animation = QPropertyAnimation(self, b"windowOpacity")
        self._fade_animation.setDuration(200)
        self._fade_animation.setEasingCurve(QEasingCurve.Type.OutCubic)
        
        # Setup UI
        self._setup_ui()
        self._setup_style()
        
        # Hide by default
        self.hide()
        self.setWindowOpacity(0.0)
    
    def _setup_ui(self):
        """Setup the user interface layout with horizontal orientation."""
        # Main layout - horizontal
        main_layout = QHBoxLayout(self)
        main_layout.setAlignment(Qt.AlignmentFlag.AlignCenter)
        main_layout.setSpacing(12)
        main_layout.setContentsMargins(16, 12, 16, 12)
        
        # Use modern spinner widget
        self._spinner_widget = ModernSpinnerWidget(self, self._spinner_size, self._spinner_color.name())
        
        # Text label
        self._text_label = QLabel(self._text)
        self._text_label.setAlignment(Qt.AlignmentFlag.AlignLeft | Qt.AlignmentFlag.AlignVCenter)
        self._text_label.setWordWrap(False)
        
        # Add widgets to layout horizontally
        main_layout.addWidget(self._spinner_widget, alignment=Qt.AlignmentFlag.AlignCenter)
        main_layout.addWidget(self._text_label, alignment=Qt.AlignmentFlag.AlignCenter)
        
        # Set widget properties for horizontal layout
        self.setFixedSize(self._spinner_size + 120, self._spinner_size + 24)
        self.setWindowFlags(Qt.WindowType.FramelessWindowHint)
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground)
    
    def _setup_style(self):
        """Setup modern styling for the spinner and text."""
        # Text styling
        font = QFont()
        font.setPointSize(self._text_size)
        font.setWeight(QFont.Weight.Medium)
        self._text_label.setFont(font)
        self._text_label.setStyleSheet(f"""
            QLabel {{
                color: {self._text_color.name()};
                background: transparent;
                padding: 0px;
                border-radius: 0px;
                font-weight: 500;
            }}
        """)
        
        # Modern background styling with shadow effect
        self.setStyleSheet(f"""
            QWidget {{
                background-color: {self._background_color.name()};
                border-radius: 20px;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }}
        """)
    
    def _rotate(self):
        """Rotate the spinner by updating the rotation angle."""
        self._current_rotation = (self._current_rotation + 25) % 360
        self._spinner_widget.set_rotation(self._current_rotation)
    
    def start(self):
        """Start the spinner animation with fade-in effect."""
        if self.parent() and self._center_on_parent:
            self._center_on_parent_widget()
        
        if self._disable_parent_when_spinning and self.parent():
            self.parent().setEnabled(False)
        
        # Fade in animation
        self._fade_animation.setStartValue(0.0)
        self._fade_animation.setEndValue(1.0)
        self._fade_animation.start()
        
        self.show()
        # Ensure timer is started in the main thread
        if QApplication.instance():
            self._animation_timer.start(self._animation_speed)
    
    def stop(self):
        """Stop the spinner animation with fade-out effect."""
        self._animation_timer.stop()
        
        # Fade out animation
        self._fade_animation.setStartValue(1.0)
        self._fade_animation.setEndValue(0.0)
        self._fade_animation.finished.connect(self._on_fade_out_finished)
        self._fade_animation.start()
        
        if self._disable_parent_when_spinning and self.parent():
            self.parent().setEnabled(True)
    
    def _on_fade_out_finished(self):
        """Handle fade-out animation completion."""
        self.hide()
        self._fade_animation.finished.disconnect(self._on_fade_out_finished)
    
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
                padding: 0px;
                border-radius: 0px;
                font-weight: 500;
            }}
        """)
    
    def set_background_color(self, color):
        """Set the background color."""
        self._background_color = QColor(color)
        self.setStyleSheet(f"""
            QWidget {{
                background-color: {self._background_color.name()};
                border-radius: 20px;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }}
        """)
    
    def set_spinner_color(self, color):
        """Set the spinner color."""
        self._spinner_color = QColor(color)
        self._spinner_widget._color = self._spinner_color
        self.setStyleSheet(f"""
            QWidget {{
                background-color: {self._background_color.name()};
                border-radius: 20px;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }}
        """)
    
    def set_animation_speed(self, speed):
        """Set the animation speed in milliseconds."""
        self._animation_speed = speed
        if self._animation_timer.isActive():
            self._animation_timer.setInterval(speed)


class FancyWaitingSpinner(WaitingSpinner):
    """
    An enhanced version of the waiting spinner with additional visual effects.
    """
    
    def __init__(self, parent=None, text="Loading...", 
                 text_color="#FFFFFF", background_color="#2C3E50",
                 spinner_color="#3498DB", spinner_size=50, 
                 text_size=14, center_on_parent=True,
                 disable_parent_when_spinning=False,
                 show_progress=False):
        super().__init__(parent, text, text_color, background_color,
                        spinner_color, spinner_size, text_size,
                        center_on_parent, disable_parent_when_spinning)
        
        self._show_progress = show_progress
        self._progress = 0
        self._progress_animation = QPropertyAnimation(self, b"progress")
        self._progress_animation.setDuration(2000)
        self._progress_animation.setEasingCurve(QEasingCurve.Type.InOutQuad)
        
        if show_progress:
            self._setup_progress_ui()
    
    def _setup_progress_ui(self):
        """Setup progress bar UI elements."""
        # Add progress bar
        self._progress_bar = QFrame()
        self._progress_bar.setFixedHeight(3)
        self._progress_bar.setStyleSheet(f"""
            QFrame {{
                background-color: rgba(255, 255, 255, 0.2);
                border-radius: 2px;
            }}
        """)
        
        # Add progress bar to layout
        layout = self.layout()
        layout.insertWidget(1, self._progress_bar)
    
    def paintEvent(self, event):
        """Enhanced paint event with progress visualization."""
        super().paintEvent(event)
        
        if not self.isVisible() or not self._show_progress:
            return
        
        # Paint progress bar
        painter = QPainter(self._progress_bar)
        painter.setRenderHint(QPainter.RenderHint.Antialiasing)
        
        # Background
        painter.fillRect(self._progress_bar.rect(), 
                        QColor(255, 255, 255, 50))
        
        # Progress fill
        progress_width = int(self._progress_bar.width() * self._progress / 100)
        if progress_width > 0:
            progress_rect = self._progress_bar.rect()
            progress_rect.setWidth(progress_width)
            painter.fillRect(progress_rect, self._spinner_color)
    
    def set_progress(self, progress):
        """Set the progress percentage (0-100)."""
        self._progress = max(0, min(100, progress))
        if self._show_progress:
            self._progress_bar.update()
    
    def animate_progress(self, target_progress, duration=1000):
        """Animate progress to target value."""
        if not self._show_progress:
            return
        
        self._progress_animation.setStartValue(self._progress)
        self._progress_animation.setEndValue(target_progress)
        self._progress_animation.setDuration(duration)
        self._progress_animation.start()
    
    def get_progress(self):
        """Get the current progress value."""
        return self._progress


# Example usage and testing
if __name__ == "__main__":
    app = QApplication(sys.argv)
    
    # Create a test window
    test_window = QWidget()
    test_window.setWindowTitle("Modern Spinner Test")
    test_window.setGeometry(100, 100, 500, 300)
    test_window.setStyleSheet("background-color: #34495E;")
    
    # Create different spinner examples
    spinner1 = WaitingSpinner(
        test_window,
        text="Processing...",
        text_color="#FFFFFF",
        background_color="#E74C3C",
        spinner_color="#F39C12",
        spinner_size=40
    )
    
    spinner2 = FancyWaitingSpinner(
        test_window,
        text="Downloading files...",
        text_color="#FFFFFF",
        background_color="#27AE60",
        spinner_color="#3498DB",
        spinner_size=50,
        show_progress=True
    )
    
    # Layout for testing
    layout = QVBoxLayout(test_window)
    layout.addWidget(spinner1)
    layout.addWidget(spinner2)
    
    # Start spinners
    spinner1.start()
    spinner2.start()
    
    # Simulate progress
    timer = QTimer()
    progress = 0
    def update_progress():
        global progress
        progress = (progress + 10) % 100
        spinner2.set_progress(progress)
    
    timer.timeout.connect(update_progress)
    timer.start(500)
    
    test_window.show()
    sys.exit(app.exec())



