"use client";
import { SelectedType, CellColor } from "constant-eums";
import { Tooltip } from "@heroui/tooltip";
import type { JSX } from "react";

type Category = {
  name: string;
  goalArea: string;
  startAngle: number;
  endAngle: number;
};

export default function SpiderRadarChart({
  rows = 5,
  radiusStep = 30,
  defaultVals = [],
  selfVals = [],
  managerVals = [],
  achievedVals = [],
  type = SelectedType.Default,
  category = [],
  tooltips = [],
  groupMap = {},
}: {
  rows?: number;
  radiusStep?: number;
  defaultVals?: number[];
  selfVals?: number[];
  managerVals?: number[];
  achievedVals?: number[];
  type?: SelectedType;
  category?: Category[];
  tooltips?: string[][];
  groupMap?: Record<string, number[]>;
}) {
  const totalRadius = radiusStep * rows;
  const outerCircleRadius = ((radiusStep * rows) / 1.5) * 1.05;
  const DEG_TO_RAD = Math.PI / 180;
  const round = (num: number) => Math.round(num * 1000) / 1000;

  // --- Use defaultVals for Self but yellow color ---
  const getCellColor = (type: SelectedType, row: number, col: number) => {
    const rowValsMap: Record<SelectedType, number[]> = {
      [SelectedType.Default]: defaultVals,
      [SelectedType.Self]: selfVals,
      [SelectedType.Manager]: managerVals,
      [SelectedType.Achieved]: achievedVals,
    };

    const colorMap: Record<SelectedType, string> = {
      [SelectedType.Default]: CellColor.Gray,
      [SelectedType.Self]: CellColor.Yellow,
      [SelectedType.Manager]: CellColor.Blue,
      [SelectedType.Achieved]: CellColor.Green,
    };

    const values = rowValsMap[type] || [];
    return (values[col] ?? 0) >= row ? colorMap[type] : CellColor.White;
  };

  const generateGrid = () => {
    const cells: JSX.Element[] = [];

    // --- Force "Know your Craft" to start at top center ---
let craftIndices = groupMap["Know your Craft"];
let rotationOffset = 0;
if (craftIndices && craftIndices.length > 0) {
  // --- Align boundary between "Know your Craft" and next group to vertical ---
let craftEnd = Math.max(...craftIndices.map(i => category[i].endAngle));

// find next group's first start (wrap around)
const allGroups = Object.keys(groupMap);
const craftIndex = allGroups.indexOf("Know your Craft");
const nextGroup =
  craftIndex >= 0
    ? allGroups[(craftIndex + 1) % allGroups.length]
    : null;
let nextStart = nextGroup
  ? Math.min(...(groupMap[nextGroup] || []).map(i => category[i].startAngle))
  : craftEnd;

const boundaryMid = (craftEnd + nextStart) / 2;
rotationOffset = 270 - boundaryMid;

} else {
  // fallback to previous logic if "Know your Craft" not found
  const firstGoal = Object.keys(groupMap)[0];
  const firstIndices = groupMap[firstGoal] || [];
  const firstBoundary = firstIndices.length
    ? Math.max(...firstIndices.map((i) => category[i].endAngle))
    : 0;
  rotationOffset = 180 - firstBoundary;
}

    // Outer border circle
    cells.push(
      <circle
        key="circle"
        cx={0}
        cy={0}
        r={outerCircleRadius}
        fill="none"
        stroke="#865DBE"
        strokeWidth="1"
      />
    );

    // --- Draw slices ---
    for (let row = 1; row <= rows; row++) {
      category.forEach((cat, col) => {
        const innerRadius = (radiusStep * (row - 1)) / 1.5;
        const outerRadius = (radiusStep * row) / 1.5;
        const angleStart = (cat.startAngle + rotationOffset) * DEG_TO_RAD;
        const angleEnd = (cat.endAngle + rotationOffset) * DEG_TO_RAD;

        const coords = (angle: number, r: number) => [
          round(Math.cos(angle) * r),
          round(Math.sin(angle) * r),
        ];
        const [x1, y1] = coords(angleStart, innerRadius);
        const [x2, y2] = coords(angleEnd, innerRadius);
        const [x3, y3] = coords(angleEnd, outerRadius);
        const [x4, y4] = coords(angleStart, outerRadius);

        const pathData = `M${x1},${y1} A${innerRadius},${innerRadius} 0 0,1 ${x2},${y2} 
                          L${x3},${y3} A${outerRadius},${outerRadius} 0 0,0 ${x4},${y4} Z`;
        const tooltipContent = tooltips?.[col]?.[row - 1] || "No Data";

        cells.push(
          <Tooltip
            key={`row-${row}-col-${col}`}
            content={<div dangerouslySetInnerHTML={{ __html: tooltipContent }} />}
            className="p-2 bg-purple-200 text-black text-sm font-bold rounded-lg shadow-md max-w-[300px]"
          >
            <path
              d={pathData}
              fill={getCellColor(type, row, col)}
              stroke="#D5D5D5"
              strokeWidth="1"
            />
          </Tooltip>
        );
      });
    }

    // --- Goal Area and Subsection Labels ---
    Object.keys(groupMap).forEach((goalArea) => {
      const indices = groupMap[goalArea];
      const minStart = Math.min(...indices.map((i) => category[i].startAngle));
      const maxEnd = Math.max(...indices.map((i) => category[i].endAngle));
      const midAngle = (minStart + maxEnd) / 2 + rotationOffset;
      const goalLabelDistance = outerCircleRadius + 70;

      let gx = round(Math.cos(midAngle * DEG_TO_RAD) * goalLabelDistance);
      let gy = round(Math.sin(midAngle * DEG_TO_RAD) * goalLabelDistance);

      if (goalArea.toLowerCase().includes("market")) {
        gx += 40;
      }

      const words = goalArea.split(" ");
      const firstLine = words.slice(0, words.length - 1).join(" ") || goalArea;
      const secondLine = words.length > 1 ? words[words.length - 1] : "";

      cells.push(
        <text
          key={`goal-label-${goalArea}`}
          x={gx}
          y={gy}
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ fontSize: "14px", fill: "#865DBE" }}
        >
          <tspan x={gx} dy="-0.5em" style={{ fontWeight: "normal" }}>
            {firstLine}
          </tspan>
          {secondLine && (
            <tspan x={gx} dy="1.2em" style={{ fontWeight: "bold" }}>
              {secondLine}
            </tspan>
          )}
        </text>
      );

      indices.forEach((idx) => {
        const cat = category[idx];
        const subAngle = (cat.startAngle + cat.endAngle) / 2 + rotationOffset;
        const subDist = outerCircleRadius + 40;
        const sx = round(Math.cos(subAngle * DEG_TO_RAD) * subDist);
        const sy = round(Math.sin(subAngle * DEG_TO_RAD) * subDist);

        const words = cat.name.split(" ");
        let line1 = cat.name;
        let line2 = "";
        if (cat.name.length > 18 && words.length > 1) {
          const midIndex = Math.ceil(words.length / 2);
          line1 = words.slice(0, midIndex).join(" ");
          line2 = words.slice(midIndex).join(" ");
        }

        cells.push(
          <text
            key={`sub-${cat.name}`}
            x={sx}
            y={sy}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{
              fontSize: "8px",
              fontWeight: "500",
              fill: "#6B7280",
            }}
          >
            {line2 ? (
              <>
                <tspan x={sx} dy="-0.4em">
                  {line1}
                </tspan>
                <tspan x={sx} dy="1.2em">
                  {line2}
                </tspan>
              </>
            ) : (
              line1
            )}
          </text>
        );
      });
    });

    const boundaryAngles: number[] = [];
    Object.keys(groupMap).forEach((goal) => {
      const indices = groupMap[goal];
      if (indices && indices.length > 0) {
        const maxEnd = Math.max(...indices.map((idx) => category[idx].endAngle));
        boundaryAngles.push(maxEnd);
      }
    });

    boundaryAngles.forEach((angle, idx) => {
      const arrowLength = outerCircleRadius * 1.03;
      const xArrow = round(Math.cos((angle + rotationOffset) * DEG_TO_RAD) * arrowLength);
      const yArrow = round(Math.sin((angle + rotationOffset) * DEG_TO_RAD) * arrowLength);

      cells.push(
        <line
          key={`boundary-arrow-${idx}`}
          x1={0}
          y1={0}
          x2={xArrow}
          y2={yArrow}
          stroke="#865DBE"
          strokeWidth="1"
          markerEnd="url(#arrowhead)"
        />
      );
    });

    return cells;
  };

  return (
    <div className="flex items-center h-[60dvh] mt-[100px]">
      <svg
        viewBox={`${-totalRadius} ${-totalRadius} ${totalRadius * 2} ${totalRadius * 2}`}
        xmlns="http://www.w3.org/2000/svg"
        className="w-[950px] h-[700px] block"
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="6"
            markerHeight="6"
            refX="0"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L6,3 L0,6 Z" fill="#865DBE" />
          </marker>
        </defs>
        <g transform="scale(0.7)">{generateGrid()}</g>
      </svg>
    </div>
  );
}
