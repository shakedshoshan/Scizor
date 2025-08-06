const { ipcRenderer } = require('electron');

/**
 * Settings Window Renderer
 * Handles settings management and UI interactions
 */
class SettingsRenderer {
    constructor() {
        this.currentSettings = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSettings();
    }

    setupEventListeners() {
        // Close button
        document.getElementById('close-btn').addEventListener('click', () => {
            ipcRenderer.send('close-settings');
        });

        // Apply button
        document.getElementById('apply-btn').addEventListener('click', () => {
            this.applySettings();
        });

        // Save button
        document.getElementById('save-btn').addEventListener('click', () => {
            this.saveSettings();
        });

        // Reset button
        document.getElementById('reset-btn').addEventListener('click', () => {
            this.resetToDefaults();
        });

        // Form controls
        document.getElementById('columns').addEventListener('change', () => {
            this.updateFeatureOrder();
        });

        document.getElementById('features-per-column').addEventListener('change', () => {
            this.updateFeatureOrder();
        });

        // Checkbox changes
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateFeatureOrder();
            });
        });

        // IPC listeners
        this.setupIPCListeners();
    }

    setupIPCListeners() {
        // Load settings from main process
        ipcRenderer.on('load-settings', (event, settings) => {
            this.currentSettings = settings;
            this.populateForm(settings);
        });

        // Settings saved confirmation
        ipcRenderer.on('settings-saved', (event, success) => {
            if (success) {
                this.showStatus('Settings saved successfully!', 'success');
            } else {
                this.showStatus('Failed to save settings.', 'error');
            }
        });

        // Settings applied confirmation
        ipcRenderer.on('settings-applied', (event, success) => {
            if (success) {
                this.showStatus('Settings applied successfully!', 'success');
            } else {
                this.showStatus('Failed to apply settings.', 'error');
            }
        });
    }

    loadSettings() {
        // Request settings from main process
        ipcRenderer.send('load-settings');
    }

    populateForm(settings) {
        // Populate layout settings
        document.getElementById('columns').value = settings.columns || 1;
        document.getElementById('features-per-column').value = settings.featuresPerColumn || 2;

        // Populate visibility settings
        const visibility = settings.visibility || {};
        document.getElementById('clipboard-history').checked = visibility.clipboard_history !== false;
        document.getElementById('notes').checked = visibility.notes !== false;
        document.getElementById('ai-prompt-enhancement').checked = visibility.ai_prompt_enhancement !== false;
        document.getElementById('ai-smart-response').checked = visibility.ai_smart_response === true;

        // Update feature order
        this.updateFeatureOrder();
    }

    updateFeatureOrder() {
        const featureOrder = this.getFeatureOrder();
        const featureOrderContainer = document.getElementById('feature-order');
        featureOrderContainer.innerHTML = '';

        featureOrder.forEach((feature, index) => {
            const featureItem = document.createElement('div');
            featureItem.className = 'feature-item';
            featureItem.draggable = true;
            featureItem.dataset.feature = feature;
            featureItem.innerHTML = `
                <span>${feature}</span>
                <span class="feature-index">${index + 1}</span>
            `;

            // Drag and drop functionality
            featureItem.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', feature);
                featureItem.classList.add('dragging');
            });

            featureItem.addEventListener('dragend', () => {
                featureItem.classList.remove('dragging');
            });

            featureOrderContainer.appendChild(featureItem);
        });

        // Setup drop zone
        featureOrderContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        featureOrderContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            const draggedFeature = e.dataTransfer.getData('text/plain');
            const dropTarget = e.target.closest('.feature-item');
            
            if (dropTarget && dropTarget.dataset.feature !== draggedFeature) {
                this.reorderFeatures(draggedFeature, dropTarget.dataset.feature);
            }
        });
    }

    getFeatureOrder() {
        const featureOrder = [];
        const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
        
        checkboxes.forEach(checkbox => {
            const featureName = this.getFeatureNameFromId(checkbox.id);
            if (featureName) {
                featureOrder.push(featureName);
            }
        });

        return featureOrder;
    }

    getFeatureNameFromId(id) {
        const mapping = {
            'clipboard-history': 'Clipboard History',
            'notes': 'Notes',
            'ai-prompt-enhancement': 'AI Prompt Enhancement',
            'ai-smart-response': 'AI Smart Response'
        };
        return mapping[id];
    }

    reorderFeatures(draggedFeature, targetFeature) {
        const currentOrder = this.getFeatureOrder();
        const draggedIndex = currentOrder.indexOf(draggedFeature);
        const targetIndex = currentOrder.indexOf(targetFeature);

        if (draggedIndex !== -1 && targetIndex !== -1) {
            currentOrder.splice(draggedIndex, 1);
            currentOrder.splice(targetIndex, 0, draggedFeature);
            this.updateFeatureOrder();
        }
    }

    getCurrentSettings() {
        const columns = parseInt(document.getElementById('columns').value);
        const featuresPerColumn = parseInt(document.getElementById('features-per-column').value);
        
        const visibility = {
            clipboard_history: document.getElementById('clipboard-history').checked,
            notes: document.getElementById('notes').checked,
            ai_prompt_enhancement: document.getElementById('ai-prompt-enhancement').checked,
            ai_smart_response: document.getElementById('ai-smart-response').checked
        };

        const featureOrder = this.getFeatureOrder();

        return {
            columns,
            featuresPerColumn,
            visibility,
            featureOrder
        };
    }

    applySettings() {
        const settings = this.getCurrentSettings();
        ipcRenderer.send('apply-settings', settings);
    }

    saveSettings() {
        const settings = this.getCurrentSettings();
        ipcRenderer.send('save-settings', settings);
    }

    resetToDefaults() {
        const defaultSettings = {
            columns: 1,
            featuresPerColumn: 2,
            visibility: {
                clipboard_history: true,
                notes: true,
                ai_prompt_enhancement: true,
                ai_smart_response: false
            },
            featureOrder: [
                'Clipboard History',
                'Notes',
                'AI Prompt Enhancement',
                'AI Smart Response'
            ]
        };

        this.currentSettings = defaultSettings;
        this.populateForm(defaultSettings);
        this.showStatus('Settings reset to defaults.', 'info');
    }

    showStatus(message, type = 'info') {
        // Remove existing status messages
        const existingStatus = document.querySelector('.status-message');
        if (existingStatus) {
            existingStatus.remove();
        }

        // Create new status message
        const statusDiv = document.createElement('div');
        statusDiv.className = `status-message status-${type}`;
        statusDiv.textContent = message;

        // Insert at the top of settings content
        const settingsContent = document.querySelector('.settings-content');
        settingsContent.insertBefore(statusDiv, settingsContent.firstChild);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (statusDiv.parentNode) {
                statusDiv.remove();
            }
        }, 3000);
    }
}

// Initialize settings renderer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SettingsRenderer();
}); 