/**
 * Notifications Page
 *
 * This component provides the user with a centralized view of childcare-related
 * notifications and reminders. It connects to Firestore to track the user’s
 * activities and messages in real time and derives key categories of information:
 *
 *  - **Action Items**: Activities that do not yet have a responsible adult.
 *  - **Reminders**: Unread messages and tasks assigned to the user within the
 *    next 24 hours that may require confirmation.
 *  - **Upcoming Tasks**: Tasks assigned to the user within the next 3 days.
 *
 * Core Features:
 *  - Subscribes to Firestore collections (`activities` and `messages`) for the
 *    current user.
 *  - Provides actions for the user:
 *      • Take responsibility for an unassigned activity.
 *      • Ask trusted adults for help with an activity.
 *      • Confirm pickup/drop-off for assigned tasks.
 *  - Sends confirmation or request messages to the primary user’s notifications
 *    collection, with immediate UI feedback via alerts.
 *  - Displays real-time counts (unassigned activities, unread messages) and
 *    task lists grouped by urgency.
 *
 * This page acts as the central “to-do” hub for coordinating childcare
 * responsibilities and communication between parents and trusted adults.
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
  addDoc,
} from "firebase/firestore";
import { Link } from "react-router-dom";

function Notifications() {
  
  // React State
  
  const [activities, setActivities] = useState([]); // All activities for the user
  const [messages, setMessages] = useState([]);     // Notification messages
  const [uid, setUid] = useState(null);             // Current user ID

  //  Actions 
    const handleLogout = async () => {
      try {
        await signOut(auth);
        window.location.href = "/login";
      } catch (err) {
        console.error("Error logging out:", err);
      }
    };

  // TODO: replace with dynamic lookup if stored in Firestore
  const primaryUid = "PRIMARY_USER_UID";


  
  // Firestore Subscriptions
  
  useEffect(() => {
    if (!auth.currentUser) return;
    const currentUid = auth.currentUser.uid;
    setUid(currentUid);

    // Activities subscription (all activities, sorted by start date) 
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

    // Messages subscription (most recent first) 
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

  
  // Derived Data
  

  // Unassigned activities - user needs to take action
  const actionItems = activities.filter((ev) => !ev.assignedAdult);

  // Unread messages
  const unreadMessages = messages.filter((message) => !message.read);

  // Next 24h tasks assigned to this user
  const next24hTasks = activities.filter(
    (ev) =>
      ev.assignedAdult === uid &&
      new Date(ev.start) > new Date() &&
      new Date(ev.start) < new Date(Date.now() + 24 * 60 * 60 * 1000)
  );

  // Next 3 days tasks assigned to this user
  const next3DaysTasks = activities.filter(
    (ev) =>
      ev.assignedAdult === uid &&
      new Date(ev.start) > new Date() &&
      new Date(ev.start) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
  );

  
  // Firestore Actions
  

  // Helper to push a message to the primary user's notifications + show an alert
  const pushMessage = async (text) => {
    try {
      await addDoc(collection(db, "users", primaryUid, "messages"), {
        text,
        createdAt: new Date(),
        read: false,
        type: "confirmation",
      });
      alert(text); // immediate feedback
    } catch (err) {
      console.error("Error adding message:", err);
    }
  };

  /**
   * Confirms that the user will handle a pickup/drop-off.
   * Updates the activity AND sends a confirmation message.
   */
  const confirmTask = async (activity) => {
    if (!uid) return;
    try {
      const ref = doc(db, "users", uid, "activities", activity.id);

      await updateDoc(ref, {
        assignedAdult: uid,
        helpRequested: false,
        confirmed: true,
      });

      const userName = auth.currentUser?.displayName || "A user";
      const messageText = `${userName} has confirmed pickup/drop-off of ${activity.child} (${activity.title}).`;
      await pushMessage(messageText);

      console.log("Confirmed task:", activity.id);
    } catch (err) {
      console.error("Error confirming task:", err);
    }
  };

  /**
   * Takes responsibility for an unassigned activity.
   */
  const takeResponsibility = async (activity) => {
    if (!uid) return;
    try {
      const ref = doc(db, "users", uid, "activities", activity.id);

      await updateDoc(ref, {
        assignedAdult: uid,
        helpRequested: false,
      });

      const userName = auth.currentUser?.displayName || "A user";
      const messageText = `${userName} has taken responsibility for ${activity.child} (${activity.title}).`;
      await pushMessage(messageText);

      console.log("You have taken responsibility for:", activity.id);
    } catch (err) {
      console.error("Error assigning activity:", err);
    }
  };

  /**
   * Requests help from trusted adults.
   */
  const askTrustedAdults = async (activity) => {
    if (!uid) return;
    try {
      const ref = doc(db, "users", uid, "activities", activity.id);

      await updateDoc(ref, {
        helpRequested: true,
      });

      const userName = auth.currentUser?.displayName || "A user";
      const messageText = `${userName} requested help with ${activity.child} (${activity.title}).`;
      await pushMessage(messageText);

      console.log("Help requested for:", activity.id);
    } catch (err) {
      console.error("Error requesting help:", err);
    }
  };

  
  // JSX Rendering
  
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
          <li><Link to="/calendar">Calendar</Link></li>
          <li><Link to="/messages">Messages</Link></li>
          <li><Link to="/children">Children</Link></li>
          <li><Link to="/village">Village</Link></li>
          <li><button onClick={handleLogout}>Log Out</button></li>
        </ul>
      </nav>

      <h1 style={{ margin: "1rem 0", textAlign: "center" }}>Notifications</h1>

      {/* ACTION ITEMS */}
      <h2 className="mt-6 text-lg font-semibold">Action Items</h2>
      <p>You have {actionItems.length} unassigned activities.</p>
      {actionItems.length > 0 && (
        <ul>
          {actionItems.map((ev) => (
            <li
              key={ev.id}
              style={{
                borderLeft: `4px solid ${ev.colour || "#ccc"}`,
                paddingLeft: "0.5rem",
                marginBottom: "0.5rem",
              }}
            >
              <b>{ev.child}</b> – {ev.title} on{" "}
              {new Date(ev.start).toLocaleString()} at {ev.location}
              <br />
              <button
                onClick={() => takeResponsibility(ev)}
                style={{ marginRight: "0.5rem" }}
              >
                Take Responsibility
              </button>
              <button onClick={() => askTrustedAdults(ev)}>
                Ask Trusted Adults
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* REMINDERS */}
      <h2 className="mt-6 text-lg font-semibold">Your Reminders</h2>
      <p>You have {unreadMessages.length} unread messages.</p>
      {next24hTasks.length === 0 ? (
        <p>No tasks assigned to you in the next 24 hours.</p>
      ) : (
        <ul>
          {next24hTasks.map((task) => (
            <li key={task.id}>
              <b>{task.title}</b> – {new Date(task.start).toLocaleString()}
              <br />
              <button
                onClick={() => confirmTask(task)}
                style={{ marginTop: "0.5rem" }}
              >
                Confirm Pickup/Drop-off
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* UPCOMING TASKS */}
      <h2 className="mt-6 text-lg font-semibold">Your Upcoming Tasks</h2>
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
                onClick={() => confirmTask(task)}
                style={{ marginTop: "0.5rem" }}
              >
                Confirm Pickup/Drop-off
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Notifications;
