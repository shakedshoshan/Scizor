#!/usr/bin/env python3
"""
Test script for the hotkey enhance prompt functionality
"""

import sys
import os
import time

# Add the src directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from core.hotkey_manager import get_hotkey_manager, start_hotkey_manager, stop_hotkey_manager

def test_hotkey_enhance():
    """Test the hotkey enhance prompt functionality"""
    print("Testing Hotkey Enhance Prompt Functionality")
    print("=" * 50)
    
    # Get hotkey manager
    hotkey_manager = get_hotkey_manager()
    
    # Connect to the enhance prompt signal (fallback only)
    def on_enhance_prompt_requested(text):
        print(f"⚠️ Fallback triggered! Selected text: '{text}'")
        print("This is the fallback signal when direct enhancement fails.")
    
    hotkey_manager.enhance_prompt_requested.connect(on_enhance_prompt_requested)
    
    # Start hotkey manager
    print("Starting hotkey manager...")
    start_hotkey_manager()
    
    print("\nHotkey Enhance Prompt Test Instructions:")
    print("1. Select some text in any application")
    print("2. Press Ctrl+Alt+H to trigger the enhance prompt hotkey")
    print("3. The selected text should be enhanced and replaced directly")
    print("4. If enhancement fails, a fallback signal will be emitted")
    print("5. Press Ctrl+C to exit this test")
    
    try:
        # Keep the test running
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nStopping hotkey manager...")
        stop_hotkey_manager()
        print("Test completed!")

if __name__ == "__main__":
    test_hotkey_enhance() 