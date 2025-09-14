/**
 * Login.jsx
 *
 * This component provides the login functionality for the Childcare Share app.
 * 
 * Responsibilities:
 *   - Allows users to log in with email and password (via Firebase Authentication).
 *   - Fetches the user's role from Firestore (`/users/{uid}/role`) after login.
 *   - Stores the user's role in localStorage for later access (e.g., for access control).
 *   - Provides error handling for failed login attempts (e.g., wrong password).
 *   - Redirects authenticated users to the dashboard on successful login.
 *   - Includes a logout handler (for debugging or future use).
 *   - Provides navigation to the registration page for new users.
 *
 * Libraries used:
 *   - Firebase Authentication (signInWithEmailAndPassword, signOut)
 *   - Firebase Firestore (getDoc for fetching user role)
 *   - React Router (useNavigate, Link)
 *
 * This page serves as the entry point for authenticated usage of the app,
 * ensuring that only registered and authorized users can access the dashboard
 * and other core features.
 */

import { useState } from "react";
import { auth, db } from "../../firebase.js";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";

export default function Login() {
  // State for form inputs and error feedback
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Handles login submission
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Sign in using Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch user role from Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const role = userSnap.data().role;
        console.log("User role:", role);

        // Store role in localStorage for access control
        localStorage.setItem("userRole", role);

        alert(`Login successful as ${role}!`);
        navigate("/dashboard"); // Redirect to dashboard
      } else {
        // Role not found in Firestore
        setError("No role found for this user. Please contact support.");
      }
    } catch (err) {
      // Show authentication or Firestore errors
      setError(err.message);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    await signOut(auth);
    alert("Logged out!");
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded-xl shadow-md w-96">
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <img
            src="public/childcare-share-pwa/public/ChildcareShareLogo.png"
            alt="App Logo"
            style={{ maxHeight: "80px" }}
          />
        </div>

        {/* Intro text */}
        <h2 style={{ marginBottom: "1rem", textAlign: "center" }}>
          Welcome to the Childcare Share App
        </h2>
        <p style={{ marginBottom: "1rem", textAlign: "center" }}>
          Because it takes a village!
        </p>

        {/* Login form */}
        <h2 style={{ marginBottom: "1rem", textAlign: "left" }}>Log In</h2>
        {error && <p className="text-red-500">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-3 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 mb-3 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" className="w-full bg-green-500 text-white py-2 rounded">
          Login
        </button>

        {/* Register redirect */}
        <p className="text-center mt-4">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-600 hover:underline">
            Register now
          </Link>
        </p>
      </form>
    </div>
  );
}
