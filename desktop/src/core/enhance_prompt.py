#!/usr/bin/env python3
"""
Enhance Prompt Module
Handles prompt enhancement functionality using the backend AI API
"""

import requests
import json
from typing import Dict, Optional, Any
from enum import Enum


class EnhancementType(Enum):
    """Enhancement types supported by the API"""
    GENERAL = "general"
    EDUCATIONAL = "educational"
    CODE = "code"
    CREATIVE = "creative"
    ANALYTICAL = "analytical"
    STEP_BY_STEP = "step-by-step"
    FUN = "fun"


class EnhancePromptService:
    """Service for enhancing prompts using the backend AI API"""
    
    def __init__(self, base_url: str = "https://uicah08f3a.execute-api.us-east-1.amazonaws.com/prod"):
        """
        Initialize the enhance prompt service
        
        Args:
            base_url: Base URL for the backend API
        """
        self.base_url = base_url.rstrip('/')
        self.api_endpoint = f"{self.base_url}/ai/enhance-prompt"
        
    def enhance_prompt(
        self, 
        prompt: str, 
        user_id: str,
    ) -> Dict[str, Any]:
        """
        Enhance a prompt using the backend AI API
        
        Args:
            prompt: The original prompt to enhance
            user_id: The user ID for the request
            
        Returns:
            Dictionary containing the enhanced prompt and metadata
            
        Raises:
            requests.RequestException: If the API request fails
            ValueError: If the response is invalid
        """
        if not prompt or not prompt.strip():
            raise ValueError("Prompt cannot be empty")
            
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
            "prompt": prompt.strip(),
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
_enhance_prompt_service = None


def get_enhance_prompt_service(base_url: str = "https://uicah08f3a.execute-api.us-east-1.amazonaws.com/prod") -> EnhancePromptService:
    """
    Get or create the global enhance prompt service instance
    
    Args:
        base_url: Base URL for the backend API
        
    Returns:
        EnhancePromptService instance
    """
    global _enhance_prompt_service
    if _enhance_prompt_service is None:
        _enhance_prompt_service = EnhancePromptService(base_url)
    return _enhance_prompt_service


def enhance_prompt(
    prompt: str, 
    user_id: str,
    base_url: str = "https://uicah08f3a.execute-api.us-east-1.amazonaws.com/prod",
) -> Dict[str, Any]:
    """
    Convenience function to enhance a prompt
    
    Args:
        prompt: The original prompt to enhance
        user_id: The user ID for the request
        base_url: Base URL for the backend API
        
    Returns:
        Dictionary containing the enhanced prompt and metadata
    """
    service = get_enhance_prompt_service(base_url)
    return service.enhance_prompt(
        prompt, 
        user_id, 
    )
