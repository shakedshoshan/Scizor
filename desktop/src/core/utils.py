from typing import Dict

def get_authenticated_headers() -> Dict[str, str]:
    """
    Get headers with JWT authentication for API requests
    
    Returns:
        Dictionary containing headers with Authorization and Content-Type
    """
    try:
        from database.db_connection import get_database
        
        # Get current JWT tokens from database
        db = get_database()
        tokens = db.get_current_auth_tokens()
        
        if tokens and tokens.get('access_token'):
            return {
                'Authorization': f"Bearer {tokens['access_token']}",
                'Content-Type': 'application/json'
            }
        else:
            return {}
    except Exception as e:
        print(f"Error getting authenticated headers: {e}")
        return {}
    