#!/usr/bin/env python3
"""
Generate Response Module
Handles AI response generation functionality using the backend AI API
"""

import requests
import json
from typing import Dict, Optional, Any
from enum import Enum


class ResponseType(Enum):
    """Response types supported by the API"""
    GENERAL = "general"
    EDUCATIONAL = "educational"
    CODE = "code"
    CREATIVE = "creative"
    ANALYTICAL = "analytical"
    STEP_BY_STEP = "step-by-step"
    FUN = "fun"


class GenerateResponseService:
    """Service for generating AI responses using the backend AI API"""
    
    def __init__(self, base_url: str = "http://localhost:5000"):
        """
        Initialize the generate response service
        
        Args:
            base_url: Base URL for the backend API
        """
        self.base_url = base_url.rstrip('/')
        self.api_endpoint = f"{self.base_url}/ai/generate-response"
        
    def generate_response(
        self, 
        content: str, 
    ) -> Dict[str, Any]:
        """
        Generate an AI response using the backend AI API
        
        Args:
            content: The content to generate a response for
            
        Returns:
            Dictionary containing the generated response and metadata
            
        Raises:
            requests.RequestException: If the API request fails
            ValueError: If the response is invalid
        """
        if not content or not content.strip():
            raise ValueError("content cannot be empty")
            
        # Prepare request payload
        payload = {
            "content": content.strip(),
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
_generate_response_service = None


def get_generate_response_service(base_url: str = "http://localhost:5000") -> GenerateResponseService:
    """
    Get or create the global generate response service instance
    
    Args:
        base_url: Base URL for the backend API
        
    Returns:
        GenerateResponseService instance
    """
    global _generate_response_service
    if _generate_response_service is None:
        _generate_response_service = GenerateResponseService(base_url)
    return _generate_response_service


def generate_response(
    prompt: str, 
    base_url: str = "http://localhost:5000"
) -> Dict[str, Any]:
    """
    Convenience function to generate an AI response
    
    Args:
        prompt: The prompt to generate a response for
        base_url: Base URL for the backend API
        
    Returns:
        Dictionary containing the generated response and metadata
    """
    service = get_generate_response_service(base_url)
    return service.generate_response(prompt) 