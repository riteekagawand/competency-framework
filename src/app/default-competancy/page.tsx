"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { SelectedType } from "constant-eums";
import SpiderRadarChart from "../_components/spider-radar-chart";
import { mapJsonToSpider } from "../utils/mapJsonToSpider";
import CompetencySidebar from "../_components/sidebar";
import Header from "../_components/Header";
import Approved from "../approved/page";

interface RadialChartPageProps {
  hideSidebar?: boolean;
  setGoalAreas?: React.Dispatch<React.SetStateAction<any[]>>;
}

interface UserData {
  Department: string;
  Role: string;
  Level: string;
}

export default function RadialChartPage({
  hideSidebar = false,
  setGoalAreas: externalSetGoalAreas,
}: RadialChartPageProps) {
  const [selectedType] = useState<SelectedType>(SelectedType.Default);
  const [category, setCategory] = useState<any[]>([]);
  const [tooltips, setTooltips] = useState<string[][]>([]);
  const [groupMap, setGroupMap] = useState<Record<string, number[]>>({});
  const [selectedLevels, setSelectedLevels] = useState<Record<string, number>>({});
  const [defaultLevels, setDefaultLevels] = useState<Record<string, number>>({});
  const [goalAreas, setGoalAreas] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // ✅ Dialog for Goal Approved
  const [isApprovedDialogOpen, setIsApprovedDialogOpen] = useState(false);

  // ✅ Ensure portals only render on client
  const [isClient, setIsClient] = useState(false);

  // ✅ Store user info
  const [user, setUser] = useState<any>(null);

  // Dropdown state
  const [departments, setDepartments] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  const router = useRouter();
  const rows = 5;
  const radiusStep = 30;

  useEffect(() => {
    setIsClient(true);
  }, []);

  const loadData = async (department: string, role: string) => {
    try {
      const userRes = await fetch("/api/getUser");
      if (!userRes.ok) {
        window.location.href = "/login";
        return;
      }
      const userData = await userRes.json();
      setUser(userData);

      const dataRes = await fetch(`/Data/Band 1/Band1.json`);
      if (!dataRes.ok) return;
      const data: UserData[] = await dataRes.json();

      const allDepartments = [...new Set(data.map((d) => d.Department))];
      const allRoles = [...new Set(data.map((d) => d.Role))];
      setDepartments(allDepartments);
      setRoles(allRoles);

      const record = data.find(
        (item: any) =>
          item.Department === department &&
          item.Level === userData.Level &&
          item.Role === role
      );
      if (!record) return;

      const { category, defaultVals, tooltips, groupMap, goalAreas } =
        mapJsonToSpider(record);

      setCategory(category);
      setTooltips(tooltips);
      setGroupMap(groupMap);
      setGoalAreas(goalAreas);
      if (externalSetGoalAreas) externalSetGoalAreas(goalAreas);

      const initLevels: Record<string, number> = {};
      category.forEach((cat, i) => {
        initLevels[cat.name] = defaultVals[i] ?? 1;
      });
      setSelectedLevels(initLevels);
      setDefaultLevels(initLevels);
    } catch (err) {
      console.error("Error loading chart data:", err);
    }
  };

  useEffect(() => {
  if (isApprovedDialogOpen) {
    // Navigate to /approved after showing the dialog for 1.5 sec
    const timer = setTimeout(() => {
      <Approved />
    }, 1500);

    return () => clearTimeout(timer);
  }
}, [isApprovedDialogOpen, router]);


  useEffect(() => {
    (async () => {
      try {
        // ✅ Fetch user
        const userRes = await fetch("/api/getUser");
        if (!userRes.ok) return;
        const fetchedUser = await userRes.json();
        setUser(fetchedUser);

        setSelectedDepartment(fetchedUser.Department);
        setSelectedRole(fetchedUser.Role);

        await loadData(fetchedUser.Department, fetchedUser.Role);

        // ✅ Fetch approved goals
        const goalRes = await fetch(`/api/getApprovedGoals?userId=${fetchedUser.EmployeeId}`);
        if (!goalRes.ok) {
          console.warn("Goal API not OK:", goalRes.status);
          return;
        }
        const goalData = await goalRes.json();
        console.log("✅ Goal Data:", goalData);

        // ✅ Match user goals dynamically
        const userGoals = goalData.filter(
          (g: any) =>
            g.userId === fetchedUser.EmployeeId ||
            g.userId === fetchedUser.userId ||
            g.userId === fetchedUser._id
        );
        console.log("✅ User-specific Goals:", userGoals);

        // ✅ If no user-specific goals found, check all approved goals (fallback)
        const hasApprovedGoals =
          (userGoals.length > 0
            ? userGoals.some((g: any) => g.status === "Approved")
            : goalData.some((g: any) => g.status === "Approved"));

        console.log("✅ hasApprovedGoals:", hasApprovedGoals);

        // ✅ Show dialog if approved
        if (hasApprovedGoals) {
          console.log("✅ Showing Approved Dialog...");
          setIsApprovedDialogOpen(true);
        }
      } catch (err) {
        console.error("Error fetching goals:", err);
      }
    })();
  }, []);

  const selectedSelfVals = useMemo(
    () => category.map((cat) => selectedLevels[cat.name] ?? cat.defaultCount),
    [selectedLevels, category]
  );

  const defaultVals = useMemo(
    () => category.map((cat) => defaultLevels[cat.name] ?? cat.defaultCount),
    [defaultLevels, category]
  );

  const handleStoreChanges = async () => {
    const changedEntries: Record<string, number> = {};
    const defaultEntries: Record<string, number> = {};

    Object.entries(selectedLevels).forEach(([cat, level]) => {
      defaultEntries[cat] = defaultLevels[cat] ?? 1;
      if (defaultLevels[cat] !== level) changedEntries[cat] = level;
    });

    const payload = { Default: defaultEntries, Changed: changedEntries };

    try {
      await fetch("/api/updateUserGoals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setIsDialogOpen(false);
    } catch (err) {
      console.error("Error saving changes:", err);
    }
  };

  console.log("isDialogOpen:", isDialogOpen);
  console.log("isApprovedDialogOpen:", isApprovedDialogOpen);

  return (
    <div className="flex h-screen w-full overflow-x-hidden relative">
      {!hideSidebar && (
        <CompetencySidebar
          goalAreas={goalAreas}
          showGoals={true}
          selectedLevels={selectedLevels}
          setSelectedLevels={setSelectedLevels}
          hideDefaultChart={true}
        />
      )}

      <div
        className={`flex flex-col justify-center relative ${hideSidebar ? "ml-0" : ""}`}
      >
        <Header
          departments={departments}
          roles={roles}
          selectedDepartment={selectedDepartment}
          selectedRole={selectedRole}
          onDepartmentChange={(dept) => {
            setSelectedDepartment(dept);
            loadData(dept, selectedRole);
          }}
          onRoleChange={(role) => {
            setSelectedRole(role);
            loadData(selectedDepartment, role);
          }}
        />

        <SpiderRadarChart
          rows={rows}
          radiusStep={radiusStep}
          defaultVals={defaultVals}
          selfVals={selectedSelfVals}
          managerVals={[]}
          achievedVals={[]}
          type={selectedType}
          category={category}
          tooltips={tooltips}
          groupMap={groupMap}
        />

        <div className="flex gap-4 mt-18 ml-60">
          <button className="px-6 py-2 bg-gray-300 text-black rounded-xl hover:bg-gray-400">
            Default Goals
          </button>
          <button
            className="px-6 py-2 bg-[#ffd566] text-gray-700 rounded-xl hover:bg-[#ffc700]"
            onClick={() => setIsDialogOpen(true)}
          >
            Submit
          </button>
        </div>
      </div>

      {/* ✅ Submit/Edit Dialog */}
      {isClient && isDialogOpen &&
        createPortal(
          <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80">
            <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-[400px] text-center border border-purple-400">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Edit your goal</h2>
              <p className="text-gray-600 text-sm mb-6">
                or your default goal will be submitted.
              </p>
              <div className="flex justify-center gap-4 h-8 items-center">
                <button
                  onClick={() => router.push("/set-goals")}
                  className="px-5 py-2 rounded-lg border border-gray-400 text-white bg-[#8e8e93] hover:bg-purple-400"
                >
                  Edit
                </button>
                <button
                  onClick={handleStoreChanges}
                  className="px-5 py-2 rounded-lg border border-gray-400 text-white bg-[#8e8e93] hover:bg-purple-400"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* ✅ Goal Approved Dialog */}
      {isClient && isApprovedDialogOpen && user &&
  createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80"
      onClick={() => setIsApprovedDialogOpen(false)} // ✅ Just close on background click
    >
      <div
        className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-[400px] text-center border border-purple-400"
        onClick={(e) => e.stopPropagation()} // ✅ Prevent closing when clicking inside
      >
        <h2 className="text-lg font-semibold text-gray-700 mb-2">
          Hi {user?.Name || "User"},
        </h2>
        <p className="text-gray-900 text-md font-semibold mb-6">
          Your goal has been approved.
        </p>
      </div>
    </div>,
    document.body
  )}

    </div>
  );
}
