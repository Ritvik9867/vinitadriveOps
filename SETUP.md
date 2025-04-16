# Project Setup Guide

## Version Compatibility Issues

1. React version mismatch detected:
   - React v17.0.2 is used while @types/react is for v18
   - Update package.json to align versions:
     ```json
     "react": "^18.2.0",
     "react-dom": "^18.2.0"
     ```

2. Missing essential dependencies:
   - Add required packages:
     ```json
     "@capacitor/app": "^5.0.6",
     "@capacitor/preferences": "^5.0.6",
     "@capacitor/status-bar": "^5.0.6"
     ```

## Build Configuration

### Vite Config
- Current configuration is correct for path aliases and build optimization
- Ensure CORS is properly configured for development

### Capacitor Config
- Configuration is properly set up with necessary permissions
- Keystore configuration present for Android release builds

### TypeScript Config
- Configuration is correct for React and path aliases
- Properly set up for ESNext features

## Project Structure

Essential files and folders that should be present:

```
├── android/                 # Android platform files
├── ios/                     # iOS platform files
├── src/
│   ├── components/         # Reusable React components
│   ├── config/             # Configuration files
│   ├── contexts/           # React context providers
│   ├── pages/              # Page components
│   ├── utils/              # Utility functions
│   ├── App.jsx             # Main App component
│   └── main.jsx            # Entry point
├── backend/
│   └── Code.gs            # Google Apps Script backend
├── capacitor.config.ts     # Capacitor configuration
├── index.html             # HTML entry point
├── package.json           # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── vite.config.js        # Vite configuration
```

## Build Steps

1. Install updated dependencies:
   ```bash
   npm install
   ```

2. Build web app:
   ```bash
   npm run build
   ```

3. Sync with Capacitor:
   ```bash
   npx cap sync
   ```

4. Platform-specific builds:
   - Android:
     ```bash
     npx cap open android
     # Then build APK from Android Studio
     ```
   - iOS:
     ```bash
     npx cap open ios
     # Then build from Xcode
     ```

## Security Considerations

1. Google Apps Script Integration:
   - Use OAuth2 for authentication
   - Implement rate limiting
   - Validate all inputs server-side

2. Mobile Security:
   - Enable SSL pinning
   - Implement secure storage for sensitive data
   - Add biometric authentication where needed

## Optimization Tips

1. Performance:
   - Implement lazy loading for routes
   - Use service workers for offline support
   - Optimize image assets

2. Mobile-specific:
   - Use native APIs through Capacitor
   - Implement proper error handling
   - Add pull-to-refresh functionality

## Common Issues

1. Module Resolution:
   - Ensure all imports use correct path aliases
   - Check for circular dependencies
   - Verify module versions match

2. Build Problems:
   - Clear cache: `npm cache clean --force`
   - Remove node_modules: `rm -rf node_modules`
   - Rebuild: `npm install && npm run build`

3. Platform Issues:
   - Android: Check gradle version compatibility
   - iOS: Verify CocoaPods installation
   - Web: Ensure proper CORS configuration