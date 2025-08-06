const { ipcRenderer } = require('electron');

/**
 * Header Panel Component
 * Provides the main header with controls and branding
 */
class HeaderPanel {
    constructor() {
        this.container = null;
        this.isVisible = true;
    }

    render(container) {
        this.container = container;
        this.createHeaderContent();
        this.setupEventListeners();
    }

    createHeaderContent() {
        this.container.innerHTML = `
            <div class="header-content">
                <div class="header-title">
                    <span class="scizor-logo">🔧</span>
                    <span class="app-name">Scizor Dashboard</span>
                </div>
                <div class="header-controls">
                    <button class="header-btn" id="expand-btn" title="Expand Window">
                        <span>⤢</span>
                    </button>
                    <button class="header-btn" id="settings-btn" title="Settings">
                        <span>⚙</span>
                    </button>
                    <button class="header-btn" id="minimize-btn" title="Hide Dashboard">
                        <span>−</span>
                    </button>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // Expand button
        const expandBtn = this.container.querySelector('#expand-btn');
        if (expandBtn) {
            expandBtn.addEventListener('click', () => {
                this.onExpandRequested();
            });
        }

        // Settings button
        const settingsBtn = this.container.querySelector('#settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.onSettingsRequested();
            });
        }

        // Minimize button
        const minimizeBtn = this.container.querySelector('#minimize-btn');
        if (minimizeBtn) {
            minimizeBtn.addEventListener('click', () => {
                this.onCloseRequested();
            });
        }
    }

    onExpandRequested() {
        // Send message to main process to open expanded window
        ipcRenderer.send('open-expanded-window');
    }

    onSettingsRequested() {
        // Send message to main process to open settings
        ipcRenderer.send('open-settings');
    }

    onCloseRequested() {
        // Send message to main process to toggle visibility
        ipcRenderer.send('toggle-visibility');
    }

    show() {
        this.isVisible = true;
        this.container.style.display = 'block';
    }

    hide() {
        this.isVisible = false;
        this.container.style.display = 'none';
    }

    updateTitle(title) {
        const titleElement = this.container.querySelector('.app-name');
        if (titleElement) {
            titleElement.textContent = title;
        }
    }

    // Utility methods
    showStatus(message, type = 'info') {
        // Show status message in header
        const statusDiv = document.createElement('div');
        statusDiv.className = `header-status status-${type}`;
        statusDiv.textContent = message;
        
        this.container.appendChild(statusDiv);
        
        setTimeout(() => {
            if (statusDiv.parentNode) {
                statusDiv.parentNode.removeChild(statusDiv);
            }
        }, 3000);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { HeaderPanel };
} 