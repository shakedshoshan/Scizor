# Firebase Authentication Setup

This guide will help you set up Firebase Authentication for your Scizor website.

## Prerequisites

1. A Firebase project (you already have one: `scizor-96416`)
2. Firebase Authentication enabled in your project

## Setup Steps

### 1. Get Firebase Configuration

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`scizor-96416`)
3. Click on the gear icon (⚙️) next to "Project Overview" to open Project Settings
4. Scroll down to the "Your apps" section
5. Click on the web app icon (</>) to add a web app if you haven't already
6. Register your app with a nickname (e.g., "Scizor Website")
7. Copy the configuration object

### 2. Configure Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_PROJECT_ID=scizor-96416
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
```

Replace the values with the actual values from your Firebase configuration.

### 3. Enable Authentication Providers

1. In the Firebase Console, go to "Authentication" in the left sidebar
2. Click on "Get started" if you haven't set up Authentication yet
3. Go to the "Sign-in method" tab
4. Enable the providers you want to use:
   - **Google**: Click on Google and enable it
   - **Email/Password**: Click on Email/Password and enable it

### 4. Configure Google Sign-In (Optional)

If you want to use Google Sign-In:

1. In the Firebase Console, go to Authentication > Sign-in method
2. Click on Google provider
3. Enable it and add your authorized domain (localhost for development)
4. You may need to configure OAuth consent screen in Google Cloud Console

### 5. Test the Authentication

1. Run your development server: `npm run dev`
2. Navigate to `http://localhost:3000/auth`
3. Test the sign-in flow

## Features

- **Google Sign-In**: Users can sign in with their Google account
- **Email/Password**: Users can create accounts with email and password
- **Protected Routes**: The dashboard is protected and requires authentication
- **User Profile**: Shows user information and profile picture
- **Sign Out**: Users can sign out from the dashboard

## File Structure

```
src/
├── lib/
│   └── firebase.ts          # Firebase configuration
├── contexts/
│   └── AuthContext.tsx      # Authentication context
├── components/
│   └── auth/
│       ├── FirebaseAuth.tsx     # Main auth component
│       └── FirebaseUIWrapper.tsx # FirebaseUI wrapper
└── app/
    ├── auth/
    │   └── page.tsx         # Authentication page
    └── dashboard/
        └── page.tsx         # Protected dashboard
```

## Troubleshooting

### Common Issues

1. **"FirebaseUI is not defined"**: Make sure you've installed the dependencies with `npm install firebase firebaseui --legacy-peer-deps`

2. **"Invalid API key"**: Double-check your environment variables in `.env.local`

3. **"Domain not authorized"**: Add your domain to the authorized domains in Firebase Console > Authentication > Settings > Authorized domains

4. **"Google Sign-In not working"**: Make sure you've enabled Google provider and configured the OAuth consent screen

### Development vs Production

- For development, use `localhost` in authorized domains
- For production, add your actual domain to authorized domains
- Make sure to update environment variables for production deployment

## Security Notes

- Never commit your `.env.local` file to version control
- Use environment variables for all sensitive configuration
- The `NEXT_PUBLIC_` prefix makes variables available to the client-side code
- Consider implementing additional security measures for production 