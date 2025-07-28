#!/usr/bin/env python3
"""
Hotkey Manager for Scizor Desktop Application
Handles global hotkeys for dashboard control
"""

import keyboard
import threading
import pyperclip
import time
from typing import Callable, Optional, Dict
from PyQt6.QtCore import QObject, pyqtSignal, QTimer, QThread, pyqtSlot, Qt
from PyQt6.QtWidgets import QApplication
from PyQt6.QtGui import QCursor

from core.clipboard_manager import get_clipboard_manager
from ui.component.spinner import WaitingSpinner
from ui.component.popup_window import show_popup


class EnhancePromptWorker(QThread):
    """Worker thread for enhancing prompts to avoid blocking the UI"""
    
    finished = pyqtSignal(dict)  # Signal emitted when enhancement is complete
    error = pyqtSignal(str)      # Signal emitted when an error occurs
    
    def __init__(self, text: str):
        super().__init__()
        self.text = text
        
    def run(self):
        """Run the enhancement in a separate thread"""
        try:
            from core.enhance_prompt import get_enhance_prompt_service
            enhance_service = get_enhance_prompt_service()
            result = enhance_service.enhance_prompt(self.text)
            self.finished.emit(result)
        except Exception as e:
            self.error.emit(str(e))


class GenerateResponseWorker(QThread):
    """Worker thread for generating AI responses to avoid blocking the UI"""
    
    finished = pyqtSignal(dict)  # Signal emitted when generation is complete
    error = pyqtSignal(str)      # Signal emitted when an error occurs
    
    def __init__(self, text: str):
        super().__init__()
        self.text = text
        
    def run(self):
        """Run the response generation in a separate thread"""
        try:
            from core.generate_response import get_generate_response_service
            generate_service = get_generate_response_service()
            result = generate_service.generate_response(self.text)
            self.finished.emit(result)
        except Exception as e:
            self.error.emit(str(e))


class FloatingSpinner:
    """A floating spinner that can be positioned near the cursor"""
    
    def __init__(self):
        self.spinner = None
        self.worker = None
        
    def show_spinner(self, text: str = "Loading..."):
        """Show the spinner near the current cursor position"""
        try:
            # Get the main application instance
            app = QApplication.instance()
            if not app:
                return
                
            # Create spinner if it doesn't exist
            if self.spinner is None:
                self.spinner = WaitingSpinner(
                    parent=None,
                    text=text,
                    text_color="#FFFFFF",
                    background_color="#2C3E50",
                    spinner_color="#3498DB",
                    spinner_size=80,
                    text_size=12,
                    center_on_parent=False,
                    disable_parent_when_spinning=False
                )
                
                # Set as floating window
                self.spinner.setWindowFlags(
                    Qt.WindowType.Tool |
                    Qt.WindowType.FramelessWindowHint |
                    Qt.WindowType.WindowStaysOnTopHint
                )
            
            # Update text
            self.spinner.set_text(text)
            
            # Position near cursor
            cursor_pos = QCursor.pos()
            x = cursor_pos.x() - self.spinner.width() // 2
            y = cursor_pos.y() - self.spinner.height() // 2
            self.spinner.move(x, y)
            
            # Show and start
            self.spinner.show()
            self.spinner.start()
            
        except Exception as e:
            print(f"Error showing spinner: {e}")
    
    def hide_spinner(self):
        """Hide the spinner"""
        try:
            if self.spinner:
                self.spinner.stop()
                self.spinner.hide()
        except Exception as e:
            print(f"Error hiding spinner: {e}")
    
    def update_text(self, text: str):
        """Update the spinner text"""
        try:
            if self.spinner:
                self.spinner.set_text(text)
        except Exception as e:
            print(f"Error updating spinner text: {e}")


