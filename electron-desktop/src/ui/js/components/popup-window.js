const { ipcRenderer } = require('electron');

/**
 * Popup Window Component
 * Provides modal popup functionality for the application
 */
class PopupWindow {
    constructor() {
        this.isVisible = false;
        this.currentPopup = null;
    }

    show(title, message, type = 'info', options = {}) {
        this.createPopup(title, message, type, options);
        this.showPopup();
    }

    createPopup(title, message, type, options) {
        // Remove existing popup if any
        this.hide();

        // Create popup container
        const popupContainer = document.createElement('div');
        popupContainer.className = 'popup-overlay';
        popupContainer.id = 'popup-overlay';

        // Create popup content
        const popupContent = document.createElement('div');
        popupContent.className = `popup-window popup-${type}`;
        popupContent.innerHTML = `
            <div class="popup-header">
                <h3 class="popup-title">${title}</h3>
                <button class="popup-close-btn" id="popup-close">×</button>
            </div>
            <div class="popup-body">
                <p class="popup-message">${message}</p>
            </div>
            <div class="popup-footer">
                ${this.createFooterButtons(options)}
            </div>
        `;

        popupContainer.appendChild(popupContent);
        document.body.appendChild(popupContainer);

        this.currentPopup = popupContainer;
        this.setupPopupEvents();
    }

    createFooterButtons(options) {
        const buttons = options.buttons || ['OK'];
        return buttons.map(button => 
            `<button class="btn popup-btn" data-action="${button.toLowerCase()}">${button}</button>`
        ).join('');
    }

    setupPopupEvents() {
        if (!this.currentPopup) return;

        // Close button
        const closeBtn = this.currentPopup.querySelector('#popup-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hide();
            });
        }

        // Action buttons
        const actionBtns = this.currentPopup.querySelectorAll('.popup-btn');
        actionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                this.handleAction(action);
            });
        });

        // Click outside to close
        this.currentPopup.addEventListener('click', (e) => {
            if (e.target === this.currentPopup) {
                this.hide();
            }
        });

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hide();
            }
        });
    }

    handleAction(action) {
        // Handle different actions
        switch (action) {
            case 'ok':
            case 'cancel':
                this.hide();
                break;
            case 'yes':
                this.hide();
                // Trigger yes action
                break;
            case 'no':
                this.hide();
                // Trigger no action
                break;
            default:
                this.hide();
        }
    }

    showPopup() {
        if (this.currentPopup) {
            this.isVisible = true;
            this.currentPopup.style.display = 'flex';
            this.currentPopup.classList.add('popup-show');
        }
    }

    hide() {
        if (this.currentPopup) {
            this.isVisible = false;
            this.currentPopup.classList.remove('popup-show');
            setTimeout(() => {
                if (this.currentPopup && this.currentPopup.parentNode) {
                    this.currentPopup.parentNode.removeChild(this.currentPopup);
                }
                this.currentPopup = null;
            }, 300);
        }
    }

    // Utility methods for common popup types
    showInfo(title, message) {
        this.show(title, message, 'info');
    }

    showSuccess(title, message) {
        this.show(title, message, 'success');
    }

    showError(title, message) {
        this.show(title, message, 'error');
    }

    showWarning(title, message) {
        this.show(title, message, 'warning');
    }

    showConfirm(title, message, onConfirm, onCancel) {
        this.show(title, message, 'confirm', {
            buttons: ['Yes', 'No']
        });
        
        // Store callbacks for later use
        this.onConfirm = onConfirm;
        this.onCancel = onCancel;
    }
}

// Create global instance
const popupWindow = new PopupWindow();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PopupWindow, popupWindow };
} 