# Auth Module API Documentation

This module provides APIs for managing text documents and user tokens in Firestore.

## Text Collection API

### POST /auth/text

Creates a new text document in the Firestore "texts" collection.

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

## User Token Collection API

### POST /auth/user

Creates a new user with 0 tokens in the Firestore "user_token" collection.

**Request Body:**
```json
{
  "user_id": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully with 0 tokens",
  "data": {
    "document_id": "auto-generated-id",
    "user_id": "string",
    "tokens": 0
  }
}
```

**Error Response (User already exists):**
```json
{
  "success": false,
  "message": "User already exists",
  "data": null
}
```

### GET /auth/user/:userId

Retrieves user token information.

**Response (User found):**
```json
{
  "success": true,
  "message": "User token retrieved successfully",
  "data": {
    "user_id": "string",
    "tokens": 0
  }
}
```

**Response (User not found):**
```json
{
  "success": false,
  "message": "User not found",
  "data": null
}
```

## Data Structures

### Text Collection
- `user_id`: String - User identifier
- `action_type`: String - One of: "enhance", "respond", "translate", "read"
- `text`: String - The text content
- `created_at`: Timestamp - Server timestamp when document was created
- `updated_at`: Timestamp - Server timestamp when document was last updated

### User Token Collection
- `user_id`: String - User identifier
- `tokens`: Number - Number of tokens (integer, minimum 0)
- `created_at`: Timestamp - Server timestamp when document was created
- `updated_at`: Timestamp - Server timestamp when document was last updated

## Usage Examples

### Create a text document
```bash
curl -X POST http://localhost:3000/auth/text \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "action_type": "enhance",
    "text": "Hello world"
  }'
```

### Create a new user
```bash
curl -X POST http://localhost:3000/auth/create-user-token \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123"
  }'
```

### Get user token information
```bash
curl -X GET http://localhost:3000/auth/user/user123
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