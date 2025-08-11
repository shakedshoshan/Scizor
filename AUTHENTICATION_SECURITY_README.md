# Scizor Authentication Security Documentation

## Overview

This document outlines the secure authentication flow implemented between the Scizor web application and desktop application, using industry-standard security practices including PKCE (Proof Key for Code Exchange) and JWT tokens.

## Architecture

```
Desktop App → Web App → Backend API → Desktop App
     ↓           ↓         ↓           ↓
  PKCE Gen   Firebase   JWT Gen    Token Exch
  Browser    Auth      Consent    Access Token
```

## Security Features

### 1. PKCE (Proof Key for Code Exchange)
- **Purpose**: Prevents authorization code interception attacks
- **Implementation**: 
  - Desktop app generates random `code_verifier` (32+ characters)
  - SHA256 hash of `code_verifier` creates `code_challenge`
  - Backend validates `code_verifier` against stored `code_challenge`
  - One-time use challenges with 10-minute expiration

### 2. JWT Security
- **Algorithm**: HS256 (HMAC with SHA-256)
- **Secret**: Environment variable with minimum 32 characters
- **Token Types**:
  - **Consent Token**: 10 minutes, includes PKCE challenge
  - **Access Token**: 1 hour, for API requests
  - **Refresh Token**: 7 days, for token renewal

### 3. Rate Limiting
- **Window**: 15 minutes
- **Limit**: 100 requests per window
- **Headers**: X-RateLimit-* headers for client awareness
- **Protection**: Prevents brute force and DDoS attacks

### 4. CORS Security
- **Origins**: Whitelisted domains only
- **Credentials**: Enabled for authenticated requests
- **Methods**: Restricted to necessary HTTP methods
- **Headers**: Controlled header exposure

## Authentication Flow

### Step 1: Desktop App Initialization
```python
# Generate PKCE parameters
code_verifier = base64.urlsafe_b64encode(secrets.token_bytes(32)).decode('utf-8').rstrip('=')
code_challenge = base64.urlsafe_b64encode(hashlib.sha256(code_verifier.encode('utf-8')).digest()).decode('utf-8').rstrip('=')

# Store code_verifier securely (in memory for this session)
self.code_verifier = code_verifier
```

### Step 2: Browser Authentication
```
GET /auth?client_id=scizor-desktop-app&code_challenge={challenge}&code_challenge_method=S256&redirect_uri=http://localhost:8080/callback&state={random_state}
```

### Step 3: User Consent
- User signs in with Firebase
- Redirected to consent page with PKCE parameters
- User grants permission
- Backend generates JWT consent token with embedded PKCE challenge

### Step 4: Token Exchange
```python
# Desktop app sends consent token with code_verifier
response = requests.post('/auth/device/token', json={
    'consent_token': consent_token,
    'code_verifier': self.code_verifier,
    'redirect_uri': 'http://localhost:8080/callback'
})
```

### Step 5: Backend Validation
```typescript
// Validate PKCE challenge
if (decoded.codeChallenge) {
  if (!this.validatePKCEChallenge(decoded.codeChallenge, deviceTokenDto.code_verifier)) {
    throw new UnauthorizedException('Invalid PKCE challenge');
  }
}

// Generate access and refresh tokens
const accessToken = this.generateAccessToken(userId);
const refreshToken = this.generateRefreshToken(userId);
```

## Security Measures

### 1. Environment Variables
```bash
# Required environment variables
JWT_SECRET=your-super-secure-jwt-secret-key-here-minimum-32-characters
SESSION_SECRET=your-super-secure-session-secret-here

# Optional but recommended
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGIN=http://localhost:3000,http://localhost:8080
```

### 2. Token Storage
- **Desktop App**: Encrypted local storage
- **Web App**: Firebase Auth (secure by default)
- **Backend**: In-memory PKCE challenges (Redis recommended for production)

### 3. Input Validation
- **DTOs**: Class-validator decorators
- **Sanitization**: Input sanitization and validation
- **Type Safety**: TypeScript strict mode enabled

### 4. Error Handling
- **Generic Errors**: No sensitive information in error messages
- **Logging**: Secure logging without exposing secrets
- **Rate Limiting**: Graceful degradation under attack

## Production Considerations

