const { BrowserWindow, screen } = require('electron');
const path = require('path');

/**
 * Main window for Scizor Desktop Application
 * Uses modular feature components for better organization
 */
class MainWindow {
    constructor() {
        this.window = null;
        this.currentSettings = this.getDefaultSettings();
        this.panels = {};
        this.featureVisibilityMapping = {
            'Clipboard History': 'clipboard_history',
            'Notes': 'notes',
            'AI Prompt Enhancement': 'ai_prompt_enhancement',
            'AI Smart Response': 'ai_smart_response'
        };
        
        this.initWindow();
        this.setupLayout();
        this.setupConnections();
        this.setupHotkeys();
        this.rebuildLayout();
    }

    initWindow() {
        // Create the browser window
        this.window = new BrowserWindow({
            width: 400,
            height: 800,
            minWidth: 350,
            minHeight: 600,
            title: 'Scizor Dashboard',
            frame: false, // No window frame for dashboard-like appearance
            alwaysOnTop: true, // Keep on top
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                enableRemoteModule: true
            },
            icon: path.join(__dirname, 'resources', 'icons', 'scizor_icon.png')
        });

        // Load the main HTML file
        this.window.loadFile(path.join(__dirname, 'ui', 'index.html'));

        // Position window on the right side of the screen
        this.positionOnRightSide();

