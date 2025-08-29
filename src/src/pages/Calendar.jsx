import { Link } from "react-router-dom";
import { useState } from "react";

function Calendar() {
  const [activities, setActivities] = useState([]);
  const [form, setForm] = useState({ child: "", activity: "", start: "", end: "", location: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newActivity = { ...form, id: Date.now(), assignedAdult: null };
    setActivities([...activities, newActivity]);
    setForm({ child: "", activity: "", start: "", end: "", location: "" });
  };

  const assignAdult = (id, adultName) => {
    setActivities(activities.map(act => act.id === id ? { ...act, assignedAdult: adultName } : act));
    // later: send Firebase notification to parent + adult
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Calendar</h1>

      <form onSubmit={handleSubmit}>
        <input name="child" value={form.child} onChange={handleChange} placeholder="Child's Name" required />
        <input name="activity" value={form.activity} onChange={handleChange} placeholder="Activity" required />
        <input name="start" type="datetime-local" value={form.start} onChange={handleChange} required />
        <input name="end" type="datetime-local" value={form.end} onChange={handleChange} required />
        <input name="location" value={form.location} onChange={handleChange} placeholder="Location" required />
        <button type="submit">Add Activity</button>
      </form>

      <ul>
        {activities.map(act => (
          <li key={act.id}>
            <b>{act.child}</b> - {act.activity} ({act.start} → {act.end}) at {act.location}
            <br />
            {act.assignedAdult ? (
              <span>Assigned to: {act.assignedAdult}</span>
            ) : (
              <button onClick={() => assignAdult(act.id, "Trusted Adult")}>Take Responsibility</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Calendar;
