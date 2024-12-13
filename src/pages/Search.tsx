import React, { useState } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardFooter } from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { db } from "../firebase/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  setDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface UserProfile {
  uid: string;
  displayName: string;
  userType: string;
  category: string;
  location: string;
}

export function Search() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleSearch = async () => {
    setLoading(true);

    const q = query(
      collection(db, "userProfiles"),
      where("displayName", ">=", searchTerm),
      where("displayName", "<=", searchTerm + "\uf8ff")
    );

    try {
      const querySnapshot = await getDocs(q);
      const results: UserProfile[] = [];
      querySnapshot.forEach((doc) => {
        const userData = doc.data() as UserProfile;
        if (userData.uid !== currentUser?.uid) {
          results.push(userData);
        }
      });
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching users: ", error);
    }

    setLoading(false);
  };

  const handleContactClick = async (user: UserProfile) => {
    if (!currentUser) return;

    // Create a unique chat ID
    const chatId = [currentUser.uid, user.uid].sort().join("_");

    // Check if the chat already exists
    const chatRef = doc(db, "chats", chatId);
    const chatDoc = await getDoc(chatRef);

    if (!chatDoc.exists()) {
      // If the chat doesn't exist, create it
      await setDoc(chatRef, {
        participants: [currentUser.uid, user.uid],
        createdAt: new Date(),
      });
    }

    // Navigate to the messages component with chat ID and user data
    navigate(`/messages/${chatId}`, {
      state: { user: user },
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Search Users</h1>
      <div className="flex space-x-4 mb-8">
        <Input
          placeholder="Search by name, category, or location"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow"
        />
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {searchResults.length === 0 && !loading && <p>No results found</p>}
        {searchResults.map((result) => (
          <Card key={result.uid} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={`https://api.dicebear.com/6.x/initials/svg?seed=${result.displayName}`}
                  />
                  <AvatarFallback>
                    {result.displayName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold">
                    {result.displayName}
                  </h2>
                  <p className="text-sm text-gray-500">{result.userType}</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm">
                  <span className="font-medium">Category:</span>{" "}
                  {result.category}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Location:</span>{" "}
                  {result.location}
                </p>
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 p-4">
              <Button
                className="w-full"
                onClick={() => handleContactClick(result)}
              >
                Start Chat
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
