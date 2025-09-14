/**
 * Village Page
 *
 * This component allows users to manage their "village" of trusted adults for childcare support.
 * It provides the ability to:
 *   - View a list of trusted adults with details such as name, relation, and phone number.
 *   - Add new trusted adults to the user's village.
 *   - Send in-app messages to adults who have opted-in for messaging.
 *
 * Key Features:
 *   - Real-time Firestore updates: listens for changes in the user's village sub-collection.
 *   - Demo data seeding: populates sample trusted adults for new accounts or empty villages.
 *   - Controlled form inputs for adding trusted adults.
 *   - Conditional messaging interface that shows a message input box when a trusted adult is selected.
 *   - Role of `canMessage` determines whether the "Message" button is shown.
 *
 * Notes:
 *   - Messages are currently logged to the console; in production, messages would be sent via Firestore or notifications.
 *   - Each trusted adult document includes a timestamp for potential ordering or auditing.
 */

import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { db, auth } from '../../firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, onSnapshot, getDocs } from "firebase/firestore";

/**
 * Village Page
 *
 * Allows users to manage their trusted adults ("village") for childcare support.
 * Features:
 *   - View, add, and message trusted adults
 *   - Real-time updates from Firestore
 *   - Demo data seeding for new users
 */

function Village() {
 
  // STATE MANAGEMENT 

  // Stores list of trusted adults retrieved from Firestore
  const [trustedAdults, setTrustedAdults] = useState([]);

  // Controlled inputs for adding a new trusted adult
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Messaging state
  const [selectedAdultForMessaging, setSelectedAdultForMessaging] = useState(null);
  const [currentMessageText, setCurrentMessageText] = useState("");
  
  //  Actions 
    const handleLogout = async () => {
      try {
        await signOut(auth);
        window.location.href = "/login";
      } catch (err) {
        console.error("Error logging out:", err);
      }
    };
    
  // SAMPLE DATA FOR PROTOTYPE 

  // Demo adults used to seed Firestore if empty
  const sampleAdults = [
    { name: "Mary", relation: "Grandma", phoneNumber: "07896346328", canMessage: true },
    { name: "Joshua", relation: "Grandad", phoneNumber: "07937459294", canMessage: false },
    { name: "Sarah's Mom", relation: "School Parent", phoneNumber: "0728493053", canMessage: true },
    { name: "Katy", relation: "Babysitter", phoneNumber: "0754832984", canMessage: true }
  ];

  //  FUNCTION TO SEED DEMO DATA 
  const seedTestAdults = async (uid) => {
    if (!uid) return;

    const villageCollectionRef = collection(db, "users", uid, "village");
    const snapshot = await getDocs(villageCollectionRef);

    if (snapshot.empty) {
      console.log("Seeding test trusted adults...");
      for (const adult of sampleAdults) {
        try {
          await addDoc(villageCollectionRef, {
            ...adult,
            timestamp: serverTimestamp(), // For ordering or auditing
          });
        } catch (err) {
          console.error("Error seeding trusted adult:", err);
        }
      }
      console.log("Test trusted adults seeded successfully!");
    } else {
      console.log("Village collection is not empty, skipping seeding.");
    }
  };

  //  FETCH & LISTEN FOR REALTIME UPDATES 
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      console.log("User not logged in, cannot fetch or seed village.");
      return;
    }

    // Seed demo data for fresh accounts
    seedTestAdults(uid);

    // Listen for changes in the village sub-collection
    const villageRef = collection(db, "users", uid, "village");
    const unsubscribe = onSnapshot(
      villageRef,
      (snapshot) => {
        // Convert Firestore docs to JS objects
        const adults = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTrustedAdults(adults); // Update local state
      },
      (error) => {
        console.error("Error listening to village updates:", error);
      }
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  //  ADD A NEW TRUSTED ADULT 
  const handleAddAdult = async (e) => {
    e.preventDefault();
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    try {
      await addDoc(collection(db, "users", uid, "village"), {
        name,
        relation,
        phoneNumber: phoneNumber,
        canMessage: true, // Default allow messaging
        timestamp: serverTimestamp(),
      });
      // Reset form after successful add
      setName("");
      setRelation("");
      setPhoneNumber("");
    } catch (err) {
      console.error("Error adding trusted adult:", err);
    }
  };

  //  MESSAGING HANDLERS 

  // Open message input for selected adult
  const handleMessageButtonClick = (adult) => {
    setSelectedAdultForMessaging(adult);
    setCurrentMessageText(""); // Start with blank input
  };

  // Handle sending message
  const handleSendMessage = () => {
    if (selectedAdultForMessaging && currentMessageText.trim()) {
      console.log(
        `Sending message to ${selectedAdultForMessaging.name}: "${currentMessageText}"`
      );

      // In production: write to Firestore or trigger notification
      setCurrentMessageText(""); // Clear input
      setSelectedAdultForMessaging(null); // Close messaging UI
    } else {
      alert("Please type a message before sending!");
    }
  };

  // Cancel messaging
  const handleCancelMessage = () => {
    setSelectedAdultForMessaging(null);
    setCurrentMessageText("");
  };

  //  RENDER 
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
          <li><button onClick={handleLogout}>Log Out</button></li>
        </ul>
      </nav>

      {/* Village List */}
      <h1 style={{ marginBottom: "1rem", textAlign: "center" }}>Your Village</h1>
      <p>Your chosen trusted adults for childcare:</p>
      <ul>
        {trustedAdults.map((a) => (
          <li
            key={a.id}
            style={{
              marginBottom: "0.5rem",
              display: "flex",
              alignItems: "center",
            }}
          >
            <strong>{a.name}</strong> ({a.relation})
            {a.phoneNumber && (
              <span style={{ marginLeft: "0.5rem" }}>| Phone: {a.phoneNumber}</span>
            )}
            {/* Show "Message" button only if adult allows messaging */}
            {a.canMessage && (
              <button
                onClick={() => handleMessageButtonClick(a)}
                style={{
                  marginLeft: "1rem",
                  padding: "0.2rem 0.5rem",
                  background: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "3px",
                  cursor: "pointer",
                }}
              >
                Message
              </button>
            )}
          </li>
        ))}
      </ul>

      {/* Messaging Box */}
      {selectedAdultForMessaging && (
        <div
          style={{
            marginTop: "2rem",
            padding: "1rem",
            border: "1px solid #ccc",
            borderRadius: "5px",
            backgroundColor: "#f9f9f9",
          }}
        >
          <h3>Message {selectedAdultForMessaging.name}</h3>
          <textarea
            rows="3"
            placeholder={`Type your message to ${selectedAdultForMessaging.name}...`}
            value={currentMessageText}
            onChange={(e) => setCurrentMessageText(e.target.value)}
            style={{
              width: "100%",
              padding: "0.5rem",
              marginBottom: "1rem",
              border: "1px solid #ddd",
              borderRadius: "3px",
            }}
          ></textarea>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={handleSendMessage}
              style={{
                padding: "0.5rem 1rem",
                background: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Send Message
            </button>
            <button
              onClick={handleCancelMessage}
              style={{
                padding: "0.5rem 1rem",
                background: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Add Trusted Adult Form */}
      <h2 style={{ marginTop: "2rem" }}>Add a Trusted Adult</h2>
      <form
        onSubmit={handleAddAdult}
        style={{
          display: "flex",
          flexDirection: "column",
          maxWidth: "300px",
          gap: "10px",
        }}
      >
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Relation"
          value={relation}
          onChange={(e) => setRelation(e.target.value)}
          required
        />
        <input
          type="tel"
          placeholder="Phone Number (optional)"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
        <button
          type="submit"
          style={{
            padding: "0.5rem 1rem",
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Add
        </button>
      </form>
    </div>
  );
}

export default Village;
