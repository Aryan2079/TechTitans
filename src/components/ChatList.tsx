import React, { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  getDocs,
} from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";

interface Chat {
  id: string;
  lastMessage: string;
  timestamp: Date;
  participants: string[];
  otherUserName: string;
}

export function ChatList() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Store the user display names mapped by their uid
  const [userNames, setUserNames] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      setError("Please log in to view your chats.");
      return;
    }

    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", currentUser.uid),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const chatList: Chat[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          const otherUserId = data.participants.find(
            (id: string) => id !== currentUser.uid
          );

          // Fetch the display name for the other user if it hasn't been fetched yet
          const otherUserName = userNames[otherUserId] || "Unknown User";

          chatList.push({
            id: doc.id,
            lastMessage: data.lastMessage || "No messages yet",
            timestamp: data.timestamp.toDate(),
            participants: data.participants,
            otherUserName: otherUserName,
          });
        });
        setChats(chatList);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching chats:", err);
        setError("Failed to retrieve chats. Please try again later.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser, userNames]); // Make sure to re-run this effect if userNames change

  // Fetch user names when the component mounts or when a participant is added
  useEffect(() => {
    const fetchUserNames = async () => {
      const participantIds = new Set<string>();
      chats.forEach((chat) => {
        chat.participants.forEach((id) => participantIds.add(id));
      });

      // Convert the Set to an array and check if it's empty
      const participantIdsArray = Array.from(participantIds);

      if (participantIdsArray.length > 0) {
        const userQuery = query(
          collection(db, "userProfiles"),
          where("uid", "in", participantIdsArray)
        );

        try {
          const userDocs = await getDocs(userQuery);
          const userNamesMap: Record<string, string> = {};

          userDocs.forEach((doc) => {
            const data = doc.data();
            userNamesMap[data.uid] = data.displayName || "Unknown User";
          });

          setUserNames(userNamesMap); // Update state with fetched user names
        } catch (err) {
          console.error("Error fetching user names:", err);
        }
      }
    };

    fetchUserNames();
  }, [chats]); // Re-fetch user names when chats data changes

  const handleChatClick = (chatId: string) => {
    navigate(`/messages/${chatId}`);
  };

  if (loading) {
    return <div className="p-4">Loading chats...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Your Chats</h1>
      {chats.length === 0 ? (
        <p className="text-center text-gray-500">No chats available</p>
      ) : (
        <div className="space-y-4">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className="flex items-center space-x-4 p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
              onClick={() => handleChatClick(chat.id)}
            >
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={`https://api.dicebear.com/6.x/initials/svg?seed=${chat.otherUserName}`}
                />
                <AvatarFallback>
                  {chat.otherUserName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-grow">
                <p className="font-bold">{chat.otherUserName}</p>
                <p className="text-sm text-gray-600 truncate">
                  {chat.lastMessage}
                </p>
              </div>
              <div className="text-xs text-gray-400">
                {formatTimestamp(chat.timestamp)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return date.toLocaleDateString();
}
