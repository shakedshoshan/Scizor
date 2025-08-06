const { ipcRenderer } = require('electron');

/**
 * Expanded Window Renderer
 * Handles expanded view functionality and data synchronization
 */
class ExpandedRenderer {
    constructor() {
        this.clipboardData = [];
        this.notesData = [];
        this.settings = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupIPCListeners();
        this.requestData();
    }

    setupEventListeners() {
        // Close button
        document.getElementById('close-btn').addEventListener('click', () => {
            ipcRenderer.send('close-expanded');
        });

        // Clipboard controls
        document.getElementById('clear-clipboard').addEventListener('click', () => {
            this.clearClipboardHistory();
        });

        document.getElementById('refresh-clipboard').addEventListener('click', () => {
            this.refreshClipboardHistory();
        });

        // Notes controls
        document.getElementById('new-note').addEventListener('click', () => {
            this.createNewNote();
        });

        document.getElementById('refresh-notes').addEventListener('click', () => {
            this.refreshNotes();
        });

        // AI Prompt Enhancement controls
        document.getElementById('enhance-prompt-btn').addEventListener('click', () => {
            this.enhancePrompt();
        });

        document.getElementById('clear-enhance').addEventListener('click', () => {
            this.clearEnhanceInput();
        });

        // AI Smart Response controls
        document.getElementById('generate-response-btn').addEventListener('click', () => {
            this.generateResponse();
        });

        document.getElementById('clear-generate').addEventListener('click', () => {
            this.clearGenerateInput();
        });

        document.getElementById('speak-response').addEventListener('click', () => {
            this.speakResponse();
        });
    }

    setupIPCListeners() {
        // Data synchronization
        ipcRenderer.on('data-synced', (event, data) => {
            this.handleDataSync(data);
        });

        ipcRenderer.on('settings-synced', (event, settings) => {
            this.settings = settings;
            this.updateDisplay();
        });

        ipcRenderer.on('clipboard-synced', (event, clipboardData) => {
            this.clipboardData = clipboardData;
            this.updateClipboardDisplay();
        });

        ipcRenderer.on('notes-synced', (event, notesData) => {
            this.notesData = notesData;
            this.updateNotesDisplay();
        });

        ipcRenderer.on('ai-response-synced', (event, responseData) => {
            this.handleAIResponse(responseData);
        });
    }

    requestData() {
        // Request initial data from main process
        ipcRenderer.send('request-data');
    }

    handleDataSync(data) {
        if (data.clipboard) {
            this.clipboardData = data.clipboard;
            this.updateClipboardDisplay();
        }

        if (data.notes) {
            this.notesData = data.notes;
            this.updateNotesDisplay();
        }

        if (data.settings) {
            this.settings = data.settings;
            this.updateDisplay();
        }
    }

    updateDisplay() {
        this.updateClipboardDisplay();
        this.updateNotesDisplay();
    }

