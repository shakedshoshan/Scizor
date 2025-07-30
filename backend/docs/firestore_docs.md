# Auth Module - Firestore API

This module provides a simple POST API to store text data in Firestore.

## API Endpoints

### POST /auth/text

Creates a new text document in the Firestore "text" collection.

**Request Body:**
```json
{
  "user_id": "string",
  "action_type": "enhance" | "respond" | "translate" | "read",
  "text": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Text document created successfully",
  "data": {
    "document_id": "auto-generated-id",
    "user_id": "string",
    "action_type": "string",
    "text": "string"
  }
}
```

## Environment Variables

Add the following to your `.env` file:

```
FIREBASE_PROJECT_ID=your-firebase-project-id
```

## Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Firestore Database
3. Set up authentication (optional for this simple API)
4. Get your project ID and add it to the environment variables

## Usage Example

```bash
curl -X POST http://localhost:3000/auth/text \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "action_type": "enhance",
    "text": "Hello world"
  }'
```

## Data Structure

The API stores documents in the "text" collection with the following structure:

- `user_id`: String - User identifier
- `action_type`: String - One of: "enhance", "respond", "translate", "read"
- `text`: String - The text content
- `created_at`: Timestamp - Server timestamp when document was created
- `updated_at`: Timestamp - Server timestamp when document was last updated 