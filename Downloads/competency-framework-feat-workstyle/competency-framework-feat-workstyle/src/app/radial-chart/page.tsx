"use client";
import React, { useEffect, useState } from "react";
import { SelectedType, CellColor } from "constant-eums";
import SpiderRadarChart from "../_components/spider-radar-chart";
import SideBar from "../_components/competency-sidebar-chart";

type ExpectedCompetency = {
  Title: string;
  Weightage: string;
  Competencies: string[];
  "Default Competencies": number;
};

type GoalArea = {
  Name: string;
  TotalWeightage: string;
  "Expected Competancy": ExpectedCompetency[];
};

type CompetencyJson = {
  Department: string;
  Level: string;
  Role: string;
  "Competency Framework": { "Goal Areas": GoalArea[] };
};

type Employee = {
  Name: string;
  EmployeeId: string;
  Department: string;
  Level: string;
  Role: string;
};

// --- Map JSON to chart ---
function mapJsonToSpider(data: CompetencyJson) {
  const goalAreas = data["Competency Framework"]["Goal Areas"];
  const totalWeight = goalAreas.reduce(
    (sum, g) => sum + parseFloat(g.TotalWeightage),
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

  goalAreas.forEach((goal) => {
    const goalWeight = parseFloat(goal.TotalWeightage);
    const goalAngle = (goalWeight / totalWeight) * 360;

    const totalCompWeight = goal["Expected Competancy"].reduce(
      (sum, c) => sum + parseFloat(c.Weightage),
      0
    );

    goal["Expected Competancy"].forEach((expected) => {
      const compWeight = parseFloat(expected.Weightage);
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
        ? `<b>${cat.goalArea} → ${cat.name}</b><br/><b>Level ${
            i + 1
          }</b><br/>${cat.competencies[i]}`
        : `<b>${cat.goalArea} → ${cat.name}</b><br/><b>Level ${
            i + 1
          }</b><br/>No competency defined`
    )
  );

  return { category, defaultVals, tooltips, groupMap };
}

export default function Dashboard() {
  const [selectedType, setSelectedType] = useState<SelectedType>(
    SelectedType.Default
  );
  const [allData, setAllData] = useState<CompetencyJson[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [department, setDepartment] = useState("");
  const [level, setLevel] = useState("");
  const [role, setRole] = useState("");
  const [employee, setEmployee] = useState("");
  const [roles, setRoles] = useState<string[]>([]);
  const [employeeList, setEmployeeList] = useState<Employee[]>([]);
  const [chartData, setChartData] = useState<any>(null);

  const levelMapping: Record<string, string> = {
    "1": "Band 1 - Foundational",
    "2": "Band 2 - Developing",
    "3": "Band 3 - Proficient",
    "4": "Band 4 - Advanced",
    "5": "Band 5 - Expert",
    "6": "Band 6 - Principal",
  };

  useEffect(() => {
    fetch("/Data/Band 1/Band1.json")
      .then((res) => res.json())
      .then((data) => setAllData(data))
      .catch((err) => console.error("Error loading JSON", err));
  }, []);

  useEffect(() => {
    fetch("/Data/Band 1/Employees.json")
      .then((res) => res.json())
      .then((data) => setEmployees(data))
      .catch((err) => console.error("Error loading Employees JSON", err));
  }, []);

  useEffect(() => {
    if (!level) {
      setRoles([]);
      return;
    }
    const mappedLevel = levelMapping[level];
    const availableRoles = allData
      .filter(
        (d) =>
          (!department || d.Department === department) &&
          d.Level === mappedLevel
      )
      .map((d) => d.Role);
    setRoles(Array.from(new Set(availableRoles)));
    setRole("");
    setEmployee("");
  }, [department, level, allData]);

  useEffect(() => {
    if (!role) {
      setEmployeeList([]);
      return;
    }
    const mappedLevel = levelMapping[level];
    const empList = employees.filter(
      (e) =>
        e.Department === department &&
        e.Level === mappedLevel &&
        e.Role === role
    );
    setEmployeeList(empList);
    setEmployee("");
  }, [department, level, role, employees]);

  useEffect(() => {
    if (!role) {
      setChartData(null);
      return;
    }
    const mappedLevel = levelMapping[level];
    const match = allData.find(
      (d) =>
        (!department || d.Department === department) &&
        d.Level === mappedLevel &&
        d.Role === role
    );
    if (match) setChartData(mapJsonToSpider(match));
    else setChartData(null);
  }, [role, department, level, allData]);

  return (
    <div className="flex">
      {/* Sidebar fixed on left */}
      <SideBar />
      {/* Main content with left margin */}
      <div className="ml-80 text-black p-6 mt-[10px] w-full">
        {/* Filters */}
        <div className="flex gap-4 mb-6 flex-wrap">
          <select
            value={department}
            onChange={(e) => {
              setDepartment(e.target.value);
              setLevel("");
              setRole("");
              setEmployee("");
            }}
            className="border p-2 rounded"
          >
            <option value="">Select Department</option>
            <option value="Engineering">Engineering</option>
            <option value="Product">Product</option>
            <option value="Marketing">Marketing</option>
          </select>

          <select
            value={level}
            onChange={(e) => {
              setLevel(e.target.value);
              setRole("");
              setEmployee("");
            }}
            className="border p-2 rounded"
          >
            <option value="">Select Level</option>
            <option value="1">Level 1</option>
            <option value="2">Level 2</option>
            <option value="3">Level 3</option>
            <option value="4">Level 4</option>
            <option value="5">Level 5</option>
            <option value="6">Level 6</option>
          </select>

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="border p-2 rounded"
            disabled={!roles.length}
          >
            <option value="">Select Role</option>
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          <select
            value={employee}
            onChange={(e) => setEmployee(e.target.value)}
            className="border p-2 rounded"
            disabled={!employeeList.length}
          >
            <option value="">Select Employee</option>
            {employeeList.map((emp) => (
              <option key={emp.EmployeeId} value={emp.EmployeeId}>
                {emp.Name}
              </option>
            ))}
          </select>
        </div>

        {/* Chart */}
        {chartData && employee ? (
          <SpiderRadarChart
            rows={5}
            radiusStep={30}
            defaultVals={chartData.defaultVals}
            selfVals={[]}
            managerVals={[]}
            achievedVals={[]}
            type={selectedType}
            category={chartData.category}
            tooltips={chartData.tooltips}
            groupMap={chartData.groupMap}
          />
        ) : (
          <div className="text-gray-500 text-center">
            Please select department, level, role, and employee to view chart
          </div>
        )}

        {/* Type Selection */}
        <div className="w-full flex flex-row  items- pt-8 flex-wrap gap-2">
          {Object.values(SelectedType).map((type) => (
            <label
              key={type}
              className="flex items-center justify-between m-2 p-2 rounded-lg w-36 cursor-pointer"
              style={{
                backgroundColor:
                  type === SelectedType.Self
                    ? CellColor.Yellow
                    : type === SelectedType.Manager
                    ? CellColor.Blue
                    : type === SelectedType.Achieved
                    ? CellColor.Green
                    : CellColor.Gray,
              }}
              onClick={() => setSelectedType(type)}
            >
              <span className="font-medium">{type}</span>
              {selectedType === type && <div>✔</div>}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
