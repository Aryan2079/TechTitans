import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  //   CardFooter,
} from "../components/ui/card";
import { useAuth } from "../contexts/AuthContext";

export function SignUp() {
  const [userType, setUserType] = useState("business");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const additionalInfo =
        userType === "business"
          ? { displayName, businessType, location }
          : { displayName, category, location };
      await signup(
        email,
        password,
        userType as "business" | "influencer",
        additionalInfo
      );
      navigate("/dashboard");
    } catch (err) {
      setError("Failed to create an account");
      console.error(err);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-80px)]">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
          <CardDescription>Create your account to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label>Account Type</Label>
                <RadioGroup
                  defaultValue="business"
                  onValueChange={(value) => setUserType(value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="business" id="business" />
                    <Label htmlFor="business">Business</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="influencer" id="influencer" />
                    <Label htmlFor="influencer">Influencer</Label>
                  </div>
                </RadioGroup>
              </div>
              {userType === "business" && (
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="businessType">Business Type</Label>
                  <Input
                    id="businessType"
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    required
                  />
                </div>
              )}
              {userType === "influencer" && (
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  />
                </div>
              )}
            </div>
            {error && <p className="text-red-500 mt-4">{error}</p>}
            <Button className="w-full mt-4" type="submit">
              Sign Up
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
