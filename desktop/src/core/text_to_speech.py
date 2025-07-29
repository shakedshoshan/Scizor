"""
text-to-speech.py - Text-to-Speech Module

This module provides text-to-speech functionality by calling the backend API.
It handles converting text to speech and playing the generated audio.
"""

import os
import tempfile
import requests
import json
from typing import Optional, Dict, Any
import pygame
import threading
from pathlib import Path


class TextToSpeech:
    """
    Text-to-Speech service that converts text to speech using the backend API
    and plays the generated audio.
    """
    
    def __init__(self, base_url: str = "http://localhost:5000"):
        """
        Initialize the Text-to-Speech service.
        
        Args:
            base_url (str): Base URL of the backend API
        """
        self.base_url = base_url.rstrip('/')
        self.api_endpoint = f"{self.base_url}/ai/text-to-speech"
        self.temp_dir = Path(tempfile.gettempdir()) / "scizor_tts"
        self.temp_dir.mkdir(exist_ok=True)
        
        # Initialize pygame mixer for audio playback
        try:
            pygame.mixer.init()
        except Exception as e:
            print(f"Warning: Could not initialize pygame mixer: {e}")
    
    def convert_text_to_speech(
        self,
        text: str,
        voice: str = "alloy",
        response_format: str = "mp3",
        speed: float = 1.0,
        model: str = "tts-1"
    ) -> Optional[bytes]:
        """
        Convert text to speech using the backend API.
        
        Args:
            text (str): Text to convert to speech
            voice (str): Voice type (alloy, echo, fable, onyx, nova, shimmer)
            response_format (str): Audio format (mp3, opus, aac, flac)
            speed (float): Speech speed (0.25 to 2.0)
            model (str): TTS model to use
            
        Returns:
            Optional[bytes]: Audio data as bytes, or None if failed
        """
        try:
            # Prepare request payload
            payload = {
                "text": text,
                "voice": voice,
                "responseFormat": response_format,
                "speed": speed,
                "model": model
            }
            
            # Make API request
            response = requests.post(
                self.api_endpoint,
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            if response.status_code == 200:
                return response.content
            else:
                print(f"Error: API returned status code {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"Error details: {error_data}")
                except:
                    print(f"Error response: {response.text}")
                return None
                
        except requests.exceptions.RequestException as e:
            print(f"Network error: {e}")
            return None
        except Exception as e:
            print(f"Unexpected error: {e}")
            return None
    
    def save_audio_to_file(self, audio_data: bytes, filename: str = None) -> Optional[str]:
        """
        Save audio data to a temporary file.
        
        Args:
            audio_data (bytes): Audio data to save
            filename (str): Optional filename, will generate one if not provided
            
        Returns:
            Optional[str]: Path to the saved audio file, or None if failed
        """
        try:
            if filename is None:
                filename = f"speech_{hash(audio_data) % 10000}.mp3"
            
            file_path = self.temp_dir / filename
            
            with open(file_path, 'wb') as f:
                f.write(audio_data)
            
            return str(file_path)
        except Exception as e:
            print(f"Error saving audio file: {e}")
            return None
    
    def play_audio(self, audio_file_path: str) -> bool:
        """
        Play audio file using pygame.
        
        Args:
            audio_file_path (str): Path to the audio file to play
            
        Returns:
            bool: True if playback started successfully, False otherwise
        """
        try:
            if not pygame.mixer.get_init():
                pygame.mixer.init()
            
            pygame.mixer.music.load(audio_file_path)
            pygame.mixer.music.play()
            return True
        except Exception as e:
            print(f"Error playing audio: {e}")
            return False
    
    def play_audio_async(self, audio_file_path: str) -> threading.Thread:
        """
        Play audio file asynchronously in a separate thread.
        
        Args:
            audio_file_path (str): Path to the audio file to play
            
        Returns:
            threading.Thread: Thread object running the audio playback
        """
        def play_thread():
            try:
                if not pygame.mixer.get_init():
                    pygame.mixer.init()
                
                pygame.mixer.music.load(audio_file_path)
                pygame.mixer.music.play()
                
                # Wait for playback to complete
                while pygame.mixer.music.get_busy():
                    pygame.time.Clock().tick(10)
                    
            except Exception as e:
                print(f"Error in audio playback thread: {e}")
        
        thread = threading.Thread(target=play_thread, daemon=True)
        thread.start()
        return thread
    
    def stop_audio(self):
        """Stop currently playing audio."""
        try:
            if pygame.mixer.get_init():
                pygame.mixer.music.stop()
        except Exception as e:
            print(f"Error stopping audio: {e}")
    
    def is_playing(self) -> bool:
        """
        Check if audio is currently playing.
        
        Returns:
            bool: True if audio is playing, False otherwise
        """
        try:
            return pygame.mixer.get_init() and pygame.mixer.music.get_busy()
        except:
            return False
    
    def text_to_speech_and_play(
        self,
        text: str,
        voice: str = "alloy",
        response_format: str = "mp3",
        speed: float = 1.0,
        model: str = "tts-1",
        async_playback: bool = True
    ) -> Optional[threading.Thread]:
        """
        Convert text to speech and play it immediately.
        
        Args:
            text (str): Text to convert to speech
            voice (str): Voice type
            response_format (str): Audio format
            speed (float): Speech speed
            model (str): TTS model
            async_playback (bool): Whether to play audio asynchronously
            
        Returns:
            Optional[threading.Thread]: Thread object if async_playback is True, None otherwise
        """
        # Convert text to speech
        audio_data = self.convert_text_to_speech(text, voice, response_format, speed, model)
        
        if audio_data is None:
            print("Failed to convert text to speech")
            return None
        
        # Save audio to file
        audio_file_path = self.save_audio_to_file(audio_data)
        
        if audio_file_path is None:
            print("Failed to save audio file")
            return None
        
        # Play audio
        if async_playback:
            return self.play_audio_async(audio_file_path)
        else:
            success = self.play_audio(audio_file_path)
            return None if success else None
    
    def cleanup_temp_files(self):
        """Clean up temporary audio files."""
        try:
            for file_path in self.temp_dir.glob("*"):
                if file_path.is_file():
                    file_path.unlink()
        except Exception as e:
            print(f"Error cleaning up temp files: {e}")
    
    def get_available_voices(self) -> Dict[str, str]:
        """
        Get available voice types and their descriptions.
        
        Returns:
            Dict[str, str]: Dictionary mapping voice types to descriptions
        """
        return {
            "alloy": "Balanced, natural voice",
            "echo": "Clear, professional voice", 
            "fable": "Warm, friendly voice",
            "onyx": "Deep, authoritative voice",
            "nova": "Bright, energetic voice",
            "shimmer": "Soft, gentle voice"
        }
    
    def get_available_formats(self) -> Dict[str, str]:
        """
        Get available audio formats and their descriptions.
        
        Returns:
            Dict[str, str]: Dictionary mapping formats to descriptions
        """
        return {
            "mp3": "MP3 audio format (most compatible)",
            "opus": "Opus audio format (good compression)",
            "aac": "AAC audio format (high quality)",
            "flac": "FLAC audio format (lossless)"
        }
    
    def test_connection(self) -> bool:
        """
        Test the connection to the backend API.
        
        Returns:
            bool: True if connection is successful, False otherwise
        """
        try:
            response = requests.get(f"{self.base_url}/ai/health", timeout=5)
            return response.status_code == 200
        except:
            return False


# Convenience function for quick text-to-speech
def speak_text(
    text: str,
    voice: str = "alloy",
    base_url: str = "http://localhost:5000",
    async_playback: bool = True
) -> Optional[threading.Thread]:
    """
    Quick function to convert text to speech and play it.
    
    Args:
        text (str): Text to convert to speech
        voice (str): Voice type to use
        base_url (str): Backend API base URL
        async_playback (bool): Whether to play audio asynchronously
        
    Returns:
        Optional[threading.Thread]: Thread object if async_playback is True, None otherwise
    """
    tts = TextToSpeech(base_url)
    return tts.text_to_speech_and_play(text, voice, async_playback=async_playback)


