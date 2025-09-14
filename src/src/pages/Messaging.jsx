/**
 * Messaging.jsx
 *
 * This component provides secure chat functionality between the user (parent)
 * and their trusted adults (the "village").
 *
 * Responsibilities:
 *   - Fetches the current user's trusted adults from Firestore (`/users/{uid}/village`).
 *   - Allows the user to select a trusted adult from a dropdown list.
 *   - Establishes a unique chat thread (`chatId`) based on both participants' IDs.
 *   - Subscribes to live message updates for the selected chat (via Firestore onSnapshot).
 *   - Displays all messages in chronological order (with "You" vs. "Friend" labeling).
 *   - Allows the user to compose and send new messages (stored in Firestore with timestamps).
 *   - Shows pretend/sample messages if no Firestore messages exist (for demo purposes).
 *
 * Data structure:
 *   - Trusted adults: /users/{uid}/village
 *   - Messages: /messages/{chatId}/messages/{messageDoc}
 *
 * Libraries used:
 *   - Firebase Authentication (for current user context)
 *   - Firebase Firestore (getDocs, onSnapshot, addDoc, serverTimestamp)
 *   - React Router (Link for navigation)
 *
 * This page provides asynchronous two-way communication to support coordination
 * between parents and their trusted adults for childcare activities.
 */

import { useState, useEffect } from "react";
import { db, auth } from "../../firebase"; 
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp, 
  getDocs 
} from "firebase/firestore";
import { Link } from "react-router-dom";

function Messaging() {
  // State for chat messages, form input, trusted adults, and dropdown selection
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [trustedAdults, setTrustedAdults] = useState([]);
  const [selectedAdult, setSelectedAdult] = useState("");

  const currentUser = auth.currentUser;


  // Pretend sample messages (only shown if no Firestore messages exist)
  const pretendMessages = [
    { id: "p1", from: "Grandma Mary", text: "Does Lucy need her violin today?" },
    { id: "p2", from: "Sarah's Mom", text: "I can do a carshare for football on Friday!" },
  ];

  // Fetch trusted adults for dropdown (one-time effect when component mounts)
  useEffect(() => {
    const uid = currentUser?.uid;
    if (!uid) return;

    const fetchAdults = async () => {
      const snapshot = await getDocs(collection(db, "users", uid, "village"));
      setTrustedAdults(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    fetchAdults();
  }, [currentUser]);

  // Subscribe to messages for the selected trusted adult
  useEffect(() => {
    if (!selectedAdult || !currentUser) return;

    // Generate a consistent chatId for both participants (sorted to avoid duplicates)
    const chatId = [currentUser.uid, selectedAdult].sort().join("_");

    const q = query(
      collection(db, "messages", chatId, "messages"),
      orderBy("timestamp", "asc")
    );

    // Real-time Firestore listener for messages
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe(); // Cleanup on unmount or adult change
  }, [selectedAdult, currentUser]);

  // Send message handler
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedAdult) return;

    const chatId = [currentUser.uid, selectedAdult].sort().join("_");

    // Add new message to Firestore
    await addDoc(collection(db, "messages", chatId, "messages"), {
      from: currentUser.uid,
      to: selectedAdult,
      text: input,
      timestamp: serverTimestamp(),
    });

    setInput(""); // Reset input field
  };

  //  Actions 
    const handleLogout = async () => {
      try {
        await signOut(auth);
        window.location.href = "/login";
      } catch (err) {
        console.error("Error logging out:", err);
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

      {/* Navigation bar */}
      <nav className="navbar">
        <ul>
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><Link to="/notifications">Notifications</Link></li>
          <li><Link to="/calendar">Calendar</Link></li>
          <li><Link to="/children">Children</Link></li>
          <li><Link to="/village">Village</Link></li>
          <li><button onClick={handleLogout}>Log Out</button></li>
        </ul>
      </nav>

      <h1 style={{ marginBottom: "1rem", textAlign: "center" }}>Messaging</h1>

      {/* Messages display area */}
      <div 
        style={{ 
          border: "1px solid #ccc", 
          padding: "1rem", 
          maxHeight: "300px", 
          overflowY: "auto",
          marginTop: "1rem"
        }}
      >
        {messages.length === 0 ? (
          // Show pretend messages if Firestore is empty
          pretendMessages.map(m => (
            <p key={m.id}><b>{m.from}:</b> {m.text}</p>
          ))
        ) : (
          // Render live Firestore messages
          messages.map(m => (
            <p key={m.id}>
              <b>{m.from === currentUser.uid ? "You" : "Friend"}:</b> {m.text}
            </p>
          ))
        )}
      </div>

      {/* Message input form */}
      <form onSubmit={sendMessage} style={{ marginTop: "1rem" }}>
        {/* Trusted adult selector */}
        <div>
          <label className="block text-sm font-medium">Select Trusted Adult</label>
          <select
            value={selectedAdult}
            onChange={(e) => setSelectedAdult(e.target.value)}
            className="w-full p-2 mb-3 border rounded"
            required
          >
            <option value="">-- Choose a person --</option>
            {trustedAdults.map(adult => (
              <option key={adult.id} value={adult.id}>
                {adult.name} ({adult.relation})
              </option>
            ))}
          </select>
        </div>

        {/* Message input box */}
        <div>
          <label className="block text-sm font-medium">Message</label>
          <input 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            placeholder="Type a message..." 
            className="w-full p-2 mb-3 border rounded"
            required 
          />
        </div>

        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
          Send
        </button>
      </form>
    </div>
  );
}

export default Messaging;
