/**
 * Calendar.jsx
 *
 * This component provides the main calendar functionality for the Childcare Share app.
 * It allows the primary user to:
 *   • View activities for their children on a shared calendar, colour-coded by child.
 *   • Add new activities (with title, location, start/end times, and recurrence options).
 *   • Assign activities to themselves or a trusted adult ("village" member).
 *   • Request help from their village, which sends a notification to trusted adults.
 *   • Delete individual activities or entire recurring series.
 *   • View activity details in a popup, including recurrence and responsibility.
 *
 * Data sources:
 *   • Children: Firestore subcollection under /users/{uid}/children
 *   • Trusted Adults (Village): Firestore subcollection under /users/{uid}/village
 *   • Activities/Events: Firestore subcollection under /users/{uid}/activities
 *   • Messages/Notifications: Firestore subcollection under /users/{uid}/messages
 *
 * Libraries used:
 *   • react-big-calendar (with date-fns localizer for UK English formatting)
 *   • Firebase Authentication (for current user context)
 *   • Firebase Firestore (for persistence of children, activities, village, and messages)
 *
 * User flow:
 *   1. The user adds children and trusted adults on other pages.
 *   2. On the calendar page, they can schedule activities for those children.
 *   3. Each activity can be recurring, assigned to an adult, or shared as a help request.
 *   4. Calendar view automatically syncs with Firestore and updates in real time.
 *
 * This page acts as the central hub for activity logistics, reducing the "who’s doing what
 * and when" burden by giving visibility, accountability, and coordination tools.
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { db, auth } from "../../firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";

// Calendar imports (React Big Calendar with date-fns as the localizer)
import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import enGB from "date-fns/locale/en-GB";
import addDays from "date-fns/addDays";
import addWeeks from "date-fns/addWeeks";
import addMonths from "date-fns/addMonths";
import addYears from "date-fns/addYears";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { signOut } from "firebase/auth";

// Set up UK English localisation for the calendar
const locales = { "en-GB": enGB };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

function Calendar() {
  
  // React State Hooks
  
  const [events, setEvents] = useState([]);              // Stores activity events
  const [children, setChildren] = useState([]);          // Stores child profiles
  const [newChild, setNewChild] = useState("");          // Form: selected child
  const [newTitle, setNewTitle] = useState("");          // Form: activity title
  const [newLocation, setNewLocation] = useState("");    // Form: activity location
  const [newStart, setNewStart] = useState("");          // Form: start datetime
  const [newEnd, setNewEnd] = useState("");              // Form: end datetime
  const [recurrence, setRecurrence] = useState("none");  // Form: repeat rule
  const [occurrences, setOccurrences] = useState(1);     // Form: number of repeats
  const [selectedEvent, setSelectedEvent] = useState(null); // Currently selected event in popup
  const [village, setVillage] = useState([]);            // Trusted adults
  const [assignedAdult, setAssignedAdult] = useState(""); // Selected adult assignment

  
  // Firestore: Fetch children
  
  useEffect(() => {
    if (!auth.currentUser) return;
    const user = auth.currentUser;

    const childrenRef = collection(db, "users", user.uid, "children");

    const unsubscribe = onSnapshot(childrenRef, (snapshot) => {
      setChildren(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, []);

  
  // Firestore: Fetch trusted adults ("village")
  
  useEffect(() => {
    if (!auth.currentUser) return;
    const user = auth.currentUser;

    const villageRef = collection(db, "users", user.uid, "village");

    const unsubscribe = onSnapshot(villageRef, (snapshot) => {
      setVillage(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, []);

  
  // Firestore: Fetch activities/events
  
  useEffect(() => {
    if (!auth.currentUser) return;
    const user = auth.currentUser;

    const eventsRef = collection(db, "users", user.uid, "activities");

    const unsubscribe = onSnapshot(eventsRef, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        start: new Date(doc.data().start),
        end: new Date(doc.data().end),
      }));
      setEvents(data);
    });

    return () => unsubscribe();
  }, []);

  //  Actions 
    const handleLogout = async () => {
      try {
        await signOut(auth);
        window.location.href = "/login";
      } catch (err) {
        console.error("Error logging out:", err);
      }
    };

  /**
   * Generates an array of recurring date ranges based on a rule.
   *
   * @param {Date} start - The starting datetime of the first event.
   * @param {Date} end - The ending datetime of the first event.
   * @param {string} rule - Recurrence rule ("daily", "weekly", "biweekly", "monthly", "yearly").
   * @param {number} count - Number of occurrences to generate.
   * @returns {Array<{start: Date, end: Date}>} Array of generated date ranges.
   */
  const generateRecurringDates = (start, end, rule, count) => {
    const dates = [];
    let currentStart = new Date(start);
    let currentEnd = new Date(end);

    for (let i = 0; i < count; i++) {
      dates.push({ start: new Date(currentStart), end: new Date(currentEnd) });

      switch (rule) {
        case "daily": currentStart = addDays(currentStart, 1); currentEnd = addDays(currentEnd, 1); break;
        case "weekly": currentStart = addWeeks(currentStart, 1); currentEnd = addWeeks(currentEnd, 1); break;
        case "biweekly": currentStart = addWeeks(currentStart, 2); currentEnd = addWeeks(currentEnd, 2); break;
        case "monthly": currentStart = addMonths(currentStart, 1); currentEnd = addMonths(currentEnd, 1); break;
        case "yearly": currentStart = addYears(currentStart, 1); currentEnd = addYears(currentEnd, 1); break;
        default: return dates;
      }
    }
    return dates;
  };

  /**
   * Handles adding a new event to Firestore.
   * Supports both single and recurring activities.
   *
   * @param {Event} e - Form submission event.
   */
  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    const user = auth.currentUser;

    const dates =
  recurrence === "none"
    ? [{ start: new Date(newStart), end: new Date(newEnd) }]
    : generateRecurringDates(new Date(newStart), new Date(newEnd), recurrence, occurrences);

    const seriesId = recurrence === "none" ? null : Date.now().toString(); // seriesId only for recurring
    
    const eventsRef = collection(db, "users", user.uid, "activities");
  

    // Default to current user if no trusted adult picked
    const chosenAdult = village.find(v => v.id === assignedAdult) || {
      id: user.uid,
      name: user.displayName || "Unnamed",
    };

    for (const d of dates) {
    await addDoc(eventsRef, {
    child: newChild,
    title: newTitle,
    location: newLocation,
    start: d.start.toISOString(),
    end: d.end.toISOString(),
    recurrence,
    seriesId,
    assignedAdult: chosenAdult.id,
    assignedAdultName: chosenAdult.name,
    confirmed: false,
    helpRequested: false,
  });

    }

    // Reset form fields
    setNewChild("");
    setNewTitle("");
    setNewLocation("");
    setNewStart("");
    setNewEnd("");
    setRecurrence("none");
    setOccurrences(1);
    setAssignedAdult("");
  };

  /**
   * Deletes a single event or a full recurring series from Firestore.
   *
   * @param {Object} event - The event object to delete.
   * @param {boolean} wholeSeries - Whether to delete the entire series or just one.
   */
  const handleDeleteEvent = async (event, wholeSeries = false) => {
    if (!auth.currentUser) return;
    const user = auth.currentUser;

    if (wholeSeries && event.seriesId) {
      // Delete all events in the same series
      const q = query(
        collection(db, "users", user.uid, "activities"),
        where("seriesId", "==", event.seriesId)
      );
      const snapshot = await getDocs(q);
      for (const docSnap of snapshot.docs) {
        await deleteDoc(docSnap.ref);
      }
    } else {
      // Delete just one event
      const eventRef = doc(db, "users", user.uid, "activities", event.id);
      await deleteDoc(eventRef);
    }

    setSelectedEvent(null);
  };

  /**
   * Assigns the currently logged-in user as the responsible adult for an activity.
   * Also logs a notification in the messages collection.
   *
   * @param {string} id - Firestore document ID of the activity.
   */
  const assignAdult = async (id) => {
    if (!auth.currentUser) return;
    try {
      const user = auth.currentUser;
      const ref = doc(db, "users", user.uid, "activities", id);

      await updateDoc(ref, {
        assignedAdult: user.uid,
        assignedAdultName: user.displayName || "Me",
      });

      // Log a message in Firestore
      const messagesRef = collection(db, "users", user.uid, "messages");
      await addDoc(messagesRef, {
        text: `${user.displayName || "Someone"} has taken responsibility for activity ${id}`,
        createdAt: new Date(),
      });

      // Alert confirmation for user feedback
      alert(`You have successfully taken responsibility for activity ${id}`);
    } catch (err) {
      console.error("Error assigning adult:", err);
      alert("An error occurred when taking responsibility.");
    }
  };

  /**
   * Reassigns an event to a different trusted adult.
   *
   * @param {string} eventId - ID of the event being reassigned.
   * @param {string} newAdultId - ID of the new adult.
   */
  const reassignAdult = async (eventId, newAdultId) => {
    if (!auth.currentUser) return;
    const user = auth.currentUser;

    const chosenAdult = village.find(v => v.id === newAdultId) || {
      id: user.uid,
      name: user.displayName || "Unnamed",
    };

    const ref = doc(db, "users", user.uid, "activities", eventId);
    await updateDoc(ref, {
      assignedAdult: chosenAdult.id,
      assignedAdultName: chosenAdult.name,
    });
  };

  /**
   * Sends a help request notification to all trusted adults in the user's "village".
   *
   * @param {Object} event - Event object containing activity details.
   */
  const handleAskHelp = async (event) => {
    if (!auth.currentUser) return;
    const user = auth.currentUser;

    try {
      const villageRef = collection(db, "users", user.uid, "village");
      const villageSnap = await getDocs(villageRef);

      for (const docSnap of villageSnap.docs) {
        const adultId = docSnap.id;
        await addDoc(collection(db, "users", adultId, "messages"), {
          from: user.uid,
          text: `Can you take responsibility for "${event.title}" for ${event.child} on ${event.start.toLocaleString()} at ${event.location}?`,
          createdAt: new Date(),
        });
      }

      alert("Request sent to all trusted adults!");
    } catch (err) {
      console.error("Error sending request:", err);
      alert("Error sending request.");
    }
  };

  
  // JSX: Render UI
  
  return (
    <div style={{ padding: "1rem" }}>
      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: "1rem" }}>
        <img src="public/childcare-share-pwa/public/ChildcareShareLogo.png" alt="App Logo" style={{ maxHeight: "80px" }} />
      </div>

      {/* Navigation */}
      <nav className="navbar">
        <ul>
          <li><Link to="/notifications">Notifications</Link></li>
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><Link to="/children">Children</Link></li>
          <li><Link to="/village">Village</Link></li>
          <li><Link to="/messages">Messages</Link></li>
          <li><button onClick={handleLogout}>Log Out</button></li>
        </ul>
      </nav>

      <h1 style={{ marginBottom: "1rem", textAlign: "center" }}>Calendar</h1>

      {/* Add new activity form */}
      <form onSubmit={handleAddEvent} style={{ marginBottom: "1rem" }}>
        {/* Child selection dropdown */}
        <select
          value={newChild}
          onChange={(e) => setNewChild(e.target.value)}
          required
        >
          <option value="">Select Child</option>
          {children.map((c) => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>

        {/* Title, location, times */}
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Activity Title"
          required
        />
        <input
          value={newLocation}
          onChange={(e) => setNewLocation(e.target.value)}
          placeholder="Activity Location"
          required
        />
        <input
          type="datetime-local"
          value={newStart}
          onChange={(e) => setNewStart(e.target.value)}
          required
        />
        <input
          type="datetime-local"
          value={newEnd}
          onChange={(e) => setNewEnd(e.target.value)}
          required
        />

        {/* Recurrence options */}
        <select value={recurrence} onChange={(e) => setRecurrence(e.target.value)} style={{ marginLeft: "0.5rem" }}>
          <option value="none">Does not repeat</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="biweekly">Bi-Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>

        {recurrence !== "none" && (
          <input
            type="number"
            min="1"
            value={occurrences}
            onChange={(e) => setOccurrences(Number(e.target.value))}
            placeholder="Number of times"
            style={{ width: "80px", marginLeft: "0.5rem" }}
          />
        )}

        <button type="submit" style={{ marginLeft: "0.5rem" }}>Add Activity</button>
      </form>

      {/* Calendar view */}
      <BigCalendar
        localizer={localizer}
        events={events.map(ev => ({
          ...ev,
          title: `${ev.child} – (${ev.location || "No location"})`,
        }))}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        onSelectEvent={(event) => setSelectedEvent(event)}
        eventPropGetter={(event) => {
          const childObj = children.find(c => c.name === event.child);
          return {
            style: {
              backgroundColor: childObj?.colour || "#D3D3D3",
              color: "black",
              borderRadius: "6px",
              padding: "2px 4px",
            },
          };
        }}
      />

      {/* Event details popup */}
      {selectedEvent && (
        <div
          style={{
            position: "fixed",
            top: "30%",
            left: "50%",
            transform: "translate(-50%, -30%)",
            background: "white",
            padding: "1rem",
            border: "1px solid #ccc",
            borderRadius: "8px",
            zIndex: 1000,
          }}
        >
          <h3>{selectedEvent.child} – {selectedEvent.title}</h3>
          <p>
            Location: {selectedEvent.location || "Not specified"} <br />
            Start: {selectedEvent.start.toLocaleString()} <br />
            End: {selectedEvent.end.toLocaleString()}
          </p>
          {selectedEvent.recurrence !== "none" && <p>Repeats: {selectedEvent.recurrence}</p>}

          <button onClick={() => assignAdult(selectedEvent.id)}>Take Responsibility</button>
          <button onClick={() => handleAskHelp(selectedEvent)} style={{ marginLeft: "0.5rem" }}>Ask Trusted Adults</button>
          <br /><br />

          {selectedEvent.seriesId ? (
            <>
              <button onClick={() => handleDeleteEvent(selectedEvent, false)}>Delete Only This Event</button>
              <button onClick={() => handleDeleteEvent(selectedEvent, true)} style={{ marginLeft: "0.5rem" }}>Delete Whole Series</button>
            </>
          ) : (
            <button onClick={() => handleDeleteEvent(selectedEvent)}>Delete</button>
          )}

          <button onClick={() => setSelectedEvent(null)} style={{ marginLeft: "0.5rem" }}>Close</button>
        </div>
      )}
    </div>
  );
}

export default Calendar;
