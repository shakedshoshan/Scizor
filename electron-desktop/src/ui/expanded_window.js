const { BrowserWindow, ipcMain } = require('electron');
const path = require('path');

/**
 * Expanded Window for Scizor Desktop Application
 * Provides a larger, more detailed view of the dashboard
 */
class ExpandedWindow {
    constructor(parentWindow) {
        this.parentWindow = parentWindow;
        this.window = null;
        this.initWindow();
    }

    initWindow() {
        // Create the expanded window
        this.window = new BrowserWindow({
            width: 1200,
            height: 900,
            minWidth: 800,
            minHeight: 600,
            title: 'Scizor Dashboard - Expanded',
            frame: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                enableRemoteModule: true
            },
            icon: path.join(__dirname, '..', 'resources', 'icons', 'scizor_icon.png')
        });

        // Load the expanded HTML file
        this.window.loadFile(path.join(__dirname, 'expanded.html'));

        // Handle window closed
        this.window.on('closed', () => {
            this.cleanup();
        });

        // Setup IPC handlers
        this.setupIPC();
    }

    setupIPC() {
        // Handle data sync from parent window
        ipcMain.on('sync-data', (event, data) => {
            if (this.window && !this.window.isDestroyed()) {
                this.window.webContents.send('data-synced', data);
            }
        });

        // Handle settings sync
        ipcMain.on('sync-settings', (event, settings) => {
            if (this.window && !this.window.isDestroyed()) {
                this.window.webContents.send('settings-synced', settings);
            }
        });

        // Handle clipboard data sync
        ipcMain.on('sync-clipboard', (event, clipboardData) => {
            if (this.window && !this.window.isDestroyed()) {
                this.window.webContents.send('clipboard-synced', clipboardData);
            }
        });

        // Handle notes data sync
        ipcMain.on('sync-notes', (event, notesData) => {
            if (this.window && !this.window.isDestroyed()) {
                this.window.webContents.send('notes-synced', notesData);
            }
        });

        // Handle AI response sync
        ipcMain.on('sync-ai-response', (event, responseData) => {
            if (this.window && !this.window.isDestroyed()) {
                this.window.webContents.send('ai-response-synced', responseData);
            }
        });

        // Handle window close request
        ipcMain.on('close-expanded', () => {
            this.hide();
        });

        // Handle data request from expanded window
        ipcMain.on('request-data', (event) => {
            // Request data from parent window
            this.parentWindow.window.webContents.send('request-data-for-expanded');
        });
    }

    syncData(data) {
        if (this.window && !this.window.isDestroyed()) {
            this.window.webContents.send('data-synced', data);
        }
    }

    syncSettings(settings) {
        if (this.window && !this.window.isDestroyed()) {
            this.window.webContents.send('settings-synced', settings);
        }
    }

    syncClipboard(clipboardData) {
        if (this.window && !this.window.isDestroyed()) {
            this.window.webContents.send('clipboard-synced', clipboardData);
        }
    }

    syncNotes(notesData) {
        if (this.window && !this.window.isDestroyed()) {
            this.window.webContents.send('notes-synced', notesData);
        }
    }

    syncAIResponse(responseData) {
        if (this.window && !this.window.isDestroyed()) {
            this.window.webContents.send('ai-response-synced', responseData);
        }
    }

    show() {
        if (this.window && !this.window.isDestroyed()) {
            this.window.show();
            this.window.focus();
        }
    }

    hide() {
        if (this.window && !this.window.isDestroyed()) {
            this.window.hide();
        }
    }

    focus() {
        if (this.window && !this.window.isDestroyed()) {
            this.window.focus();
        }
    }

    isVisible() {
        return this.window && !this.window.isDestroyed() && this.window.isVisible();
    }

    cleanup() {
        // Remove IPC listeners
        ipcMain.removeAllListeners('sync-data');
        ipcMain.removeAllListeners('sync-settings');
        ipcMain.removeAllListeners('sync-clipboard');
        ipcMain.removeAllListeners('sync-notes');
        ipcMain.removeAllListeners('sync-ai-response');
        ipcMain.removeAllListeners('close-expanded');
        ipcMain.removeAllListeners('request-data');
    }
}

module.exports = { ExpandedWindow }; 