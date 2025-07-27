#!/usr/bin/env python3
"""
Test script for the enhance prompt functionality
"""

import sys
import os

# Add the src directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from core.enhance_prompt import EnhancePromptService, EnhancementType

def test_enhance_prompt():
    """Test the enhance prompt functionality"""
    print("Testing Enhance Prompt Functionality")
    print("=" * 50)
    
    # Create service instance
    service = EnhancePromptService()
    
    # Test connection
    print("Testing connection to backend API...")
    if service.test_connection():
        print("✅ Connection successful!")
    else:
        print("❌ Connection failed. Make sure the backend server is running on http://localhost:3000")
        return
    
    # Test prompt enhancement
    test_prompt = "Write a Python function to sort a list"
    print(f"\nTesting prompt enhancement with: '{test_prompt}'")
    
    try:
        result = service.enhance_prompt(
            prompt=test_prompt,
            enhancement_type=EnhancementType.CODE,
            context="For educational purposes",
            target_audience="Python beginners"
        )
        
        print("✅ Enhancement successful!")
        print(f"Enhanced prompt: {result.get('enhancedPrompt', 'No enhanced prompt received')}")
        
    except Exception as e:
        print(f"❌ Enhancement failed: {e}")
    
    print("\nTest completed!")

if __name__ == "__main__":
    test_enhance_prompt() 