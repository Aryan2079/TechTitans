import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
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
import { Separator } from "@/components/ui/separator";

type FormData = {
  displayName: string;
  location: string;
  businessType?: string;
  category?: string;
  bio: string;
};

export function Profile() {
  const { userProfile, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    displayName: userProfile?.displayName || "",
    location: userProfile?.location || "",
    // Use 'category' for both, but set it as 'businessType' for business users
    businessType:
      userProfile?.userType === "business" ? userProfile?.category : "",
    category: userProfile?.userType !== "business" ? userProfile?.category : "",
    bio: userProfile?.bio || "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="w-24 h-24">
              <AvatarImage
                src={`https://api.dicebear.com/6.x/initials/svg?seed=${userProfile?.displayName}`}
              />
              <AvatarFallback>
                {userProfile?.displayName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-3xl">
                {userProfile?.displayName}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {userProfile?.email}
              </p>
              <p className="text-sm text-muted-foreground">
                {userProfile?.userType === "business"
                  ? "Business"
                  : "Influencer"}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="info" className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="info">Information</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
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
                    <Label
                      htmlFor={
                        userProfile?.userType === "business"
                          ? "businessType"
                          : "category"
                      }
                    >
                      {userProfile?.userType === "business"
                        ? "Business Type"
                        : "Category"}
                    </Label>
                    <Input
                      id={
                        userProfile?.userType === "business"
                          ? "businessType"
                          : "category"
                      }
                      name={
                        userProfile?.userType === "business"
                          ? "businessType"
                          : "category"
                      }
                      value={
                        userProfile?.userType === "business"
                          ? formData.businessType
                          : formData.category
                      }
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
                      className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-input bg-transparent"
                    />
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Name
                      </Label>
                      <p className="text-lg">{userProfile?.displayName}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Location
                      </Label>
                      <p className="text-lg">{userProfile?.location}</p>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      {userProfile?.userType === "business"
                        ? "Business Type"
                        : "Category"}
                    </Label>
                    <p className="text-lg">
                      {userProfile?.userType === "business"
                        ? userProfile?.category // Use category for business
                        : userProfile?.category}
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Bio
                    </Label>
                    <p className="text-lg">{userProfile?.bio}</p>
                  </div>
                </div>
              )}
            </TabsContent>
            <TabsContent value="stats" className="mt-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Total Connections
                    </Label>
                    <p className="text-3xl font-bold">24</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Completed Campaigns
                    </Label>
                    <p className="text-3xl font-bold">7</p>
                  </div>
                </div>
                <Separator />
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Average Rating
                  </Label>
                  <p className="text-3xl font-bold">4.8/5</p>
                </div>
                <Separator />
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Total Earnings
                  </Label>
                  <p className="text-3xl font-bold">$12,450</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-end">
          {isEditing ? (
            <>
              <Button onClick={handleSubmit} className="mr-2">
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
