import React from "react";
// import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BarChart, Users, MessageSquare, Calendar } from "lucide-react";

export function Dashboard() {
  //   const { userProfile } = useAuth();

  const stats = [
    { title: "Total Connections", value: "24", icon: Users },
    { title: "Active Campaigns", value: "3", icon: BarChart },
    { title: "Unread Messages", value: "5", icon: MessageSquare },
    { title: "Upcoming Events", value: "2", icon: Calendar },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button>Create New Campaign</Button>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li className="flex items-center">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="/placeholder-avatar.jpg" alt="Avatar" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div className="ml-4">
                  <p className="text-sm font-medium">New connection request</p>
                  <p className="text-sm text-muted-foreground">2 hours ago</p>
                </div>
              </li>
              <li className="flex items-center">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="/placeholder-avatar.jpg" alt="Avatar" />
                  <AvatarFallback>AS</AvatarFallback>
                </Avatar>
                <div className="ml-4">
                  <p className="text-sm font-medium">Campaign completed</p>
                  <p className="text-sm text-muted-foreground">1 day ago</p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li>
                <p className="text-sm font-medium">Product Launch Meeting</p>
                <p className="text-sm text-muted-foreground">
                  Tomorrow at 2:00 PM
                </p>
              </li>
              <li>
                <p className="text-sm font-medium">
                  Influencer Collaboration Call
                </p>
                <p className="text-sm text-muted-foreground">
                  June 15th at 11:00 AM
                </p>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
