#!/usr/bin/env python3
"""
Script to build Windows executable with custom properties
"""

import os
import sys
import subprocess
from pathlib import Path

def create_version_info():
    """Create version info for the executable"""
    version_info = '''# UTF-8
#
# For more details about fixed file info 'ffi' see:
# http://msdn.microsoft.com/en-us/library/ms646997.aspx
VSVersionInfo(
  ffi=FixedFileInfo(
    # filevers and prodvers should be always a tuple with four items: (1, 2, 3, 4)
    # Set not needed items to zero 0.
    filevers=(1, 0, 0, 0),
    prodvers=(1, 0, 0, 0),
    # Contains a bitmask that specifies the valid bits 'flags'r
    mask=0x3f,
    # Contains a bitmask that specifies the Boolean attributes of the file.
    flags=0x0,
    # The operating system for which this file was designed.
    # 0x4 - NT and there is no need to change it.
    OS=0x40004,
    # The general type of file.
    # 0x1 - the file is an application.
    fileType=0x1,
    # The function of the file.
    # 0x0 - the function is not defined for this fileType
    subtype=0x0,
    # Creation date and time stamp.
    date=(0, 0)
    ),
  kids=[
    StringFileInfo(
      [
      StringTable(
        u'040904B0',
        [StringStruct(u'CompanyName', u'Scizor'),
        StringStruct(u'FileDescription', u'Scizor Desktop - AI-powered productivity tool'),
        StringStruct(u'FileVersion', u'1.0.0'),
        StringStruct(u'InternalName', u'scizor_desktop'),
        StringStruct(u'LegalCopyright', u'Copyright (c) 2024 Scizor'),
        StringStruct(u'OriginalFilename', u'ScizorDesktop.exe'),
        StringStruct(u'ProductName', u'Scizor Desktop'),
        StringStruct(u'ProductVersion', u'1.0.0')])
      ]), 
    VarFileInfo([VarStruct(u'Translation', [1033, 1200])])
  ]
)'''
    
    version_file = Path("version_info.txt")
    with open(version_file, 'w', encoding='utf-8') as f:
        f.write(version_info)
    
    return version_file

def build_executable():
    """Build the executable with custom properties"""
    
    # Create version info
    version_file = create_version_info()
    
    # Build command
    cmd = [
        'pyinstaller',
        '--onefile',
        '--windowed',  # No console window
        '--name=ScizorDesktop',
        f'--version-file={version_file}',
        '--icon=src/resources/icons/app_icon.ico',
        '--add-data=src/resources;resources',
        'src/main.py'
    ]
    
    print("Building executable...")
    print(f"Command: {' '.join(cmd)}")
    
    try:
        result = subprocess.run(cmd, check=True, capture_output=True, text=True)
        print("Build successful!")
        print("Executable created in dist/ScizorDesktop.exe")
        
        # Clean up version file
        version_file.unlink()
        
    except subprocess.CalledProcessError as e:
        print(f"Build failed: {e}")
        print(f"Error output: {e.stderr}")
    except FileNotFoundError:
        print("PyInstaller not found. Install it with: pip install pyinstaller")

if __name__ == "__main__":
    build_executable() 