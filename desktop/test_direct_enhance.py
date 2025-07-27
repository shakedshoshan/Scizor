#!/usr/bin/env python3
"""
Test script for the direct enhance prompt functionality
"""

import sys
import os

# Add the src directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from core.hotkey_manager import get_hotkey_manager
from core.enhance_prompt import get_enhance_prompt_service

def test_direct_enhance():
    """Test the direct enhance prompt functionality"""
    print("Testing Direct Enhance Prompt Functionality")
    print("=" * 50)
    
    # Test the enhance prompt service directly
    service = get_enhance_prompt_service()
    
    # Test connection
    print("Testing connection to backend API...")
    if service.test_connection():
        print("✅ Connection successful!")
    else:
        print("❌ Connection failed. Make sure the backend server is running on http://localhost:5000")
        return
    
    # Test direct enhancement
    test_text = "Write a Python function"
    print(f"\nTesting direct enhancement with: '{test_text}'")
    
    try:
        result = service.enhance_prompt(test_text)
        enhanced_text = result.get('enhancedPrompt', '')
        
        if enhanced_text:
            print("✅ Direct enhancement successful!")
            print(f"Original: {test_text}")
            print(f"Enhanced: {enhanced_text}")
        else:
            print("❌ No enhanced text received")
            
    except Exception as e:
        print(f"❌ Direct enhancement failed: {e}")
    
    print("\nTest completed!")

if __name__ == "__main__":
    test_direct_enhance() 