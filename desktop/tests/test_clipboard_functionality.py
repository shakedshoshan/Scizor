#!/usr/bin/env python3
"""
Test script for clipboard functionality
"""

import sys
import os
import time

# Add the src directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from core.clipboard_manager import get_clipboard_manager, start_clipboard_monitoring, stop_clipboard_monitoring
from database.db_connection import get_database

def test_clipboard_functionality():
    """Test the clipboard functionality"""
    print("Testing clipboard functionality...")
    
    # Get clipboard manager
    clipboard_manager = get_clipboard_manager()
    
    # Start monitoring
    start_clipboard_monitoring()
    print("✓ Clipboard monitoring started")
    
    # Test adding items manually
    test_items = [
        "Test clipboard item 1",
        "Test clipboard item 2", 
        "Test clipboard item 3",
        "Another test item",
        "Final test item"
    ]
    
    print("\nAdding test items to clipboard history...")
    for item in test_items:
        clipboard_manager.add_to_history(item)
        print(f"✓ Added: {item}")
        time.sleep(0.1)  # Small delay
    
    # Get and display history
    print("\nRetrieving clipboard history...")
    history = clipboard_manager.get_clipboard_history()
    print(f"✓ Found {len(history)} items in history:")
    
    for i, item in enumerate(history, 1):
        content = item.get('content', '')
        created_at = item.get('created_at', '')
        print(f"  {i}. {content[:50]}{'...' if len(content) > 50 else ''} ({created_at})")
    
    # Test limit enforcement
    print("\nTesting limit enforcement...")
    for i in range(105):  # Add more than 100 items
        clipboard_manager.add_to_history(f"Limit test item {i+1}")
    
    history_after_limit = clipboard_manager.get_clipboard_history()
    print(f"✓ After adding 105 items, history contains {len(history_after_limit)} items (should be 100 or less)")
    
    # Stop monitoring
    stop_clipboard_monitoring()
    print("✓ Clipboard monitoring stopped")
    
    print("\n✅ Clipboard functionality test completed!")

if __name__ == "__main__":
    test_clipboard_functionality() 