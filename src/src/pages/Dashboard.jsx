/**
 * Dashboard.jsx
 *
 * High-level overview:
 * The Dashboard serves as the "home" page for logged-in parents. It aggregates
 * and displays key childcare information in one place, giving the user a quick
 * snapshot of their responsibilities and communications.
 *
 * Main features:
 *   - Fetches and displays the user's upcoming activities from Firestore.
 *   - Fetches and displays the user's recent messages (ordered newest first).
 *   - Provides quick stats (unread messages, tasks in the next 3 days).
 *   - Allows confirmation of pickup/drop-off tasks by marking activities as "confirmed".
 *   - Provides navigation to other parts of the app (Calendar, Village, Messages, etc.).
 *   - Supports logging out via Firebase Authentication.
 *
 * Data sources:
 *   - Activities:   /users/{uid}/activities
 *   - Messages:     /users/{uid}/messages
 *
 * This component functions as a central hub for a parent, reducing the need to
 * jump between views to see messages and upcoming responsibilities.
 */


import { useState, useEffect } from "react";
import { db, auth } from "../../firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";
import { Link } from "react-router-dom";
import { signOut } from "firebase/auth";

function Dashboard() {
  const [activities, setActivities] = useState([]);
  const [messages, setMessages] = useState([]);
  const [uid, setUid] = useState(null);

  useEffect(() => {
    if (!auth.currentUser) return;
    const currentUid = auth.currentUser.uid;
    setUid(currentUid);

    // Activities subscription 
    const qActivities = query(
  collection(db, "users", currentUid, "activities"), 
  orderBy("start", "asc")
);
const unsubActivities = onSnapshot(qActivities, (snapshot) => {
  const data = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  setActivities(data);
});

    //  Messages subscription
    const qMessages = query(
      collection(db, "users", currentUid, "messages"),
      orderBy("createdAt", "desc")  
    );
    const unsubMessages = onSnapshot(qMessages, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(data);
    });

    return () => {
      unsubActivities();
      unsubMessages();
    };
  }, []);

  // Derived data
  const unreadMessages = messages.filter((m) => !m.read);

  const next3DaysTasks = activities.filter((ev) => {
    const startDate = new Date(ev.start);
    const now = new Date();
    const cutoff = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    return (
      ev.assignedAdult === uid &&
      startDate > now &&
      startDate < cutoff
    );
  });

  //  Actions 
  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = "/login";
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };

  const confirmTask = async (activityId) => {
    try {
      await updateDoc(doc(db, "activities", activityId), { confirmed: true });
    } catch (err) {
      console.error("Error confirming task:", err);
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: "1rem" }}>
        <img
          src="public/childcare-share-pwa/public/ChildcareShareLogo.png"
          alt="App Logo"
          style={{ maxHeight: "80px" }}
        />
      </div>

      {/* Navbar */}
      <nav className="navbar">
        <ul>
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><Link to="/notifications">Notifications</Link></li>
          <li><Link to="/calendar">Calendar</Link></li>
          <li><Link to="/messages">Messages</Link></li>
          <li><Link to="/children">Children</Link></li>
          <li><Link to="/village">Village</Link></li>
          <li><button onClick={handleLogout}>Log Out</button></li>
        </ul>
      </nav>

      {/* Welcome */}
      <h1 style={{ textAlign: "center", marginTop: "1rem" }}>
        Welcome back to your Dashboard {auth.currentUser?.displayName}!
      </h1>

      {/* Quick Stats */}
      <div style={{ marginTop: "2rem" }}>
        <h2>Quick Overview</h2>
        <p>You have {unreadMessages.length} unread messages.</p>
        <p>
          You have {next3DaysTasks.length} tasks in the next 3 days.
        </p>
      </div>

      {/* Upcoming tasks */}
      <h2 style={{ marginTop: "1.5rem" }}>Your Upcoming Tasks</h2>
      {next3DaysTasks.length === 0 ? (
        <p>No tasks in the next 3 days.</p>
      ) : (
        <ul>
          {next3DaysTasks.map((task) => (
            <li key={task.id}>
              <b>{task.child}</b> – {task.title} on{" "}
              {new Date(task.start).toLocaleString()} at {task.location}
              <br />
              <button
                onClick={() => confirmTask(task.id)}
                style={{ marginTop: "0.5rem" }}
              >
                Confirm Pickup/Drop-off
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Recent Messages */}
      <h2 style={{ marginTop: "1.5rem" }}>Recent Messages</h2>
      {messages.length === 0 ? (
        <p>No messages yet.</p>
      ) : (
        <ul>
          {messages.slice(0, 3).map((msg) => (
            <li key={msg.id}>
              <b>{msg.senderName || msg.from || "Unknown"}:</b> {msg.text}{" "}
              ({new Date(msg.createdAt?.toDate?.() || msg.createdAt).toLocaleString()})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Dashboard;
