import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  UserCredential,
} from "firebase/auth";
import { auth, db } from "../firebase/firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  Timestamp,
} from "firebase/firestore";

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signup: (
    email: string,
    password: string,
    userType: UserType,
    additionalInfo: AdditionalInfo
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<void>;
  submitRating: (
    ratedUserId: string,
    rating: number,
    comment: string
  ) => Promise<void>;
  addRecentConnection: (userId: string) => Promise<void>;
}

type UserType = "business" | "influencer";

interface UserProfile {
  uid: string;
  email: string;
  userType: UserType;
  displayName: string;
  businessType?: string;
  category?: string;
  location: string;
  bio: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  averageRating?: number;
  totalRatings?: number;
}

interface AdditionalInfo {
  displayName: string;
  category?: string;
  businessType?: string;
  location: string;
  bio: string;
}

interface Rating {
  id: string;
  raterId: string;
  ratedUserId: string;
  rating: number;
  comment: string;
  createdAt: Timestamp;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  async function signup(
    email: string,
    password: string,
    userType: UserType,
    additionalInfo: AdditionalInfo
  ): Promise<void> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        userType,
        displayName: additionalInfo.displayName,
        category:
          userType === "business"
            ? additionalInfo.businessType
            : additionalInfo.category,
        location: additionalInfo.location,
        bio: additionalInfo.bio,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await setDoc(doc(db, "userProfiles", user.uid), userProfile);
      setUserProfile(userProfile);
    } catch (error) {
      console.error("Error in signup:", error);
      throw error;
    }
  }

  async function login(
    email: string,
    password: string
  ): Promise<UserCredential> {
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Error in login:", error);
      throw error;
    }
  }

  async function logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error in logout:", error);
      throw error;
    }
  }

  async function updateProfile(
    profileData: Partial<UserProfile>
  ): Promise<void> {
    if (!currentUser) {
      throw new Error("No user is currently logged in");
    }
    try {
      const updatedData = {
        ...profileData,
        updatedAt: Timestamp.now(),
      };
      await updateDoc(doc(db, "userProfiles", currentUser.uid), updatedData);
      setUserProfile((prevProfile) => ({ ...prevProfile!, ...updatedData }));
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  }

  async function submitRating(
    ratedUserId: string,
    rating: number,
    comment: string
  ): Promise<void> {
    if (!currentUser) {
      throw new Error("No user is currently logged in");
    }
    try {
      const ratingData: Omit<Rating, "id"> = {
        raterId: currentUser.uid,
        ratedUserId,
        rating,
        comment,
        createdAt: Timestamp.now(),
      };

      // Add the rating to the ratings collection
      await addDoc(collection(db, "ratings"), ratingData);

      // Update the user's average rating and total ratings
      const userRef = doc(db, "userProfiles", ratedUserId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserProfile;
        const newTotalRatings = (userData.totalRatings || 0) + 1;
        const newAverageRating =
          ((userData.averageRating || 0) * (newTotalRatings - 1) + rating) /
          newTotalRatings;

        await updateDoc(userRef, {
          averageRating: newAverageRating,
          totalRatings: newTotalRatings,
          updatedAt: Timestamp.now(),
        });
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      throw error;
    }
  }

  async function addRecentConnection(userId: string): Promise<void> {
    if (!currentUser) {
      throw new Error("No user is currently logged in");
    }
    try {
      const connectionRef = doc(
        db,
        "userProfiles",
        currentUser.uid,
        "connections",
        userId
      );
      await setDoc(
        connectionRef,
        {
          lastInteraction: Timestamp.now(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Error adding recent connection:", error);
      throw error;
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setLoading(true);
      if (user) {
        try {
          const docRef = doc(db, "userProfiles", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserProfile(docSnap.data() as UserProfile);
          } else {
            console.warn("No user profile found for the current user");
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    userProfile,
    loading,
    signup,
    login,
    logout,
    updateProfile,
    submitRating,
    addRecentConnection,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
