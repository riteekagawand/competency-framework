"use client";

import { useState, useEffect } from "react";
import Sidebar from "../_components/manger-sidebar";
import RadialChartPage from "../default-competancy/page";
import ReviewGoalsComponent from "../ReviewGoals/page";
import Header from "../_components/Header";

type GoalEntry = {
  _id: string;
  userId: string;
  name: string;
  role: string;
  department: string;
  level: string;
  goals: {
    Default: Record<string, number>;
    Changed: Record<string, number>;
  };
  submittedAt: string;
  status: string;
};

export default function ManagerDashboard() {
  const [activeStep, setActiveStep] = useState(0);
  const [viewMode, setViewMode] = useState("myGoals");
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  const [pendingGoal, setPendingGoal] = useState<GoalEntry | null>(null);

  // Header dropdown state
  const [departments, setDepartments] = useState<string[]>([
    "HR",
    "Finance",
    "Engineering",
  ]);
  const [roles, setRoles] = useState<string[]>(["Manager", "Lead", "Staff"]);

  // Initialize selectedDepartment and selectedRole safely
  const [selectedDepartment, setSelectedDepartment] = useState<string>(
    departments[0] ?? ""
  );
  const [selectedRole, setSelectedRole] = useState<string>(roles[0] ?? "");

  const loadData = (department: string, role: string) => {
    console.log("Load data for:", department, role);
    // TODO: fetch or filter dashboard data based on department & role
  };

  // Fetch goals from API when page loads
  useEffect(() => {
  const fetchGoals = async () => {
    try {
      const res = await fetch("/api/getGoalsToReview");
      const data: GoalEntry[] = await res.json();

      if (Array.isArray(data) && data.length > 0) {
        // Filter pending, sort by submittedAt (newest first)
        const pendingGoals = data
          .filter((goal) => goal.status.toLowerCase() === "pending")
          .sort(
            (a, b) =>
              new Date(b.submittedAt).getTime() -
              new Date(a.submittedAt).getTime()
          );

        // Use null if array is empty instead of undefined
        const latestPending = pendingGoals[0] ?? null;

        setPendingGoal(latestPending); // ✅ safe for GoalEntry | null
        if (latestPending) setShowWelcomeDialog(true);
      } else {
        setPendingGoal(null);
      }
    } catch (err) {
      console.error("Failed to fetch goals", err);
      setPendingGoal(null);
    }
  };

  fetchGoals();
}, []);


  const renderMainContent = () => {
    if (activeStep === 0) {
      return viewMode === "myGoals" ? (
        <div>
          <RadialChartPage hideSidebar={true} />
        </div>
      ) : (
        <ReviewGoalsComponent />
      );
    } else if (activeStep === 1) {
      return <div className="p-6 text-xl">Approval Component</div>;
    } else {
      return <div className="p-6 text-xl">Show Review Component</div>;
    }
  };

  return (
    <div className="flex flex-col-1 bg-white">
      <Sidebar
        activeStep={activeStep}
        setActiveStep={setActiveStep}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />
      
      

      <div className="flex-1 h-screen">{renderMainContent()}</div>

      {/* Pending Goal Dialog */}
      {showWelcomeDialog && pendingGoal && (
        <div className="fixed inset-0 flex items-center justify-center text-lg bg-black/70 z-50">
          <div className="bg-white p-6 rounded-2xl border border-purple-400 shadow-lg max-w-sm w-[380px] text-center">
            <p className="mb-4 text-gray-800">
              <span className="font-medium">{pendingGoal.name}</span>{" "}
              <span className="">wants you to<br /></span>
              <span className="mb-6 text-gray-600">approve their goal.</span>
            </p>

            <div className="flex justify-center gap-3 items-center">
              <button
                className="px-6 py-2 h-8 flex justify-center items-center rounded-md bg-[#8e8e93] text-white hover:bg-purple-400"
                onClick={() => setShowWelcomeDialog(false)}
              >
                Later
              </button>
              <button
                className="px-6 py-2 h-8 flex justify-center items-center rounded-md bg-[#8e8e93] text-white hover:bg-purple-400"
                onClick={() => {
                  setShowWelcomeDialog(false);
                  setActiveStep(0);
                  setViewMode("reviewGoals");
                }}
              >
                Check
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
