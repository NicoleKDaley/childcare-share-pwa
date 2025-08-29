import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";



// Pages
import Login from "./src/pages/Login";
import Register from "./src/pages/Register";
import Dashboard from "./src/pages/Dashboard";
import CalendarPage from "./src/pages/Calendar";
import NotificationsPage from "./src/pages/Notifications";
import VillagePage from "./src/pages/Village";
import MessagingPage from "./src/pages/Messaging";

function App() {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-lg font-semibold">Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={user ? <Dashboard /> : <Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes (require login) */}
        <Route path="/dashboard" element={user ? <Dashboard /> : <Login />} />
        <Route path="/calendar" element={user ? <CalendarPage /> : <Login />} />
        <Route
          path="/notifications"
          element={user ? <NotificationsPage /> : <Login />}
        />
        <Route path="/village" element={user ? <VillagePage /> : <Login />} />
        <Route path="/messages" element={user ? <MessagingPage /> : <Login />} />
      </Routes>
    </Router>
  );
}

export default App;
