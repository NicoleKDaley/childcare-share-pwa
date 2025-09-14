import { collection, query, where, orderBy, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Fetch activities for a user between two dates.
 * Converts Firestore Timestamps to JS Date objects automatically.
 * 
 * @param {string} userId 
 * @param {Date} startDate 
 * @param {Date} endDate 
 * @param {function} callback - receives array of activities
 * @returns unsubscribe function
 */
export const subscribeActivities = (userId, startDate, endDate, callback) => {
  const activitiesRef = collection(db, "users", userId, "activities");

  const q = query(
    activitiesRef,
    where("start", ">=", Timestamp.fromDate(startDate)),
    where("start", "<=", Timestamp.fromDate(endDate)),
    orderBy("start", "asc")
  );

  const unsubscribe = onSnapshot(q, snapshot => {
    const activities = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        start: data.start?.toDate?.() || data.start,
        end: data.end?.toDate?.() || data.end,
      };
    });

    callback(activities);
  });

  return unsubscribe;
};
