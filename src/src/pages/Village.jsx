import { useState } from "react";

function Village() {
  const [trustedAdults] = useState([
    { id: 1, name: "Jane Smith", relation: "Aunt" },
    { id: 2, name: "Michael Johnson", relation: "Grandad" }
  ]);

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Village</h1>
      <p>Your trusted adults:</p>
      <ul>
        {trustedAdults.map(a => (
          <li key={a.id}>
            {a.name} ({a.relation})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Village;
