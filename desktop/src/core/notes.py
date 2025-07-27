#!/usr/bin/env python3
"""
Notes Module
Handles note business logic and operations for Scizor
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
import logging
from PyQt6.QtCore import QObject, pyqtSignal
from database import get_database

# Configure logging
logger = logging.getLogger(__name__)


class NoteManager(QObject):
    """Manages note operations and business logic with PyQt signals"""
    
    # PyQt signals for UI updates
    note_added = pyqtSignal(dict)  # Emits the new note data
    note_updated = pyqtSignal(dict)  # Emits the updated note data
    note_deleted = pyqtSignal(int)  # Emits the deleted note ID
    notes_loaded = pyqtSignal(list)  # Emits list of all notes
    error_occurred = pyqtSignal(str)  # Emits error message
    
    def __init__(self):
        """Initialize the notes manager"""
        super().__init__()
        self.db = get_database()
    
    def create_note(self, title: str, content: str, priority: int = 1) -> int:
        """Add a new note to the database"""
        query = """
        INSERT INTO notes (title, content, priority, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?)
        """
        current_time = datetime.now().isoformat()
        params = (title, content, priority, current_time, current_time)
        
        try:
            cursor = self.db.get_connection().cursor()
            cursor.execute(query, params)
            self.db.get_connection().commit()
            note_id = cursor.lastrowid
            logger.info(f"Note added successfully with ID: {note_id}")
            
            # Emit signal with the new note data
            new_note = {
                'id': note_id,
                'title': title,
                'content': content,
                'priority': priority,
                'created_at': current_time,
                'updated_at': current_time
            }
            self.note_added.emit(new_note)
            return note_id
        except Exception as e:
            logger.error(f"Failed to add note: {e}")
            self.db.get_connection().rollback()
            self.error_occurred.emit(f"Failed to add note: {e}")
            raise
    
    def create_note_from_text(self, selected_text: str, priority: int = 1) -> int:
        """Create a note from selected text with automatic title generation"""
        if not selected_text or not selected_text.strip():
            raise ValueError("Selected text cannot be empty")
        
        # Generate title from first line or first 50 characters
        lines = selected_text.strip().split('\n')
        first_line = lines[0].strip()
        
        if len(first_line) > 50:
            title = first_line[:47] + "..."
        else:
            title = first_line if first_line else "Quick Note"
        
        # If title is empty or too short, use a default
        if not title or len(title) < 3:
            title = f"Note from {datetime.now().strftime('%H:%M')}"
        
        # Create the note
        return self.create_note(title, selected_text.strip(), priority)
    
    def get_note(self, note_id: int) -> Optional[Dict[str, Any]]:
        """Get a note by ID"""
        query = "SELECT * FROM notes WHERE id = ?"
        results = self.db.execute_query(query, (note_id,))
        return results[0] if results else None
    
    def get_notes(self) -> List[Dict[str, Any]]:
        """Get all notes ordered by priority and creation date"""
        query = """
        SELECT * FROM notes 
        ORDER BY priority DESC, created_at DESC
        """
        try:
            results = self.db.execute_query(query)
            self.notes_loaded.emit(results)
            return results
        except Exception as e:
            logger.error(f"Failed to get notes: {e}")
            self.error_occurred.emit(f"Failed to get notes: {e}")
            return []
    
    def update_note(self, note_id: int, title: str = None, content: str = None, 
                   priority: int = None) -> bool:
        """Update a note"""
        update_parts = []
        params = []
        
        if title is not None:
            update_parts.append("title = ?")
            params.append(title)
        
        if content is not None:
            update_parts.append("content = ?")
            params.append(content)
        
        if priority is not None:
            update_parts.append("priority = ?")
            params.append(priority)
        
        if not update_parts:
            return False
        
        update_parts.append("updated_at = ?")
        params.append(datetime.now().isoformat())
        params.append(note_id)
        
        query = f"""
        UPDATE notes 
        SET {', '.join(update_parts)}
        WHERE id = ?
        """
        
        try:
            self.db.execute_query(query, tuple(params))
            logger.info(f"Note {note_id} updated successfully")
            
            # Emit signal with updated note data
            updated_note = self.get_note(note_id)
            if updated_note:
                self.note_updated.emit(updated_note)
            return True
        except Exception as e:
            logger.error(f"Failed to update note {note_id}: {e}")
            self.error_occurred.emit(f"Failed to update note: {e}")
            return False
    
    def delete_note(self, note_id: int) -> bool:
        """Delete a note by ID"""
        query = "DELETE FROM notes WHERE id = ?"
        
        try:
            self.db.execute_query(query, (note_id,))
            logger.info(f"Note {note_id} deleted successfully")
            self.note_deleted.emit(note_id)
            return True
        except Exception as e:
            logger.error(f"Failed to delete note {note_id}: {e}")
            self.error_occurred.emit(f"Failed to delete note: {e}")
            return False
    
    def search_notes(self, search_term: str) -> List[Dict[str, Any]]:
        """Search notes by title or content"""
        query = """
        SELECT * FROM notes 
        WHERE title LIKE ? OR content LIKE ?
        ORDER BY priority DESC, created_at DESC
        """
        search_pattern = f"%{search_term}%"
        try:
            results = self.db.execute_query(query, (search_pattern, search_pattern))
            self.notes_loaded.emit(results)
            return results
        except Exception as e:
            logger.error(f"Failed to search notes: {e}")
            self.error_occurred.emit(f"Failed to search notes: {e}")
            return []
    

    
    def get_notes_sorted(self, sort_by: str) -> List[Dict[str, Any]]:
        """Get notes sorted by specified criteria"""
        sort_queries = {
            'priority': """
                SELECT * FROM notes 
                ORDER BY priority DESC, created_at DESC
            """,
            'name': """
                SELECT * FROM notes 
                ORDER BY COALESCE(title, '') ASC, created_at DESC
            """,
            'time_created': """
                SELECT * FROM notes 
                ORDER BY created_at DESC
            """
        }
        
        query = sort_queries.get(sort_by, sort_queries['time_created'])
        
        try:
            results = self.db.execute_query(query)
            self.notes_loaded.emit(results)
            return results
        except Exception as e:
            logger.error(f"Failed to get notes sorted by {sort_by}: {e}")
            self.error_occurred.emit(f"Failed to get notes sorted by {sort_by}: {e}")
            return []
    
    def export_notes_to_text(self) -> str:
        """Export all notes to text format"""
        notes = self.get_notes()
        if not notes:
            return "No notes to export."
        
        export_text = "=== SCIZOR NOTES EXPORT ===\n\n"
        
        for note in notes:
            title = note.get('title') or 'Untitled'
            content = note.get('content', '')
            priority = note.get('priority', 1)
            created = note.get('created_at', '')
            
            export_text += f"Title: {title}\n"
            export_text += f"Priority: {priority}\n"
            export_text += f"Created: {created}\n"
            export_text += f"Content:\n{content}\n"
            export_text += "-" * 50 + "\n\n"
        
        return export_text
    