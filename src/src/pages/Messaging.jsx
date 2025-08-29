import { useState } from "react";

function Messaging() {
  const [messages, setMessages] = useState([
    { id: 1, from: "Jane", text: "I can take Emily tomorrow!" },
    { id: 2, from: "You", text: "Thanks Jane, much appreciated!" }
  ]);
  const [input, setInput] = useState("");

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages([...messages, { id: Date.now(), from: "You", text: input }]);
    setInput("");
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Messaging</h1>
      <div style={{ border: "1px solid #ccc", padding: "1rem", maxHeight: "300px", overflowY: "auto" }}>
        {messages.map(m => (
          <p key={m.id}><b>{m.from}:</b> {m.text}</p>
        ))}
      </div>
      <form onSubmit={sendMessage} style={{ marginTop: "1rem" }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message..." required />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default Messaging;
