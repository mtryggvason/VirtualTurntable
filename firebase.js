import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyDB0hdunnfRUsAqSaip_J3F41u0xHKxXfw",
  authDomain: "virtual-turntable-72e2a.firebaseapp.com",
  projectId: "virtual-turntable-72e2a",
  storageBucket: "virtual-turntable-72e2a.firebasestorage.app",
  messagingSenderId: "563235456078",
  appId: "1:563235456078:web:4870656b60ab548b9baf1f",
  measurementId: "G-LCZNPNY0YM"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}
export { analytics };

export default app;