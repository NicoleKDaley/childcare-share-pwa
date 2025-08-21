import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";

function Dashboard() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Dashboard</h1>
      <p>Welcome to the Childcare Share App!</p>
      <p>Here you can manage childcare schedules, view shared resources, and connect with your village helping your family thrive.</p>
    </div>
  );
}

async function addChildcarePost(title, description) {
  try {
    await addDoc(collection(db, "childcarePosts"), {
      title,
      description,
      createdAt: new Date()
    });
    console.log("Post added!");
  } catch (error) {
    console.error("Error adding post:", error);
  }
}

export default Dashboard;
