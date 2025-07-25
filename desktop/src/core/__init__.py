#!/usr/bin/env python3
"""
Core Package
Core business logic modules for Scizor
"""

from .notes import NoteManager

# Global notes manager instance
_notes_manager_instance = None

def get_notes_manager() -> NoteManager:
    """Get the global notes manager instance"""
    global _notes_manager_instance
    if _notes_manager_instance is None:
        _notes_manager_instance = NoteManager()
    return _notes_manager_instance

__all__ = [
    'NoteManager',
    'get_notes_manager',
] 