# Scizor Desktop Hotkey System

## Overview
The Scizor Desktop application now supports global hotkeys to control the dashboard visibility and create notes from selected text. The application runs as a background process and can be toggled on/off using keyboard shortcuts.

## Hotkey Configuration

### Primary Hotkeys
- **Ctrl + Alt + S**: Toggle dashboard visibility (show/hide)
- **Ctrl + Alt + N**: Create note from selected text
- **Ctrl +Alt + H**: Enhance selected text with AI
- **Ctrl + Alt + G**: Generate AI response for selected text

### UI Controls
- **X Button**: Hide dashboard (same as Ctrl+Alt+S)
- **⤢ Button**: Open expanded dashboard window
- **⚙ Button**: Open settings

## How It Works

1. **Background Process**: The application starts hidden and runs in the background
2. **Global Hotkeys**: 
   - Press `Ctrl + Alt + S` from anywhere to show/hide the dashboard
   - Select text in any application, then press `Ctrl + Alt + N` to create a note
   - Select text and press `Ctrl + Alt + H` to enhance it with AI
   - Select text and press `Ctrl + Alt + G` to generate an AI response
3. **Dashboard Positioning**: The dashboard appears on the right side of the screen
4. **Always on Top**: The dashboard stays on top of other windows when visible
5. **Quick Note Creation**: Selected text automatically becomes note content with smart title generation
6. **UI Controls**: Use the X button in the header to hide the dashboard (same as hotkey)

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

### Close Button Test
```bash
cd desktop
python test_close_button.py
```
Test the X button functionality specifically.

## Features

- **Global Hotkeys**: Works from any application
- **Smooth Toggle**: Show/hide with single key combination or X button
- **Background Operation**: Runs silently until needed
- **Quick Note Creation**: Create notes from selected text with automatic title generation
- **Smart Title Generation**: Uses first line of text or timestamp for note titles
- **Clipboard Preservation**: Original clipboard content is preserved after note creation
- **Proper Cleanup**: Hotkeys are properly cleaned up on exit
- **UI Integration**: X button provides same functionality as Ctrl+Alt+S hotkey

## How to Create Notes from Text

1. **Select Text**: Select any text in any application (browser, document, etc.)
2. **Press Hotkey**: Press `Ctrl + Alt + N`
3. **Automatic Creation**: A note is created with the selected text as content
4. **Smart Title**: The note gets a title based on the first line or timestamp

## How to Hide/Show Dashboard

1. **Using Hotkey**: Press `Ctrl + Alt + S` from any application
2. **Using UI**: Click the X button in the dashboard header
3. **Both Methods**: Both methods perform the same action - hiding the dashboard
4. **Show Again**: Use `Ctrl + Alt + S` again to show the dashboard

## Troubleshooting

- **Hotkeys Not Working**: Make sure the application is running and has proper permissions
- **Dashboard Not Showing**: Check if it's hidden and use `Ctrl + Alt + S` to show it
- **Permission Issues**: Run as administrator if hotkeys don't work
- **Multiple Instances**: Close any existing instances before starting a new one 