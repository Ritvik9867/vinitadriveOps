import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Network } from '@capacitor/network';
import { LocalNotifications } from '@capacitor/local-notifications';
import { initializeDB, setToDB, getFromDB } from './indexedDB';

// File picker utilities
export const pickFile = async () => {
  try {
    const result = await Filesystem.pickFiles({
      multiple: false,
      readData: true
    });
    if (result.files.length > 0) {
      const file = result.files[0];
      await cacheFile(file.name, file.data);
      return file;
    }
    return null;
  } catch (error) {
    console.error('Error picking file:', error);
    throw error;
  }
};

// Camera utilities
export const takePicture = async () => {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera
    });
    return image.webPath;
  } catch (error) {
    console.error('Error taking picture:', error);
    throw error;
  }
};

// File system utilities
export const saveFile = async (fileName, data, mimeType = 'application/octet-stream') => {
  try {
    // Save to filesystem
    const result = await Filesystem.writeFile({
      path: fileName,
      data: data,
      directory: Directory.Data
    });
    // Cache file metadata
    await cacheFile(fileName, result.uri, mimeType);
    return result.uri;
  } catch (error) {
    console.error('Error saving file:', error);
    throw error;
  }
};

// File caching utilities
export const cacheFile = async (fileName, uri, mimeType = 'application/octet-stream') => {
  try {
    const db = await initializeDB();
    await setToDB('files', fileName, {
      uri,
      mimeType,
      timestamp: new Date().toISOString(),
      synced: false
    });
  } catch (error) {
    console.error('Error caching file:', error);
    throw error;
  }
};

export const getCachedFile = async (fileName) => {
  try {
    const fileData = await getFromDB('files', fileName);
    if (fileData && fileData.uri) {
      const contents = await Filesystem.readFile({
        path: fileData.uri,
        directory: Directory.Data
      });
      return {
        ...fileData,
        contents
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting cached file:', error);
    throw error;
  }
};

// Network status check
export const checkNetworkStatus = async () => {
  const status = await Network.getStatus();
  return status.connected;
};

// Offline queue management
export const addToSyncQueue = async (operation) => {
  try {
    const db = await openDB('vinitaDriveOps');
    await db.add('syncQueue', {
      operation,
      timestamp: new Date().toISOString(),
      status: 'pending'
    });
  } catch (error) {
    console.error('Error adding to sync queue:', error);
    throw error;
  }
};

// Local notifications
export const scheduleNotification = async (title, body) => {
  await LocalNotifications.schedule({
    notifications: [
      {
        title,
        body,
        id: new Date().getTime(),
        schedule: { at: new Date(Date.now() + 1000) }
      }
    ]
  });
};