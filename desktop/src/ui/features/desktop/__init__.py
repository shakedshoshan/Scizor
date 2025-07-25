"""
UI Features Package
Contains modular UI components for the Scizor dashboard
"""

from .clipboard_panel import ClipboardPanel
from .notes_panel import NotesPanel
from .header_panel import HeaderPanel

__all__ = [
    'ClipboardPanel',
    'NotesPanel', 
    'HeaderPanel',
] 