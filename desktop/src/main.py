#!/usr/bin/env python3
"""
Main entry point for the Scizor Desktop Application
"""

import sys
import os

# Add the src directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import ScizorApp

def main():
    """Main function to start the application"""
    app = ScizorApp()
    return app.run()

if __name__ == "__main__":
    sys.exit(main()) 