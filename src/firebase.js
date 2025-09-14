import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged 
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs,
  Timestamp
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// ---- Firebase Config ----
const firebaseConfig = {
  apiKey: "AIzaSyChqMUtZs6v6EIJDSLf_0L9r53VUoLA9kk",
  authDomain: "childcare-share.firebaseapp.com",
  projectId: "childcare-share",
  storageBucket: "childcare-share.appspot.com", 
  messagingSenderId: "904300586476",
  appId: "1:904300586476:web:23325b02c7b26bc6d98cc9",
  measurementId: "G-PWK95QL0ZD"
};

// ---- Initialize ----
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Analytics )
let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

// ---- Auth Helpers ----
export const register = async (email, password) => {
  try {
    const user = await createUserWithEmailAndPassword(auth, email, password);
    console.log("Registered:", user);
    return user;
  } catch (err) {
    console.error("Error registering:", err);
    throw err;
  }
};

export const login = async (email, password) => {
  try {
    const user = await signInWithEmailAndPassword(auth, email, password);
    console.log("Logged in:", user);
    return user;
  } catch (err) {
    console.error("Error logging in:", err);
    throw err;
  }
};

// ---- Firestore Helpers ----
export const addActivity = async (userId, activity) => {
  try {
    await addDoc(collection(db, "users", userId, "activities"), {
      ...activity,
      start: activity.start instanceof Date 
        ? Timestamp.fromDate(activity.start) 
        : activity.start,  // convert if Date
      end: activity.end instanceof Date 
        ? Timestamp.fromDate(activity.end) 
        : activity.end,
      createdAt: Timestamp.now(), // stores creation time
    });
    console.log("Activity saved!");
  } catch (err) {
    console.error("Error saving activity:", err);
    throw err;
  }
};

export const getActivities = async (userId) => {
  try {
    const snapshot = await getDocs(collection(db, "users", userId, "activities"));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error("Error fetching activities:", err);
    throw err;
  }
};



export const addListing = async (listing) => {
  try {
    await addDoc(collection(db, "listings"), listing);
    console.log("Listing added!");
  } catch (err) {
    console.error("Error adding listing:", err);
    throw err;
  }
};

export const getListings = async () => {
  try {
    const snapshot = await getDocs(collection(db, "listings"));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error("Error fetching listings:", err);
    throw err;
  }
};

