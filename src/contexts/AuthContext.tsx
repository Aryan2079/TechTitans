/* eslint-disable @typescript-eslint/no-explicit-any */

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
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  signup: (
    email: string,
    password: string,
    userType: "business" | "influencer",
    additionalInfo: any
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<void>;
}

interface UserProfile {
  uid: string;
  email: string;
  userType: "business" | "influencer";
  displayName?: string;
  businessType?: string;
  category?: string;
  location?: string;
  bio?: string; // Make bio optional
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
    userType: "business" | "influencer",
    additionalInfo: {
      displayName: string;
      category?: string;
      businessType?: string;
      location: string;
      bio?: string;
    }
  ) {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Ensure category is not undefined
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      userType,
      displayName: additionalInfo.displayName,
      category:
        userType === "business"
          ? additionalInfo.businessType || "Not specified"
          : additionalInfo.category,
      location: additionalInfo.location,
      bio: additionalInfo.bio || "", // Optional bio, defaults to an empty string if not provided
    };

    try {
      // Set user profile in Firestore
      await setDoc(doc(db, "userProfiles", user.uid), userProfile);

      // Set local user profile state (if needed)
      setUserProfile(userProfile);
    } catch (error) {
      console.error("Error creating user profile in Firestore: ", error);
    }
  }

  function login(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  async function updateProfile(profileData: Partial<UserProfile>) {
    if (currentUser) {
      await updateDoc(doc(db, "userProfiles", currentUser.uid), profileData);
      setUserProfile((prevProfile) => ({ ...prevProfile!, ...profileData }));
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const docRef = doc(db, "userProfiles", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserProfile(docSnap.data() as UserProfile);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    signup,
    login,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
