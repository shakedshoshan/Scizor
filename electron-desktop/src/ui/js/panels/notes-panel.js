const { ipcRenderer } = require('electron');

/**
 * Notes Panel Component
 * Manages notes creation, editing, and display
 */
class NotesPanel {
    constructor() {
        this.container = null;
        this.notes = [];
    }

    render(container) {
        this.container = container;
        this.createPanelContent();
        this.setupEventListeners();
        this.loadNotes();
    }

    createPanelContent() {
        this.container.innerHTML = `
            <div class="panel-header">
                <h3 class="panel-title">📝 Notes</h3>
                <div class="panel-controls">
                    <button class="panel-btn" id="new-note-btn" title="New Note">
                        ➕
                    </button>
                    <button class="panel-btn" id="refresh-notes-btn" title="Refresh">
                        🔄
                    </button>
                </div>
            </div>
            <div class="panel-content">
                <div id="notes-list" class="notes-list">
                    <div class="empty-state">
                        <p>No notes yet</p>
                        <p>Create your first note!</p>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // New note button
        const newNoteBtn = this.container.querySelector('#new-note-btn');
        if (newNoteBtn) {
            newNoteBtn.addEventListener('click', () => {
                this.createNewNote();
            });
        }

        // Refresh button
        const refreshBtn = this.container.querySelector('#refresh-notes-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshNotes();
            });
        }
    }

    loadNotes() {
        console.log('Loading notes...');
        
        // Add some sample notes for demo
        setTimeout(() => {
            this.notes = [
                { id: 1, title: 'Sample Note 1', content: 'This is a sample note content.', timestamp: new Date().toISOString() },
                { id: 2, title: 'Sample Note 2', content: 'Another sample note with some content.', timestamp: new Date().toISOString() }
            ];
            this.updateDisplay();
        }, 500);
    }

    createNewNote() {
        const title = prompt('Enter note title:');
        if (title) {
            const content = prompt('Enter note content:');
            if (content) {
                const note = {
                    id: Date.now(),
                    title: title,
                    content: content,
                    timestamp: new Date().toISOString()
                };
                this.notes.unshift(note);
                this.updateDisplay();
                ipcRenderer.send('note-created', note);
            }
        }
    }

    createNoteFromText(text) {
        const title = this.generateTitleFromText(text);
        const note = {
            id: Date.now(),
            title: title,
            content: text,
            timestamp: new Date().toISOString()
        };
        this.notes.unshift(note);
        this.updateDisplay();
        ipcRenderer.send('note-created', note);
    }

    generateTitleFromText(text) {
        const words = text.split(' ').slice(0, 5);
        return words.join(' ') + (text.length > 50 ? '...' : '');
    }

    saveNote(note) {
        const index = this.notes.findIndex(n => n.id === note.id);
        if (index !== -1) {
            this.notes[index] = note;
            this.updateDisplay();
            ipcRenderer.send('note-updated', note);
        }
    }

    showNoteEditor(note) {
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
                this.saveNote(updatedNote);
            }
        }
    }

    updateDisplay() {
        const listContainer = this.container.querySelector('#notes-list');
        if (!listContainer) return;

        if (this.notes.length === 0) {
            listContainer.innerHTML = `
                <div class="empty-state">
                    <p>No notes yet</p>
                    <p>Create your first note!</p>
                </div>
            `;
            return;
        }

        listContainer.innerHTML = '';
        this.notes.forEach((note, index) => {
            const noteElement = document.createElement('div');
            noteElement.className = 'list-item note-item';
            noteElement.innerHTML = `
                <div class="item-content">
                    <div class="item-title">${note.title}</div>
                    <div class="item-text">${this.truncateText(note.content, 40)}</div>
                    <div class="item-time">${this.formatTime(note.timestamp)}</div>
                </div>
                <div class="item-actions">
                    <button class="panel-btn edit-btn" data-id="${note.id}">Edit</button>
                    <button class="panel-btn delete-btn" data-id="${note.id}">Delete</button>
                </div>
            `;

            // Add edit functionality
            const editBtn = noteElement.querySelector('.edit-btn');
            editBtn.addEventListener('click', () => {
                this.showNoteEditor(note);
            });

            // Add delete functionality
            const deleteBtn = noteElement.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => {
                this.deleteNote(note.id);
            });

            listContainer.appendChild(noteElement);
        });
    }

    selectNote(noteId) {
        const note = this.notes.find(n => n.id === noteId);
        if (note) {
            this.showNoteEditor(note);
        }
    }

    deleteNote(noteId) {
        if (confirm('Are you sure you want to delete this note?')) {
            this.notes = this.notes.filter(n => n.id !== noteId);
            this.updateDisplay();
            ipcRenderer.send('note-deleted', noteId);
        }
    }

    refreshNotes() {
        console.log('Refreshing notes...');
        this.loadNotes();
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NotesPanel };
} 