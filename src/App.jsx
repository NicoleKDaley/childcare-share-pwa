import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";
import { useState, useEffect, createContext, useContext } from "react";
import { onAuthStateChanged } from "firebase/auth";

// Pages
import Login from "./src/pages/Login";
import Register from "./src/pages/Register";
import Dashboard from "./src/pages/Dashboard";
import CalendarPage from "./src/pages/Calendar";
import NotificationsPage from "./src/pages/Notifications";
import VillagePage from "./src/pages/Village";
import MessagingPage from "./src/pages/Messaging";
import Children from "./src/pages/Children";
import AboutUs from "./src/pages/AboutUs";

/**
 * App Component  
 * Nicole Daley - F1234475 - EMA - TM470 
 *
 * This is the root component of the Childcare Share application.
 * Responsibilities:
 *  - Set up routing for public and protected pages
 *  - Display loading state while authentication is in progress
 *  - Provide authentication context to child components
 *  
 * Pages included:
 *  - Login & Register (public)
 *  - Dashboard, Calendar, Notifications, Village, Messaging, Children (protected)
 */

function App() {
  // React Firebase hook to track the current user
  const [user, loading] = useAuthState(auth);

  // Show a loading screen while authentication state is being resolved
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
        <Route path="/aboutUs" element={<AboutUs />} />

        {/* Protected routes: Require user login, redirect to Login if unauthenticated */}
        <Route path="/dashboard" element={user ? <Dashboard /> : <Login />} />
        <Route path="/calendar" element={user ? <CalendarPage /> : <Login />} />
        <Route
          path="/notifications"
          element={user ? <NotificationsPage /> : <Login />}
        />
        <Route path="/village" element={user ? <VillagePage /> : <Login />} />
        <Route path="/messages" element={user ? <MessagingPage /> : <Login />} />
        <Route path="/children" element={user ? <Children /> : <Login />} />
      </Routes>
    </Router>
  );
}

// AUTH CONTEXT SETUP

// Create a context for authentication data
const AuthContext = createContext();

/**
 * AuthProvider
 *
 * Provides authentication info and user role to the rest of the app.
 * Responsibilities:
 *  - Listen for changes in Firebase auth state
 *  - Fetch user role from Firestore
 *  - Make currentUser and role available via context
 */
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);

        // Fetch user role from Firestore
        const roleSnap = await getDoc(doc(db, "users", user.uid));
        setRole(roleSnap.exists() ? roleSnap.data().role : null);
      } else {
        setCurrentUser(null);
        setRole(null);
      }
    });

    // Clean up listener on unmount
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, role }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth
 *
 * Custom hook to access the authentication context
 */
export function useAuth() {
  return useContext(AuthContext);
}

export default App;
