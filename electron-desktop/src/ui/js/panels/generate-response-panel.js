const { ipcRenderer } = require('electron');

/**
 * AI Smart Response Panel Component
 * Provides AI-powered response generation functionality
 */
class GenerateResponsePanel {
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
                <h3 class="panel-title">💬 AI Smart Response</h3>
                <div class="panel-controls">
                    <button class="panel-btn" id="clear-generate-btn" title="Clear">
                        🗑
                    </button>
                </div>
            </div>
            <div class="panel-content">
                <div class="form-group">
                    <label for="generate-input">Enter your message:</label>
                    <textarea id="generate-input" class="form-input" rows="3" placeholder="Enter your message here..."></textarea>
                </div>
                <div class="form-controls">
                    <button class="btn btn-primary" id="generate-btn">Generate Response</button>
                </div>
                <div id="generate-result" class="generate-result">
                    <div class="empty-state">
                        <p>Generated response will appear here</p>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // Generate button
        const generateBtn = this.container.querySelector('#generate-btn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => {
                this.generateResponse();
            });
        }

        // Clear button
        const clearBtn = this.container.querySelector('#clear-generate-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearInput();
            });
        }
    }

    generateResponse() {
        const input = this.container.querySelector('#generate-input');
        const message = input.value.trim();

        if (!message) {
            this.showStatus('Please enter a message to generate a response.', 'error');
            return;
        }

        this.showLoadingState();
        this.callGenerateAPI(message);
    }

    callGenerateAPI(message) {
        // Simulate API call
        setTimeout(() => {
            const response = `Here's a smart response to: "${message}"\n\nThis is an AI-generated response that provides helpful and contextual information based on your input.`;
            this.showGeneratedResult(response);
        }, 2000);
    }

    showGeneratedResult(result) {
        this.hideLoadingState();
        const resultDiv = this.container.querySelector('#generate-result');
        resultDiv.innerHTML = `
            <div class="generated-content">
                <h4>Generated Response:</h4>
                <p>${result}</p>
                <div class="result-actions">
                    <button class="panel-btn copy-btn">Copy</button>
                    <button class="panel-btn speak-btn">Speak</button>
                </div>
            </div>
        `;

        // Add action button handlers
        const copyBtn = resultDiv.querySelector('.copy-btn');
        const speakBtn = resultDiv.querySelector('.speak-btn');

        copyBtn.addEventListener('click', () => {
            this.copyResponse(result);
        });

        speakBtn.addEventListener('click', () => {
            this.speakResponse(result);
        });
    }

    showLoadingState() {
        this.isLoading = true;
        const resultDiv = this.container.querySelector('#generate-result');
        resultDiv.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <span>Generating response...</span>
            </div>
        `;
    }

    hideLoadingState() {
        this.isLoading = false;
    }

    clearInput() {
        const input = this.container.querySelector('#generate-input');
        input.value = '';
        
        const resultDiv = this.container.querySelector('#generate-result');
        resultDiv.innerHTML = `
            <div class="empty-state">
                <p>Generated response will appear here</p>
            </div>
        `;
    }

    copyResponse(text) {
        ipcRenderer.send('copy-to-clipboard', text);
        this.showStatus('Response copied to clipboard!', 'success');
    }

    speakResponse(text) {
        ipcRenderer.send('speak-text', text);
        this.showStatus('Speaking response...', 'info');
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
    module.exports = { GenerateResponsePanel };
} 