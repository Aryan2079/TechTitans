import React, { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { useNavigate } from "react-router-dom";

interface Chat {
  id: string;
  lastMessage: string;
  timestamp: Timestamp;
  participants: string[];
  otherUser: UserProfile;
}

interface UserProfile {
  uid: string;
  displayName: string;
}

export function ChatList() {
  const [chats, setChats] = useState<Chat[]>([]);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", currentUser.uid),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const chatPromises = snapshot.docs.map(async (doc) => {
        const chatData = doc.data();
        const otherUserId = chatData.participants.find(
          (id: string) => id !== currentUser.uid
        );
        if (otherUserId) {
          const userDoc = await getDocs(
            query(
              collection(db, "userProfiles"),
              where("uid", "==", otherUserId)
            )
          );
          const userData = userDoc.docs[0]?.data() as UserProfile;
          return {
            ...chatData,
            id: doc.id,
            otherUser: userData,
            timestamp: chatData.timestamp as Timestamp,
          } as Chat;
        }
        return null;
      });

      const resolvedChats = (await Promise.all(chatPromises)).filter(Boolean);
      setChats(resolvedChats as Chat[]);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleChatClick = (chatId: string, user: UserProfile) => {
    navigate(`/messages/${chatId}`, { state: { user } });
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Chats</h1>
      <div className="space-y-4">
        {chats.length === 0 ? (
          <p>No chats available</p>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.id}
              className="flex items-center space-x-4 p-4 border-b border-gray-200 cursor-pointer"
              onClick={() => handleChatClick(chat.id, chat.otherUser)}
            >
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={`https://api.dicebear.com/6.x/initials/svg?seed=${chat.otherUser.displayName}`}
                />
                <AvatarFallback>
                  {chat.otherUser.displayName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-grow">
                <p className="font-semibold">{chat.otherUser.displayName}</p>
                <p className="text-sm text-gray-500">{chat.lastMessage}</p>
              </div>
              <p className="text-xs text-gray-400">
                {chat.timestamp.toDate().toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
