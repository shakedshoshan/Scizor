const { ipcRenderer } = require('electron');

/**
 * Main renderer process for Scizor Dashboard
 * Handles UI interactions and communicates with main process
 */
class DashboardRenderer {
    constructor() {
        this.currentSettings = null;
        this.panels = {};
        this.featureVisibilityMapping = {
            'Clipboard History': 'clipboard_history',
            'Notes': 'notes',
            'AI Prompt Enhancement': 'ai_prompt_enhancement',
            'AI Smart Response': 'ai_smart_response'
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupIPCListeners();
        this.loadInitialSettings();
    }

    setupEventListeners() {
        // Global event listeners
        document.addEventListener('DOMContentLoaded', () => {
            this.initializePanels();
        });

        // Window focus events
        window.addEventListener('focus', () => {
            this.onWindowFocus();
        });

        window.addEventListener('blur', () => {
            this.onWindowBlur();
        });
    }

    setupIPCListeners() {
        // Listen for messages from main process
        ipcRenderer.on('rebuild-layout', (event, settings) => {
            this.currentSettings = settings;
            this.rebuildLayout();
        });

        ipcRenderer.on('setup-hotkeys', () => {
            this.setupHotkeys();
        });

        ipcRenderer.on('stop-hotkey-manager', () => {
            this.stopHotkeys();
        });

        ipcRenderer.on('stop-clipboard-monitoring', () => {
            this.stopClipboardMonitoring();
        });

        ipcRenderer.on('close-clipboard-manager', () => {
            this.closeClipboardManager();
        });

        ipcRenderer.on('create-note-from-text', (event, selectedText) => {
            this.createNoteFromText(selectedText);
        });

        ipcRenderer.on('get-panel-sizes', () => {
            this.getPanelSizes();
        });

        ipcRenderer.on('set-panel-sizes', (event, sizesDict) => {
            this.setPanelSizes(sizesDict);
        });

        // Handle initial settings
        ipcRenderer.on('initial-settings', (event, settings) => {
            this.currentSettings = settings;
            this.rebuildLayout();
        });
    }

    loadInitialSettings() {
        // Load initial settings from main process
        ipcRenderer.send('get-initial-settings');
    }

    initializePanels() {
        // Initialize all panel components
        this.panels = {
            'Header Panel': new HeaderPanel(),
            'Clipboard History': new ClipboardPanel(),
            'Notes': new NotesPanel(),
            'AI Prompt Enhancement': new EnhancePromptPanel(),
            'AI Smart Response': new GenerateResponsePanel()
        };

        // Initialize header panel
        const headerContainer = document.getElementById('header-panel');
        if (headerContainer && this.panels['Header Panel']) {
            this.panels['Header Panel'].render(headerContainer);
        }

        // Build initial layout with default settings
        this.currentSettings = this.getDefaultSettings();
        this.rebuildLayout();
    }

    rebuildLayout() {
        const container = document.getElementById('main-content');
        if (!container) return;

        container.innerHTML = '';

        const visibleFeatures = this.getVisibleFeatures();
        const columns = this.currentSettings.columns || 1;
        const featuresPerColumn = this.currentSettings.featuresPerColumn || 2;

        if (columns === 1) {
            this.buildSingleColumnLayout(container, visibleFeatures);
        } else {
            this.buildMultiColumnLayout(container, visibleFeatures, columns, featuresPerColumn);
        }

        this.applyLayoutAnimations();
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
                header: true,
                clipboard_history: true,
                notes: true,
                ai_prompt_enhancement: true,
                ai_smart_response: false
            }
        };
    }

    getVisibleFeatures() {
        const visibility = this.currentSettings.visibility || {};
        const featureOrder = this.currentSettings.featureOrder || [];

        return featureOrder.filter(feature => {
            const visibilityKey = this.featureVisibilityMapping[feature];
            return visibility[visibilityKey] !== false;
        });
    }

    buildSingleColumnLayout(container, visibleFeatures) {
        visibleFeatures.forEach(featureName => {
            const panelElement = this.createPanelElement(featureName);
            container.appendChild(panelElement);
        });
    }

    buildMultiColumnLayout(container, visibleFeatures, columns, featuresPerColumn) {
        const columnContainer = document.createElement('div');
        columnContainer.className = 'multi-column';
        columnContainer.style.display = 'grid';
        columnContainer.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
        columnContainer.style.gap = '20px';

        visibleFeatures.forEach(featureName => {
            const panelElement = this.createPanelElement(featureName);
            columnContainer.appendChild(panelElement);
        });

        container.appendChild(columnContainer);
    }

    createPanelElement(featureName) {
        const panelDiv = document.createElement('div');
        panelDiv.className = 'panel feature-panel';
        panelDiv.id = `${featureName.toLowerCase().replace(/\s+/g, '-')}-panel`;

        const panelTitle = document.createElement('h3');
        panelTitle.textContent = featureName;
        panelDiv.appendChild(panelTitle);

        const panelContent = document.createElement('div');
        panelContent.className = 'panel-content';
        panelDiv.appendChild(panelContent);

        // Initialize panel if it exists
        if (this.panels[featureName]) {
            this.panels[featureName].render(panelContent);
        }

        return panelDiv;
    }

    applyLayoutAnimations() {
        const panels = document.querySelectorAll('.feature-panel');
        panels.forEach((panel, index) => {
            panel.style.opacity = '0';
            panel.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                panel.style.transition = 'all 0.3s ease';
                panel.style.opacity = '1';
                panel.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    setupHotkeys() {
        // Setup global hotkeys for the application
        console.log('Setting up hotkeys...');
    }

    stopHotkeys() {
        // Stop global hotkeys
        console.log('Stopping hotkeys...');
    }

    stopClipboardMonitoring() {
        // Stop clipboard monitoring
        console.log('Stopping clipboard monitoring...');
    }

    closeClipboardManager() {
        // Close clipboard manager
        console.log('Closing clipboard manager...');
    }

    createNoteFromText(selectedText) {
        // Create note from selected text
        console.log('Creating note from text:', selectedText);
    }

    getPanelSizes() {
        const sizes = {};
        Object.keys(this.panels).forEach(panelName => {
            const panelElement = document.getElementById(`${panelName.toLowerCase().replace(/\s+/g, '-')}-panel`);
            if (panelElement) {
                sizes[panelName] = {
                    width: panelElement.offsetWidth,
                    height: panelElement.offsetHeight
                };
            }
        });
        ipcRenderer.send('panel-sizes', sizes);
    }

    setPanelSizes(sizesDict) {
        Object.keys(sizesDict).forEach(panelName => {
            const panelElement = document.getElementById(`${panelName.toLowerCase().replace(/\s+/g, '-')}-panel`);
            if (panelElement) {
                const size = sizesDict[panelName];
                panelElement.style.width = `${size.width}px`;
                panelElement.style.height = `${size.height}px`;
            }
        });
    }

    onWindowFocus() {
        // Handle window focus
        console.log('Window focused');
    }

    onWindowBlur() {
        // Handle window blur
        console.log('Window blurred');
    }

    showStatusMessage(message, type = 'info') {
        const statusDiv = document.createElement('div');
        statusDiv.className = `status-message status-${type}`;
        statusDiv.textContent = message;
        
        document.body.appendChild(statusDiv);
        
        setTimeout(() => {
            if (statusDiv.parentNode) {
                statusDiv.remove();
            }
        }, 3000);
    }

    showLoadingSpinner(container) {
        const spinner = document.createElement('div');
        spinner.className = 'spinner';
        container.appendChild(spinner);
        return spinner;
    }

    hideLoadingSpinner(spinner) {
        if (spinner && spinner.parentNode) {
            spinner.remove();
        }
    }
}

// Initialize the dashboard renderer when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DashboardRenderer();
}); 