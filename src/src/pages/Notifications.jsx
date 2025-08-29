import { useState } from "react";

function Notifications() {
  const [notifications] = useState([
    { id: 1, text: "Football practice at 5pm. Waiting for adult assignment." },
    { id: 2, text: "Jane has agreed to take Emily to ballet tomorrow." }
  ]);

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Notifications</h1>
      {notifications.length === 0 ? (
        <p>No notifications today.</p>
      ) : (
        <ul>
          {notifications.map(n => (
            <li key={n.id}>{n.text}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Notifications;
