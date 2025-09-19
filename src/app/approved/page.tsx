"use client";
import React, { useEffect, useState } from "react";
import SpiderRadarChart from "../_components/spider-radar-chart";
import { mapJsonToSpider } from "../utils/mapJsonToSpider";
import { SelectedType } from "constant-eums";
import Header from "../_components/Header"; // ✅ import Header

interface Goal {
  _id: string;
  name: string;
  role: string;
  level: string;
  department: string;
  status: string;
  goals?: {
    Default: Record<string, number>;
    Changed: Record<string, number>;
  };
  beyondRole: string[];
}

export default function Page() {
  const [approvedGoals, setApprovedGoals] = useState<Goal[]>([]);
  const [chartDataMap, setChartDataMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  // ✅ for header
  const [departments, setDepartments] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  useEffect(() => {
    const fetchApprovedGoals = async () => {
      try {
        const res = await fetch("/api/getApprovedGoals");
        const data: Goal[] = await res.json();
        setApprovedGoals(data);

        // build unique departments/roles for header
        let uniqueDepartments = [...new Set(data.map((g) => g.department).filter(Boolean))];
        let uniqueRoles = [...new Set(data.map((g) => g.role).filter(Boolean))];

        // ✅ Always read frameworks to ensure non-empty dropdowns
        let frameworks: any[] = [];
        try {
          const frameworkRes = await fetch(`/Data/Band 1/Band1.json`);
          frameworks = await frameworkRes.json();
        } catch (e) {
          frameworks = [];
        }

        if (frameworks.length > 0) {
          const allDepts = [...new Set(frameworks.map((f: any) => f.Department))];
          const allRoles = [...new Set(frameworks.map((f: any) => f.Role))];
          if (uniqueDepartments.length === 0) uniqueDepartments = allDepts;
          if (uniqueRoles.length === 0) uniqueRoles = allRoles;
        }

        // ✅ Try to preselect from current user
        try {
          const userRes = await fetch("/api/getUser");
          if (userRes.ok) {
            const user = await userRes.json();
            if (user?.Department) {
              setSelectedDepartment(user.Department);
              if (!uniqueDepartments.includes(user.Department)) {
                uniqueDepartments = [user.Department, ...uniqueDepartments];
              }
            }
            if (user?.Role) {
              setSelectedRole(user.Role);
              if (!uniqueRoles.includes(user.Role)) {
                uniqueRoles = [user.Role, ...uniqueRoles];
              }
            }
          }
        } catch {}

        setDepartments(uniqueDepartments);
        setRoles(uniqueRoles);

        // If still nothing selected, choose first available
        if (!selectedDepartment && uniqueDepartments.length > 0) setSelectedDepartment(uniqueDepartments[0]);
        if (!selectedRole && uniqueRoles.length > 0) setSelectedRole(uniqueRoles[0]);

        // build chart data map
        const chartMap: Record<string, any> = {};
        for (const goal of data) {
          const frameworkRes = await fetch(`/Data/Band 1/Band1.json`);
          const frameworks = await frameworkRes.json();

          const framework = frameworks.find(
            (f: any) =>
              f.Role === goal.role &&
              f.Department === goal.department &&
              f.Level === goal.level
          );
          if (!framework) continue;

          const { category, defaultVals, tooltips, groupMap } =
            mapJsonToSpider(framework);

          // ✅ Use Changed goals if approved; fallback to Default per category
          const selfVals = category.map((c: any) => {
            const changed = goal.goals?.Changed?.[c.name];
            const def = goal.goals?.Default?.[c.name] ?? 0;
            if (goal.status === "Approved") {
              return changed ?? def;
            }
            return def;
          });

          chartMap[goal._id] = {
            category,
            defaultVals,
            approvedVals: selfVals, // ✅ Changed overriding Default
            tooltips,
            groupMap,
          };
        }
        setChartDataMap(chartMap);
      } catch (err) {
        console.error("Error fetching approved goals:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedGoals();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="w-full overflow-x-hidden bg-white">
      {/* ✅ Sticky Header within right content pane (no sidebar overlap) */}
      <div className="sticky top-3 w-full bg-white">
        <Header
          departments={departments}
          roles={roles}
          selectedDepartment={selectedDepartment}
          selectedRole={selectedRole}
          onDepartmentChange={(dept) => setSelectedDepartment(dept)}
          onRoleChange={(role) => setSelectedRole(role)}
        />
      </div>

      {/* -------- Goals List Section -------- */}
      <section className="pt-28 px-6 mx-auto">
        {approvedGoals.length === 0 ? (
          <p>No approved goals yet.</p>
        ) : (
          <div className="space-y-10  overflow-x-auto scrollbar-hide">
            {approvedGoals.map((goal) => {
              const chartData = chartDataMap[goal._id];
              return (
                <div
                  key={goal._id}
                  className="p-4 rounded-lg bg-white"
                >
                  <h3 className="text-lg font-semibold mb-4">
                    {goal.name} – {goal.role}
                  </h3>

                  {chartData && (
                    <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
                      {/* Beyond Role Goals */}
                      {goal.beyondRole?.length > 0 && (
                        <div className="fixed top-40 right-4 border-2 rounded-lg p-4 w-[180px] bg-gray-50">
                          <h4 className="font-medium mb-2">
                            Goals Beyond the Role:
                          </h4>
                          <ul className="list-disc ml-5 text-sm text-gray-700">
                            {goal.beyondRole.map((item, idx) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex flex-col space-y-4">
                        <SpiderRadarChart
                          rows={5}
                          radiusStep={30}
                          defaultVals={chartData.defaultVals}
                          achievedVals={chartData.approvedVals} // ✅ Changed/Default based on status
                          type={SelectedType.Approved}
                          category={chartData.category}
                          tooltips={chartData.tooltips}
                          groupMap={chartData.groupMap}
                        />

                        {/* Changed Goals */}
                        {goal.goals?.Changed && (
                          <div className="mt-4 pt-3">
                            <h4 className="font-medium mb-2">Changed Goals:</h4>

                            <p className="text-gray-700 leading-relaxed mt-4 ml-40 text-justify mb-6 w-[700px]">
                              Here are your finalized goals for this quarter,
                              designed to guide your progress effectively.
                              Review each goal to understand your focus areas
                              and expectations. Track your achievements to stay
                              aligned and make the most of your quarterly
                              journey.
                            </p>

                            <ul className="list-disc ml-5 text-sm text-gray-700">
                              {Object.entries(goal.goals.Changed).map(
                                ([key, value]) => (
                                  <li key={key}>
                                    <span className="font-semibold">{key}:</span>{" "}
                                    {value}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
