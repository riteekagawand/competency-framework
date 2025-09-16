"use client";
import { useState } from "react";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepContent from "@mui/material/StepContent";
import type { StepIconProps } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { ChevronDown, ChevronUp } from "lucide-react";

// ✅ import the actual chart component, not the whole page
import RadialChartPage from "../default-competancy/page";
import Approval from "../approved/page"

function CustomStepIcon({ active, completed }: StepIconProps) {
  return completed ? (
    <CheckCircleIcon color="success" />
  ) : (
    <RadioButtonUncheckedIcon color={active ? "primary" : "disabled"} />
  );
}

function StepTwoComponent({ hideDefaultChart }: { hideDefaultChart: boolean }) {
  if (hideDefaultChart) {
    return <div className="p-6 text-gray-500">hello</div>;
  }

  return (
    <div className="flex items-center w-full">
      <RadialChartPage hideSidebar={true} />
    </div>
  );
}

function StepApprovalComponent() {
  return (
    <div className="text-xl">
      <Approval />
    </div>
  );
}

function StepFourComponent() {
  return <div className="p-6 text-xl">Show Review Component</div>;
}

export default function CompetencySidebar({
  showGoals,
  selectedLevels,
  setSelectedLevels,
  hideDefaultChart = false,
  goalAreas = [],
}: {
  showGoals: boolean;
  selectedLevels: Record<string, number>;
  setSelectedLevels: React.Dispatch<
    React.SetStateAction<Record<string, number>>
  >;
  hideDefaultChart?: boolean;
  goalAreas?: any[];
}) {
  const [activeStep, setActiveStep] = useState(0);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleLevelSelect = (title: string, level: number) => {
    setSelectedLevels((prev) => ({ ...prev, [title]: level }));
  };

  const toggleDropdown = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  const steps = [
    {
      label: "Set My Goals",
      content: <StepTwoComponent hideDefaultChart={hideDefaultChart} />,
      description: (
        <div>
          <div className="font-semibold mb-2">Competency split</div>
          {goalAreas.length > 0 ? (
            goalAreas.map((goal, i) => {
              let shortName = goal.Name;
              if (goal.Name.toLowerCase().includes("know your self"))
                shortName = "Self";
              else if (goal.Name.toLowerCase().includes("know your product"))
                shortName = "Product";
              else if (goal.Name.toLowerCase().includes("know your craft"))
                shortName = "Craft";
              else if (goal.Name.toLowerCase().includes("know your market"))
                shortName = "Market";

              const isExpanded = expandedIndex === i;

              return (
                <div key={i} className="mb-2 border rounded-md">
                  <button
                    onClick={() => toggleDropdown(i)}
                    className="flex justify-between w-full px-3 py-[3px] rounded-md"
                  >
                    <span className="text-sm font-medium">{shortName}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-700">
                        {goal.TotalWeightage}
                      </span>
                      {isExpanded ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </div>
                  </button>

                  {isExpanded && showGoals && (
                    <div className="px-4 py-2 text-sm text-gray-600 space-y-4">
                      {goal["Expected Competancy"]?.length > 0 ? (
                        goal["Expected Competancy"].map(
                          (comp: any, idx: number) => (
                            <div key={idx}>
                              <p className="font-semibold text-gray-800 mb-1">
                                {comp.Title}
                              </p>
                              <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((level) => (
                                  <button
                                    key={level}
                                    onClick={() =>
                                      handleLevelSelect(comp.Title, level)
                                    }
                                    className={`w-8 h-8 rounded border text-sm font-medium ${
                                      (selectedLevels[comp.Title] ?? 0) >= level
                                        ? "bg-[#ffd566] text-black border-gray-700"
                                        : "text-black border-black"
                                    }`}
                                  >
                                    {level}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )
                        )
                      ) : (
                        <p className="italic text-gray-400">
                          No competencies defined
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p className="italic text-gray-400">No goal areas loaded</p>
          )}
        </div>
      ),
    },
    {
      label: "Approval",
      content: <StepApprovalComponent />,
      description: "Overview",
    },
    {
      label: "Show Review",
      content: <StepFourComponent />,
      description: "Overview",
    },
  ];

  const handleStepClick = (index: number) => {
    setActiveStep(index); // ✅ just switch step, no redirect
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-[266px] h-screen p-[10px] bg-white overflow-hidden">
        <div className="w-[240px] h-full rounded-xl bg-[#D9D9D9] p-2">
          <h2 className="text-2xl mt-2 font-bold ml-10 text-gray-800 mb-3 h-[35px] p-2 mx-4 ">
            ACADEMY
          </h2>
          <div className="mb-6 custom-dashed-border" />
          <Stepper
            activeStep={activeStep}
            orientation="vertical"
            connector={null}
          >
            {steps.map((step, index) => (
              <Step key={index} onClick={() => handleStepClick(index)}>
                <StepLabel StepIconComponent={CustomStepIcon}>
                  {step.label}
                </StepLabel>
                <StepContent>{step.description}</StepContent>
              </Step>
            ))}
          </Stepper>
        </div>
      </div>

      {/* Right-side content */}
      <div className="flex-1 h-screen overflow-y-auto overflow-x-hidden bg-white">
        {steps[activeStep]?.content}
      </div>
    </div>
  );
}