        // Handle window closed
        this.window.on('closed', () => {
            this.cleanup();
        });
    }

    setupLayout() {
        // Create feature components (these will be loaded in the renderer process)
        this.panels = {
            'Header Panel': 'header',
            'Clipboard History': 'clipboard_panel',
            'Notes': 'notes_panel',
            'AI Prompt Enhancement': 'enhance_prompt_panel',
            'AI Smart Response': 'generate_response_panel'
        };
    }

    setupConnections() {
        // Setup IPC communications between main and renderer processes
        this.window.webContents.on('ipc-message', (event, channel, ...args) => {
            switch (channel) {
                case 'toggle-visibility':
                    this.toggleVisibility();
                    break;
                case 'open-expanded-window':
                    this.openExpandedWindow();
                    break;
                case 'open-settings':
                    this.openSettings();
                    break;
                case 'clipboard-cleared':
                    this.onClipboardCleared();
                    break;
                case 'clipboard-item-selected':
                    this.onClipboardItemSelected(args[0]);
                    break;
                case 'note-created':
                    this.onNoteCreated(args[0]);
                    break;
                case 'note-updated':
                    this.onNoteUpdated(args[0]);
                    break;
                case 'note-deleted':
                    this.onNoteDeleted(args[0]);
                    break;
                case 'notes-loaded':
                    this.onNotesLoaded(args[0]);
                    break;
                case 'notes-error':
                    this.onNotesError(args[0]);
                    break;
                case 'prompt-enhanced':
                    this.onPromptEnhanced(args[0]);
                    break;
                case 'enhance-prompt-error':
                    this.onEnhancePromptError(args[0]);
                    break;
                case 'response-generated':
                    this.onResponseGenerated(args[0]);
                    break;
                case 'generate-response-error':
                    this.onGenerateResponseError(args[0]);
                    break;
            }
        });

        // Handle initial settings request
        this.window.webContents.on('ipc-message', (event, channel, ...args) => {
            if (channel === 'get-initial-settings') {
                this.window.webContents.send('initial-settings', this.currentSettings);
            }
        });
    }

    setupHotkeys() {
        // Global hotkeys will be handled by the renderer process
        // using electron-global-shortcut or similar
        this.window.webContents.send('setup-hotkeys');
    }

    toggleVisibility() {
        if (this.window.isVisible()) {
            this.window.hide();
        } else {
            this.window.show();
            this.window.focus();
        }
    }

    createNoteFromText(selectedText) {
        // Show the dashboard if it's hidden
        if (!this.window.isVisible()) {
            this.window.show();
            this.window.focus();
        }

        // Create the note using the notes panel
        this.window.webContents.send('create-note-from-text', selectedText);
    }

    openExpandedWindow() {
        try {
            // Create expanded window
            const { ExpandedWindow } = require('./ui/expanded_window');
            this.expandedWindow = new ExpandedWindow(this);
            this.expandedWindow.show();
            this.expandedWindow.focus();
        } catch (error) {
            console.error('Error opening expanded window:', error);
        }
    }

    positionOnRightSide() {
        const primaryDisplay = screen.getPrimaryDisplay();
        const { width, height } = primaryDisplay.workAreaSize;
        const windowBounds = this.window.getBounds();

        // Position on the right side with some margin
        const x = width - windowBounds.width - 20;
        const y = (height - windowBounds.height) / 2;

        this.window.setPosition(x, y);
    }

    updateWindowSizeForColumns(columns) {
        const baseWidth = 400; // Base width for single column
        const columnWidth = 350; // Width per additional column
        const minWidth = 350;
        const maxWidth = 1200; // Maximum width to prevent going off-screen

        let newWidth;
        if (columns === 1) {
            newWidth = baseWidth;
        } else {
            newWidth = baseWidth + (columns - 1) * columnWidth;
            newWidth = Math.max(minWidth, Math.min(newWidth, maxWidth));
        }

        // Update window size
        const currentHeight = this.window.getBounds().height;
        this.window.setSize(newWidth, currentHeight);

        // Reposition window to stay on right side
        this.positionOnRightSide();
    }

    getPanelSizes() {
        // Get current panel sizes for saving/restoring layout
        return this.window.webContents.send('get-panel-sizes');
    }

    setPanelSizes(sizesDict) {
        // Set panel sizes from saved layout
        this.window.webContents.send('set-panel-sizes', sizesDict);
    }

    // Event handlers for feature components
    onClipboardCleared() {
        console.log('Clipboard cleared');
    }

    onClipboardItemSelected(itemText) {
        console.log(`Selected: ${itemText.substring(0, 30)}...`);
    }

    onNoteCreated(noteData) {
        console.log(`Note created: ${noteData.title || 'Untitled'}`);
    }

    onNoteUpdated(noteData) {
        console.log(`Note updated: ${noteData.title || 'Untitled'}`);
    }

    onNoteDeleted(noteId) {
        console.log(`Note deleted: ${noteId}`);
    }

    onNotesLoaded(notesList) {
        console.log(`Notes loaded: ${notesList.length} notes`);
    }

    onNotesError(errorMessage) {
        console.log(`Notes error: ${errorMessage}`);
    }

    onPromptEnhanced(resultData) {
        const enhancedPrompt = resultData.enhancedPrompt || '';
        console.log(`Prompt enhanced: ${enhancedPrompt.substring(0, 50)}...`);
    }

    onEnhancePromptError(errorMessage) {
        console.log(`Enhance prompt error: ${errorMessage}`);
    }

    onResponseGenerated(resultData) {
        const generatedResponse = resultData.response || '';
        console.log(`Response generated: ${generatedResponse.substring(0, 50)}...`);
    }

    onGenerateResponseError(errorMessage) {
        console.log(`Generate response error: ${errorMessage}`);
    }

    cleanup() {
        try {
            // Stop hotkey manager
            this.window.webContents.send('stop-hotkey-manager');
            
            // Stop clipboard monitoring
            this.window.webContents.send('stop-clipboard-monitoring');
            
            // Close clipboard manager
            this.window.webContents.send('close-clipboard-manager');
        } catch (error) {
            console.error('Error during cleanup:', error);
        }
    }

    getDefaultSettings() {
        return {
            featureOrder: [
                'Clipboard History',
                'Notes',
                'AI Prompt Enhancement',
                'AI Smart Response'
            ],
            columns: 1,
            featuresPerColumn: 2,
            visibility: {
                header: true, // Header is always visible
                clipboard_history: true,
                notes: true,
                ai_prompt_enhancement: true,
                ai_smart_response: false
            }
        };
    }

    loadSettingsFromDatabase() {
        try {
            // Load settings from database or return defaults
            // This would typically use a database module
            const { getDatabase } = require('./database/db_connection');
            const db = getDatabase();
            const settings = db.loadLayoutSettings();
            return settings;
        } catch (error) {
            console.error('Failed to load settings from database:', error);
            return this.getDefaultSettings();
        }
    }

    openSettings() {
        try {
            const { SettingsWindow } = require('./ui/settings_window');
            this.settingsWindow = new SettingsWindow(this);
            this.settingsWindow.loadSettings(this.currentSettings);
            this.settingsWindow.on('settings-applied', (settings) => {
                this.applySettings(settings);
            });
            this.settingsWindow.show();
        } catch (error) {
            console.error('Error opening settings window:', error);
        }
    }

    applySettings(settings) {
        this.currentSettings = settings;
        this.rebuildLayout();

        // Save settings to database
        try {
            const { getDatabase } = require('./database/db_connection');
            const db = getDatabase();
            db.saveLayoutSettings(settings);
        } catch (error) {
            console.error('Failed to save settings to database:', error);
        }
    }

    rebuildLayout() {
        // Send rebuild layout command to renderer process
        this.window.webContents.send('rebuild-layout', this.currentSettings);
    }

    show() {
        this.window.show();
        this.window.focus();
    }

    hide() {
        this.window.hide();
    }

    isVisible() {
        return this.window.isVisible();
    }
}

module.exports = { MainWindow };
