/**
 * Children.jsx
 * This component allows the primary user to manage their children in the app.
 * - Users can add a child’s name and select a unique colour (used as a visual identifier in the app).
 * - Each child is stored in a Firestore sub-collection under the user’s document (`users/{uid}/children`).
 * - The list of children is retrieved in real time using Firestore's `onSnapshot` listener.
 * - Users can delete a child, which immediately removes them from both Firestore and the UI.
 * 
 * Purpose: 
 * Managing children is essential for scheduling and assigning responsibilities within the childcare share system. 
 * This module reduces organisational complexity by ensuring each child is clearly represented and identifiable.
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { db, auth } from "../../firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";

// Predefined colour palette for children (makes each child visually distinct in the app)
const colours = ["#FFB6C1", "#ADD8E6", "#98FB98", "#FFD580", "#DDA0DD"];

function Children() {
  
  // STATE MANAGEMENT
  

  // Stores all children belonging to the logged-in user
  const [children, setChildren] = useState([]);

  // Stores input for the "Add Child" form
  const [newChild, setNewChild] = useState("");

  // Stores the colour selected for a new child
  const [colour, setColour] = useState(colours[0]);

  //  Actions 
    const handleLogout = async () => {
      try {
        await signOut(auth);
        window.location.href = "/login";
      } catch (err) {
        console.error("Error logging out:", err);
      }
    };

  
  // FIRESTORE LISTENER
  
  // Runs once on component mount, and sets up a real-time listener on the "children" sub-collection
  useEffect(() => {
    if (!auth.currentUser) return;
    const user = auth.currentUser;

    // Reference to this user’s children sub-collection
    const childrenRef = collection(db, "users", user.uid, "children");

    // Listen for updates (adds, deletes, edits)
    const unsubscribe = onSnapshot(childrenRef, (snapshot) => {
      setChildren(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Clean up listener on unmount
    return () => unsubscribe();
  }, []);

  
  // ADD CHILD HANDLER
  
  // Called when the form is submitted.
  // Creates a new Firestore document in the user’s "children" sub-collection.
  const handleAddChild = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    const user = auth.currentUser;

    await addDoc(collection(db, "users", user.uid, "children"), {
      name: newChild,
      colour: colour,
    });

    // Reset form inputs after adding
    setNewChild("");
    setColour(colours[0]);
  };

  
  // DELETE CHILD HANDLER
  
  // Removes the child document by ID from Firestore.
  const handleDeleteChild = async (id) => {
    if (!auth.currentUser) return;
    const user = auth.currentUser;
    await deleteDoc(doc(db, "users", user.uid, "children", id));
  };

  
  // COMPONENT RENDER
  
  return (
    <div style={{ padding: "1rem" }}>
      {/* Logo at the top of the page */}
      <div style={{ textAlign: "center", marginBottom: "1rem" }}>
        <img
          src="public/childcare-share-pwa/public/ChildcareShareLogo.png"
          alt="App Logo"
          style={{ maxHeight: "80px" }}
        />
      </div>

      {/* Navigation bar (consistent across app pages) */}
      <nav className="navbar">
        <ul>
          <li><Link to="/notifications">Notifications</Link></li>
          <li><Link to="/calendar">Calendar</Link></li>
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><Link to="/village">Village</Link></li>
          <li><Link to="/messages">Messages</Link></li>
          <li><button onClick={handleLogout}>Log Out</button></li>
        </ul>
      </nav>

      {/* Page heading and description */}
      <h1 style={{ textAlign: "center", marginBottom: "1rem" }}>Manage Children</h1>
      <p>
        Add your children to the app to cut down on the headache of 
        "figuring out the logistics".
      </p>

      {/* Form to add a new child */}
      <form onSubmit={handleAddChild} style={{ marginBottom: "1rem" }}>
        <input
          value={newChild}
          onChange={(e) => setNewChild(e.target.value)}
          placeholder="Child's name"
          required
          style={{ marginRight: "0.5rem" }}
        />
        {/* Dropdown to select a colour from the predefined palette */}
        <select value={colour} onChange={(e) => setColour(e.target.value)}>
          {colours.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <button type="submit" style={{ marginLeft: "0.5rem" }}>
          Add Child
        </button>
      </form>

      {/* Display list of children */}
      <ul>
        {children.map((child) => (
          <li key={child.id} style={{ marginBottom: "0.5rem" }}>
            {/* Display child name with colour-coded label */}
            <span
              style={{
                backgroundColor: child.colour,
                padding: "2px 6px",
                borderRadius: "4px",
                marginRight: "0.5rem",
              }}
            >
              {child.name}
            </span>
            {/* Delete button for each child */}
            <button onClick={() => handleDeleteChild(child.id)}>X</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Children;
