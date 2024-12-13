import React, { useEffect, useState, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { db } from "../firebase/firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { useAuth } from "../contexts/AuthContext";
import { ChatList } from "../components/ChatList";
import { ArrowLeft, Send } from "lucide-react";

interface Message {
  id: string;
  text: string;
  timestamp: Timestamp;
  senderId: string;
}

interface UserProfile {
  uid: string;
  displayName: string;
}

export function Messages() {
  const { chatId } = useParams<{ chatId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user: selectedUser } =
    (location.state as { user: UserProfile }) || {};
  const { currentUser } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState<string>("");
  const [otherUser, setOtherUser] = useState<UserProfile | null>(
    selectedUser || null
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchOtherUser = async () => {
      if (chatId && currentUser) {
        const chatDoc = await getDoc(doc(db, "chats", chatId));
        if (chatDoc.exists()) {
          const participants = chatDoc.data().participants;
          const otherUserId = participants.find(
            (id: string) => id !== currentUser.uid
          );
          if (otherUserId) {
            const userDoc = await getDoc(doc(db, "userProfiles", otherUserId));
            if (userDoc.exists()) {
              setOtherUser(userDoc.data() as UserProfile);
            }
          }
        }
      }
    };

    if (!selectedUser) {
      fetchOtherUser();
    } else {
      setOtherUser(selectedUser); // Ensure `otherUser` is populated if passed via state
    }
  }, [chatId, currentUser, selectedUser]);

  useEffect(() => {
    if (chatId) {
      const q = query(
        collection(db, "chats", chatId, "messages"),
        orderBy("timestamp", "asc")
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const messageList: Message[] = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Message)
        );
        setMessages(messageList);
      });

      return () => unsubscribe();
    }
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (messageText.trim() && chatId && currentUser && otherUser) {
      const chatRef = doc(db, "chats", chatId);
      const chatDoc = await getDoc(chatRef);

      if (!chatDoc.exists()) {
        // Create chat if it doesn't exist
        await setDoc(chatRef, {
          participants: [currentUser.uid, otherUser.uid],
          lastMessage: messageText,
          timestamp: Timestamp.now(),
          participantNames: {
            [currentUser.uid]: currentUser.displayName,
            [otherUser.uid]: otherUser.displayName,
          },
        });
      } else {
        // Update the last message and timestamp in the chat document
        await updateDoc(chatRef, {
          lastMessage: messageText,
          timestamp: Timestamp.now(),
        });
      }

      // Add the new message to the messages collection
      const newMessage = {
        text: messageText,
        timestamp: Timestamp.now(),
        senderId: currentUser.uid,
      };

      await addDoc(collection(db, "chats", chatId, "messages"), newMessage);

      setMessageText("");
    }
  };

  const formatTimestamp = (timestamp: Timestamp) => {
    const date = timestamp.toDate();
    return date.toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
      month: "short",
      day: "numeric",
    });
  };

  if (!chatId) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <ChatList />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 h-screen flex flex-col">
      <div className="flex items-center space-x-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/messages")}
          className="mr-2"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        {otherUser && (
          <>
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={`https://api.dicebear.com/6.x/initials/svg?seed=${otherUser.displayName}`}
              />
              <AvatarFallback>
                {otherUser.displayName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <h1 className="text-2xl font-bold">{otherUser.displayName}</h1>
          </>
        )}
      </div>
      <div className="flex-grow overflow-y-auto mb-4 space-y-4">
        {messages.length === 0 ? (
          <p className="text-center text-gray-500">
            No messages yet. Start the conversation!
          </p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.senderId === currentUser?.uid
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl p-3 rounded-lg ${
                  msg.senderId === currentUser?.uid
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                <p>{msg.text}</p>
                <p className="text-xs mt-1 opacity-70">
                  {formatTimestamp(msg.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex space-x-2">
        <Input
          placeholder="Type a message"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          className="flex-grow"
        />
        <Button onClick={handleSendMessage}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
