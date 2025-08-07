"use client";
import { useEffect, useState } from "react";
import { SelectedType } from "constant-eums";
import SpiderRadarChart from "../_components/spider-radar-chart";
import CompetencySidebar from "../_components/sidebar"; // import sidebar

function mapJsonToSpider(data: any) {
  const goalAreas = data["Competency Framework"]["Goal Areas"];
  const totalWeight = goalAreas.reduce(
    (sum: number, g: any) => sum + parseFloat(g.TotalWeightage.replace("%", "")),
    0
  );

  let angleCursor = 0;
  const category: {
    name: string;
    goalArea: string;
    competencies: string[];
    defaultCount: number;
    startAngle: number;
    endAngle: number;
  }[] = [];
  const groupMap: Record<string, number[]> = {};

  goalAreas.forEach((goal: any) => {
    const goalWeight = parseFloat(goal.TotalWeightage.replace("%", ""));
    const goalAngle = (goalWeight / totalWeight) * 360;
    const totalCompWeight = goal["Expected Competancy"].reduce(
      (sum: number, c: any) => sum + parseFloat(c.Weightage.replace("%", "")),
      0
    );

    goal["Expected Competancy"].forEach((expected: any) => {
      const compWeight = parseFloat(expected.Weightage.replace("%", ""));
      const sliceAngle = (compWeight / totalCompWeight) * goalAngle;
      const startAngle = angleCursor;
      const endAngle = angleCursor + sliceAngle;

      const index = category.length;
      category.push({
        name: expected.Title,
        goalArea: goal.Name,
        competencies: expected.Competencies,
        defaultCount: expected["Default Competencies"],
        startAngle,
        endAngle,
      });

      if (!groupMap[goal.Name]) groupMap[goal.Name] = [];
      groupMap[goal.Name].push(index);

      angleCursor += sliceAngle;
    });
  });

  const defaultVals = category.map((cat) => cat.defaultCount);
  const tooltips: string[][] = category.map((cat) =>
    Array.from({ length: 5 }, (_, i) =>
      cat.competencies[i]
        ? `${cat.competencies[i]}`
        : `<b>${cat.goalArea} → ${cat.name}</b><br/><b>Level ${i + 1}</b><br/>No competency defined`
    )
  );

  return { category, defaultVals, tooltips, groupMap, goalAreas };
}

export default function RadialChartPage() {
  const [selectedType, setSelectedType] = useState<SelectedType>(SelectedType.Default);
  const [category, setCategory] = useState<any[]>([]);
  const [tooltips, setTooltips] = useState<string[][]>([]);
  const [groupMap, setGroupMap] = useState<Record<string, number[]>>({});
  const [defaultVals, setDefaultVals] = useState<number[]>([]);
  const [goalAreas, setGoalAreas] = useState<any[]>([]);
  const [showGoals, setShowGoals] = useState(false); // for modal

  const rows = 5;
  const radiusStep = 30;
  const totalRadius = rows * radiusStep;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await fetch("/api/getUser");
        if (!userRes.ok) {
          window.location.href = "/login";
          return;
        }
        const user = await userRes.json();

        const bandMatch = user.Level.match(/Band\s*(\d+)/i);
        const bandFolder = bandMatch ? `Band ${bandMatch[1]}` : "Band 1";
        const dataRes = await fetch(
          `/Data/${bandFolder}/Band${bandMatch ? bandMatch[1] : "1"}.json`
        );
        if (!dataRes.ok) return;

        const data = await dataRes.json();
        const record = data.find(
          (item: any) =>
            item.Department === user.Department &&
            item.Level === user.Level &&
            item.Role === user.Role
        );
        if (!record) return;

        const { category, defaultVals, tooltips, groupMap, goalAreas } =
          mapJsonToSpider(record);

        setCategory(category);
        setTooltips(tooltips);
        setGroupMap(groupMap);
        setDefaultVals(defaultVals);
        setGoalAreas(goalAreas);
      } catch (err) {
        console.error("Error loading chart data:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="relative items-center justify-center">
      {/* Goal Areas Top-Left */}
      <div className="absolute mt-24 ml-[-100px] bg-white shadow p-4 rounded">
        <h3 className="font-bold text-lg mb-2">Goal Areas</h3>
        {goalAreas.map((g, index) => (
          <div key={index} className="flex justify-between text-sm mb-1">
            <span>{g.Name}</span>
            <span>{g.TotalWeightage}</span>
          </div>
        ))}
      </div>

      <SpiderRadarChart
        rows={rows}
        radiusStep={radiusStep}
        defaultVals={defaultVals}
        selfVals={[]}
        managerVals={[]}
        achievedVals={[]}
        type={selectedType}
        category={category}
        tooltips={tooltips}
        groupMap={groupMap}
      />

      <svg
        viewBox={`${-totalRadius} ${-totalRadius} ${totalRadius * 2} ${totalRadius * 2}`}
        xmlns="http://www.w3.org/2000/svg"
        className="w-[950px] h-[700px] absolute top-0 left-0 pointer-events-none"
      ></svg>

      {/* Buttons Below Chart */}
      <div className="mt-16 flex gap-4 ml-[400px]">
        <button className="px-6 py-2 bg-gray-300 text-black rounded-xl hover:bg-gray-400">
          Default Goals
        </button>
        <button
          className="px-6 py-2 bg-[#ffd566] text-gray-700 rounded-xl hover:bg-[#ffc700]"
          onClick={() => setShowGoals(true)}
        >
          Submit
        </button>
      </div>

      {/* Modal for My Goals */}
      {showGoals && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div className="relative bg-white w-[100%] h-[100%] overflow-y-auto">      
      <CompetencySidebar goalAreas={goalAreas} showGoals={showGoals} />
    </div>
  </div>
)}

    </div>
  );
}
