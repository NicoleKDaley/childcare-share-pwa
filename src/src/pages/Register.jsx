/**
 * Register Page
 *
 * This component allows new users to create an account for the Childcare Share App.
 * Users can register as either a "Primary Carer" or "Secondary Carer".
 *
 * Core Features:
 *  - Captures user input for full name, email, password, and role.
 *  - Creates a Firebase Authentication user account.
 *  - Stores user profile information in Firestore under the "users" collection.
 *  - Provides real-time error feedback if registration fails.
 *  - Navigates the user to the Dashboard after successful registration.
 *
 * Notes:
 *  - The default role is set to "primary".
 *  - Role information can later be used to manage access or display role-specific UI.
 */

// React and Firebase imports
import { useState } from "react";
import { auth, db } from "../../firebase.js";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("primary"); // default to primary carer
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Handles form submission for registration
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save user profile info in Firestore
      await setDoc(doc(db, "users", user.uid), {
        fullName: fullName,
        email: user.email,
        role: role,
      });

      alert("Registration successful!"); // Notify user
      navigate("/dashboard"); // Redirect to dashboard
    } catch (err) {
      setError(err.message); // Show error if registration fails
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <form onSubmit={handleRegister} className="bg-white p-6 rounded-xl shadow-md w-96">
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <img
            src="public/childcare-share-pwa/public/ChildcareShareLogo.png"
            alt="App Logo"
            style={{ maxHeight: "80px" }}
          />
        </div>
        
        {/* Page header */}
        <h2 className="mb-4 text-center text-xl font-bold">Register</h2>

        {/* Display error if exists */}
        {error && <p className="text-red-500">{error}</p>}

        {/* Full Name input */}
        <input
          type="text"
          placeholder="Full Name"
          className="w-full p-2 mb-3 border rounded"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />

        {/* Email input */}
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-3 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* Password input */}
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 mb-3 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* Role selection */}
        <label className="block mb-2">Select Role:</label>
        <select
          className="w-full p-2 mb-4 border rounded"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          required
        >
          <option value="primary">Primary Carer</option>
          <option value="secondary">Secondary Carer</option>
        </select>

        {/* Submit button */}
        <button type="submit" className="w-full bg-green-500 text-white py-2 rounded">
          Register
        </button>

        {/* Link to login page */}
        <p className="text-center mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Log in
          </Link>
        </p>

        {/* Link to about us page */}
        <p className="text-center mt-4">
          About Us{" "}
          <Link to="/aboutUs" className="text-blue-600 hover:underline">
            About Us
          </Link>
        </p>
      </form>
    </div>
  );
}
