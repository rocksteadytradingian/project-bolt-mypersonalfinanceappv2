# Netlify Setup Instructions

## Prerequisites
1. A Netlify account
2. GitHub repository access (already configured at https://github.com/rocksteadytradingian/project-bolt-mypersonalfinanceappv2)

## Steps

### 1. Connect to Netlify
1. Go to https://app.netlify.com/
2. Sign in to your Netlify account
3. Click "Add new site" > "Import an existing project"
4. Choose "Deploy with GitHub"
5. Select the repository: `rocksteadytradingian/project-bolt-mypersonalfinanceappv2`

### 2. Configure Build Settings
The following settings are already configured in netlify.toml, but verify they match:
- Build command: `npm run build`
- Publish directory: `dist`
- Base directory: Not set (root)

### 3. Configure Environment Variables
Add the following environment variables in Netlify (Site settings > Environment variables):

```
VITE_ANTHROPIC_API_KEY=[Your Anthropic API Key]
VITE_ENCRYPTION_KEY=[Your Encryption Key]

# Firebase Configuration
VITE_FIREBASE_API_KEY=[Your Firebase API Key]
VITE_FIREBASE_AUTH_DOMAIN=[Your Firebase Auth Domain]
VITE_FIREBASE_PROJECT_ID=[Your Firebase Project ID]
VITE_FIREBASE_STORAGE_BUCKET=[Your Firebase Storage Bucket]
VITE_FIREBASE_MESSAGING_SENDER_ID=[Your Firebase Messaging Sender ID]
VITE_FIREBASE_APP_ID=[Your Firebase App ID]
VITE_FIREBASE_MEASUREMENT_ID=[Your Firebase Measurement ID]
```

Note: Replace the placeholders with your actual values from your .env file.

### 4. Deploy Settings
1. In "Site settings" > "Build & deploy" > "Continuous Deployment":
   - Ensure "Production branch" is set to `master`
   - Enable "Auto publish"
2. Under "Deploy notifications", consider enabling:
   - Deploy succeeded
   - Deploy failed

### 5. Domain and HTTPS
1. In "Domain settings":
   - Set up a custom domain if desired
   - Ensure HTTPS is enabled (should be automatic)

### 6. Post-Setup Verification
1. Wait for the initial deployment to complete
2. Verify the site is accessible at the provided Netlify URL
3. Test core functionality:
   - User authentication
   - Firebase connectivity
   - Data operations
   - AI features

## Troubleshooting
If you encounter issues:
1. Check the deploy logs in Netlify
2. Verify all environment variables are correctly set
3. Ensure Firebase security rules are properly configured
4. Check browser console for any client-side errors

## Security Notes
- Keep your environment variables secure
- Never commit sensitive keys to the repository
- Regularly rotate security keys and update them in Netlify
- Monitor the application logs for any security issues
