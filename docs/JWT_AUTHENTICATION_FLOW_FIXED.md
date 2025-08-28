# JWT Authentication Flow - Fixed Implementation

## Overview

The JWT authentication flow has been completely fixed to ensure that all API calls from the desktop application are properly authenticated with JWT tokens obtained from the website authorization flow.

## Authentication Flow

### 1. Website Authorization (OAuth2 + PKCE)

1. **User Authentication**: User signs in via website at `/auth/device`
   - Email/password authentication
   - Google OAuth authentication
   - Extracts PKCE parameters from URL (`code_challenge`, etc.)

2. **Consent Flow**: User grants permission at `/auth/device/consent`
   - Displays app permissions and user information
   - Validates PKCE challenge
   - Generates JWT consent token with embedded PKCE challenge

3. **Token Generation**: Backend `/auth/consent-token` endpoint
   - Creates JWT consent token containing:
     - User ID, email, name
     - PKCE challenge for validation
     - Token type: 'consent'
     - 10-minute expiration

### 2. Desktop Application Token Exchange

1. **Manual Token Input**: User copies consent token from website to desktop app

2. **Token Exchange**: Desktop calls `/auth/device/token` with:
   - `consent_token`: JWT from website
   - `code_verifier`: PKCE verifier
   - `redirect_uri`: Desktop callback URI

3. **PKCE Validation**: Backend verifies:
   - JWT signature and expiration
   - PKCE challenge matches verifier
   - Token type is 'consent'

4. **Access Token Generation**: Backend returns:
   - `access_token`: JWT with 1-hour expiration
   - `refresh_token`: JWT with 7-day expiration
   - `user_id`: Authenticated user ID
   - `expires_in`: Token expiration time

### 3. Authenticated API Requests

All API requests to `/ai/*` endpoints now include:

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

## Fixed Components

### Backend (`backend/src/`)

#### 1. Auth Controller (`auth/auth.controller.ts`)
- ✅ JWT consent token generation with PKCE
- ✅ Device token exchange with PKCE validation
- ✅ Token refresh functionality

#### 2. Auth Service (`auth/auth.service.ts`)
- ✅ JWT token generation and verification
- ✅ PKCE challenge validation
- ✅ Access token validation for API requests

#### 3. JWT Guard (`auth/guards/jwt-auth.guard.ts`)
- ✅ Extracts Bearer token from Authorization header
- ✅ Validates JWT signature and expiration
- ✅ Attaches user info to request object

#### 4. AI Controller (`ai/ai.controller.ts`)
- ✅ Individual endpoint authentication with `@UseGuards(JwtAuthGuard)`
- ✅ Public health endpoint (no authentication required)
- ✅ All protected endpoints: enhance-prompt, generate-response, text-to-speech, translate

### Desktop Application (`desktop/src/`)

#### 1. Device Auth Manager (`auth/device_auth.py`)
- ✅ PKCE parameter generation
- ✅ JWT consent token processing
- ✅ Token exchange with backend
- ✅ Token storage and refresh
- ✅ Authenticated request headers

#### 2. Core Services (Updated for JWT)
- ✅ **Enhance Prompt** (`core/enhance_prompt.py`): JWT authentication added
- ✅ **Generate Response** (`core/generate_response.py`): JWT authentication added  
- ✅ **Translate** (`core/translate.py`): JWT authentication added
- ✅ **Text-to-Speech** (`core/text_to_speech.py`): JWT authentication added

Each service now includes:
- `_get_authenticated_headers()` method
- Authentication check before API calls
- Proper error handling for authentication failures

### Website (`scizor-website/src/`)

#### 1. Device Auth Page (`app/auth/device/page.tsx`)
- ✅ PKCE parameter extraction from URL
- ✅ User authentication (email/password + Google)
- ✅ Redirect to consent page with user info

#### 2. Consent Page (`app/auth/device/consent/page.tsx`)
- ✅ JWT consent token generation with PKCE
- ✅ Token display and copy functionality
- ✅ PKCE challenge validation

#### 3. Consent Token Hook (`hooks/useConsentToken.ts`)
- ✅ Backend communication for consent token generation
- ✅ PKCE challenge embedding

## API Endpoints Protection

### Protected Endpoints (Require JWT)
- `POST /ai/enhance-prompt`
- `POST /ai/generate-response` 
- `POST /ai/text-to-speech`
- `POST /ai/translate`
- `GET /auth/user/:userId`

### Public Endpoints (No Authentication)
- `GET /ai/health`
- `POST /auth/consent-token`
- `POST /auth/device/token`
- `POST /auth/device/refresh`
- `POST /auth/create-user-token`

## Error Handling

### Authentication Errors
- **401 Unauthorized**: Invalid or expired JWT token
- **403 Forbidden**: Valid token but insufficient permissions
- **400 Bad Request**: Missing or malformed authentication data

### Desktop Error Messages
- "Authentication required. Please sign in first."
- "Invalid or expired token"
- "Failed to get authentication headers"

## Testing

### Test Script (`desktop/test_auth_flow.py`)
Run the test script to verify:
```bash
cd desktop
python test_auth_flow.py
```

Tests include:
- Authentication status check
- JWT header availability
- Health endpoint accessibility
- All authenticated API endpoints

### Manual Testing Steps

1. **Start Backend**: Ensure backend is running with proper JWT_SECRET
2. **Open Website**: Navigate to auth flow with PKCE parameters
3. **Authenticate**: Sign in and grant consent
4. **Copy Token**: Copy JWT consent token to desktop app
5. **Exchange Token**: Desktop exchanges for access token
6. **Test APIs**: All core features should work with JWT authentication

## Security Features

### PKCE (Proof Key for Code Exchange)
- Prevents authorization code interception attacks
- Code verifier and challenge validation
- Secure random generation

### JWT Security
- HS256 algorithm for token signing
- Short-lived access tokens (1 hour)
- Longer refresh tokens (7 days)
- Token type validation

### Request Security
- Bearer token authentication
- HTTPS enforcement (in production)
- CORS configuration
- Rate limiting (existing middleware)

## Environment Variables

Ensure these are set in your backend:

```env
JWT_SECRET=your-very-secure-secret-key-minimum-32-characters
```

## Summary

The authentication flow is now complete and secure:

1. ✅ **Website generates JWT consent tokens** with PKCE security
2. ✅ **Desktop exchanges consent tokens** for access tokens
3. ✅ **All API calls use JWT authentication** with Bearer tokens
4. ✅ **Backend validates all requests** with JWT guard
5. ✅ **Proper error handling** for authentication failures
6. ✅ **Test coverage** for the complete flow

Users can now seamlessly authenticate via the website and use all desktop features with proper JWT-based API authorization.
