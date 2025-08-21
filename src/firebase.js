// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_APP.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_APP.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";

// Sign up
const register = async (email, password) => {
  try {
    const user = await createUserWithEmailAndPassword(auth, email, password);
    console.log("Registered:", user);
  } catch (err) {
    console.error(err);
  }
};

// Sign in
const login = async (email, password) => {
  try {
    const user = await signInWithEmailAndPassword(auth, email, password);
    console.log("Logged in:", user);
  } catch (err) {
    console.error(err);
  }
};

import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "./firebase";

// Add a listing
const addListing = async (listing) => {
  await addDoc(collection(db, "listings"), listing);
};

// Get all listings
const getListings = async () => {
  const snapshot = await getDocs(collection(db, "listings"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

