const { ipcRenderer } = require('electron');

/**
 * Clipboard Panel Component
 * Manages clipboard history and operations
 */
class ClipboardPanel {
    constructor() {
        this.container = null;
        this.clipboardHistory = [];
        this.isMonitoring = false;
    }

    render(container) {
        this.container = container;
        this.createPanelContent();
        this.setupEventListeners();
        this.startMonitoring();
    }

    createPanelContent() {
        this.container.innerHTML = `
            <div class="panel-header">
                <h3 class="panel-title">📋 Clipboard History</h3>
                <div class="panel-controls">
                    <button class="panel-btn" id="clear-clipboard-btn" title="Clear History">
                        🗑
                    </button>
                    <button class="panel-btn" id="refresh-clipboard-btn" title="Refresh">
                        🔄
                    </button>
                </div>
            </div>
            <div class="panel-content">
                <div id="clipboard-list" class="clipboard-list">
                    <div class="empty-state">
                        <p>No clipboard items yet</p>
                        <p>Copy something to see it here!</p>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // Clear button
        const clearBtn = this.container.querySelector('#clear-clipboard-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearHistory();
            });
        }

        // Refresh button
        const refreshBtn = this.container.querySelector('#refresh-clipboard-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshHistory();
            });
        }
    }

    startMonitoring() {
        this.isMonitoring = true;
        console.log('Clipboard monitoring started');
        
        // Simulate some clipboard items for demo
        setTimeout(() => {
            this.addToHistory('Sample clipboard item 1');
            this.addToHistory('Sample clipboard item 2');
            this.addToHistory('Sample clipboard item 3');
        }, 1000);
    }

    stopMonitoring() {
        this.isMonitoring = false;
        console.log('Clipboard monitoring stopped');
    }

    clearHistory() {
        this.clipboardHistory = [];
        this.updateDisplay();
        ipcRenderer.send('clipboard-cleared');
    }

    refreshHistory() {
        console.log('Refreshing clipboard history...');
        this.updateDisplay();
    }

    loadHistory() {
        // Load clipboard history from storage
        console.log('Loading clipboard history...');
        this.updateDisplay();
    }

    updateDisplay() {
        const listContainer = this.container.querySelector('#clipboard-list');
        if (!listContainer) return;

        if (this.clipboardHistory.length === 0) {
            listContainer.innerHTML = `
                <div class="empty-state">
                    <p>No clipboard items yet</p>
                    <p>Copy something to see it here!</p>
                </div>
            `;
            return;
        }

        listContainer.innerHTML = '';
        this.clipboardHistory.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'list-item clipboard-item';
            itemElement.innerHTML = `
                <div class="item-content">
                    <div class="item-text">${this.truncateText(item, 50)}</div>
                    <div class="item-time">Just now</div>
                </div>
                <div class="item-actions">
                    <button class="panel-btn copy-btn" data-index="${index}">Copy</button>
                </div>
            `;

            // Add copy functionality
            const copyBtn = itemElement.querySelector('.copy-btn');
            copyBtn.addEventListener('click', () => {
                this.selectItem(index);
            });

            listContainer.appendChild(itemElement);
        });
    }

    selectItem(index) {
        if (index >= 0 && index < this.clipboardHistory.length) {
            const item = this.clipboardHistory[index];
            this.copyToClipboard(item);
        }
    }

    copyToClipboard(text) {
        ipcRenderer.send('copy-to-clipboard', text);
        console.log('Copied to clipboard:', text);
    }

    addToHistory(text) {
        if (text && text.trim()) {
            this.clipboardHistory.unshift(text.trim());
            // Keep only last 20 items
            if (this.clipboardHistory.length > 20) {
                this.clipboardHistory = this.clipboardHistory.slice(0, 20);
            }
            this.updateDisplay();
        }
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ClipboardPanel };
} 