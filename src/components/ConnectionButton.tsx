import React from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase/firebase";
import {
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

interface ConnectionButtonProps {
  userId: string;
  isConnected: boolean;
  onConnectionChange: () => void;
}

export function ConnectionButton({
  userId,
  isConnected,
  onConnectionChange,
}: ConnectionButtonProps) {
  const { currentUser } = useAuth();

  const handleConnection = async () => {
    if (!currentUser) return;

    const connectionRef = doc(
      db,
      "connections",
      currentUser.uid,
      "users",
      userId
    );
    const userProfileRef = doc(db, "userProfiles", currentUser.uid);

    try {
      if (isConnected) {
        await deleteDoc(connectionRef);
        await updateDoc(userProfileRef, {
          connections: arrayRemove(userId),
        });
      } else {
        await setDoc(connectionRef, {
          connectedAt: new Date().toISOString(),
        });
        await updateDoc(userProfileRef, {
          connections: arrayUnion(userId),
        });
      }
      onConnectionChange();
    } catch (error) {
      console.error("Error updating connection:", error);
    }
  };

  return (
    <Button onClick={handleConnection}>
      {isConnected ? "Disconnect" : "Connect"}
    </Button>
  );
}
