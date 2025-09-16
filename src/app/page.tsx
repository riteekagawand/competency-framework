"use client";
import React from "react";
import CompetencySidebar from "./_components/sidebar";

export default function DefaultCompetancyPage() {
  return (
    <div className="flex h-screen">
      {/* Sidebar + Right side content handled inside sidebar */}
      <CompetencySidebar />
    </div>
  );
}
