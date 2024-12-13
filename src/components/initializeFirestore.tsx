import { useEffect } from "react";
import { db } from "../firebase/firebase";
import { doc, setDoc } from "firebase/firestore";

const initializeFirestore = async () => {
  const users = [
    {
      uid: "influencer-001",
      email: "influencer@example.com",
      userType: "influencer",
      displayName: "John Doe",
      category: "Tech",
      location: "San Francisco",
      bio: "Tech enthusiast sharing knowledge.",
    },
    {
      uid: "business-001",
      email: "business@example.com",
      userType: "business",
      displayName: "Jane's Restaurant",
      category: "Food & Drink",
      location: "Los Angeles",
      bio: "Best pizza in town!",
    },
    {
      uid: "influencer-002",
      email: "influencer2@example.com",
      userType: "influencer",
      displayName: "Alice Smith",
      category: "Fashion",
      location: "New York",
      bio: "Fashion influencer and stylist.",
    },
    {
      uid: "business-002",
      email: "business2@example.com",
      userType: "business",
      displayName: "Mark's Gym",
      category: "Fitness",
      location: "Chicago",
      bio: "Get fit with us at Mark's Gym.",
    },
  ];

  for (const user of users) {
    await setDoc(doc(db, "userProfiles", user.uid), user);
  }

  console.log("Firestore initialized with dummy data");
};

const FirestoreInitializer = () => {
  useEffect(() => {
    initializeFirestore();
  }, []);

  return null; // This component won't render anything
};

export default FirestoreInitializer;
