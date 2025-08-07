"use client";
import { useEffect, useState } from "react";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepContent from "@mui/material/StepContent";
import type { StepIconProps } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { ChevronDown, ChevronUp } from "lucide-react";
import RadialChartPage from "../default-competancy/page";

function CustomStepIcon({ active, completed }: StepIconProps) {
  return completed
    ? <CheckCircleIcon color="success" />
    : <RadioButtonUncheckedIcon color={active ? "primary" : "disabled"} />;
}

function StepTwoComponent() {
  return (
    <div className="flex justify-center items-center w-[1270px]">
      <RadialChartPage />
    </div>
  );
}

function StepThreeComponent() {
  return <div className="p-6 text-xl">Approval Component</div>;
}

function StepFourComponent() {
  return <div className="p-6 text-xl">Show Review Component</div>;
}

export default function CompetencySidebar({
  goalAreas,
  showGoals,
}: {
  goalAreas: any[];
  showGoals: boolean;
}) {
  const [activeStep, setActiveStep] = useState(0);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [selectedLevels, setSelectedLevels] = useState<Record<string, number>>({});

  const handleLevelSelect = (title: string, level: number) => {
    setSelectedLevels((prev) => ({ ...prev, [title]: level }));
  };

  const toggleDropdown = (index: number) => {
    setExpandedIndex(prev => (prev === index ? null : index));
  };

  useEffect(() => {
    if (!goalAreas || goalAreas.length === 0) return;

    const initialLevels: Record<string, number> = {};

    goalAreas.forEach((goal) => {
      if (goal["Expected Competancy"] && Array.isArray(goal["Expected Competancy"])) {
        goal["Expected Competancy"].forEach((comp: any) => {
          const defaultLevel = comp["Default Competencies"];
          if (typeof defaultLevel === "number" && defaultLevel >= 1 && defaultLevel <= 5) {
            initialLevels[comp.Title] = defaultLevel;
          }
        });
      }
    });

    setSelectedLevels(initialLevels);
  }, [goalAreas]);

  const steps = [
    {
      label: "Set My Goals",
      content: <StepTwoComponent />,
      description: (
        <div>
          <div className="font-semibold mb-2">Competency split</div>
          {goalAreas && goalAreas.length > 0 ? (
            goalAreas.map((goal, i) => {
              let shortName = goal.Name;
              if (goal.Name.toLowerCase().includes("know your self")) shortName = "Self";
              else if (goal.Name.toLowerCase().includes("know your product")) shortName = "Product";
              else if (goal.Name.toLowerCase().includes("know your craft")) shortName = "Craft";
              else if (goal.Name.toLowerCase().includes("know your customer")) shortName = "Customer";

              const isExpanded = expandedIndex === i;

              return (
                <div key={i} className="mb-2 border rounded-md">
                  <button
                    onClick={() => toggleDropdown(i)}
                    className="flex justify-between w-full px-3 py-[3px] rounded-md"
                  >
                    <span className="text-sm font-medium">{shortName}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-700">{goal.TotalWeightage}</span>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </button>

                  {isExpanded && showGoals && (
                    <div className=" px-4 py-2 text-sm text-gray-600 space-y-4">
                      {goal["Expected Competancy"]?.length > 0 ? (
                        goal["Expected Competancy"].map((comp: any, idx: number) => (
                          <div key={idx}>
                            <p className="font-semibold text-gray-800 mb-1">{comp.Title}</p>
                            <div className="flex gap-2">
                              {[1, 2, 3, 4, 5].map((level) => (
                                <button
                                  key={level}
                                  onClick={() => handleLevelSelect(comp.Title, level)}
                                  className={`w-8 h-8 rounded border text-sm font-medium ${
                                    selectedLevels[comp.Title] >= level
                                      ? "bg-[#ffd566] text-black border-gray-700"
                                      : " text-black border-black"
                                  }`}
                                >
                                  {level}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="italic text-gray-400">No competencies defined</p>
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
    { label: "Approval", content: <StepThreeComponent />, description: "Overview" },
    { label: "Show Review", content: <StepFourComponent />, description: "Overview" },
  ];

  return (
    <div className="flex h-full">
      <div className="w-[266px] p-[10px] bg-white">
        <div className="w-[240px] h-full rounded-xl bg-[#D9D9D9]">
          <h2 className="text-2xl mt-2 font-bold ml-10 text-gray-800 mb-3">ACADEMY</h2>
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-600 mb-4">
              - - - - - - - - - - - - - - - - - - - - - - - - - -
            </h3>
          </div>
          <Stepper activeStep={activeStep} orientation="vertical" connector={null}>
            {steps.map((step, index) => (
              <Step key={index} onClick={() => setActiveStep(index)}>
                <StepLabel StepIconComponent={CustomStepIcon}>{step.label}</StepLabel>
                <StepContent>{step.description}</StepContent>
              </Step>
            ))}
          </Stepper>
        </div>
      </div>
      <div className="flex-1 bg-white">{steps[activeStep]?.content}</div>
    </div>
  );
}
