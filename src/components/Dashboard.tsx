import React, { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { ConnectionButton } from "../components/ConnectionButton";
import { useNavigate } from "react-router-dom";

interface Connection {
  uid: string;
  displayName: string;
  photoURL: string;
}

export function Dashboard() {
  const [recentConnections, setRecentConnections] = useState<Connection[]>([]);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const fetchRecentConnections = async () => {
    if (currentUser) {
      const userProfileRef = doc(db, "userProfiles", currentUser.uid);
      const userProfileSnap = await getDoc(userProfileRef);
      const userData = userProfileSnap.data();
      const connectionIds = userData?.connections || [];

      const connections = await Promise.all(
        connectionIds.map(async (id: string) => {
          // Add ': string' here
          const userProfileRef = doc(db, "userProfiles", id);
          const userProfileSnap = await getDoc(userProfileRef);
          const userData = userProfileSnap.data();
          return {
            uid: id,
            displayName: userData?.displayName || "Unknown User",
            photoURL: userData?.photoURL || "https://via.placeholder.com/150",
          };
        })
      );

      setRecentConnections(connections);
    }
  };

  useEffect(() => {
    fetchRecentConnections();
  }, [currentUser]);

  const handleRateUser = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Recent Connections</h1>
      {recentConnections.map((connection) => (
        <div
          key={connection.uid}
          className="p-4 border rounded mb-4 flex justify-between items-center"
        >
          <div>
            <h2 className="font-medium">{connection.displayName}</h2>
          </div>
          <div className="flex space-x-2">
            <ConnectionButton
              userId={connection.uid}
              isConnected={true}
              onConnectionChange={() => {
                fetchRecentConnections();
              }}
            />
            {currentUser?.uid !== connection.uid && (
              <Button onClick={() => handleRateUser(connection.uid)}>
                Rate User
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
