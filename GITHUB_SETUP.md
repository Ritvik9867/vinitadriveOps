# GitHub and Google Apps Script Setup Guide

## Prerequisites

1. Node.js and npm installed
2. Git installed
3. Android Studio (for mobile development)
4. Google Account with access to Google Drive and Sheets

## GitHub Desktop Setup

### 1. Install GitHub Desktop

1. Download GitHub Desktop from [desktop.github.com](https://desktop.github.com)
2. Install and launch GitHub Desktop
3. Sign in to your GitHub account

### 2. Configure GitHub Desktop

1. In GitHub Desktop, go to File > Options
2. Under 'Git', configure your name and email:
   - Name: Your Name
   - Email: your.email@example.com
3. Click 'Save'

### 3. Create GitHub Repository

1. In GitHub Desktop, click 'Create a New Repository'
2. Fill in repository details:
   - Name: `vinitadriveOps`
   - Description: "Cab Management System with React and Google Apps Script"
   - Local Path: Choose your project folder
   - Initialize with a README: Yes
   - Git ignore: Node
   - License: MIT
3. Click 'Create Repository'
4. After creation, add the following files from the template:
   - capacitor.config.ts
   - vite.config.js
   - tsconfig.json
   - android/
   - src/
   - scripts/

### 4. Working with GitHub Desktop

1. Making Changes:
   - Edit your files in your preferred editor
   - Changes appear automatically in GitHub Desktop

2. Committing Changes:
   - Select changed files in GitHub Desktop
   - Add a summary (required) and description (optional)
   - Click 'Commit to main'

3. Publishing Repository:
   - Click 'Publish repository'
   - Choose visibility (Public/Private)
   - Click 'Publish Repository'

4. Syncing Changes:
   - Push changes: Click 'Push origin'
   - Get updates: Click 'Fetch origin' then 'Pull origin'

## Google Apps Script Setup

### 1. Create New Google Apps Script Project

1. Go to [Google Apps Script](https://script.google.com)
2. Click 'New Project'
3. Rename project to 'VinitaDriveOps'

### 2. Configure Script Properties

1. In the Apps Script editor:
   - Click ⚙️ (Project Settings)
   - Under 'Script Properties', click 'Add Script Property'
   - Add necessary properties:
     ```
     SPREADSHEET_ID=your_spreadsheet_id
     FOLDER_ID=your_folder_id
     JWT_SECRET=your_jwt_secret
     ENCRYPTION_KEY=your_encryption_key
     ```
2. Initialize Google Sheets:
   - Run the `initializeSheets.js` script to create required sheets
   - Verify sheets creation: Users, Trips, Expenses, Complaints, Repayments, Login_Logs

### 3. Deploy as Web App

1. Click 'Deploy' > 'New deployment'
2. Choose 'Web app'
3. Configure settings:
   - Description: "VinitaDriveOps API"
   - Execute as: "Me"
   - Who has access: "Anyone"
4. Click 'Deploy'
5. Authorize the application when prompted

### 4. Copy Web App URL

1. After deployment, copy the provided Web App URL
2. Update the `src/config/api.js` file with this URL

### 5. Code Organization

Organize your `Code.gs` file structure:

```javascript
// Code.gs
const CONFIG = {
  SPREADSHEET_ID: PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID'),
  API_KEY: PropertiesService.getScriptProperties().getProperty('API_KEY')
};

function doGet(e) {
  // Handle GET requests
}

function doPost(e) {
  // Handle POST requests
}

// Add other necessary functions
```

## Security Considerations

1. GitHub Security:
   - Never commit sensitive data
   - Use .gitignore for sensitive files
   - Keep your GitHub Desktop installation updated
   - Use environment variables for sensitive data
   - Regular security audits of dependencies

2. Apps Script Security:
   - Use appropriate sharing settings
   - Implement JWT-based authentication
   - Enable two-factor authentication
   - Implement rate limiting
   - Log all data access
   - Regular backup of Google Sheets data
   - Encrypt sensitive data before storage

3. Mobile Security:
   - Implement secure storage for offline data
   - Use biometric authentication when available
   - Implement certificate pinning
   - Regular security updates

## Troubleshooting

### GitHub Desktop Issues

1. Authentication Issues:
   - Sign out and sign back in
   - Reset GitHub Desktop credentials

2. Sync Conflicts:
   - Fetch latest changes first
   - Resolve conflicts in your editor
   - Commit resolved changes

### Apps Script Issues

1. CORS errors:
   - Verify deployment settings
   - Check access permissions
   - Add proper headers in `Code.gs`

2. Authorization errors:
   - Re-authorize the application
   - Check script properties
   - Verify OAuth scopes

### Mobile Development Issues

1. Android Build Errors:
   - Verify Android SDK installation
   - Update Gradle version if needed
   - Clean and rebuild project

2. Capacitor Issues:
   - Check capacitor.config.ts configuration
   - Verify native dependencies
   - Run `npx cap sync` after web build

## Mobile Development Setup

### Android Setup

1. Install Android Studio:
   - Download from [developer.android.com](https://developer.android.com/studio)
   - Install Android SDK during setup
   - Configure environment variables

2. Configure Capacitor:
   ```bash
   npm install @capacitor/core @capacitor/android
   npx cap init
   npm run build
   npx cap add android
   ```

3. Build and Run:
   ```bash
   npx cap sync
   npx cap open android
   ```

### Mobile-Specific Features

1. Configure Offline Storage:
   - Update IndexedDB schema in `src/utils/indexedDB.js`
   - Implement background sync
   - Handle file uploads in offline mode

2. Native Features:
   - Camera access for documents
   - Geolocation for trip tracking
   - Push notifications

## Maintenance

1. Regular Updates:
   - Keep GitHub Desktop updated
   - Monitor Apps Script quotas
   - Review security settings
   - Update mobile dependencies

2. Backup:
   - Regular commits via GitHub Desktop
   - Export Apps Script versions
   - Backup spreadsheet data
   - Backup mobile app data

3. Performance Monitoring:
   - Track API response times
   - Monitor offline storage usage
   - Check mobile app memory usage
   - Regular performance audits