    updateClipboardDisplay() {
        const clipboardList = document.getElementById('clipboard-list');
        clipboardList.innerHTML = '';

        if (this.clipboardData.length === 0) {
            clipboardList.innerHTML = '<div class="empty-state">No clipboard items found</div>';
            return;
        }

        this.clipboardData.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'clipboard-item';
            itemElement.dataset.index = index;
            itemElement.innerHTML = `
                <div class="item-content">
                    <div class="item-text">${this.truncateText(item.text, 100)}</div>
                    <div class="item-time">${this.formatTime(item.timestamp)}</div>
                </div>
                <div class="item-actions">
                    <button class="btn btn-secondary btn-sm copy-btn">Copy</button>
                </div>
            `;

            // Add click handler for copying
            const copyBtn = itemElement.querySelector('.copy-btn');
            copyBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.copyToClipboard(item.text);
            });

            clipboardList.appendChild(itemElement);
        });
    }

    updateNotesDisplay() {
        const notesList = document.getElementById('notes-list');
        notesList.innerHTML = '';

        if (this.notesData.length === 0) {
            notesList.innerHTML = '<div class="empty-state">No notes found</div>';
            return;
        }

        this.notesData.forEach((note, index) => {
            const noteElement = document.createElement('div');
            noteElement.className = 'note-item';
            noteElement.dataset.id = note.id;
            noteElement.innerHTML = `
                <div class="note-content">
                    <div class="note-title">${note.title || 'Untitled Note'}</div>
                    <div class="note-text">${this.truncateText(note.content, 150)}</div>
                    <div class="note-time">${this.formatTime(note.timestamp)}</div>
                </div>
                <div class="note-actions">
                    <button class="btn btn-secondary btn-sm edit-btn">Edit</button>
                    <button class="btn btn-danger btn-sm delete-btn">Delete</button>
                </div>
            `;

            // Add click handlers
            const editBtn = noteElement.querySelector('.edit-btn');
            const deleteBtn = noteElement.querySelector('.delete-btn');

            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.editNote(note);
            });

            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteNote(note.id);
            });

            notesList.appendChild(noteElement);
        });
    }

    clearClipboardHistory() {
        ipcRenderer.send('clipboard-cleared');
        this.showStatus('Clipboard history cleared.', 'success');
    }

    refreshClipboardHistory() {
        ipcRenderer.send('refresh-clipboard');
        this.showStatus('Refreshing clipboard history...', 'info');
    }

    createNewNote() {
        const title = prompt('Enter note title:');
        if (title) {
            const content = prompt('Enter note content:');
            if (content) {
                const noteData = {
                    title: title,
                    content: content,
                    timestamp: new Date().toISOString()
                };
                ipcRenderer.send('note-created', noteData);
            }
        }
    }

    refreshNotes() {
        ipcRenderer.send('refresh-notes');
        this.showStatus('Refreshing notes...', 'info');
    }

    editNote(note) {
        const newTitle = prompt('Edit note title:', note.title);
        if (newTitle !== null) {
            const newContent = prompt('Edit note content:', note.content);
            if (newContent !== null) {
                const updatedNote = {
                    ...note,
                    title: newTitle,
                    content: newContent,
                    timestamp: new Date().toISOString()
                };
                ipcRenderer.send('note-updated', updatedNote);
            }
        }
    }

    deleteNote(noteId) {
        if (confirm('Are you sure you want to delete this note?')) {
            ipcRenderer.send('note-deleted', noteId);
        }
    }

    enhancePrompt() {
        const input = document.getElementById('enhance-prompt-input');
        const prompt = input.value.trim();

        if (!prompt) {
            this.showStatus('Please enter a prompt to enhance.', 'error');
            return;
        }

        this.showLoadingState('enhance');
        ipcRenderer.send('enhance-prompt', prompt);
    }

    clearEnhanceInput() {
        document.getElementById('enhance-prompt-input').value = '';
        document.getElementById('enhance-result').innerHTML = '';
    }

    generateResponse() {
        const input = document.getElementById('generate-response-input');
        const message = input.value.trim();

        if (!message) {
            this.showStatus('Please enter a message to generate a response.', 'error');
            return;
        }

        this.showLoadingState('generate');
        ipcRenderer.send('generate-response', message);
    }

    clearGenerateInput() {
        document.getElementById('generate-response-input').value = '';
        document.getElementById('generate-result').innerHTML = '';
    }

    speakResponse() {
        const resultDiv = document.getElementById('generate-result');
        const text = resultDiv.textContent || resultDiv.innerText;
        
        if (text) {
            ipcRenderer.send('speak-text', text);
            this.showStatus('Speaking response...', 'info');
        } else {
            this.showStatus('No response to speak.', 'error');
        }
    }

    copyToClipboard(text) {
        ipcRenderer.send('copy-to-clipboard', text);
        this.showStatus('Copied to clipboard!', 'success');
    }

    showLoadingState(type) {
        const resultDiv = document.getElementById(`${type}-result`);
        resultDiv.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <span>Processing...</span>
            </div>
        `;
    }

    handleAIResponse(responseData) {
        const { type, result, error } = responseData;
        const resultDiv = document.getElementById(`${type}-result`);

        if (error) {
            resultDiv.innerHTML = `
                <div class="status-message status-error">
                    Error: ${error}
                </div>
            `;
        } else {
            resultDiv.innerHTML = `
                <h3>Enhanced Result:</h3>
                <p>${result}</p>
                <div class="result-actions">
                    <button class="btn btn-secondary btn-sm copy-result-btn">Copy</button>
                    <button class="btn btn-secondary btn-sm replace-original-btn">Replace Original</button>
                </div>
            `;

            // Add action button handlers
            const copyBtn = resultDiv.querySelector('.copy-result-btn');
            const replaceBtn = resultDiv.querySelector('.replace-original-btn');

            copyBtn.addEventListener('click', () => {
                this.copyToClipboard(result);
            });

            replaceBtn.addEventListener('click', () => {
                const inputId = type === 'enhance' ? 'enhance-prompt-input' : 'generate-response-input';
                document.getElementById(inputId).value = result;
                this.showStatus('Original text replaced!', 'success');
            });
        }
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString();
    }

    showStatus(message, type = 'info') {
        // Create status message
        const statusDiv = document.createElement('div');
        statusDiv.className = `status-message status-${type}`;
        statusDiv.textContent = message;

        // Insert at the top of expanded content
        const expandedContent = document.querySelector('.expanded-content');
        expandedContent.insertBefore(statusDiv, expandedContent.firstChild);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (statusDiv.parentNode) {
                statusDiv.remove();
            }
        }, 3000);
    }
}

// Initialize expanded renderer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ExpandedRenderer();
}); 