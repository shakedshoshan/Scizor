# Text-to-Speech API Documentation

## Overview

The Text-to-Speech API allows you to convert text into natural-sounding speech using OpenAI's Speech API. This endpoint supports multiple voices, audio formats, and speed controls.

## Endpoint

```
POST /ai/text-to-speech
```

## Request Body

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `text` | string | Yes | - | The text to convert to speech (max 4096 characters) |
| `voice` | string | No | `alloy` | Voice type to use for speech synthesis |
| `responseFormat` | string | No | `mp3` | Audio format for the response |
| `speed` | number | No | `1` | Speech speed (0.25 to 2.0) |
| `model` | string | No | `tts-1` | TTS model to use |

### Voice Types

- `alloy` - Balanced, natural voice
- `echo` - Clear, professional voice
- `fable` - Warm, friendly voice
- `onyx` - Deep, authoritative voice
- `nova` - Bright, energetic voice
- `shimmer` - Soft, gentle voice

### Response Formats

- `mp3` - MP3 audio format
- `opus` - Opus audio format
- `aac` - AAC audio format
- `flac` - FLAC audio format

### Speed Values

- `0.25` - Very slow
- `0.5` - Slow
- `0.75` - Slightly slow
- `1` - Normal speed
- `1.25` - Slightly fast
- `1.5` - Fast
- `1.75` - Very fast
- `2` - Maximum speed

## Example Request

```json
{
  "text": "Hello, welcome to our text-to-speech service!",
  "voice": "nova",
  "responseFormat": "mp3",
  "speed": 1.2,
  "model": "tts-1"
}
```

## Response

The endpoint returns an audio file with the following headers:

- `Content-Type`: Audio MIME type (e.g., `audio/mpeg` for MP3)
- `Content-Length`: Size of the audio file in bytes
- `Content-Disposition`: `attachment; filename="speech.mp3"`

## Error Responses

### 400 Bad Request
- Invalid text length (exceeds 4096 characters)
- Invalid voice type
- Invalid response format
- Invalid speed value

### 401 Unauthorized
- Invalid OpenAI API key

### 429 Too Many Requests
- OpenAI API rate limit exceeded

### 503 Service Unavailable
- OpenAI service unavailable
- Missing OpenAI package

## Usage Examples

### cURL
```bash
curl -X POST http://localhost:3000/ai/text-to-speech \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, world!",
    "voice": "alloy",
    "responseFormat": "mp3"
  }' \
  --output speech.mp3
```

### JavaScript
```javascript
const response = await fetch('/ai/text-to-speech', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    text: 'Hello, world!',
    voice: 'nova',
    responseFormat: 'mp3',
    speed: 1.1
  })
});

const audioBlob = await response.blob();
const audioUrl = URL.createObjectURL(audioBlob);
```

## Notes

- Maximum text length is 4096 characters
- Audio files are returned as binary data
- The service uses OpenAI's `tts-1` model by default
- All voices are optimized for natural-sounding speech
- Response time depends on text length and server load 