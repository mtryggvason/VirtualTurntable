import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  doc,
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

// Add a new song to Firestore
export const addSong = async (songData) => {
  try {
    const docRef = await addDoc(collection(db, 'songs'), {
      ...songData,
      uploadedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding song:', error);
    throw error;
  }
};

// Get songs for a specific user
export const getUserSongs = async (userId) => {
  try {
    const q = query(
      collection(db, 'songs'),
      where('userId', '==', userId),
      orderBy('uploadedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const songs = [];
    
    querySnapshot.forEach((doc) => {
      songs.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return songs;
  } catch (error) {
    console.error('Error fetching user songs:', error);
    throw error;
  }
};

// Get all songs (public)
export const getAllSongs = async () => {
  try {
    const q = query(
      collection(db, 'songs'),
      orderBy('uploadedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const songs = [];
    
    querySnapshot.forEach((doc) => {
      songs.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return songs;
  } catch (error) {
    console.error('Error fetching songs:', error);
    throw error;
  }
};

// Get a single song by ID
export const getSongById = async (songId) => {
  try {
    const docRef = doc(db, 'songs', songId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching song:', error);
    throw error;
  }
};