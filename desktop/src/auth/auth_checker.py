#!/usr/bin/env python3
"""
Standalone authentication checker to avoid circular imports
"""

from typing import Optional, Dict
from database.db_connection import get_database


def get_authenticated_user() -> Optional[Dict]:
    """Check if user is authenticated (returns basic auth status)"""
    try:
        db = get_database()
        
        # Check if we have valid JWT tokens
        if db.is_authenticated():
            print("✅ User is authenticated")
            return {
                'authenticated': True,
                'user_id': 'authenticated_user'  # Generic - no user info stored for security
            }
        
        print("❌ No authenticated user found")
        return None
    except Exception as e:
        print(f"Error checking authentication: {e}")
        return None


def is_authenticated() -> bool:
    """Simple authentication check"""
    try:
        db = get_database()
        return db.is_authenticated()
    except Exception as e:
        print(f"Error checking authentication: {e}")
        return False 