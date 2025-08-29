import { useState } from "react";
import {auth} from "../../firebase.js";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Login successful!");
      navigate("/dashboard"); // Redirect to dashboard on successful registration
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    alert("Logged out!");
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded-xl shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
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

        <p className="text-center mt-4">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-600 hover:underline">
            Register now
          </Link> </p>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full bg-gray-400 text-white py-2 mt-2 rounded"
        >
          Logout
        </button>
      </form>
    </div>
  );
}

