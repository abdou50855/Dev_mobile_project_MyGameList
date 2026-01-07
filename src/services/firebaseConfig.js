import { initializeApp } from 'firebase/app';
import { 
  initializeAuth, 
  getReactNativePersistence 
} from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

// Configuration Firebase - MyGameList-App
const firebaseConfig = {
  apiKey: "AIzaSyBLg3QsXwaL6kJAKbP3y2BaBe2kxpJjchw",
  authDomain: "mygamelist-app-b6ee7.firebaseapp.com",
  projectId: "mygamelist-app-b6ee7",
  storageBucket: "mygamelist-app-b6ee7.firebasestorage.app",
  messagingSenderId: "523295368984",
  appId: "1:523295368984:web:18a033c70d425d4c4ca06d",
  measurementId: "G-RQJRE3V50J"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Auth avec persistance (AsyncStorage)
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

// Firestore
export const db = getFirestore(app);
