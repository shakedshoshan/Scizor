const { ipcRenderer } = require('electron');

/**
 * AI Prompt Enhancement Panel Component
 * Provides AI-powered prompt enhancement functionality
 */
class EnhancePromptPanel {
    constructor() {
        this.container = null;
        this.isLoading = false;
    }

    render(container) {
        this.container = container;
        this.createPanelContent();
        this.setupEventListeners();
    }

    createPanelContent() {
        this.container.innerHTML = `
            <div class="panel-header">
                <h3 class="panel-title">🤖 AI Prompt Enhancement</h3>
                <div class="panel-controls">
                    <button class="panel-btn" id="clear-enhance-btn" title="Clear">
                        🗑
                    </button>
                </div>
            </div>
            <div class="panel-content">
                <div class="form-group">
                    <label for="enhance-input">Enter your prompt:</label>
                    <textarea id="enhance-input" class="form-input" rows="3" placeholder="Enter your prompt here..."></textarea>
                </div>
                <div class="form-controls">
                    <button class="btn btn-primary" id="enhance-btn">Enhance Prompt</button>
                </div>
                <div id="enhance-result" class="enhance-result">
                    <div class="empty-state">
                        <p>Enhanced prompt will appear here</p>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // Enhance button
        const enhanceBtn = this.container.querySelector('#enhance-btn');
        if (enhanceBtn) {
            enhanceBtn.addEventListener('click', () => {
                this.enhancePrompt();
            });
        }

        // Clear button
        const clearBtn = this.container.querySelector('#clear-enhance-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearInput();
            });
        }
    }

    enhancePrompt() {
        const input = this.container.querySelector('#enhance-input');
        const prompt = input.value.trim();

        if (!prompt) {
            this.showStatus('Please enter a prompt to enhance.', 'error');
            return;
        }

        this.showLoadingState();
        this.callEnhanceAPI(prompt);
    }

    callEnhanceAPI(prompt) {
        // Simulate API call
        setTimeout(() => {
            const enhancedPrompt = `Enhanced: ${prompt}\n\nThis is an enhanced version of your prompt with improved clarity and structure.`;
            this.showEnhancedResult(enhancedPrompt);
        }, 2000);
    }

    showEnhancedResult(result) {
        this.hideLoadingState();
        const resultDiv = this.container.querySelector('#enhance-result');
        resultDiv.innerHTML = `
            <div class="enhanced-content">
                <h4>Enhanced Prompt:</h4>
                <p>${result}</p>
                <div class="result-actions">
                    <button class="panel-btn copy-btn">Copy</button>
                    <button class="panel-btn replace-btn">Replace Original</button>
                </div>
            </div>
        `;

        // Add action button handlers
        const copyBtn = resultDiv.querySelector('.copy-btn');
        const replaceBtn = resultDiv.querySelector('.replace-btn');

        copyBtn.addEventListener('click', () => {
            this.copyEnhancedPrompt(result);
        });

        replaceBtn.addEventListener('click', () => {
            this.replaceOriginal(result);
        });
    }

    showLoadingState() {
        this.isLoading = true;
        const resultDiv = this.container.querySelector('#enhance-result');
        resultDiv.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <span>Enhancing prompt...</span>
            </div>
        `;
    }

    hideLoadingState() {
        this.isLoading = false;
    }

    clearInput() {
        const input = this.container.querySelector('#enhance-input');
        input.value = '';
        
        const resultDiv = this.container.querySelector('#enhance-result');
        resultDiv.innerHTML = `
            <div class="empty-state">
                <p>Enhanced prompt will appear here</p>
            </div>
        `;
    }

    copyEnhancedPrompt(text) {
        ipcRenderer.send('copy-to-clipboard', text);
        this.showStatus('Enhanced prompt copied to clipboard!', 'success');
    }

    replaceOriginal(text) {
        const input = this.container.querySelector('#enhance-input');
        input.value = text;
        this.showStatus('Original prompt replaced!', 'success');
    }

    showStatus(message, type = 'info') {
        const statusDiv = document.createElement('div');
        statusDiv.className = `status-message status-${type}`;
        statusDiv.textContent = message;
        
        this.container.appendChild(statusDiv);
        
        setTimeout(() => {
            if (statusDiv.parentNode) {
                statusDiv.remove();
            }
        }, 3000);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EnhancePromptPanel };
} 