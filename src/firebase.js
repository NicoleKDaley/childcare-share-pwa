// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";



const firebaseConfig = {
  apiKey: "AIzaSyChqMUtZs6v6EIJDSLf_0L9r53VUoLA9kk",
  authDomain: "childcare-share.firebaseapp.com",
  projectId: "childcare-share",
  storageBucket: "childcare-share.firebasestorage.app",
  messagingSenderId: "904300586476",
  appId: "1:904300586476:web:23325b02c7b26bc6d98cc9",
  measurementId: "G-PWK95QL0ZD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export auth instance
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { collection, addDoc, getDocs } from "firebase/firestore";


// Sign up
export const register = async (email, password) => { // Exporting these functions
  try {
    const user = await createUserWithEmailAndPassword(auth, email, password);
    console.log("Registered:", user);
    return user; // Good practice to return data
  } catch (err) {
    console.error(err);
    throw err; // Re-throw to allow calling component to handle
  }
};

// Sign in
export const login = async (email, password) => { // Exporting these functions
  try {
    const user = await signInWithEmailAndPassword(auth, email, password);
    console.log("Logged in:", user);
    return user;
  } catch (err) {
    console.error(err);
    throw err;
  }
};


// Add a listing
export const addListing = async (listing) => { // Exporting these functions
  try {
    await addDoc(collection(db, "listings"), listing);
    console.log("Listing added!");
  } catch (err) {
    console.error(err);
    throw err;
  }
};

// Get all listings
export const getListings = async () => { // Exporting these functions
  try {
    const snapshot = await getDocs(collection(db, "listings"));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error(err);
    throw err;
  }
};

