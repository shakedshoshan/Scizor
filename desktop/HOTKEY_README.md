# Scizor Desktop Hotkey System

## Overview
The Scizor Desktop application now supports global hotkeys to control the dashboard visibility and create notes from selected text. The application runs as a background process and can be toggled on/off using keyboard shortcuts.

## Hotkey Configuration

### Primary Hotkeys
- **Ctrl + Alt + S**: Toggle dashboard visibility (show/hide)
- **Ctrl + Alt + N**: Create note from selected text

## How It Works

1. **Background Process**: The application starts hidden and runs in the background
2. **Global Hotkeys**: 
   - Press `Ctrl + Alt + S` from anywhere to show/hide the dashboard
   - Select text in any application, then press `Ctrl + Alt + N` to create a note
3. **Dashboard Positioning**: The dashboard appears on the right side of the screen
4. **Always on Top**: The dashboard stays on top of other windows when visible
5. **Quick Note Creation**: Selected text automatically becomes note content with smart title generation

## Running the Application

### Normal Mode (Background Process)
```bash
cd desktop
python src/main.py
```
The application will start hidden. Use `Ctrl + Alt + S` to show/hide the dashboard.

### Test Mode (Visible Initially)
```bash
cd desktop
python test_hotkey_fixed.py
```
The dashboard will be visible initially for testing purposes.

## Features

- **Global Hotkeys**: Works from any application
- **Smooth Toggle**: Show/hide with single key combination
- **Background Operation**: Runs silently until needed
- **Quick Note Creation**: Create notes from selected text with automatic title generation
- **Smart Title Generation**: Uses first line of text or timestamp for note titles
- **Clipboard Preservation**: Original clipboard content is preserved after note creation
- **Proper Cleanup**: Hotkeys are properly cleaned up on exit

## How to Create Notes from Text

1. **Select Text**: Select any text in any application (browser, document, etc.)
2. **Create Note**: Press `Ctrl + Alt + N` to create a note
3. **Note Created**: The note will appear in your notes panel with:
   - Auto-generated title from the first line of text
   - Full content from your selection
   - Default priority level
   - Current timestamp
4. **Clipboard Preserved**: Your original clipboard content is automatically restored

## Technical Details

- Uses the `keyboard` library for global hotkey detection
- Uses the `pyperclip` library for clipboard access
- Automatically captures selected text using Ctrl+C simulation
- Preserves original clipboard content
- Runs hotkey listener in a separate daemon thread
- Integrates with existing PyQt6 application structure
- Proper cleanup on application exit
- Automatic dashboard show when creating notes

## Troubleshooting

If the hotkeys don't work:
1. Make sure you're running the application with appropriate permissions
2. Check if another application is using the same hotkey combination
3. Verify that the `keyboard` and `pyperclip` libraries are properly installed
4. For note creation: ensure text is selected before pressing `Ctrl + Alt + N`
5. Try running the test script first to verify functionality 