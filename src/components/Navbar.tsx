import React from "react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { useAuth } from "../contexts/AuthContext";

export function Navbar() {
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-primary">
          BizInfluence
        </Link>
        <div className="flex items-center space-x-4">
          {currentUser ? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Link to="/search">
                <Button variant="ghost">Search</Button>
              </Link>
              <Link to="/messages">
                <Button variant="ghost">Messages</Button>
              </Link>
              <Link to="/profile">
                <Button variant="ghost">Profile</Button>
              </Link>
              <Button onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/signup">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
