# Enhance Prompt Feature

## Overview

The Enhance Prompt feature allows users to improve their prompts using AI-powered enhancement. This feature integrates with the backend AI API to provide intelligent prompt optimization.

## Features

### Core Functionality
- **AI-Powered Enhancement**: Uses the backend AI service to enhance prompts
- **Multiple Enhancement Types**: Supports different enhancement styles:
  - General
  - Educational
  - Code
  - Creative
  - Analytical
  - Step-by-Step
  - Fun
- **Context Support**: Add additional context for better enhancement
- **Target Audience**: Specify the intended audience for tailored results
- **Real-time Processing**: Background thread processing with progress indicators

### UI Components

#### Dashboard Panel (`enhance_prompt_panel.py`)
- Compact interface for quick prompt enhancement
- Basic enhancement options
- Copy enhanced prompt to clipboard
- Status indicators

#### Enhanced Panel (`enhanced_enhance_prompt_panel.py`)
- Full-featured interface in the expanded window
- Split-panel layout with input and results
- Tabbed interface for results and history
- Advanced options and better UX
- History tracking
- Save to notes integration (planned)

## API Integration

### Backend Endpoint
- **URL**: `{{baseUrl}}/ai/enhance-prompt`
- **Method**: POST
- **Content-Type**: application/json

### Request Format
```json
{
  "prompt": "Your original prompt",
  "enhancementType": "general",
  "context": "Additional context (optional)",
  "targetAudience": "Target audience (optional)"
}
```

### Response Format
```json
{
  "success": true,
  "data": {
    "enhancedPrompt": "Enhanced version of your prompt",
    "metadata": "Additional information"
  },
  "message": "Prompt enhanced successfully"
}
```

## Usage

### Basic Usage
1. Open the Scizor dashboard
2. Navigate to the "Enhance Prompt" panel
3. Enter your prompt in the text area
4. Select enhancement type (optional)
5. Add context and target audience (optional)
6. Click "Enhance Prompt"
7. Copy the enhanced result to clipboard

### Advanced Usage (Expanded Window)
1. Open the expanded Scizor window
2. Go to the "🚀 AI Prompt Enhancement" tab
3. Use the enhanced interface with:
   - Split-panel layout
   - History tracking
   - Advanced options
   - Better visual feedback

## Configuration

### Backend URL
The feature connects to the backend API at `http://localhost:3000` by default. This can be configured in the `EnhancePromptService` class.

### Enhancement Types
Available enhancement types are defined in the `EnhancementType` enum:

- `GENERAL`: General purpose enhancement
- `EDUCATIONAL`: Educational content optimization
- `CODE`: Code-related prompt enhancement
- `CREATIVE`: Creative writing enhancement
- `ANALYTICAL`: Analytical thinking enhancement
- `STEP_BY_STEP`: Step-by-step instruction enhancement
- `FUN`: Fun and engaging content enhancement

## Error Handling

The feature includes comprehensive error handling:

- **Connection Errors**: Handles backend connectivity issues
- **API Errors**: Processes backend API errors gracefully
- **Validation Errors**: Validates input before sending requests
- **Timeout Handling**: 30-second timeout for API requests
- **User Feedback**: Clear error messages and status updates

## Dependencies

### Required Python Packages
- `requests>=2.31.0`: For HTTP API calls
- `PyQt6>=6.6.0`: For UI components

### Backend Requirements
- Backend server running on configured URL
- AI service properly configured
- Valid API endpoints

## Testing

### Manual Testing
1. Start the backend server
2. Run the desktop application
3. Test the enhance prompt feature
4. Verify API responses

### Automated Testing
Run the test script:
```bash
cd desktop
python test_enhance_prompt.py
```

## Future Enhancements

### Planned Features
- **Save to Notes**: Direct integration with notes system
- **Prompt Templates**: Pre-defined prompt templates
- **Batch Processing**: Enhance multiple prompts at once
- **Custom Enhancement Types**: User-defined enhancement styles
- **Prompt History**: Persistent history storage
- **Export Options**: Export enhanced prompts to various formats

### Integration Opportunities
- **Clipboard Integration**: Auto-enhance clipboard content
- **Hotkey Support**: Quick enhancement shortcuts
- **Voice Input**: Voice-to-prompt enhancement
- **Collaborative Features**: Share enhanced prompts

## Troubleshooting

### Common Issues

1. **Connection Failed**
   - Ensure backend server is running
   - Check backend URL configuration
   - Verify network connectivity

2. **API Errors**
   - Check backend logs for errors
   - Verify API endpoint configuration
   - Ensure proper request format

3. **UI Issues**
   - Restart the desktop application
   - Check PyQt6 installation
   - Verify Python version compatibility

### Debug Mode
Enable debug logging by setting environment variables or modifying the service class to include detailed logging.

## Contributing

When contributing to the enhance prompt feature:

1. Follow the existing code structure
2. Add proper error handling
3. Include unit tests
4. Update documentation
5. Test with different enhancement types
6. Verify UI responsiveness

## License

This feature is part of the Scizor project and follows the same licensing terms. 