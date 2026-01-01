import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

// Upload a file to Firebase Storage
export const uploadFile = async (file, path) => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Upload song file
export const uploadSong = async (file, userId, songName) => {
  const sanitizedSongName = songName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const path = `songs/${userId}/${sanitizedSongName}_${Date.now()}.${file.name.split('.').pop()}`;
  return uploadFile(file, path);
};

// Upload artwork file
export const uploadArtwork = async (file, userId, songName) => {
  const sanitizedSongName = songName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const path = `artwork/${userId}/${sanitizedSongName}_${Date.now()}.${file.name.split('.').pop()}`;
  return uploadFile(file, path);
};