class HotkeyManager(QObject):
    """Manages global hotkeys for the application"""
    
    # Qt signals for thread-safe communication
    toggle_requested = pyqtSignal()  # Signal to toggle dashboard visibility
    create_note_requested = pyqtSignal(str)  # Signal to create note with text
    enhance_prompt_requested = pyqtSignal(str)  # Signal to enhance prompt with text
    generate_response_requested = pyqtSignal(str)  # Signal to generate response with text
    show_spinner_requested = pyqtSignal(str)  # Signal to show spinner
    hide_spinner_requested = pyqtSignal()  # Signal to hide spinner
    update_spinner_text_requested = pyqtSignal(str)  # Signal to update spinner text
    show_popup_requested = pyqtSignal(str, str)  # Signal to show popup (title, message)
    
    def __init__(self):
        """Initialize the hotkey manager"""
        super().__init__()
        self.is_running = False
        self._hotkey_thread: Optional[threading.Thread] = None
        self.clipboard_manager = get_clipboard_manager()
        self.floating_spinner = FloatingSpinner()
        
        # Connect signals to main thread operations
        self.show_spinner_requested.connect(self._show_spinner_main_thread)
        self.hide_spinner_requested.connect(self._hide_spinner_main_thread)
        self.update_spinner_text_requested.connect(self._update_spinner_text_main_thread)
        self.show_popup_requested.connect(self._show_popup_main_thread)
        
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
            keyboard.add_hotkey('ctrl+alt+h', self._on_enhance_prompt_hotkey, suppress=True)
            keyboard.add_hotkey('ctrl+alt+g', self._on_generate_response_hotkey, suppress=True)
            
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
            time.sleep(0.1)
            
            # Get the selected text from clipboard
            selected_text = pyperclip.paste().strip()
            
            # Restore original clipboard content
            if original_clipboard != selected_text:
                pyperclip.copy(original_clipboard)
            
            if selected_text and selected_text != original_clipboard:
                # Save the copied text to clipboard history using thread-safe method
                try:
                    self.clipboard_manager.add_to_history(selected_text)
                except Exception as e:
                    print(f"Failed to add to clipboard history: {e}")
                
                # Emit signal for note creation
                self.create_note_requested.emit(selected_text)
            else:
                print("No text selected. Please select text first, then press Ctrl+Alt+N.")
                
        except Exception as e:
            print(f"Error in create note hotkey: {e}")
                
    def _on_enhance_prompt_hotkey(self):
        """Handle the enhance prompt hotkey press - capture selected text and replace with enhanced version"""
        try:
            # Store current clipboard content
            original_clipboard = pyperclip.paste()
            
            # Simulate Ctrl+C to copy selected text
            keyboard.send('ctrl+c')
            
            # Small delay to ensure copy operation completes
            time.sleep(0.15)  # Increased delay for better reliability
            
            # Get the selected text from clipboard
            selected_text = pyperclip.paste().strip()
            
            # Restore original clipboard content
            if original_clipboard != selected_text:
                pyperclip.copy(original_clipboard)
            
            if selected_text and selected_text != original_clipboard:
                # Validate text length and content
                if len(selected_text) < 3:
                    print("Selected text is too short. Please select more text to enhance.")
                    return
                
                if len(selected_text) > 2000:
                    print("Selected text is too long. Please select a shorter text to enhance.")
                    return
                
                # Save the copied text to clipboard history using thread-safe method
                try:
                    self.clipboard_manager.add_to_history(selected_text)
                except Exception as e:
                    print(f"Failed to add to clipboard history: {e}")
                
                # Start enhancement with spinner - use signals for thread safety
                self._enhance_with_spinner(selected_text)
            else:
                print("No text selected. Please select text first, then press Ctrl+Alt+H.")
                
        except Exception as e:
            print(f"Error in enhance prompt hotkey: {e}")
    
    def _on_generate_response_hotkey(self):
        """Handle the generate response hotkey press - capture selected text and replace with generated response"""
        try:
            # Store current clipboard content
            original_clipboard = pyperclip.paste()
            
            # Simulate Ctrl+C to copy selected text
            keyboard.send('ctrl+c')
            
            # Small delay to ensure copy operation completes
            time.sleep(0.15)  # Increased delay for better reliability
            
            # Get the selected text from clipboard
            selected_text = pyperclip.paste().strip()
            
            # Restore original clipboard content
            if original_clipboard != selected_text:
                pyperclip.copy(original_clipboard)
            
            if selected_text and selected_text != original_clipboard:
                # Validate text length and content
                if len(selected_text) < 3:
                    print("Selected text is too short. Please select more text to generate a response for.")
                    return
                
                if len(selected_text) > 2000:
                    print("Selected text is too long. Please select a shorter text to generate a response for.")
                    return
                
                # Save the copied text to clipboard history using thread-safe method
                try:
                    self.clipboard_manager.add_to_history(selected_text)
                except Exception as e:
                    print(f"Failed to add to clipboard history: {e}")
                
                # Start response generation with spinner - use signals for thread safety
                self._generate_with_spinner(selected_text)
            else:
                print("No text selected. Please select text first, then press Ctrl+Alt+G.")
                
        except Exception as e:
            print(f"Error in generate response hotkey: {e}")
    
    def _enhance_with_spinner(self, text: str):
        """Enhance text with spinner feedback"""
        try:
            # Show loading spinner
            self.show_spinner_requested.emit("Loading...")
            
            # Create and start worker thread
            self.floating_spinner.worker = EnhancePromptWorker(text)
            self.floating_spinner.worker.finished.connect(self._on_enhancement_complete)
            self.floating_spinner.worker.error.connect(self._on_enhancement_error)
            self.floating_spinner.worker.start()
            
        except Exception as e:
            print(f"Error starting enhancement: {e}")
            self.hide_spinner_requested.emit()
    
    def _generate_with_spinner(self, text: str):
        """Generate response with spinner feedback"""
        try:
            # Show loading spinner
            self.show_spinner_requested.emit("Generating response...")
            
            # Create and start worker thread
            self.floating_spinner.worker = GenerateResponseWorker(text)
            self.floating_spinner.worker.finished.connect(self._on_generation_complete)
            self.floating_spinner.worker.error.connect(self._on_generation_error)
            self.floating_spinner.worker.start()
            
        except Exception as e:
            print(f"Error starting response generation: {e}")
            self.hide_spinner_requested.emit()
    
    def _on_enhancement_complete(self, result: Dict):
        """Handle successful enhancement completion"""
        try:
            enhanced_text = result.get('enhancedPrompt', '')
            
            if enhanced_text:
                # Show success message
                self.update_spinner_text_requested.emit("Done! Pasting...")
                
                # Copy enhanced text to clipboard
                pyperclip.copy(enhanced_text)
                
                # Small delay to ensure clipboard is updated
                time.sleep(0.2)
                
                # Automatically paste the enhanced text
                keyboard.send('ctrl+v')
                
                # Hide spinner after a short delay
                QTimer.singleShot(1000, lambda: self.hide_spinner_requested.emit())
                
                print("Text enhanced and pasted successfully!")
            else:
                self.update_spinner_text_requested.emit("No result received")
                QTimer.singleShot(2000, lambda: self.hide_spinner_requested.emit())
                print("Failed to enhance text. No result received.")
                
        except Exception as e:
            print(f"Error completing enhancement: {e}")
            self.hide_spinner_requested.emit()
    
    def _on_enhancement_error(self, error_msg: str):
        """Handle enhancement error"""
        try:
            print(f"Enhancement error: {error_msg}")
            self.update_spinner_text_requested.emit("Error occurred")
            QTimer.singleShot(2000, lambda: self.hide_spinner_requested.emit())
        except Exception as e:
            print(f"Error handling enhancement error: {e}")
            self.hide_spinner_requested.emit()
    
    def _on_generation_complete(self, result: Dict):
        """Handle successful response generation completion"""
        try:
            generated_response = result.get('response', '')
            
            if generated_response:
                # Hide spinner first
                self.hide_spinner_requested.emit()
                
                # Show popup with the generated response using signal for thread safety
                self.show_popup_requested.emit("AI Response Generated", generated_response)
                print("Popup signal emitted")
                
                print("Response generated and displayed in popup!")
            else:
                self.update_spinner_text_requested.emit("No result received")
                QTimer.singleShot(2000, lambda: self.hide_spinner_requested.emit())
                print("Failed to generate response. No result received.")
                
        except Exception as e:
            print(f"Error completing response generation: {e}")
            self.hide_spinner_requested.emit()
    
    def _on_generation_error(self, error_msg: str):
        """Handle response generation error"""
        try:
            print(f"Response generation error: {error_msg}")
            self.hide_spinner_requested.emit()
            
            # Show error popup using signal for thread safety
            self.show_popup_requested.emit("AI Response Error", f"Failed to generate AI response.\n\nError: {error_msg}")
            print("Error popup signal emitted")
        except Exception as e:
            print(f"Error handling response generation error: {e}")
            self.hide_spinner_requested.emit()
    
    @pyqtSlot(str)
    def _show_spinner_main_thread(self, text: str):
        """Show spinner in main thread"""
        self.floating_spinner.show_spinner(text)
    
    @pyqtSlot()
    def _hide_spinner_main_thread(self):
        """Hide spinner in main thread"""
        self.floating_spinner.hide_spinner()
    
    @pyqtSlot(str)
    def _update_spinner_text_main_thread(self, text: str):
        """Update spinner text in main thread"""
        self.floating_spinner.update_text(text)
    
    @pyqtSlot(str, str)
    def _show_popup_main_thread(self, title: str, message: str):
        """Show popup in main thread"""
        try:
            print(f"Main thread: About to show popup: {title}")
            popup = show_popup(title=title, message=message)
            if popup:
                print(f"Popup created and shown successfully: {title}")
            else:
                print(f"Failed to create popup: {title}")
        except Exception as e:
            print(f"Error showing popup in main thread: {e}")
            # Fallback: copy to clipboard if it's a response
            if "Response Generated" in title:
                pyperclip.copy(message)
                print("Response copied to clipboard as fallback")
            
    def _enhance_and_replace_text(self, text: str):
        """Legacy method - kept for compatibility"""
        try:
            # Import enhance prompt service
            from core.enhance_prompt import get_enhance_prompt_service
            
            # Get the enhance prompt service
            enhance_service = get_enhance_prompt_service()
            
            # Enhance the prompt
            result = enhance_service.enhance_prompt(text)
            enhanced_text = result.get('enhancedPrompt', '')
            
            if enhanced_text:
                # Copy enhanced text to clipboard
                pyperclip.copy(enhanced_text)
                
                # Small delay to ensure clipboard is updated
                time.sleep(0.1)
                
                # Simulate Ctrl+V to paste the enhanced text
                keyboard.send('ctrl+v')
                
                print(f"Text enhanced and replaced successfully!")
            else:
                print("Failed to enhance text. No enhanced prompt received.")
                
        except Exception as e:
            print(f"Error enhancing text: {e}")
            # Fallback: emit signal for UI-based enhancement
            self.enhance_prompt_requested.emit(text)


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