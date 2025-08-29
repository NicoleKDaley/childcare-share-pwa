import { useState } from "react";
import { useNavigate } from 'react-router-dom'; // For redirection after logout
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';

function Dashboard() {
  const navigate = useNavigate(); // Initialize useNavigate

  const handleLogout = async () => {
    try {
      await signOut(auth); // Sign the user out from Firebase
      navigate('/login'); // Redirect to the login page after successful logout
    } catch (error) {
      console.error("Error signing out:", error);
      // Optionally, display an error message to the user
      alert("Failed to log out. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-4xl font-bold text-blue-700 mb-6">Welcome to your Dashboard!</h1>
      <p className="text-lg text-gray-700 mb-8">Welcome to your childcare share dashboard!</p>

      {/* Your Logout Button */}
      <button
        onClick={handleLogout}
        className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
      >
        Log Out
      </button>


      <div className="mt-6 space-y-4">
        <div className="p-4 border rounded-lg shadow-sm">
          <h3 className="font-semibold">Upcoming Bookings</h3>
          <p className="text-sm text-gray-500">No bookings yet.</p>
        </div>

        <div className="p-4 border rounded-lg shadow-sm">
          <h3 className="font-semibold">Your Shared Hours</h3>
          <p className="text-sm text-gray-500">Track your childcare sharing here.</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
