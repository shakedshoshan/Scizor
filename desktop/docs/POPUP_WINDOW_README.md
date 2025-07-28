# Popup Window Component

A small, modern popup window component for the Scizor Desktop Application with title, message, copy button, and exit functionality.

## Features

- **Clean Design**: Modern, flat design with rounded corners
- **Draggable**: Click and drag anywhere on the window to move it
- **Copy Functionality**: Copy the entire message content to clipboard
- **Multiple Exit Options**: Close button (×) in title bar or Exit button
- **Stays on Top**: Window stays above other applications
- **Responsive**: Handles long messages with scrolling
- **Visual Feedback**: Copy button shows "Copied!" feedback

## Usage

### Basic Usage

```python
from src.ui.component.popup_window import show_popup

# Simple popup
show_popup(
    title="My Popup",
    message="This is my message content."
)
```

### Advanced Usage

```python
from src.ui.component.popup_window import PopupWindow

# Create popup instance for more control
popup = PopupWindow(
    title="Custom Popup",
    message="Custom message content",
    parent=parent_widget
)

# Connect to closed signal
popup.closed.connect(self.on_popup_closed)

# Show the popup
popup.show()

# Update content dynamically
popup.set_title("New Title")
popup.set_message("New message content")
```

### Integration with Existing Panels

Here's how to integrate the popup window into existing panels:

```python
from src.ui.component.popup_window import show_popup

class MyPanel(QGroupBox):
    def __init__(self):
        super().__init__()
        # ... existing setup code ...
        
    def show_notification(self, title, message):
        """Show a notification popup"""
        show_popup(title=title, message=message, parent=self)
        
    def on_success(self):
        """Show success popup"""
        show_popup(
            title="Success",
            message="Operation completed successfully!"
        )
        
    def on_error(self, error_message):
        """Show error popup"""
        show_popup(
            title="Error",
            message=f"An error occurred:\n{error_message}"
        )
```

## API Reference

### PopupWindow Class

#### Constructor
```python
PopupWindow(title="Popup", message="", parent=None)
```

**Parameters:**
- `title` (str): Title of the popup window
- `message` (str): Message content to display
- `parent`: Parent widget (optional)

#### Methods

- `set_title(title)`: Update the popup title
- `set_message(message)`: Update the popup message
- `copy_message()`: Copy message to clipboard
- `close_popup()`: Close the popup window

#### Signals

- `closed`: Emitted when the popup is closed

### show_popup() Function

```python
show_popup(title="Popup", message="", parent=None)
```

**Parameters:**
- `title` (str): Title of the popup window
- `message` (str): Message content to display
- `parent`: Parent widget (optional)

**Returns:**
- `PopupWindow`: The created popup window instance

## Styling

The popup window uses a modern, flat design with:

- **Colors**: Blue theme (#3498db) for primary actions
- **Typography**: Segoe UI font family
- **Borders**: Rounded corners (8px radius)
- **Spacing**: Consistent 10px spacing
- **Hover Effects**: Color changes on button hover

## Examples

### Error Notification
```python
show_popup(
    title="Error",
    message="Failed to connect to server.\nPlease check your internet connection."
)
```

### Success Notification
```python
show_popup(
    title="Success",
    message="File saved successfully!\nLocation: /path/to/file.txt"
)
```

### Information Popup
```python
show_popup(
    title="Information",
    message="This feature is currently in beta.\nPlease report any issues you encounter."
)
```

### Long Message
```python
long_message = """This is a very long message that demonstrates how the popup handles multi-line content.

Features:
• Automatic scrolling for long content
• Copy button copies entire message
• Draggable window
• Stays on top of other windows

The popup will automatically handle the formatting and display."""
```

## Testing

Run the test script to see the popup window in action:

```bash
cd desktop
python test_popup.py
```

This will open a test window with buttons to demonstrate different popup scenarios.

## Dependencies

- PyQt6: UI framework
- pyperclip: Clipboard functionality (already included in requirements.txt)

## Notes

- The popup window is frameless and stays on top
- Copy functionality provides visual feedback
- Window is draggable by clicking anywhere on it
- Message area supports multi-line text with automatic scrolling
- All buttons have hover and pressed states for better UX 