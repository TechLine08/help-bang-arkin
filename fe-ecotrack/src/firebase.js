// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// ✅ Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyB1dCxEMe6USEsvDW_RjdcPGYGCA9JJQNU',
  authDomain: 'ecotrack-app-4fb84.firebaseapp.com',
  projectId: 'ecotrack-app-4fb84',
  storageBucket:'ecotrack-app-4fb84.firebasestorage.app', 
  messagingSenderId: '119294353508',
  appId: '1:119294353508:web:dfb1b88de7c4a41de3bf71',
};

// ✅ Initialize Firebase app
const app = initializeApp(firebaseConfig);

// ✅ Initialize Firebase Auth
const auth = getAuth(app);

// ✅ Export Auth instance
export { auth };
