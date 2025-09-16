"use client";

import { useEffect, useMemo, useState } from "react";
import CompetencySidebar from "../_components/sidebar";
import SpiderRadarChart from "../_components/spider-radar-chart";
import { SelectedType } from "constant-eums";
import { mapJsonToSpider } from "../utils/mapJsonToSpider";
import { useRouter } from "next/navigation";
import Header from "../_components/Header";

export default function SetGoalsPage() {
  const [category, setCategory] = useState<any[]>([]);
  const [tooltips, setTooltips] = useState<string[][]>([]);
  const [groupMap, setGroupMap] = useState<Record<string, number[]>>({});
  const [goalAreas, setGoalAreas] = useState<any[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<Record<string, number>>({});
  const [defaultLevels, setDefaultLevels] = useState<Record<string, number>>({});
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const [departments, setDepartments] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  const [goalData, setGoalData] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchUserAndData = async () => {
      try {
        console.log("🔄 Fetching user and data...");
        const userRes = await fetch("/api/getUser");
        const user = await userRes.json();
        console.log("✅ User Data:", user);

        const dataRes = await fetch(`/Data/Band 1/Band1.json`);
        const data = await dataRes.json();
        console.log("✅ Band Data:", data);

        const uniqueDepartments: string[] = Array.from(new Set(data.map((d: any) => d.Department as string)));
        const uniqueRoles: string[] = Array.from(new Set(data.map((d: any) => d.Role as string)));

        setDepartments(uniqueDepartments);
        setRoles(uniqueRoles);

        setSelectedDepartment(user.Department || uniqueDepartments[0]);
        setSelectedRole(user.Role || uniqueRoles[0]);

        loadData(user.Department, user.Role, data);

        // ✅ Fetch Goal Data
        console.log("🔄 Fetching goals...");
        const goalsRes = await fetch("/api/getGoals");
        const goals = await goalsRes.json();
        console.log("✅ Goal Data (from API):", goals);

        setGoalData(goals);
      } catch (err) {
        console.error("❌ Failed to fetch initial data:", err);
      }
    };

    fetchUserAndData();
  }, []);

  const loadData = async (department: string, role: string, dataset?: any[]) => {
    try {
      console.log(`🔄 Loading data for Department: ${department}, Role: ${role}`);
      const data = dataset ? dataset : await (await fetch(`/Data/Band 1/Band1.json`)).json();

      const userRes = await fetch("/api/getUser");
      const user = await userRes.json();

      const record = data.find(
        (item: any) => item.Department === department && item.Role === role && item.Level === user.Level
      );

      if (!record) {
        console.warn("⚠️ No matching record found for selection.");
        return;
      }

      console.log("✅ Matching Record:", record);

      const { category, defaultVals, tooltips, groupMap, goalAreas } = mapJsonToSpider(record);

      setCategory(category);
      setTooltips(tooltips);
      setGroupMap(groupMap);
      setGoalAreas(goalAreas);

      const initialLevels: Record<string, number> = {};
      const initialDefaults: Record<string, number> = {};

      category.forEach((cat, index) => {
        initialLevels[cat.name] = defaultVals[index] ?? 1;
        initialDefaults[cat.name] = defaultVals[index] ?? 1;
      });

      console.log("✅ Initial Levels:", initialLevels);
      console.log("✅ Default Levels:", initialDefaults);

      setSelectedLevels(initialLevels);
      setDefaultLevels(initialDefaults);
    } catch (err) {
      console.error("❌ Failed to load chart data:", err);
    }
  };

  const selectedSelfVals = useMemo(() => category.map((cat) => selectedLevels[cat.name] ?? cat.defaultCount), [selectedLevels, category]);
  const defaultVals = useMemo(() => category.map((cat) => defaultLevels[cat.name] ?? cat.defaultCount), [defaultLevels, category]);

  const handleConfirmSubmit = async () => {
    const changedEntries: Record<string, number> = {};
    const defaultEntries: Record<string, number> = {};

    Object.entries(selectedLevels).forEach(([category, level]) => {
      defaultEntries[category] = defaultLevels[category] ?? 1;
      if (defaultLevels[category] !== level) {
        changedEntries[category] = level;
      }
    });

    const payload = {
      Default: defaultEntries,
      Changed: changedEntries,
    };

    console.log("📤 Submitting Goals:", payload);

    try {
      await fetch("/api/updateUserGoals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("✅ Goals submitted successfully");
      setShowConfirmDialog(false);
      router.push("/");
    } catch (error) {
      console.error("❌ Error saving changes:", error);
    }
  };

  // ✅ Approved Goals Fallback
  const approvedGoals = goalData[0]?.goals ?? {};
  console.log("✅ Approved Goals:", approvedGoals);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <CompetencySidebar goalAreas={goalAreas} showGoals={true} selectedLevels={selectedLevels} setSelectedLevels={setSelectedLevels} hideDefaultChart={true} />

      {/* Main Content */}
      <div className="flex flex-col mt-[45px] w-full ">
        
          // ✅ Editable State
          <>
            <Header
              departments={departments}
              roles={roles}
              selectedDepartment={selectedDepartment}
              selectedRole={selectedRole}
              onDepartmentChange={(dept) => {
                console.log("📌 Department Changed:", dept);
                setSelectedDepartment(dept);
                loadData(dept, selectedRole);
              }}
              onRoleChange={(role) => {
                console.log("📌 Role Changed:", role);
                setSelectedRole(role);
                loadData(selectedDepartment, role);
              }}
            />

            <div className="flex flex-col justify-center px-10 ">
              {/* Spider Chart */}
              <SpiderRadarChart
                rows={5}
                radiusStep={30}
                defaultVals={defaultVals}
                selfVals={selectedSelfVals}
                managerVals={[]}
                achievedVals={[]}
                type={SelectedType.Self}
                category={category}
                tooltips={tooltips}
                groupMap={groupMap}
              />

              {/* Detailed Overview Section */}
              <div className="mt-10">
                

                {/* Goal Sections */}
                <div className="space-y-10">
                  {goalAreas.map((area, idx) => (
                    <div key={idx}>
                      <h3 className="text-lg font-semibold mb-2">{area.name}</h3>
                      <p className="text-gray-600 mb-3">{area.description}</p>

                      {area.subPoints && (
                        <div className="space-y-3">
                          {area.subPoints.map((point: any, i: number) => (
                            <div key={i}>
                              <p className="font-semibold text-gray-900">{point.title} :</p>
                              <p className="text-gray-700">{point.detail}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Buttons */}
              <div className="flex gap-4 mt-10 ml-60">
                <button
                  className="px-6 py-2 bg-gray-300 text-black rounded-xl hover:bg-gray-400"
                  onClick={() => {
                    console.log("📌 Navigating to default-competancy");
                    router.push("/default-competancy");
                  }}
                >
                  Default Goals
                </button>
                <button
                  className="px-6 py-2 bg-[#ffd566] text-gray-700 rounded-xl hover:bg-[#ffc700]"
                  onClick={() => {
                    console.log("📌 Confirm dialog opened");
                    setShowConfirmDialog(true);
                  }}
                >
                  Submit
                </button>
              </div>
            </div>
          </>
        
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
          <div className="bg-white p-6 rounded-xl border border-purple-400 shadow-lg max-w-sm w-[400px] text-center">
            <p className="mb-6 text-gray-800">
              Proceeding will lock your data, <br />
              and submitting will notify your reporting manager.
            </p>
            <button
              className="px-6 py-2 rounded-lg bg-[#8e8e93] text-white hover:bg-purple-400"
              onClick={handleConfirmSubmit}
            >
              Submit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
