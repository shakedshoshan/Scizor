#!/usr/bin/env python3
"""
Test script to verify settings window shows all features
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from PyQt6.QtWidgets import QApplication
from ui.setting_window import SettingsWindow

def test_settings_window():
    """Test that settings window shows all features"""
    app = QApplication(sys.argv)
    
    # Create settings window
    settings_window = SettingsWindow()
    
    # Get the features list
    features_list = settings_window.features_list
    
    print("Features found in settings window:")
    for i in range(features_list.count()):
        item = features_list.item(i)
        item_widget = features_list.itemWidget(item)
        if item_widget:
            feature_name = item_widget.feature_name
            enabled = item_widget.is_enabled()
            status = "✓" if enabled else "✗"
            print(f"  {i+1}. {feature_name} {status}")
    
    # Check if all expected features are present
    expected_features = [
        "Clipboard History",
        "Notes", 
        "AI Prompt Enhancement",
        "AI Smart Response"
    ]
    
    found_features = []
    for i in range(features_list.count()):
        item = features_list.item(i)
        item_widget = features_list.itemWidget(item)
        if item_widget:
            found_features.append(item_widget.feature_name)
    
    print(f"\nExpected features: {expected_features}")
    print(f"Found features: {found_features}")
    
    missing_features = [f for f in expected_features if f not in found_features]
    if missing_features:
        print(f"❌ Missing features: {missing_features}")
        return False
    else:
        print("✅ All expected features are present!")
        return True

if __name__ == "__main__":
    success = test_settings_window()
    sys.exit(0 if success else 1) 