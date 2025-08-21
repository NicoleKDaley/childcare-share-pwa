import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
        {/* Header / Navigation */}
        <header className="bg-blue-600 text-white shadow-md">
          <nav className="container mx-auto flex justify-between items-center p-4">
            <h1 className="text-xl font-bold">Childcare Share</h1>
            <ul className="flex space-x-4">
              <li><Link to="/dashboard" className="hover:underline">Dashboard</Link></li>
              <li><Link to="/village" className="hover:underline">Village</Link></li>
              <li><Link to="/messages" className="hover:underline">Messages</Link></li>
              <li><Link to="/calendar" className="hover:underline">Calendar</Link></li>
              <li><Link to="/tasks" className="hover:underline">Tasks</Link></li>
              <li><Link to="/login" className="hover:underline">Login</Link></li>
            </ul>
          </nav>
          <nav style={{ padding: "1rem", background: "#f4f4f4" }}>
        <Link to="/" style={{ marginRight: "1rem" }}>Login</Link>
        <Link to="/register" style={{ marginRight: "1rem" }}>Register</Link>
        <Link to="/dashboard">Dashboard</Link>
      </nav>
        </header>

        {/* Main Content */}
        <main className="container mx-auto flex-1 p-6">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />

          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-gray-200 text-center py-4 text-sm">
          © {new Date().getFullYear()} Childcare Share. All rights reserved.
        </footer>
      </div>
    </Router>
  );
}

export default App;
