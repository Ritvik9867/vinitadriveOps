# VinitaDriveOps Mobile App

A cab business management application with offline support and native features.

## Features

- Native file upload (camera/file manager)
- Offline data caching
- Custom splash screen and app icon
- Optimized APK build

## Build Instructions

### Prerequisites

- Node.js 14+ and npm
- Android Studio (for Android)
- Xcode 12+ (for iOS)
- Capacitor CLI (`npm install -g @capacitor/cli`)

### Common Setup

1. Install dependencies:
```bash
npm install
```

2. Build the web app:
```bash
npm run build
```

### Android Build

1. Update Android platform:
```bash
npx cap sync android
```

2. Open Android Studio:
```bash
npx cap open android
```

3. Build APK:
   - Debug: Build > Build Bundle(s) / APK(s) > Build APK(s)
   - Release: Build > Generate Signed Bundle / APK

### iOS Build

1. Update iOS platform:
```bash
npx cap sync ios
```

2. Open Xcode:
```bash
npx cap open ios
```

3. Configure signing:
   - Open Xcode project settings
   - Select your team under Signing & Capabilities
   - Update bundle identifier if needed

4. Build:
   - Select device/simulator
   - Product > Build

### Development

1. Start dev server:
```bash
npm run dev
```

2. Live reload on device:
```bash
npx cap run android
# or
npx cap run ios
```

## Troubleshooting

- Clear build cache: `cd android && ./gradlew clean`
- Reset iOS build: `cd ios && pod deintegrate && pod install`
- Sync after plugin changes: `npx cap sync`

A comprehensive cab management system built with React and Google Apps Script, using Google Sheets as a database and Google Drive for file storage.

## Features

- User authentication with role-based access (Admin/Driver)
- Trip logging and expense tracking
- Complaint management system
- Real-time dashboard with earnings overview
- Offline-first architecture with IndexedDB
- File upload support for expenses and complaints
- Downloadable reports in CSV format

## Setup Instructions

### Frontend Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure API endpoint:
   - Open `src/config/api.js`
   - Replace `API_BASE_URL` with your Google Apps Script Web App URL

3. Start development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

### Google Apps Script Setup

1. Create a new Google Apps Script project at script.google.com

2. Create a new Google Spreadsheet and note its ID from the URL

3. Create a folder in Google Drive for file uploads and note its ID

4. Copy the contents of `backend/Code.gs` to your Apps Script project

5. Update the configuration variables:
   ```javascript
   const SPREADSHEET_ID = 'your-spreadsheet-id';
   const FOLDER_ID = 'your-folder-id';
   ```

6. Deploy as Web App:
   - Click "Deploy" > "New deployment"
   - Choose "Web app"
   - Set "Execute as" to "Me"
   - Set "Who has access" to "Anyone"
   - Click "Deploy"

7. Copy the deployment URL and update `API_BASE_URL` in the frontend config

## Usage

### Admin Features
- View real-time dashboard
- Approve/reject expenses and complaints
- Generate and download reports
- Track driver performance

### Driver Features
- Log daily trips and earnings
- Submit expenses with proof
- File complaints
- View personal dashboard

## Data Structure

### Google Sheets Structure
- Users: User accounts and roles
- Trips: Trip details and earnings
- Expenses: Driver expenses with proof
- Complaints: Driver complaints with images
- Repayments: Payment tracking
- Login Logs: Authentication audit trail

## Security

- Password hashing for user accounts
- Role-based access control
- Input validation on both client and server
- File upload restrictions and validation

## Offline Support

- IndexedDB for local data storage
- Background sync for offline actions
- Automatic retry for failed API calls

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.