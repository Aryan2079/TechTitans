import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";

export function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] text-center">
      <h1 className="text-4xl font-bold mb-6">
        Connect Businesses with Influencers
      </h1>
      <p className="text-xl mb-8 max-w-2xl">
        BizInfluence is the premier platform for local businesses and
        influencers to collaborate and grow together.
      </p>
      <div className="space-x-4">
        <Link to="/search">
          <Button size="lg">Get Started</Button>
        </Link>
        {
          <Link to="/generate">
            <Button size="lg" variant="outline">
              Generate
            </Button>
          </Link>
        }
      </div>
    </div>
  );
}
