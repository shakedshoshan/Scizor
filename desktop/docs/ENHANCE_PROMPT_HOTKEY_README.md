# Enhance Prompt Hotkey Feature

## Overview

The `Ctrl+Alt+H` hotkey allows users to quickly enhance selected text using AI. When triggered, it captures the selected text, sends it to the AI enhancement service, and automatically replaces the original text with the enhanced version.

## How It Works

1. **Text Selection**: User selects text in any application
2. **Hotkey Trigger**: User presses `Ctrl+Alt+H`
3. **Text Capture**: The system copies the selected text to clipboard
4. **Direct AI Enhancement**: The text is sent directly to the backend AI service for enhancement
5. **Automatic Replacement**: The enhanced text automatically replaces the original selection
6. **Console Feedback**: Success/error messages are shown in the console

## Features

- **Global Hotkey**: Works from any application
- **Direct Enhancement**: No UI interaction required
- **Automatic Text Replacement**: No manual copy/paste required
- **Error Handling**: Graceful fallback to UI-based enhancement if direct enhancement fails
- **Clipboard Preservation**: Original clipboard content is restored

## Technical Implementation

### Hotkey Manager (`hotkey_manager.py`)
- Added `enhance_prompt_requested` signal (fallback only)
- Added `_on_enhance_prompt_hotkey()` method
- Added `_enhance_and_replace_text()` method for direct enhancement
- Registers `Ctrl+Alt+H` hotkey
- Directly calls enhance prompt service and replaces text

### Enhance Prompt Panel (`enhance_prompt_panel.py`)
- No changes needed (fallback only)

### Main Window (`main_window.py`)
- No changes needed (fallback only)

## Usage Instructions

1. **Select Text**: Highlight the text you want to enhance in any application
2. **Press Hotkey**: Press `Ctrl+Alt+H`
3. **Direct Enhancement**: The text is enhanced directly without UI interaction
4. **Automatic Replacement**: The enhanced text automatically replaces your selection
5. **Console Feedback**: Success/error messages appear in the console

## Error Handling

- **No Text Selected**: Shows message "No text selected. Please select text first, then press Ctrl+Alt+H."
- **API Connection Error**: Falls back to UI-based enhancement via signal
- **Enhancement Failure**: Shows error message in console and falls back to UI-based enhancement

## Testing

Run the test script to verify hotkey functionality:
```bash
cd desktop
python test_hotkey_enhance.py
```

## Dependencies

- `keyboard`: For global hotkey detection
- `pyperclip`: For clipboard operations
- `PyQt6`: For UI components and signals

## Configuration

The hotkey can be modified in `hotkey_manager.py`:
```python
keyboard.add_hotkey('ctrl+alt+h', self._on_enhance_prompt_hotkey, suppress=True)
```

## Troubleshooting

1. **Hotkey Not Working**: Ensure the application has permission to register global hotkeys
2. **Text Not Replaced**: Check if the target application supports Ctrl+V paste operations
3. **Enhancement Fails**: Verify the backend AI service is running and accessible 