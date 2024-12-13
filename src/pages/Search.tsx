import React, { useState } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardFooter } from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";

interface SearchResult {
  id: number;
  name: string;
  type: string;
  category: string;
  location: string;
}

const dummyResults: SearchResult[] = [
  {
    id: 1,
    name: "John Doe",
    type: "Influencer",
    category: "Fashion",
    location: "New York",
  },
  {
    id: 2,
    name: "Jane Smith",
    type: "Business",
    category: "Restaurant",
    location: "Los Angeles",
  },
  {
    id: 3,
    name: "Bob Johnson",
    type: "Influencer",
    category: "Technology",
    location: "San Francisco",
  },
];

export function Search() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Search</h1>
      <div className="flex space-x-4 mb-8">
        <Input
          placeholder="Search by name, category, or location"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow"
        />
        <Button>Search</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {dummyResults.map((result) => (
          <Card key={result.id}>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage
                    src={`https://api.dicebear.com/6.x/initials/svg?seed=${result.name}`}
                  />
                  <AvatarFallback>
                    {result.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold">{result.name}</h2>
                  <p className="text-sm text-gray-500">{result.type}</p>
                </div>
              </div>
              <div className="mt-4">
                <p>
                  <strong>Category:</strong> {result.category}
                </p>
                <p>
                  <strong>Location:</strong> {result.location}
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Contact</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
