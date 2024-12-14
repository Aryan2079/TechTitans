import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  setDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StarIcon } from "lucide-react";
import { updateProfile } from "firebase/auth";
import { ConnectionButton } from "../components/ConnectionButton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

type FormData = {
  displayName: string;
  location: string;
  category: string;
  bio: string;
};

type UserProfile = {
  uid: string;
  displayName: string;
  location: string;
  email: string;
  userType: string;
  category: string;
  bio: string;
};

type Rating = {
  rating: number;
  raterName: string;
  comment?: string;
  ratedUserId: string;
};

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon
          key={star}
          className={`h-5 w-5 ${
            star <= rating ? "text-yellow-400" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

export function Profile() {
  const { userId } = useParams<{ userId?: string }>();
  const navigate = useNavigate();
  const { currentUser, userProfile, addRecentConnection } = useAuth();
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [userRatings, setUserRatings] = useState<Rating[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [connections, setConnections] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    displayName: "",
    location: "",
    category: "",
    bio: "",
  });
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingComment, setRatingComment] = useState("");

  const isOwnProfile = currentUser?.uid === (userId || currentUser?.uid);

  const fetchConnections = async () => {
    if (currentUser) {
      const userRef = doc(db, "userProfiles", currentUser.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setConnections(userData.connections || []);
      }
    }
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      let profile: UserProfile | null = null;
      const targetUserId = userId || currentUser?.uid;
      if (targetUserId) {
        const docRef = doc(db, "userProfiles", targetUserId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          profile = {
            uid: targetUserId,
            displayName: data.displayName || "",
            location: data.location || "",
            email: data.email || "",
            userType: data.userType || "",
            category: data.category || "",
            bio: data.bio || "",
          };
          if (!isOwnProfile) {
            addRecentConnection(targetUserId);
          }
        } else if (!isOwnProfile) {
          console.log("No such user!");
          navigate("/dashboard");
          return;
        }
      }

      if (profile) {
        setProfileData(profile);
        setFormData({
          displayName: profile.displayName,
          location: profile.location,
          category: profile.category,
          bio: profile.bio,
        });
      }
    };

    const fetchUserRatings = async () => {
      if (userId || userProfile?.uid) {
        const ratingsQuery = query(
          collection(db, "ratings"),
          where("ratedUserId", "==", userId || userProfile?.uid)
        );
        const querySnapshot = await getDocs(ratingsQuery);
        const ratings = querySnapshot.docs.map((doc) => doc.data() as Rating);
        setUserRatings(ratings);

        if (ratings.length > 0) {
          const avgRating =
            ratings.reduce((sum, rating) => sum + rating.rating, 0) /
            ratings.length;
          setAverageRating(Number(avgRating.toFixed(1)));
        }
      }
    };

    const checkConnection = async () => {
      if (currentUser && userId) {
        const connectionRef = doc(
          db,
          "connections",
          currentUser.uid,
          "users",
          userId
        );
        const connectionSnap = await getDoc(connectionRef);
        setIsConnected(connectionSnap.exists());
      }
    };

    fetchProfileData();
    fetchUserRatings();
    fetchConnections();
    checkConnection();
  }, [
    userId,
    currentUser,
    userProfile,
    addRecentConnection,
    navigate,
    isOwnProfile,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isOwnProfile && currentUser) {
        await updateProfile(currentUser, {
          displayName: formData.displayName,
          photoURL: "",
        });
        const userProfileRef = doc(db, "userProfiles", currentUser.uid);
        await updateDoc(userProfileRef, {
          displayName: formData.displayName,
          location: formData.location,
          category: formData.category,
          bio: formData.bio,
        });
        setProfileData((prevData) => {
          if (prevData) {
            return { ...prevData, ...formData };
          }
          return null;
        });
      }
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile", error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRatingSubmit = async () => {
    if (!currentUser) {
      console.log("User must be logged in to submit a rating.");
      return;
    }

    const ratedUserId = userId || userProfile?.uid || "";

    const newRating: Rating = {
      rating: ratingValue,
      comment: ratingComment,
      raterName: currentUser.displayName || currentUser.email || "Unknown User",
      ratedUserId: ratedUserId,
    };

    try {
      const ratingsRef = collection(db, "ratings");
      await setDoc(doc(ratingsRef), newRating);

      setUserRatings((prevRatings) => {
        const updatedRatings = [...prevRatings, newRating];
        setAverageRating(
          updatedRatings.reduce((sum, rating) => sum + rating.rating, 0) /
            updatedRatings.length
        );
        return updatedRatings;
      });

      if (!isOwnProfile) {
        const userRef = doc(db, "userProfiles", currentUser.uid);
        await updateDoc(userRef, {
          connections: arrayUnion(ratedUserId),
        });

        setConnections((prevConnections) => [...prevConnections, ratedUserId]);
      }

      setIsRatingModalOpen(false);
      setRatingValue(0);
      setRatingComment("");
    } catch (error) {
      console.error("Failed to submit rating", error);
    }
  };

  const handleConnectionChange = () => {
    setIsConnected(!isConnected);
    fetchConnections();
  };

  if (!profileData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="w-24 h-24">
              <AvatarImage
                src={`https://api.dicebear.com/6.x/initials/svg?seed=${profileData.displayName}`}
              />
              <AvatarFallback>
                {profileData.displayName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-3xl">
                {profileData.displayName}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {profileData.email}
              </p>
              <p className="text-sm text-muted-foreground">
                {profileData.userType === "business"
                  ? "Business"
                  : "Influencer"}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="info" className="mt-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">Information</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
              <TabsTrigger value="ratings">Ratings</TabsTrigger>
            </TabsList>
            <TabsContent value="info" className="mt-6">
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Name</Label>
                      <Input
                        id="displayName"
                        name="displayName"
                        value={formData.displayName}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">
                      {profileData.userType === "business"
                        ? "Business Type"
                        : "Category"}
                    </Label>
                    <Input
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      className="w-full h-32 p-2 border rounded-md"
                    />
                  </div>
                  <Button type="submit">Save</Button>
                </form>
              ) : (
                <div className="space-y-4">
                  <p className="text-lg">{profileData.bio}</p>
                  <p className="text-sm text-muted-foreground">
                    Location: {profileData.location}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {profileData.userType === "business"
                      ? "Business Type"
                      : "Category"}
                    : {profileData.category || "Not specified"}
                  </p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="stats" className="mt-6">
              <div>
                <p className="text-xl">
                  Total Connections: {connections.length}
                </p>
                <p className="text-xl">Average Rating: {averageRating}</p>
              </div>
            </TabsContent>
            <TabsContent value="ratings" className="mt-6">
              <div>
                <h2 className="text-xl font-semibold">Ratings</h2>
                {userRatings.length > 0 ? (
                  userRatings.map((rating, index) => (
                    <div key={index} className="my-4">
                      <p className="font-semibold">{rating.raterName}</p>
                      <RatingStars rating={rating.rating} />
                      <p>{rating.comment}</p>
                    </div>
                  ))
                ) : (
                  <p>No ratings yet</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          {!isOwnProfile && (
            <>
              <ConnectionButton
                userId={userId || ""}
                isConnected={isConnected}
                onConnectionChange={handleConnectionChange}
              />
              <Dialog
                open={isRatingModalOpen}
                onOpenChange={setIsRatingModalOpen}
              >
                <DialogTrigger asChild>
                  <Button>Rate This User</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Rate {profileData?.displayName}</DialogTitle>
                    <DialogDescription>
                      Please provide your rating and feedback for this user.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon
                          key={star}
                          className={`h-8 w-8 cursor-pointer ${
                            star <= ratingValue
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                          onClick={() => setRatingValue(star)}
                        />
                      ))}
                    </div>
                    <Textarea
                      placeholder="Add your comment here..."
                      value={ratingComment}
                      onChange={(e) => setRatingComment(e.target.value)}
                    />
                    <Button onClick={handleRatingSubmit}>Submit Rating</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}
          {isOwnProfile &&
            (isEditing ? (
              <>
                <Button type="submit" onClick={handleSubmit} className="mr-2">
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
            ))}
        </CardFooter>
      </Card>
    </div>
  );
}
