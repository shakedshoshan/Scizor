#!/usr/bin/env python3
"""
Clipboard Manager Module
Handles clipboard monitoring and history management
"""

import pyperclip
import logging
from typing import Optional, List
from PyQt6.QtCore import QObject, pyqtSignal

from database.db_connection import get_database 

# Configure logging
logger = logging.getLogger(__name__)


class ClipboardManager(QObject):
    """Manages clipboard monitoring and history storage"""
    
    # Signals
    clipboard_changed = pyqtSignal(str)  # Emitted when new clipboard content is detected
    clipboard_history_updated = pyqtSignal(list)  # Emitted when history is updated
    
    def __init__(self, parent=None):
        """Initialize the clipboard manager"""
        super().__init__(parent)
        self.db = get_database()
    

    
    def add_to_history(self, content: str) -> bool:
        """Add clipboard content to history database"""
        if not content or not content.strip():
            return False
        
        try:
            # Insert with UNIQUE constraint (will ignore duplicates)
            query = """
            INSERT OR IGNORE INTO clipboard_history (content, created_at)
            VALUES (?, CURRENT_TIMESTAMP)
            """
            
            self.db.execute_query(query, (content.strip(),))
            
            # Emit signal to update UI
            self.clipboard_history_updated.emit([])
            
            logger.debug(f"Added clipboard content to history: {content[:50]}...")
            return True
            
        except Exception as e:
            logger.error(f"Failed to add clipboard content to history: {e}")
            return False
    
    def get_clipboard_history(self, limit: int = 50) -> List[dict]:
        """Get clipboard history from database"""
        try:
            query = """
            SELECT id, content, created_at
            FROM clipboard_history
            ORDER BY created_at DESC
            LIMIT ?
            """
            
            results = self.db.execute_query(query, (limit,))
            return results
            
        except Exception as e:
            logger.error(f"Failed to get clipboard history: {e}")
            return []
    
    def clear_history(self) -> bool:
        """Clear all clipboard history"""
        try:
            query = "DELETE FROM clipboard_history"
            self.db.execute_query(query)
            
            # Emit updated history
            self.clipboard_history_updated.emit([])
            
            logger.info("Clipboard history cleared")
            return True
            
        except Exception as e:
            logger.error(f"Failed to clear clipboard history: {e}")
            return False
    
    def delete_item(self, item_id: int) -> bool:
        """Delete a specific clipboard item"""
        try:
            query = "DELETE FROM clipboard_history WHERE id = ?"
            self.db.execute_query(query, (item_id,))
            
            # Get updated history for UI
            history = self.get_clipboard_history()
            self.clipboard_history_updated.emit(history)
            
            logger.debug(f"Deleted clipboard item with ID: {item_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to delete clipboard item: {e}")
            return False
    
    def get_current_clipboard(self) -> str:
        """Get current clipboard content"""
        try:
            return pyperclip.paste()
        except Exception as e:
            logger.error(f"Failed to get current clipboard content: {e}")
            return ""
    
    def set_clipboard(self, content: str) -> bool:
        """Set clipboard content"""
        try:
            pyperclip.copy(content)
            logger.debug(f"Set clipboard content: {content[:50]}...")
            return True
        except Exception as e:
            logger.error(f"Failed to set clipboard content: {e}")
            return False


# Global clipboard manager instance
_clipboard_manager_instance: Optional[ClipboardManager] = None


def get_clipboard_manager() -> ClipboardManager:
    """Get the global clipboard manager instance"""
    global _clipboard_manager_instance
    if _clipboard_manager_instance is None:
        _clipboard_manager_instance = ClipboardManager()
    return _clipboard_manager_instance


def close_clipboard_manager():
    """Close the global clipboard manager instance"""
    global _clipboard_manager_instance
    if _clipboard_manager_instance:
        _clipboard_manager_instance = None
