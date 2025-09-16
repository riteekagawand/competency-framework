"use client";

import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepContent from "@mui/material/StepContent";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import type { StepIconProps } from "@mui/material";

type SidebarProps = {
  activeStep: number;
  setActiveStep: (step: number) => void;
  viewMode: string;
  setViewMode: (mode: string) => void;
};

function CustomStepIcon({ active, completed }: StepIconProps) {
  return completed ? (
    <CheckCircleIcon color="success" />
  ) : (
    <RadioButtonUncheckedIcon color={active ? "primary" : "disabled"} />
  );
}

export default function Sidebar({
  activeStep,
  setActiveStep,
  viewMode,
  setViewMode,
}: SidebarProps) {
  const steps = [
    {
      label: "Set My Goals",
      description: (
        <div className="flex flex-col ">
          <button
            className={`px-4 py-2 rounded-md text-sm font-semibold transition ${
              viewMode === "myGoals" ? "text-black" : "text-gray-700"
            }`}
            onClick={() => setViewMode("myGoals")}
          >
            My Goals
          </button>
          <button
            className={`px-4 py-2 rounded-md text-sm font-semibold transition  ${
              viewMode === "reviewGoals" ? "text-black" : "text-gray-700"
            }`}
            onClick={() => setViewMode("reviewGoals")}
          >
            Review Goals
          </button>
        </div>
      ),
    },
    {
      label: "Approval",
      description: (
        <p className="pl-4 text-sm text-gray-700 mt-2">Approval Component</p>
      ),
    },
    {
      label: "Show Review",
      description: (
        <p className="pl-4 text-sm text-gray-700 mt-2">Show Review Component</p>
      ),
    },
  ];

  return (
    <div className="w-[266px] h-screen p-2 bg-white">
      <div className="w-[240px] h-full rounded-xl bg-[#D9D9D9] p-4 overflow-y-auto">
        <h2 className="text-2xl font-extrabold text-center text-gray-800 mb-4 h-[37px]">
          ACADEMY
        </h2>
        <div className=" mb-6 custom-dashed-border" />

        <Stepper
          activeStep={activeStep}
          orientation="vertical"
          connector={null}
        >
          {steps.map((step, index) => (
            <Step key={index}>
              <StepLabel
                StepIconComponent={CustomStepIcon}
                onClick={() => setActiveStep(index)}
                className="cursor-pointer text-sm"
              >
                {step.label}
              </StepLabel>
              <StepContent>{step.description}</StepContent>
            </Step>
          ))}
        </Stepper>
      </div>
    </div>
  );
}
