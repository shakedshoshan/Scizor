#!/usr/bin/env python3
"""
Standalone authentication checker to avoid circular imports
"""

from typing import Optional, Dict
from database.db_connection import get_database
from auth.device_auth import DeviceAuthManager


def get_authenticated_user() -> Optional[Dict]:
    """Get the currently authenticated user from the database"""
    try:
        db = get_database()
        auth_manager = DeviceAuthManager()
        
        # First check database for authenticated user
        user_info = db.get_current_authenticated_user()
        if user_info:
            print(f"✅ Found authenticated user in database: {user_info.get('email', 'Unknown')}")
            return user_info
        
        # Fallback: check auth manager
        if auth_manager.is_authenticated():
            # Try to get user info by user_id from auth manager
            if auth_manager.user_id:
                user_info = db.get_user_info(auth_manager.user_id)
                if user_info:
                    print(f"✅ Found user by auth manager user_id: {user_info.get('email', 'Unknown')}")
                    return user_info
                
                # Last fallback: create basic user info from auth manager
                print(f"✅ Using auth manager user_id: {auth_manager.user_id}")
                return {
                    'user_id': auth_manager.user_id,
                    'email': 'Unknown',
                    'name': 'Unknown'
                }
        
        print("❌ No authenticated user found")
        return None
    except Exception as e:
        print(f"Error getting authenticated user: {e}")
        return None 