#!/usr/bin/env python3
"""
Reset database settings to ensure authentication panel is visible
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from database.db_connection import get_database
import json

def reset_auth_settings():
    """Reset database settings to show authentication panel"""
    try:
        db = get_database()
        
        # Define the new settings with authentication visible
        settings = {
            'feature_order': [
                'Authentication',
                'Clipboard History',
                'Notes',
                'AI Prompt Enhancement',
                'AI Smart Response'
            ],
            'columns': 1,
            'features_per_column': 2,
            'visibility': {
                'header': True,
                'authentication': True,
                'clipboard_history': True,
                'notes': True,
                'ai_prompt_enhancement': True,
                'ai_smart_response': False
            }
        }
        
        # Save the new settings
        db.save_layout_settings(settings)
        
        print("✅ Database settings reset successfully!")
        print("Authentication panel should now be visible")
        print("Settings saved:")
        print(f"  - Feature order: {settings['feature_order']}")
        print(f"  - Authentication visible: {settings['visibility']['authentication']}")
        
    except Exception as e:
        print(f"❌ Error resetting settings: {e}")

if __name__ == "__main__":
    reset_auth_settings() 