#!/usr/bin/env python3
"""
Translate Module
Handles text translation functionality using the backend AI API
"""

import requests
import json
from typing import Dict, Optional, Any


class TranslateService:
    """Service for translating text using the backend AI API"""
    
    def __init__(self, base_url: str = "http://localhost:5000"):
        """
        Initialize the translate service
        
        Args:
            base_url: Base URL for the backend API
        """
        self.base_url = base_url.rstrip('/')
        self.api_endpoint = f"{self.base_url}/ai/translate"
        
    def translate_text(
        self, 
        text: str, 
        to_language: str,
        user_id: str,
    ) -> Dict[str, Any]:
        """
        Translate text to the specified language using the backend AI API
        
        Args:
            text: The text to translate
            to_language: The target language for translation
            user_id: The user ID for the request
            
        Returns:
            Dictionary containing the translated text and metadata
            
        Raises:
            requests.RequestException: If the API request fails
            ValueError: If the response is invalid
        """
        if not text or not text.strip():
            raise ValueError("Text cannot be empty")
            
        if not to_language or not to_language.strip():
            raise ValueError("Target language cannot be empty")
            
        if not user_id or not user_id.strip():
            # Try to resolve user_id from authenticated user
            try:
                from auth.auth_checker import get_authenticated_user
                user_info = get_authenticated_user()
                user_id = (user_info or {}).get('user_id')
            except Exception:
                user_id = None
            if not user_id or not str(user_id).strip():
                raise ValueError("User ID cannot be empty")
            
        # Prepare request payload
        payload = {
            "text": text.strip(),
            "to_language": to_language.strip(),
            "user_id": str(user_id).strip(),
        }
            
        try:
            # Make API request
            response = requests.post(
                self.api_endpoint,
                json=payload,
                headers={
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                timeout=30  # 30 second timeout
            )
            
            # Check for HTTP errors
            response.raise_for_status()
            
            # Parse response
            result = response.json()
            
            # Validate response structure
            if not isinstance(result, dict):
                raise ValueError("Invalid response format")
                
            if not result.get("success"):
                error_msg = result.get("message", "Unknown error")
                raise ValueError(f"API error: {error_msg}")
                
            return result.get("data", {})
            
        except requests.exceptions.Timeout:
            raise requests.RequestException("Request timed out. Please try again.")
        except requests.exceptions.ConnectionError:
            raise requests.RequestException("Could not connect to the backend API. Please check if the server is running.")
        except requests.exceptions.RequestException as e:
            raise requests.RequestException(f"API request failed: {str(e)}")
        except json.JSONDecodeError:
            raise ValueError("Invalid JSON response from API")
            
    def test_connection(self) -> bool:
        """
        Test the connection to the backend API
        
        Returns:
            True if connection is successful, False otherwise
        """
        try:
            health_url = f"{self.base_url}/ai/health"
            response = requests.get(health_url, timeout=5)
            return response.status_code == 200
        except:
            return False


# Global instance for easy access
_translate_service = None


def get_translate_service(base_url: str = "http://localhost:5000") -> TranslateService:
    """
    Get or create the global translate service instance
    
    Args:
        base_url: Base URL for the backend API
        
    Returns:
        TranslateService instance
    """
    global _translate_service
    if _translate_service is None:
        _translate_service = TranslateService(base_url)
    return _translate_service


def translate_text(
    text: str, 
    to_language: str,
    user_id: str,
    base_url: str = "http://localhost:5000",
) -> Dict[str, Any]:
    """
    Convenience function to translate text
    
    Args:
        text: The text to translate
        to_language: The target language for translation
        user_id: The user ID for the request
        base_url: Base URL for the backend API
        
    Returns:
        Dictionary containing the translated text and metadata
    """
    service = get_translate_service(base_url)
    return service.translate_text(
        text, 
        to_language,
        user_id, 
    )