### 1. Database Storage
```typescript
// Replace in-memory PKCE storage with Redis
@Injectable()
export class PKCEStoreService {
  async storeChallenge(challenge: string, verifier: string): Promise<void> {
    await this.redis.setex(`pkce:${challenge}`, 600, verifier);
  }
  
  async validateChallenge(challenge: string, verifier: string): Promise<boolean> {
    const stored = await this.redis.get(`pkce:${challenge}`);
    if (stored === verifier) {
      await this.redis.del(`pkce:${challenge}`);
      return true;
    }
    return false;
  }
}
```

### 2. HTTPS Enforcement
```typescript
// Force HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

### 3. Monitoring and Alerting
- **Rate Limit Violations**: Alert on suspicious patterns
- **Failed Authentication**: Monitor for brute force attempts
- **Token Usage**: Track unusual token patterns

## Testing Security

### 1. PKCE Validation Tests
```typescript
describe('PKCE Security', () => {
  it('should reject requests without code_verifier', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/device/token')
      .send({ consent_token: 'valid-token' });
    
    expect(response.status).toBe(400);
  });
  
  it('should reject invalid code_verifier', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/device/token')
      .send({ 
        consent_token: 'valid-token',
        code_verifier: 'invalid-verifier',
        redirect_uri: 'http://localhost:8080/callback'
      });
    
    expect(response.status).toBe(401);
  });
});
```

### 2. Rate Limiting Tests
```typescript
describe('Rate Limiting', () => {
  it('should block requests after limit exceeded', async () => {
    // Make 100 requests
    for (let i = 0; i < 100; i++) {
      await request(app.getHttpServer())
        .post('/auth/consent-token')
        .send({ userId: 'test', userEmail: 'test@example.com' });
    }
    
    // 101st request should be blocked
    const response = await request(app.getHttpServer())
      .post('/auth/consent-token')
      .send({ userId: 'test', userEmail: 'test@example.com' });
    
    expect(response.status).toBe(429);
  });
});
```

## Common Security Issues and Solutions

### 1. JWT Secret Exposure
**Problem**: Weak or exposed JWT secrets
**Solution**: 
- Use strong, randomly generated secrets (64+ characters)
- Store in environment variables only
- Rotate secrets regularly

### 2. PKCE Implementation Errors
**Problem**: Incorrect PKCE implementation
**Solution**:
- Use cryptographically secure random generators
- Validate code_verifier length (32-128 characters)
- Implement proper challenge expiration

### 3. Rate Limiting Bypass
**Problem**: Rate limiting can be bypassed
**Solution**:
- Use multiple identifiers (IP + User ID)
- Implement progressive delays
- Monitor for suspicious patterns

### 4. CORS Misconfiguration
**Problem**: Overly permissive CORS settings
**Solution**:
- Whitelist only necessary origins
- Restrict HTTP methods
- Validate credentials properly

## Compliance and Standards

### 1. OAuth 2.0 Compliance
- **RFC 6749**: OAuth 2.0 Authorization Framework
- **RFC 7636**: PKCE Extension
- **RFC 6819**: OAuth 2.0 Threat Model

### 2. Security Headers
- **HSTS**: HTTP Strict Transport Security
- **CSP**: Content Security Policy
- **X-Frame-Options**: Clickjacking protection
- **X-Content-Type-Options**: MIME type sniffing protection

### 3. Data Protection
- **GDPR**: User consent and data handling
- **CCPA**: California Consumer Privacy Act
- **SOC 2**: Security controls and monitoring

## Incident Response

### 1. Security Breach Response
1. **Immediate**: Revoke all affected tokens
2. **Investigation**: Analyze logs and identify scope
3. **Notification**: Inform affected users
4. **Recovery**: Implement additional security measures

### 2. Token Compromise
1. **Detection**: Monitor for unusual token usage
2. **Response**: Immediate token revocation
3. **Investigation**: Identify compromise vector
4. **Prevention**: Implement additional safeguards

## Conclusion

This authentication system implements industry-standard security practices to protect user accounts and data. The PKCE flow ensures secure authorization code exchange, while JWT tokens provide secure session management. Rate limiting and input validation protect against common attack vectors.

For production deployment, ensure all environment variables are properly set, HTTPS is enforced, and monitoring is in place to detect and respond to security incidents.
