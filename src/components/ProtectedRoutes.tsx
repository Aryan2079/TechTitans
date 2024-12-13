import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface UserProfile {
  userType: "business" | "influencer";
  //   name: string;
}

interface ProtectedRouteProps {
  children:
    | React.ReactNode
    | ((props: { userProfile: UserProfile | null }) => React.ReactNode);
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { currentUser, userProfile } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Check if children is a function; if so, call it with `userProfile`
  if (typeof children === "function") {
    return <>{children({ userProfile })}</>;
  }

  // Otherwise, render the children directly
  return <>{children}</>;
}
