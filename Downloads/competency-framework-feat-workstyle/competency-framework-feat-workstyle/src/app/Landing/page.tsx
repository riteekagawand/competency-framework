"use client";
import { useState } from "react";
import SideBar from "../_components/sidebar";

export default function LandingPage() {
  const [active, setActive] = useState("Dashboard");

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar from your component */}
      <SideBar  />
    </div>
  );
}
