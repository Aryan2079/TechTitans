import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  // Navigate,
} from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Home } from "./pages/Home";
import { SignUp } from "./pages/SignUp";
import { Login } from "./pages/Login";
import { Search } from "./pages/Search";
import { Messages } from "./pages/Messages";
import { AuthProvider } from "./contexts/AuthContext";
import { Profile } from "./pages/Profile";
import { Dashboard } from "./components/Dashboard";

import FirestoreInitializer from "./components/initializeFirestore";
import "./App.css";
import { ChatList } from "./components/ChatList";
import GenerateImageAndWebsite from "./components/Generate"; // Import the new component
import { ProtectedRoute } from "./components/ProtectedRoutes";

function App() {
  return (
    <>
      <FirestoreInitializer />
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/:userId?"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/search"
                element={
                  <ProtectedRoute>
                    <Search />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/messages/:chatId"
                element={
                  <ProtectedRoute>
                    <Messages />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/messages"
                element={
                  <ProtectedRoute>
                    <ChatList />
                  </ProtectedRoute>
                }
              />
              {/* Add the new route for the "Generate" page */}
              <Route
                path="/generate"
                element={
                  <ProtectedRoute>
                    <GenerateImageAndWebsite />{" "}
                    {/* Add the new component here */}
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </>
  );
}

export default App;
