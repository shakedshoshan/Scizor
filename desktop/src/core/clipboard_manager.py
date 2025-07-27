#!/usr/bin/env python3
"""
Clipboard Manager Module
Handles clipboard monitoring and history management
"""

import pyperclip
import logging
import threading
import time
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
        self.is_monitoring = False
        self.monitor_thread: Optional[threading.Thread] = None
        self.last_clipboard_content = ""
        self.max_history_items = 100
        
    def start_monitoring(self):
        """Start monitoring clipboard changes"""
        if self.is_monitoring:
            return
            
        self.is_monitoring = True
        self.last_clipboard_content = self.get_current_clipboard()
        
        # Start monitoring in a separate thread
        self.monitor_thread = threading.Thread(target=self._monitor_clipboard, daemon=True)
        self.monitor_thread.start()
        logger.info("Clipboard monitoring started")
        
    def stop_monitoring(self):
        """Stop monitoring clipboard changes"""
        self.is_monitoring = False
        if self.monitor_thread and self.monitor_thread.is_alive():
            self.monitor_thread.join(timeout=1)
        logger.info("Clipboard monitoring stopped")
        
    def _monitor_clipboard(self):
        """Monitor clipboard changes in a separate thread"""
        while self.is_monitoring:
            try:
                current_content = self.get_current_clipboard()
                
                # Check if clipboard content has changed
                if current_content != self.last_clipboard_content and current_content.strip():
                    self.last_clipboard_content = current_content
                    self.add_to_history(current_content)
                    self.clipboard_changed.emit(current_content)
                    
                time.sleep(0.5)  # Check every 500ms
                
            except Exception as e:
                logger.error(f"Error in clipboard monitoring: {e}")
                time.sleep(1)  # Wait longer on error
    
    def add_to_history(self, content: str) -> bool:
        """Add clipboard content to history database with limit enforcement"""
        if not content or not content.strip():
            return False
        
        try:
            # Get database connection for current thread
            db = get_database()
            
            # First, check if we need to remove old items to stay within limit
            self._enforce_history_limit(db)
            
            # Use INSERT OR REPLACE to update timestamp if content already exists
            query = """
            INSERT OR REPLACE INTO clipboard_history (content, created_at)
            VALUES (?, CURRENT_TIMESTAMP)
            """
            
            db.execute_query(query, (content.strip(),))
            
            # Get updated history and emit signal
            history = self.get_clipboard_history()
            self.clipboard_history_updated.emit(history)
            
            logger.debug(f"Added clipboard content to history: {content[:50]}...")
            return True
            
        except Exception as e:
            logger.error(f"Failed to add clipboard content to history: {e}")
            return False
    
    def _enforce_history_limit(self, db=None):
        """Ensure we don't exceed the maximum number of history items"""
        try:
            if db is None:
                db = get_database()
                
            # Count current items
            count_query = "SELECT COUNT(*) as count FROM clipboard_history"
            result = db.execute_query(count_query)
            current_count = result[0]['count'] if result else 0
            
            if current_count >= self.max_history_items:
                # Remove oldest items to make room for new ones
                delete_query = """
                DELETE FROM clipboard_history 
                WHERE id IN (
                    SELECT id FROM clipboard_history 
                    ORDER BY created_at ASC 
                    LIMIT ?
                )
                """
                items_to_remove = current_count - self.max_history_items + 1
                db.execute_query(delete_query, (items_to_remove,))
                logger.debug(f"Removed {items_to_remove} old clipboard items to maintain limit")
                
        except Exception as e:
            logger.error(f"Failed to enforce history limit: {e}")
    
    def get_clipboard_history(self, limit: int = 100) -> List[dict]:
        """Get clipboard history from database"""
        try:
            db = get_database()
            query = """
            SELECT id, content, created_at
            FROM clipboard_history
            ORDER BY created_at DESC
            LIMIT ?
            """
            
            results = db.execute_query(query, (limit,))
            return results
            
        except Exception as e:
            logger.error(f"Failed to get clipboard history: {e}")
            return []
    
    def clear_history(self) -> bool:
        """Clear all clipboard history"""
        try:
            db = get_database()
            query = "DELETE FROM clipboard_history"
            db.execute_query(query)
            
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
            db = get_database()
            query = "DELETE FROM clipboard_history WHERE id = ?"
            db.execute_query(query, (item_id,))
            
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
            self.last_clipboard_content = content  # Update our tracking
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


def start_clipboard_monitoring():
    """Start clipboard monitoring"""
    manager = get_clipboard_manager()
    manager.start_monitoring()


def stop_clipboard_monitoring():
    """Stop clipboard monitoring"""
    manager = get_clipboard_manager()
    manager.stop_monitoring()


def close_clipboard_manager():
    """Close the global clipboard manager instance"""
    global _clipboard_manager_instance
    if _clipboard_manager_instance:
        _clipboard_manager_instance.stop_monitoring()
        _clipboard_manager_instance = None
