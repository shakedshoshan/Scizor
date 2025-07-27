# Scizor Expanded Window

The Scizor Expanded Window provides a larger, more feature-rich interface for easier access to all Scizor features. This enhanced dashboard offers better organization, advanced functionality, and improved user experience.

## Features

### 🏠 Dashboard Overview
- **Welcome Section**: Beautiful gradient header with application introduction
- **Statistics Panel**: Real-time counters for clipboard items and notes
- **Quick Actions**: One-click access to common operations
- **Status Bar**: Shows current operations and system status

### 📋 Enhanced Clipboard Management
- **Search & Filter**: Find clipboard items quickly with text search and category filters
- **Preview Panel**: View full content of selected clipboard items
- **Advanced Controls**: Copy, delete individual items, or clear all history
- **Better Organization**: Improved visual layout with timestamps and content previews
- **Categories**: Filter by All, Text, URLs, Code, or Recent items

### 📝 Enhanced Notes Management
- **Card-based Layout**: Beautiful note cards with priority indicators
- **Advanced Editing**: Enhanced note editor with better formatting
- **Search & Sort**: Find notes by content and sort by priority, name, or date
- **Import/Export**: Backup and restore notes to/from text files
- **Quick Actions**: Edit and delete notes directly from cards
- **Priority System**: Color-coded priority levels (1-5)

### 🎨 Enhanced UI Features
- **Modern Design**: Clean, professional interface with consistent styling
- **Tabbed Interface**: Easy navigation between different feature sections
- **Theme Support**: Framework for theme switching (placeholder)
- **Responsive Layout**: Adapts to different window sizes
- **Status Feedback**: Real-time status updates and progress indicators

## How to Use

### Opening the Expanded Window
1. **From Main Dashboard**: Click the expand button (⤢) in the header
2. **Hotkey**: Use the same hotkeys as the main window (Ctrl+Alt+S to toggle)
3. **Direct Launch**: Run `test_expanded_window.py` for testing

### Navigation
- **Dashboard Tab**: Overview and quick actions
- **Enhanced Clipboard Tab**: Advanced clipboard management
- **Enhanced Notes Tab**: Full-featured notes management

### Clipboard Features
1. **Search**: Type in the search box to filter clipboard items
2. **Filter**: Use the dropdown to filter by content type
3. **Preview**: Click on any item to see full content in the preview panel
4. **Copy**: Double-click or use the Copy button to copy items back to clipboard
5. **Delete**: Select an item and click Delete to remove it
6. **Clear All**: Remove all clipboard history

### Notes Features
1. **Create Note**: Click "Create Note" button or use Ctrl+Alt+N hotkey
2. **Edit Note**: Double-click any note card or use the edit button
3. **Search Notes**: Use the search box to find specific notes
4. **Sort Notes**: Choose sorting method from the dropdown
5. **Export/Import**: Backup your notes to files
6. **Priority**: Set priority levels (1-5) for better organization

## Technical Details

### Architecture
- **Modular Design**: Each feature is a separate component
- **Signal/Slot System**: PyQt6 signals for component communication
- **Database Integration**: Uses the same database as the main application
- **Hotkey Support**: Integrates with the global hotkey system

### File Structure
```
desktop/src/ui/features/expend/
├── __init__.py                    # Package exports
├── enhanced_header_panel.py       # Enhanced header with controls
├── enhanced_clipboard_panel.py    # Advanced clipboard management
└── enhanced_notes_panel.py        # Enhanced notes interface

desktop/src/ui/
└── expend_window.py              # Main expanded window

desktop/
├── test_expanded_window.py       # Test script
└── EXPANDED_WINDOW_README.md     # This documentation
```

### Dependencies
- **PyQt6**: Main GUI framework
- **Core Modules**: Uses existing clipboard_manager and notes modules
- **Database**: SQLite database for persistent storage

## Testing

### Running the Test
```bash
cd desktop
python test_expanded_window.py
```

The test will run for 30 seconds, allowing you to explore all features.

### What to Test
1. **Dashboard**: Check statistics and quick actions
2. **Clipboard**: Add some text to clipboard, search, filter, preview
3. **Notes**: Create, edit, search, and organize notes
4. **Navigation**: Switch between tabs and test responsiveness
5. **Hotkeys**: Test global hotkey integration

## Future Enhancements

### Planned Features
- **Theme System**: Complete theme switching implementation
- **Settings Dialog**: User preferences and configuration
- **Advanced Search**: Regex and advanced filtering options
- **Keyboard Shortcuts**: Additional keyboard shortcuts for power users
- **Drag & Drop**: Drag items between clipboard and notes
- **Cloud Sync**: Optional cloud synchronization
- **Plugins**: Extensible plugin system for additional features

### Performance Optimizations
- **Lazy Loading**: Load content only when needed
- **Caching**: Cache frequently accessed data
- **Background Processing**: Move heavy operations to background threads

## Troubleshooting

### Common Issues
1. **Import Errors**: Ensure all dependencies are installed
2. **Database Errors**: Check database file permissions
3. **Hotkey Conflicts**: Verify no other applications use the same hotkeys
4. **UI Glitches**: Try resizing the window or restarting the application

### Debug Mode
Enable debug logging by setting the log level in the core modules.

## Contributing

When adding new features to the expanded window:
1. Follow the existing modular architecture
2. Use PyQt6 signals for component communication
3. Maintain consistent styling with the existing UI
4. Add appropriate error handling
5. Update this documentation

## License

This expanded window is part of the Scizor project and follows the same licensing terms. 