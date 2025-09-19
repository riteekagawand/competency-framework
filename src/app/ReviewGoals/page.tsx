"use client";

import { useEffect, useState } from "react";
import SpiderRadarChart from "../_components/spider-radar-chart";
import { mapJsonToSpider } from "../utils/mapJsonToSpider";
import { SelectedType } from "constant-eums";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  beyondRole?: string[];
};

export default function ReviewGoalsPage() {
  const [goals, setGoals] = useState<GoalEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<GoalEntry | null>(null);
  const [chartData, setChartData] = useState<any | null>(null);
  const [activeView, setActiveView] = useState<
    "default" | "changed" | "approved"
  >("changed");
  const [activeIndex, setActiveIndex] = useState(0);
  const [customTask, setCustomTask] = useState("");
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [tasks, setTasks] = useState<string[]>([
    "Read one professional development book.",
    "Attend a leadership workshop to enhance decision-making skills.",
    "Volunteer for a community service activity.",
    "Deliver a presentation at an internal knowledge-sharing session.",
  ]);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [editableLevels, setEditableLevels] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const res = await fetch("/api/getGoalsToReview");
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setGoals(data);
          setActiveIndex(0);
          handleViewChart(data[0]);
        } else {
          setGoals([]);
        }
      } catch (err) {
        console.error("Failed to fetch goals", err);
      }
    };
    fetchGoals();
  }, []);

  const handleViewChart = async (entry: GoalEntry) => {
    try {
      const res = await fetch(`/Data/Band 1/Band1.json`);
      const data = await res.json();

      const framework = data.find(
        (item: any) =>
          item.Role === entry.role &&
          item.Department === entry.department &&
          item.Level === entry.level
      );
      if (!framework) throw new Error("Competency framework not found");

      const { category, defaultVals, tooltips, groupMap } =
        mapJsonToSpider(framework);

      const selfVals = category.map((c: any) =>
        entry.goals.Changed?.[c.name] ?? entry.goals.Default?.[c.name] ?? 0,
      );

      const baseDefaultVals = category.map(
        (c: any) => entry.goals.Default?.[c.name] ?? 0
      );

      // Fetch approved values for this user from approvedGoals
      let approvedVals: number[] = new Array(category.length).fill(0);
      try {
        const approvedRes = await fetch(`/api/getApprovedGoals?sourceId=${encodeURIComponent(entry._id)}`);
        if (approvedRes.ok) {
          const approvedList = await approvedRes.json();
          // Prefer exact user match
          const norm = (s: string) => s?.toString().trim().toLowerCase().replace(/\u2013|\u2014|–|—/g, "-");
          let approvedDoc = Array.isArray(approvedList)
            ? approvedList[0]
            : null;
          if (!approvedDoc && Array.isArray(approvedList)) {
            // Fallback by normalized role/department/level
            approvedDoc = approvedList.find(
              (g: any) =>
                norm(g.role) === norm(entry.role) &&
                norm(g.department) === norm(entry.department) &&
                norm(g.level) === norm(entry.level),
            ) || approvedList[0];
          }
          if (approvedDoc && approvedDoc.goals) {
            const changed = approvedDoc.goals?.Changed ?? {};
            const defaults = approvedDoc.goals?.Default ?? {};
            const normChanged: Record<string, number> = {};
            const normDefault: Record<string, number> = {};
            Object.entries(changed).forEach(([k, v]: any) => {
              normChanged[k.toString().trim().toLowerCase()] = Number(v) ?? 0;
            });
            Object.entries(defaults).forEach(([k, v]: any) => {
              normDefault[k.toString().trim().toLowerCase()] = Number(v) ?? 0;
            });

            approvedVals = category.map((c: any) => {
              const key = c.name.toString().trim().toLowerCase();
              return (key in normChanged
                ? normChanged[key]
                : normDefault[key]) ?? 0;
            });

            // Debug mapping for verification in console
            try {
              // eslint-disable-next-line no-console
              console.log("[Approved Mapping]", {
                entry: { userId: entry.userId, name: entry.name },
                categories: category.map((c: any) => c.name),
                changed: normChanged,
                defaults: normDefault,
                approvedVals,
              });
            } catch {}
          }
        }
      } catch {
        // ignore fetch errors, keep zeros
      }

      setChartData({
        category,
        selfVals,
        defaultVals: baseDefaultVals,
        approvedVals,
        tooltips,
        groupMap,
      });

      setSelectedEntry(entry);
      setSelectedTasks(entry.beyondRole || []);
      setActiveView(entry.status === "Approved" ? "approved" : "changed");

      // Initialize editableLevels from current values
      const initialLevels: Record<string, number> = {};
      category.forEach((c: any, idx: number) => {
        initialLevels[c.name] = selfVals[idx] ?? baseDefaultVals[idx] ?? 0;
      });
      setEditableLevels(initialLevels);

      // Publish initial state for sidebar consumers
      if (typeof window !== "undefined") {
        (window as any).__mgrReviewState = {
          category: category.map((c: any) => ({ name: c.name })),
          levels: { ...initialLevels },
        };
        window.dispatchEvent(new CustomEvent("mgrStateUpdated"));
      }
    } catch (err) {
      console.error(err);
      alert("Error: " + (err as any).message);
    }
  };

  const handleApprove = async () => {
    if (!selectedEntry) return;

    // 🔥 Include text from the input field if not empty
    let finalTasks = [...selectedTasks];
    if (customTask.trim() !== "") {
      finalTasks.push(customTask.trim());
    }
    finalTasks = [...new Set(finalTasks)]; // dedupe

    // Build managerChanged relative to defaults
    const managerChanged: Record<string, number> = {};
    if (chartData?.category && chartData?.defaultVals) {
      chartData.category.forEach((c: any, idx: number) => {
        const defVal = chartData.defaultVals[idx] ?? 0;
        const newVal = editableLevels[c.name] ?? defVal;
        if (newVal !== defVal) {
          managerChanged[c.name] = newVal;
        }
      });
    }

    try {
      const res = await fetch("/api/approveGoals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goalId: selectedEntry._id,
          beyondRole: finalTasks,
          managerChanged,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Goals approved successfully");
        const updated = goals.map((g) =>
          g._id === selectedEntry._id
            ? { ...g, status: "Approved", beyondRole: finalTasks }
            : g
        );
        setGoals(updated);
        setSelectedEntry({
          ...selectedEntry,
          status: "Approved",
          beyondRole: finalTasks,
        });

        // Update from server-returned approved doc if available
        if (data.approved && chartData?.category) {
          const changed = data.approved.goals?.Changed ?? {};
          const defaults = data.approved.goals?.Default ?? {};
          const normChanged: Record<string, number> = {};
          const normDefault: Record<string, number> = {};
          Object.entries(changed).forEach(([k, v]: any) => {
            normChanged[k.toString().trim().toLowerCase()] = Number(v) ?? 0;
          });
          Object.entries(defaults).forEach(([k, v]: any) => {
            normDefault[k.toString().trim().toLowerCase()] = Number(v) ?? 0;
          });

          const newApprovedVals = chartData.category.map((c: any) => {
            const key = c.name.toString().trim().toLowerCase();
            return (key in normChanged ? normChanged[key] : normDefault[key]) ?? 0;
          });

          setChartData((prev: any) => ({
            ...prev,
            approvedVals: newApprovedVals,
          }));
        } else {
          // Re-fetch from DB to reflect the latest approved values
          try {
            const approvedRes = await fetch(`/api/getApprovedGoals?sourceId=${encodeURIComponent(selectedEntry._id)}`);
            if (approvedRes.ok) {
              const approvedList = await approvedRes.json();
              const approvedDoc = Array.isArray(approvedList) ? approvedList[0] : null;
              if (approvedDoc && chartData?.category) {
                const changed = approvedDoc.goals?.Changed ?? {};
                const defaults = approvedDoc.goals?.Default ?? {};
                const normChanged: Record<string, number> = {};
                const normDefault: Record<string, number> = {};
                Object.entries(changed).forEach(([k, v]: any) => {
                  normChanged[k.toString().trim().toLowerCase()] = Number(v) ?? 0;
                });
                Object.entries(defaults).forEach(([k, v]: any) => {
                  normDefault[k.toString().trim().toLowerCase()] = Number(v) ?? 0;
                });

                const newApprovedVals = chartData.category.map((c: any) => {
                  const key = c.name.toString().trim().toLowerCase();
                  return (key in normChanged ? normChanged[key] : normDefault[key]) ?? 0;
                });

                setChartData((prev: any) => ({
                  ...prev,
                  approvedVals: newApprovedVals,
                }));
              }
            }
          } catch {}
        }
        setActiveView("approved");
        setCustomTask(""); // clear input after approve
      } else {
        alert(data.message || "Error approving goals");
      }
    } catch (err) {
      console.error("Approval failed", err);
      alert("Error approving goal");
    }
  };

  const goToPrev = () => {
    if (goals.length === 0) return;
    const newIndex = (activeIndex - 1 + goals.length) % goals.length;
    setActiveIndex(newIndex);
    const entry = goals[newIndex];
    if (entry) handleViewChart(entry);
  };

  const goToNext = () => {
    if (goals.length === 0) return;
    const newIndex = (activeIndex + 1) % goals.length;
    setActiveIndex(newIndex);
    const entry = goals[newIndex];
    if (entry) handleViewChart(entry);
  };

  const addCustomTask = () => {
    if (customTask.trim() !== "") {
      const newTask = customTask.trim();
      setTasks((prev) => [...prev, newTask]);
      setSelectedTasks((prev) => [...prev, newTask]); // auto-select
      setCustomTask("");
    }
  };

  const selectedType =
    activeView === "default"
      ? SelectedType.Default
      : activeView === "changed"
      ? SelectedType.Self
      : SelectedType.Approved;

  // Listen for sidebar level changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { name: string; level: number } | undefined;
      if (!detail) return;
      setEditableLevels((prev) => ({ ...prev, [detail.name]: detail.level }));
    };
    window.addEventListener("mgrSetLevel", handler as EventListener);
    return () => window.removeEventListener("mgrSetLevel", handler as EventListener);
  }, []);

  // Whenever editableLevels or category changes, publish to sidebar
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!chartData?.category) return;
    (window as any).__mgrReviewState = {
      category: chartData.category.map((c: any) => ({ name: c.name })),
      levels: { ...editableLevels },
    };
    window.dispatchEvent(new CustomEvent("mgrStateUpdated"));
  }, [editableLevels, chartData?.category]);

  // Debug: log what the graph is rendering
  useEffect(() => {
    if (!chartData?.category) return;
    const categories = chartData.category.map((c: any) => c.name);
    const selfSeries =
      activeView === "changed" && chartData?.category
        ? chartData.category.map((c: any) => editableLevels[c.name] ?? 0)
        : chartData.selfVals;
    // eslint-disable-next-line no-console
    console.log("[Graph Render]", {
      user: { id: selectedEntry?.userId, name: selectedEntry?.name },
      view: activeView,
      categories,
      defaultVals: chartData.defaultVals,
      selfVals: selfSeries,
      approvedVals: chartData.approvedVals,
    });
  }, [chartData, activeView, selectedEntry, editableLevels]);

  return (
    <div className="flex p-6 mt-20">
      <div className="flex flex-col w-full">
        {/* Heading above chart */}
        <h2 className="text-xl font-semibold mb-6">
          Set the Goal for{" "}
          <span className="text-[#30582c]">
            {selectedEntry?.name || "User"}
          </span>
        </h2>

        {goals.length > 0 && chartData ? (
          <>
            {/* Chart + Tasks side by side */}
            <div className="flex gap-6 items-start">
              {/* Arrows + Chart */}
              <div className="flex gap-4 items-center">
                <button onClick={goToPrev}>
                  <ChevronLeft size={28} />
                </button>
                <div>
                  <SpiderRadarChart
                    rows={5}
                    radiusStep={30}
                    selfVals={
                      activeView === "changed" && chartData?.category
                        ? chartData.category.map((c: any) =>
                            editableLevels[c.name] ?? 0,
                          )
                        : chartData.selfVals
                    }
                    defaultVals={chartData.defaultVals}
                    achievedVals={chartData.approvedVals}
                    type={selectedType}
                    category={chartData.category}
                    tooltips={chartData.tooltips}
                    groupMap={chartData.groupMap}
                  />
                  <p className="mt-2 text-center font-medium">
                    {selectedEntry?.name} – {selectedEntry?.role}
                  </p>
                </div>
                <button onClick={goToNext}>
                  <ChevronRight size={28} />
                </button>
              </div>

              {/* Beyond the Role Card */}
              <div className="fixed right-3 top-50 w-[260px] border rounded-lg shadow-sm p-4 bg-white flex flex-col">
                <h3 className="text-lg font-semibold mb-3">Beyond the role</h3>

                {/* Scrollable list of checkboxes */}
                <div className="flex-1 overflow-y-auto max-h-[240px] flex flex-col gap-3 pr-1">
                  {tasks.map((task, idx) => (
                    <label
                      key={idx}
                      className="flex items-start gap-2 text-sm text-gray-700"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTasks.includes(task)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTasks((prev) => [...prev, task]);
                          } else {
                            setSelectedTasks((prev) =>
                              prev.filter((t) => t !== task)
                            );
                          }
                        }}
                        className="mt-1"
                      />
                      <span>{task}</span>
                    </label>
                  ))}
                </div>

                {/* Input field */}
                <div className="flex items-center gap-2 mt-3">
                  <input type="checkbox" disabled className="mt-1" />
                  <input
                    type="text"
                    value={customTask}
                    onChange={(e) => setCustomTask(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomTask();
                      }
                    }}
                    placeholder="Add..."
                    className="w-full border rounded px-2 py-1 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* View Buttons */}
            <div className="mt-6 flex space-x-4 ml-60">
              <button
                className="px-6 py-2 bg-gray-300 text-black rounded-xl hover:bg-gray-400"
                onClick={() => setActiveView("default")}
              >
                Default Goals
              </button>
              <button
                className="px-6 py-2 bg-[#ffd566] text-gray-700 rounded-xl hover:bg-[#ffc700]"
                onClick={() => setActiveView("changed")}
              >
                {selectedEntry?.name
                  ? `${selectedEntry.name}’s Goals`
                  : "Employee’s Goals"}
              </button>
              <button
                className={`px-6 py-2 rounded-xl ${
                  selectedEntry?.status === "Approved"
                    ? "bg-[#84b7f5] text-white"
                    : "bg-[#c5e0ff] text-gray-700 hover:bg-[#a9d0ff]"
                }`}
                onClick={() => setShowApproveDialog(true)}
                disabled={selectedEntry?.status === "Approved"}
              >
                {selectedEntry?.status === "Approved"
                  ? "Approved"
                  : "Approve Goals"}
              </button>
            </div>

            {/* Approve Confirmation Dialog */}
            {showApproveDialog && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
                <div className="bg-white p-6 rounded-xl border border-purple-400 shadow-lg max-w-sm w-[400px] text-center">
                  <p className="mb-6 text-gray-800">
                    Do you want to edit or approve these goals?
                  </p>
                  <div className="flex justify-center gap-4">
                    <button
                      className="px-6 py-2 rounded-lg bg-[#8e8e93] text-white hover:bg-purple-400"
                      onClick={() => {
                        setShowApproveDialog(false);
                        setActiveView("changed");
                        if (typeof window !== "undefined") {
                          (window as any).__mgrShowEdit = true;
                          window.dispatchEvent(
                            new CustomEvent("mgrToggleEdit", { detail: { show: true } }),
                          );
                        }
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="px-6 py-2 rounded-lg bg-[#84b7f5] text-white hover:bg-[#6ea8f0]"
                      onClick={() => {
                        setShowApproveDialog(false);
                        if (typeof window !== "undefined") {
                          (window as any).__mgrShowEdit = false;
                          window.dispatchEvent(
                            new CustomEvent("mgrToggleEdit", { detail: { show: false } }),
                          );
                        }
                        handleApprove();
                      }}
                    >
                      Approve
                    </button>
                  </div>
                </div>
              </div>
            )}

          </>
        ) : (
          <p className="text-gray-500">Loading or no goal data available</p>
        )}
      </div>
    </div>
  );
}
