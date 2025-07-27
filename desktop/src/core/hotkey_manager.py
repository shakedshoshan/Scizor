#!/usr/bin/env python3
"""
Hotkey Manager for Scizor Desktop Application
Handles global hotkeys for dashboard control
"""

import keyboard
import threading
import pyperclip
from typing import Callable, Optional, Dict
from PyQt6.QtCore import QObject, pyqtSignal


class HotkeyManager(QObject):
    """Manages global hotkeys for the application"""
    
    # Qt signals for thread-safe communication
    toggle_requested = pyqtSignal()  # Signal to toggle dashboard visibility
    create_note_requested = pyqtSignal(str)  # Signal to create note with text
    
    def __init__(self):
        """Initialize the hotkey manager"""
        super().__init__()
        self.is_running = False
        self._hotkey_thread: Optional[threading.Thread] = None
        
    def start(self):
        """Start listening for hotkeys"""
        if self.is_running:
            return
            
        self.is_running = True
        
        # Start hotkey listener in a separate thread
        self._hotkey_thread = threading.Thread(target=self._listen_for_hotkeys, daemon=True)
        self._hotkey_thread.start()
        
    def stop(self):
        """Stop listening for hotkeys"""
        self.is_running = False
        if self._hotkey_thread and self._hotkey_thread.is_alive():
            self._hotkey_thread.join(timeout=1)
            
    def _listen_for_hotkeys(self):
        """Listen for global hotkeys in a separate thread"""
        try:
            # Register the hotkeys
            keyboard.add_hotkey('ctrl+alt+s', self._on_toggle_hotkey, suppress=True)
            keyboard.add_hotkey('ctrl+alt+n', self._on_create_note_hotkey, suppress=True)
            
            # Keep the thread alive
            while self.is_running:
                keyboard.wait()
                
        except Exception as e:
            print(f"Hotkey manager error: {e}")
        finally:
            # Clean up
            try:
                keyboard.unhook_all()
            except:
                pass
                
    def _on_toggle_hotkey(self):
        """Handle the toggle hotkey press - emit signal to main thread"""
        try:
            self.toggle_requested.emit()
        except Exception as e:
            print(f"Error in toggle hotkey: {e}")
                
    def _on_create_note_hotkey(self):
        """Handle the create note hotkey press - capture selected text and emit signal"""
        try:
            # Store current clipboard content
            original_clipboard = pyperclip.paste()
            
            # Simulate Ctrl+C to copy selected text
            keyboard.send('ctrl+c')
            
            # Small delay to ensure copy operation completes
            import time
            time.sleep(0.1)
            
            # Get the selected text from clipboard
            selected_text = pyperclip.paste().strip()
            
            # Restore original clipboard content
            if original_clipboard != selected_text:
                pyperclip.copy(original_clipboard)
            
            if selected_text and selected_text != original_clipboard:
                self.create_note_requested.emit(selected_text)
            else:
                print("No text selected. Please select text first, then press Ctrl+Alt+N.")
                
        except Exception as e:
            print(f"Error in create note hotkey: {e}")


# Global hotkey manager instance
_hotkey_manager_instance = None

def get_hotkey_manager() -> HotkeyManager:
    """Get the global hotkey manager instance"""
    global _hotkey_manager_instance
    if _hotkey_manager_instance is None:
        _hotkey_manager_instance = HotkeyManager()
    return _hotkey_manager_instance

def start_hotkey_manager():
    """Start the global hotkey manager"""
    manager = get_hotkey_manager()
    manager.start()

def stop_hotkey_manager():
    """Stop the global hotkey manager"""
    manager = get_hotkey_manager()
    manager.stop()
