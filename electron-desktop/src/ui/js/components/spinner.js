/**
 * Spinner Component
 * Provides loading spinner functionality
 */
class Spinner {
    constructor() {
        this.currentSpinner = null;
    }

    show(container, text = 'Loading...') {
        this.hide(); // Hide any existing spinner

        const spinnerContainer = document.createElement('div');
        spinnerContainer.className = 'spinner-container';
        spinnerContainer.innerHTML = `
            <div class="spinner-overlay">
                <div class="spinner-content">
                    <div class="spinner"></div>
                    <div class="spinner-text">${text}</div>
                </div>
            </div>
        `;

        if (container) {
            container.appendChild(spinnerContainer);
        } else {
            document.body.appendChild(spinnerContainer);
        }

        this.currentSpinner = spinnerContainer;
    }

    hide() {
        if (this.currentSpinner && this.currentSpinner.parentNode) {
            this.currentSpinner.parentNode.removeChild(this.currentSpinner);
            this.currentSpinner = null;
        }
    }

    updateText(text) {
        if (this.currentSpinner) {
            const textElement = this.currentSpinner.querySelector('.spinner-text');
            if (textElement) {
                textElement.textContent = text;
            }
        }
    }

    // Utility method to show spinner in a specific element
    showInElement(element, text = 'Loading...') {
        this.show(element, text);
    }

    // Utility method to show full screen spinner
    showFullScreen(text = 'Loading...') {
        this.show(null, text);
    }
}

// Create global instance
const spinner = new Spinner();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Spinner, spinner };
} 