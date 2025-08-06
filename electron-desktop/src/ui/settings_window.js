const { BrowserWindow, ipcMain } = require('electron');
const path = require('path');

/**
 * Settings Window for Scizor Desktop Application
 * Manages application settings and layout preferences
 */
class SettingsWindow {
    constructor(parentWindow) {
        this.parentWindow = parentWindow;
        this.window = null;
        this.currentSettings = null;
        this.initWindow();
    }

    initWindow() {
        // Create the settings window
        this.window = new BrowserWindow({
            width: 600,
            height: 700,
            minWidth: 500,
            minHeight: 600,
            title: 'Scizor Settings',
            frame: true,
            modal: true,
            parent: this.parentWindow.window,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                enableRemoteModule: true
            },
            icon: path.join(__dirname, '..', 'resources', 'icons', 'scizor_icon.png')
        });

        // Load the settings HTML file
        this.window.loadFile(path.join(__dirname, 'settings.html'));

        // Handle window closed
        this.window.on('closed', () => {
            this.cleanup();
        });

        // Setup IPC handlers
        this.setupIPC();
    }

    setupIPC() {
        // Handle settings load request
        ipcMain.on('load-settings', (event) => {
            event.reply('settings-loaded', this.currentSettings);
        });

        // Handle settings save request
        ipcMain.on('save-settings', (event, settings) => {
            this.currentSettings = settings;
            this.parentWindow.applySettings(settings);
            event.reply('settings-saved', true);
        });

        // Handle settings apply request
        ipcMain.on('apply-settings', (event, settings) => {
            this.currentSettings = settings;
            this.parentWindow.applySettings(settings);
            this.parentWindow.window.emit('settings-applied', settings);
            event.reply('settings-applied', true);
        });

        // Handle window close request
        ipcMain.on('close-settings', () => {
            this.hide();
        });
    }

    loadSettings(settings) {
        this.currentSettings = settings;
        if (this.window && !this.window.isDestroyed()) {
            this.window.webContents.send('load-settings', settings);
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

    cleanup() {
        // Remove IPC listeners
        ipcMain.removeAllListeners('load-settings');
        ipcMain.removeAllListeners('save-settings');
        ipcMain.removeAllListeners('apply-settings');
        ipcMain.removeAllListeners('close-settings');
    }
}

module.exports = { SettingsWindow }; 