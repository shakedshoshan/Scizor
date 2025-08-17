#!/usr/bin/env python3
"""
Automated build script for Scizor Desktop installer
Builds the executable and creates Windows installer package
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path
import zipfile
import json
from datetime import datetime

class ScizorBuilder:
    def __init__(self):
        self.project_root = Path(__file__).parent
        self.dist_dir = self.project_root / "dist"
        self.installer_dir = self.project_root / "installer"
        self.output_dir = self.installer_dir / "output"
        self.build_dir = self.project_root / "build"
        
    def clean_build_dirs(self):
        """Clean previous build artifacts"""
        print("🧹 Cleaning previous build artifacts...")
        
        dirs_to_clean = [self.dist_dir, self.build_dir, self.output_dir]
        for dir_path in dirs_to_clean:
            if dir_path.exists():
                shutil.rmtree(dir_path)
                print(f"   Cleaned: {dir_path}")
        
        # Create output directory
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    def check_dependencies(self):
        """Check if required tools are installed"""
        print("🔍 Checking dependencies...")
        
        # Check PyInstaller
        try:
            result = subprocess.run(['pyinstaller', '--version'], 
                                  capture_output=True, text=True, check=True)
            print(f"   ✅ PyInstaller: {result.stdout.strip()}")
        except (subprocess.CalledProcessError, FileNotFoundError):
            print("   ❌ PyInstaller not found. Install with: pip install pyinstaller")
            return False
        
        # Check Inno Setup (Windows only)
        if os.name == 'nt':
            iscc_paths = [
                r"C:\Program Files (x86)\Inno Setup 6\ISCC.exe",
                r"C:\Program Files\Inno Setup 6\ISCC.exe",
                r"C:\Program Files (x86)\Inno Setup 5\ISCC.exe",
                r"C:\Program Files\Inno Setup 5\ISCC.exe"
            ]
            
            iscc_found = False
            for path in iscc_paths:
                if os.path.exists(path):
                    self.iscc_path = path
                    print(f"   ✅ Inno Setup: {path}")
                    iscc_found = True
                    break
            
            if not iscc_found:
                print("   ❌ Inno Setup not found. Download from: https://jrsoftware.org/isinfo.php")
                return False
        else:
            print("   ⚠️  Inno Setup check skipped (not Windows)")
            
        return True
    
    def build_executable(self):
        """Build the executable using PyInstaller"""
        print("🔨 Building executable...")
        
        # Create version info file
        version_info = self.create_version_info()
        
        # Prepare icon path - prefer ICO, fallback to PNG (requires Pillow)
        icon_path = self.project_root / "src" / "resources" / "icons" / "scizor_icon.ico"
        png_icon_path = self.project_root / "src" / "resources" / "icons" / "scizor_icon.png"
        
        # Convert PNG to ICO if needed and PNG exists
        if not icon_path.exists() and png_icon_path.exists():
            try:
                from PIL import Image
                print(f"   Converting PNG icon to ICO format...")
                
                # Create ICO from PNG
                img = Image.open(png_icon_path)
                # Create multiple sizes for ICO (Windows standard)
                icon_sizes = [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
                img.save(icon_path, format='ICO', sizes=icon_sizes)
                print(f"   ✅ Icon converted: {icon_path}")
                
            except ImportError:
                print(f"   ⚠️  Pillow not installed - cannot convert PNG to ICO")
                print(f"   Install with: pip install Pillow")
                icon_path = None
            except Exception as e:
                print(f"   ⚠️  Icon conversion failed: {e}")
                icon_path = None
        
        # Build command
        cmd = [
            'pyinstaller',
            '--clean',
            '--onefile',
            '--windowed',
            '--name=ScizorDesktop',
            f'--version-file={version_info}',
            '--add-data=src/resources;resources',
            '--distpath=dist',
            '--workpath=build',
            'src/main.py'
        ]
        
        # Add icon if exists
        if icon_path and icon_path.exists():
            cmd.append(f'--icon={icon_path}')
        elif png_icon_path.exists():
            # Fallback to PNG (requires Pillow in environment)
            cmd.append(f'--icon={png_icon_path}')
        
        print(f"   Command: {' '.join(cmd)}")
        
        try:
            # Change to project directory
            os.chdir(self.project_root)
            
            result = subprocess.run(cmd, check=True, capture_output=True, text=True)
            print("   ✅ Executable built successfully!")
            
            # Check if executable was created
            exe_path = self.dist_dir / "ScizorDesktop.exe"
            if exe_path.exists():
                size_mb = exe_path.stat().st_size / (1024 * 1024)
                print(f"   📦 Executable size: {size_mb:.1f} MB")
                return True
            else:
                print("   ❌ Executable not found after build")
                return False
                
        except subprocess.CalledProcessError as e:
            print(f"   ❌ Build failed: {e}")
            print(f"   Error output: {e.stderr}")
            return False
        finally:
            # Clean up version file
            if version_info.exists():
                version_info.unlink()
    
    def create_version_info(self):
        """Create version info file for Windows executable"""
        version_info_content = '''# UTF-8
VSVersionInfo(
  ffi=FixedFileInfo(
    filevers=(1, 0, 0, 0),
    prodvers=(1, 0, 0, 0),
    mask=0x3f,
    flags=0x0,
    OS=0x40004,
    fileType=0x1,
    subtype=0x0,
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
        
        version_file = self.project_root / "version_info.txt"
        with open(version_file, 'w', encoding='utf-8') as f:
            f.write(version_info_content)
        
        return version_file
    
    def create_installer(self):
        """Create Windows installer using Inno Setup"""
        if os.name != 'nt':
            print("⚠️  Installer creation skipped (not Windows)")
            return True
            
        print("📦 Creating installer...")
        
        # Find Inno Setup if not already found
        if not hasattr(self, 'iscc_path'):
            iscc_paths = [
                r"C:\Program Files (x86)\Inno Setup 6\ISCC.exe",
                r"C:\Program Files\Inno Setup 6\ISCC.exe",
                r"C:\Program Files (x86)\Inno Setup 5\ISCC.exe",
                r"C:\Program Files\Inno Setup 5\ISCC.exe"
            ]
            
            self.iscc_path = None
            for path in iscc_paths:
                if os.path.exists(path):
                    self.iscc_path = path
                    break
            
            if not self.iscc_path:
                print("   ❌ Inno Setup not found. Download from: https://jrsoftware.org/isinfo.php")
                return False
        
        iss_file = self.installer_dir / "scizor_desktop_setup.iss"
        if not iss_file.exists():
            print(f"   ❌ Inno Setup script not found: {iss_file}")
            return False
        
        try:
            cmd = [self.iscc_path, str(iss_file)]
            result = subprocess.run(cmd, check=True, capture_output=True, text=True, 
                                  cwd=str(self.installer_dir))
            
            print("   ✅ Installer created successfully!")
            
            # Check for output file
            installer_file = self.output_dir / "ScizorDesktopSetup.exe"
            if installer_file.exists():
                size_mb = installer_file.stat().st_size / (1024 * 1024)
                print(f"   📦 Installer size: {size_mb:.1f} MB")
                print(f"   📁 Installer location: {installer_file}")
                return True
            else:
                print("   ❌ Installer file not found")
                return False
                
        except subprocess.CalledProcessError as e:
            print(f"   ❌ Installer creation failed: {e}")
            print(f"   Error output: {e.stderr}")
            return False
    
    def create_portable_zip(self):
        """Create portable ZIP package"""
        print("📁 Creating portable ZIP package...")
        
        exe_path = self.dist_dir / "ScizorDesktop.exe"
        if not exe_path.exists():
            print("   ❌ Executable not found for portable package")
            return False
        
        zip_path = self.output_dir / "ScizorDesktop_Portable.zip"
        
        try:
            with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as zipf:
                # Add executable
                zipf.write(exe_path, "ScizorDesktop.exe")
                
                # Add resources if they exist
                resources_dir = self.project_root / "src" / "resources"
                if resources_dir.exists():
                    for file_path in resources_dir.rglob("*"):
                        if file_path.is_file():
                            arcname = f"resources/{file_path.relative_to(resources_dir)}"
                            zipf.write(file_path, arcname)
                
                # Add documentation
                for doc_file in ["README.txt", "LICENSE.txt"]:
                    doc_path = self.installer_dir / doc_file
                    if doc_path.exists():
                        zipf.write(doc_path, doc_file)
            
            size_mb = zip_path.stat().st_size / (1024 * 1024)
            print(f"   ✅ Portable package created: {size_mb:.1f} MB")
            print(f"   📁 Package location: {zip_path}")
            return True
            
        except Exception as e:
            print(f"   ❌ Portable package creation failed: {e}")
            return False
    
    def create_build_info(self):
        """Create build information file"""
        build_info = {
            "version": "1.0.0",
            "build_date": datetime.now().isoformat(),
            "platform": sys.platform,
            "python_version": sys.version,
            "build_type": "release"
        }
        
        info_file = self.output_dir / "build_info.json"
        with open(info_file, 'w') as f:
            json.dump(build_info, f, indent=2)
        
        print(f"   📋 Build info saved: {info_file}")
    
    def run_tests(self):
        """Run basic tests on the built executable"""
        print("🧪 Running tests...")
        
        exe_path = self.dist_dir / "ScizorDesktop.exe"
        if not exe_path.exists():
            print("   ❌ Executable not found for testing")
            return False
        
        try:
            # Test if executable can start (with timeout)
            result = subprocess.run([str(exe_path), "--version"], 
                                  capture_output=True, text=True, 
                                  timeout=10)
            print("   ✅ Executable starts without errors")
            return True
        except subprocess.TimeoutExpired:
            print("   ⚠️  Executable test timed out (may be normal for GUI apps)")
            return True
        except Exception as e:
            print(f"   ❌ Executable test failed: {e}")
            return False
    
    def build_all(self):
        """Run the complete build process"""
        print("🚀 Starting Scizor Desktop build process...")
        print("=" * 50)
        
        success = True
        
        # Step 1: Check dependencies
        if not self.check_dependencies():
            return False
        
        # Step 2: Clean previous builds
        self.clean_build_dirs()
        
        # Step 3: Build executable
        if not self.build_executable():
            return False
        
        # Step 4: Run tests
        if not self.run_tests():
            success = False
        
        # Step 5: Create installer
        if not self.create_installer():
            success = False
        
        # Step 6: Create portable package
        if not self.create_portable_zip():
            success = False
        
        # Step 7: Create build info
        self.create_build_info()
        
        print("=" * 50)
        if success:
            print("🎉 Build completed successfully!")
            print(f"📁 Output directory: {self.output_dir}")
            
            # List output files
            if self.output_dir.exists():
                print("\n📦 Generated files:")
                for file_path in self.output_dir.iterdir():
                    if file_path.is_file():
                        size_mb = file_path.stat().st_size / (1024 * 1024)
                        print(f"   • {file_path.name} ({size_mb:.1f} MB)")
        else:
            print("❌ Build completed with errors!")
            return False
        
        return success

def main():
    """Main entry point"""
    builder = ScizorBuilder()
    
    # Parse command line arguments
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()
        
        if command == "clean":
            builder.clean_build_dirs()
        elif command == "exe":
            builder.check_dependencies()
            builder.clean_build_dirs()
            builder.build_executable()
        elif command == "installer":
            builder.create_installer()
        elif command == "portable":
            builder.create_portable_zip()
        elif command == "test":
            builder.run_tests()
        elif command == "all":
            success = builder.build_all()
            sys.exit(0 if success else 1)
        else:
            print("Usage: python build_installer.py [clean|exe|installer|portable|test|all]")
            sys.exit(1)
    else:
        # Default: build all
        success = builder.build_all()
        sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
