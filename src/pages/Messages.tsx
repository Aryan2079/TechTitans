import React, { useState } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { ScrollArea } from "../components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";

interface Message {
  id: number;
  sender: string;
  content: string;
  timestamp: string;
}

const dummyMessages: Message[] = [
  {
    id: 1,
    sender: "John Doe",
    content: "Hi there! I'm interested in collaborating.",
    timestamp: "10:30 AM",
  },
  {
    id: 2,
    sender: "You",
    content: "Hello John! That sounds great. What did you have in mind?",
    timestamp: "10:35 AM",
  },
  {
    id: 3,
    sender: "John Doe",
    content:
      "I was thinking we could do a social media campaign for your new product launch.",
    timestamp: "10:40 AM",
  },
];

export function Messages() {
  const [message, setMessage] = useState("");

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Messages</h1>
      <div className="bg-white rounded-lg shadow-md h-[600px] flex flex-col">
        <ScrollArea className="flex-grow p-4">
          {dummyMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-2 mb-4 ${
                msg.sender === "You" ? "justify-end" : ""
              }`}
            >
              {msg.sender !== "You" && (
                <Avatar>
                  <AvatarImage
                    src={`https://api.dicebear.com/6.x/initials/svg?seed=${msg.sender}`}
                  />
                  <AvatarFallback>
                    {msg.sender
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={`rounded-lg p-3 ${
                  msg.sender === "You"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary"
                }`}
              >
                <p>{msg.content}</p>
                <p className="text-xs mt-1 opacity-70">{msg.timestamp}</p>
              </div>
            </div>
          ))}
        </ScrollArea>
        <div className="p-4 border-t">
          <form className="flex space-x-2">
            <Input
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-grow"
            />
            <Button type="submit">Send</Button>
          </form>
        </div>
      </div>
    </div>
  );
}
