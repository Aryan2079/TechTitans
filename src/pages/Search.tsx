import React, { useState, useEffect } from "react";
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
  doc,
  getDoc,
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
  bio: string;
}

export function Search() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUserType, setCurrentUserType] = useState<string | null>(null);

  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchUserType = async () => {
      if (currentUser) {
        const userRef = doc(db, "userProfiles", currentUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setCurrentUserType(userData?.userType || null);
        }
      }
    };
    fetchUserType();
  }, [currentUser]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);

    try {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();

      const targetUserType =
        currentUserType === "business" ? "influencer" : "business";

      const usersQuery = query(
        collection(db, "userProfiles"),
        where("userType", "==", targetUserType)
      );
      const userSnapshots = await getDocs(usersQuery);

      const filteredResults = userSnapshots.docs
        .map((doc) => ({ uid: doc.id, ...doc.data() } as UserProfile))
        .filter((user) => {
          return (
            user.displayName?.toLowerCase().includes(lowerCaseSearchTerm) ||
            user.category?.toLowerCase().includes(lowerCaseSearchTerm) ||
            user.bio?.toLowerCase().includes(lowerCaseSearchTerm)
          );
        });

      setSearchResults(filteredResults);
    } catch (error) {
      console.error("Error fetching search results:", error);
    }

    setLoading(false);
  };

  const handleContactClick = async (user: UserProfile) => {
    if (!currentUser) return;

    const chatId = [currentUser.uid, user.uid].sort().join("_");
    const chatRef = doc(db, "chats", chatId);
    const chatDoc = await getDoc(chatRef);

    if (!chatDoc.exists()) {
      await setDoc(chatRef, {
        participants: [currentUser.uid, user.uid],
        createdAt: new Date(),
      });
    }

    navigate(`/messages/${chatId}`, {
      state: { user: user },
    });
  };

  const navigateToProfile = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex space-x-4 mb-8">
        <Input
          placeholder="Search by name, category, or bio"
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
                <Avatar
                  className="h-12 w-12 cursor-pointer"
                  onClick={() => navigateToProfile(result.uid)}
                >
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
                  <h2
                    className="text-xl font-semibold cursor-pointer hover:underline"
                    onClick={() => navigateToProfile(result.uid)}
                  >
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
                <p className="text-sm">
                  <span className="font-medium">Bio:</span> {result.bio}
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
