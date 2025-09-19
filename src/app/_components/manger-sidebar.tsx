"use client";

import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepContent from "@mui/material/StepContent";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import type { StepIconProps } from "@mui/material";
import React from "react";

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
  const [mgrCategories, setMgrCategories] = React.useState<{ name: string }[]>([]);
  const [mgrLevels, setMgrLevels] = React.useState<Record<string, number>>({});
  const [showEdit, setShowEdit] = React.useState(false);

  React.useEffect(() => {
    const updateFromWindow = () => {
      const state = (window as any).__mgrReviewState as
        | { category: { name: string }[]; levels: Record<string, number> }
        | undefined;
      if (state) {
        setMgrCategories(state.category || []);
        setMgrLevels(state.levels || {});
      }
    };
    updateFromWindow();
    window.addEventListener("mgrStateUpdated", updateFromWindow);
    const toggleHandler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { show: boolean } | undefined;
      if (detail && typeof detail.show === "boolean") setShowEdit(detail.show);
    };
    window.addEventListener("mgrToggleEdit", toggleHandler as EventListener);
    return () => window.removeEventListener("mgrStateUpdated", updateFromWindow);
  }, []);

  const setLevel = (name: string, level: number) => {
    setMgrLevels((prev) => ({ ...prev, [name]: level }));
    window.dispatchEvent(
      new CustomEvent("mgrSetLevel", { detail: { name, level } }),
    );
  };

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
            onClick={() => {
              setViewMode("reviewGoals");
            }}
          >
            Review Goals
          </button>
          {viewMode === "reviewGoals" && showEdit && mgrCategories.length > 0 && (
            <div className="mt-3 space-y-3">
              {mgrCategories.map((c) => (
                <div key={c.name} className="px-2">
                  <div className="text-xs font-medium text-gray-800 mb-1 truncate">
                    {c.name}
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setLevel(c.name, lvl)}
                        className={`w-7 h-7 rounded border text-xs font-medium ${
                          (mgrLevels[c.name] ?? 0) >= lvl
                            ? "bg-[#ffd566] text-black border-gray-700"
                            : "text-black border-black"
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
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
