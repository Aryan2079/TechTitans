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
  loading: boolean;
  signup: (
    email: string,
    password: string,
    userType: "business" | "influencer",
    additionalInfo: AdditionalInfo
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
  bio?: string;
}

interface AdditionalInfo {
  displayName: string;
  category?: string;
  businessType?: string;
  location: string;
  bio?: string;
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
    additionalInfo: AdditionalInfo
  ) {
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
            ? additionalInfo.businessType || "Not specified"
            : additionalInfo.category,
        location: additionalInfo.location,
        bio: additionalInfo.bio || "",
      };

      await setDoc(doc(db, "userProfiles", user.uid), userProfile);
      setUserProfile(userProfile);
    } catch (error) {
      console.error("Error in signup:", error);
      throw error;
    }
  }

  async function login(email: string, password: string) {
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Error in login:", error);
      throw error;
    }
  }

  async function logout() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error in logout:", error);
      throw error;
    }
  }

  async function updateProfile(profileData: Partial<UserProfile>) {
    if (!currentUser) {
      throw new Error("No user is currently logged in");
    }
    try {
      await updateDoc(doc(db, "userProfiles", currentUser.uid), profileData);
      setUserProfile((prevProfile) => ({ ...prevProfile!, ...profileData }));
    } catch (error) {
      console.error("Error updating profile:", error);
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
