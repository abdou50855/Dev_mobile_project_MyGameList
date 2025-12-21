import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuration Firebase - MyGameList-App
const firebaseConfig = {
    apiKey: "AIzaSyCNtARBhA_bWaW2IHq3htvtWUWCRZbfgK0",
    authDomain: "mygamelist-app-b6ee7.firebaseapp.com",
    projectId: "mygamelist-app-b6ee7",
    storageBucket: "mygamelist-app-b6ee7.firebasestorage.app",
    messagingSenderId: "523295368984",
    appId: "1:523295368984:web:18a033c70d425d4c4ca06d",
    measurementId: "G-RQJRE3V50J"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Exporter les services
export const auth = getAuth(app);
export const db = getFirestore(app);