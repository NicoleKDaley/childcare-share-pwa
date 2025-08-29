import { useState } from "react"; // For state management
import { Link, useNavigate } from "react-router-dom"; // For navigation
import { auth, register } from "../../firebase";

function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    try {
      
      await register(email, password);

      navigate("/dashboard"); // Redirect to dashboard on successful registration
    } catch (err) {
      
      console.error("Registration error:", err);
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center text-blue-600">Register</h2>

      {/* Display error message if present */}
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      <form onSubmit={handleRegister} className="space-y-4"> {/* Add onSubmit handler */}
        <div>
          <label className="block text-sm font-medium">Full Name</label>
          <input
            type="text"
            className="w-full border rounded-lg p-2 mt-1"
            placeholder="Enter your full name"
            value={fullName} 
            onChange={(e) => setFullName(e.target.value)} 
            required 
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            className="w-full border rounded-lg p-2 mt-1"
            placeholder="Enter your email"
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Password</label>
          <input
            type="password"
            className="w-full border rounded-lg p-2 mt-1"
            placeholder="Enter your password"
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          Register
        </button>
      </form>

      <p className="text-sm text-center mt-4">
        Already have an account?{" "}
        <Link to="/" className="text-blue-600 hover:underline">Login</Link>
      </p>
    </div>
  );
}

export default Register;