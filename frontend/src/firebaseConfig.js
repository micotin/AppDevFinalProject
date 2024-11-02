// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth'; // Import Firebase Auth

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAKtSMOG6YUNC0_Bd1xWhYDJlMtJRs8ypo",
  authDomain: "sam1-flower-shop-130b5.firebaseapp.com",
  projectId: "sam1-flower-shop-130b5",
  storageBucket: "sam1-flower-shop-130b5.appspot.com",
  messagingSenderId: "542608033896",
  appId: "1:542608033896:web:c31d3e7109c14a346493dd",
  measurementId: "G-LHK3GSC11L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app); // Initialize Firebase Auth

export { db, storage, auth }; // Export auth
