import { Link } from "react-router-dom";

export default function AboutUs() {
  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="bg-white p-6 rounded-xl shadow-md w-96">
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <img
            src="public/childcare-share-pwa/public/ChildcareShareLogo.png"
            alt="App Logo"
            style={{ maxHeight: "80px" }}
          />
        </div>

        {/* Page header */}
        <h2 className="mb-4 text-center text-xl font-bold">About Us</h2>

        {/* Paragraphs */}
        <p className="mb-3 text-gray-700 text-sm">
          The Childcare Share App is designed to help parents and carers
          coordinate shared childcare responsibilities in a simple, secure, and
          accessible way. By providing tools for scheduling, messaging and
          managing trusted networks, the app reduces the daily stress of
          organising pickups, drop-offs and activities.

        </p>

        <p className="mb-3 text-gray-700 text-sm">
          Our goal is to create a supportive digital village that strengthens
          family life. With an emphasis on accessibility, security and ease of
          use, the Childcare Share App is built to bring peace of mind to
          parents, guardians and their trusted network of carers.

        </p>

        {/* Links */}
        <p className="text-center mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Log in
          </Link>
        </p>
        <p className="text-center mt-2">
          Don’t have an account?{" "}
          <Link to="/register" className="text-blue-600 hover:underline">
            Register now
          </Link>
        </p>
      </div>
    </div>
  );
}
