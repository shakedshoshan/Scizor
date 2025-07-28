#!/usr/bin/env python3
"""
Test script to verify notes functionality
"""

import sys
import os

# Add the src directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_notes_functionality():
    """Test the notes functionality"""
    try:
        print("🧪 Testing Notes Functionality")
        print("=" * 40)
        
        # Import the notes manager
        from core import get_notes_manager
        
        # Get the notes manager
        notes_manager = get_notes_manager()
        print("✅ Notes manager initialized")
        
        # Test creating a note
        print("\n📝 Testing note creation...")
        note_id = notes_manager.create_note("Test Note", "This is a test note content", 2)
        if note_id:
            print(f"✅ Note created with ID: {note_id}")
        else:
            print("❌ Failed to create note")
            return False
        
        # Test getting all notes
        print("\n📋 Testing get all notes...")
        notes = notes_manager.get_notes()
        print(f"✅ Retrieved {len(notes)} notes")
        
        # Test getting specific note
        print("\n🔍 Testing get specific note...")
        note = notes_manager.get_note(note_id)
        if note:
            print(f"✅ Retrieved note: {note['title']}")
        else:
            print("❌ Failed to retrieve note")
            return False
        
        # Test updating note
        print("\n✏️ Testing note update...")
        success = notes_manager.update_note(note_id, title="Updated Test Note", priority=3)
        if success:
            print("✅ Note updated successfully")
        else:
            print("❌ Failed to update note")
            return False
        
        # Test searching notes
        print("\n🔎 Testing note search...")
        search_results = notes_manager.search_notes("test")
        print(f"✅ Found {len(search_results)} notes matching 'test'")
        
        # Test getting notes by priority
        print("\n⭐ Testing get notes by priority...")
        priority_notes = notes_manager.get_notes_by_priority(3)
        print(f"✅ Found {len(priority_notes)} notes with priority 3")
        
        # Test deleting note
        print("\n🗑️ Testing note deletion...")
        success = notes_manager.delete_note(note_id)
        if success:
            print("✅ Note deleted successfully")
        else:
            print("❌ Failed to delete note")
            return False
        
        # Verify note is deleted
        remaining_notes = notes_manager.get_notes()
        print(f"✅ Remaining notes: {len(remaining_notes)}")
        
        print("\n🎉 All notes functionality tests passed!")
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_notes_functionality()
    sys.exit(0 if success else 1) 