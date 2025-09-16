"use client";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepContent from "@mui/material/StepContent";
import { useEffect, useState, type ReactNode } from "react";
import type { StepIconProps } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import SpiderRadarChart from "./spider-radar-chart";
import { SelectedType } from "constant-eums";

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

function CustomStepIcon(props: StepIconProps): ReactNode {
  const { active, completed } = props;
  if (completed) return <CheckCircleIcon color="success" />;
  if (active) return <RadioButtonUncheckedIcon color="primary" />;
  return <RadioButtonUncheckedIcon color="disabled" />;
}

export default function CompetencySidebar() {
  const [activeStep, setActiveStep] = useState(0);
  const [data, setData] = useState<CompetencyJson | null>(null);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [defaultVals, setDefaultVals] = useState<number[]>([]);
  const [selfVals, setSelfVals] = useState<number[]>([]);
  const [categories, setCategories] = useState<
    { name: string; goalArea: string; startAngle: number; endAngle: number }[]
  >([]);
  const [groupMap, setGroupMap] = useState<Record<string, number[]>>({});

  useEffect(() => {
    fetch("/Data/Band 1/Band1.json")
      .then((res) => res.json())
      .then((json) => {
        const competencyData: CompetencyJson = json[0];
        setData(competencyData);

        const defaults: Record<string, number> = {};
        const defaultArr: number[] = [];
        const cats: {
          name: string;
          goalArea: string;
          startAngle: number;
          endAngle: number;
        }[] = [];
        const mapping: Record<string, number[]> = {};

        let totalCompetencies = competencyData["Competency Framework"]["Goal Areas"]
          .reduce((sum, g) => sum + g["Expected Competancy"].length, 0);
        let angleStep = 360 / totalCompetencies;
        let currentAngle = 0;

        competencyData["Competency Framework"]["Goal Areas"].forEach((goal) => {
          const indices: number[] = [];
          goal["Expected Competancy"].forEach((comp) => {
            const defVal = comp["Default Competencies"] || 1;
            defaults[comp.Title] = defVal;
            defaultArr.push(defVal);

            const startAngle = currentAngle;
            const endAngle = currentAngle + angleStep;
            cats.push({ name: comp.Title, goalArea: goal.Name, startAngle, endAngle });
            indices.push(cats.length - 1);
            currentAngle += angleStep;
          });
          mapping[goal.Name] = indices;
        });

        setRatings(defaults);
        setDefaultVals(defaultArr);
        setSelfVals(defaultArr); // initial self = default
        setCategories(cats);
        setGroupMap(mapping);
      })
      .catch((err) => console.error("Error loading Band1.json", err));
  }, []);

  useEffect(() => {
    if (!data) return;
    const vals: number[] = data["Competency Framework"]["Goal Areas"].flatMap((goal) =>
      goal["Expected Competancy"].map((comp) => ratings[comp.Title] || 1)
    );
    setSelfVals(vals);
  }, [ratings, data]);

  const handleRating = (title: string, value: number) => {
    setRatings((prev) => ({ ...prev, [title]: value }));
  };

  // **Store data locally on submit**
  const handleSubmit = () => {
    const storedData = {
      timestamp: new Date().toISOString(),
      ratings,
    };
    localStorage.setItem("competencyRatings", JSON.stringify(storedData));
    alert("Data saved successfully!");
  };

  return (
    <div className="flex flex-col w-full">
      {/* Sidebar */}
      <div className="fixed top-0 left-0 h-full w-80 bg-[#D9D9D9] shadow-2xl p-4 z-50 overflow-y-auto">
        <Stepper activeStep={activeStep} orientation="vertical">
          <Step key="step1" onClick={() => setActiveStep(0)}>
            <StepLabel StepIconComponent={CustomStepIcon}>
              Know your work style
            </StepLabel>
            <StepContent>Persona dynamics</StepContent>
          </Step>

          <Step key="step2" onClick={() => setActiveStep(1)}>
            <StepLabel StepIconComponent={CustomStepIcon}>Set the Goal</StepLabel>
            <StepContent>
              {data ? (
                data["Competency Framework"]["Goal Areas"].flatMap((goal) =>
                  goal["Expected Competancy"].map((comp) => (
                    <div key={comp.Title} className="mb-3">
                      <div className="font-medium mb-1">{comp.Title}</div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((num) => (
                          <button
                            key={num}
                            className={`w-7 h-7 rounded ${
                              ratings[comp.Title] >= num
                                ? "bg-gray-600 text-white"
                                : "bg-white text-black border"
                            }`}
                            onClick={() => handleRating(comp.Title, num)}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )
              ) : (
                <div>Loading...</div>
              )}
            </StepContent>
          </Step>

          <Step key="step3" onClick={() => setActiveStep(2)}>
            <StepLabel StepIconComponent={CustomStepIcon}>Approval</StepLabel>
            <StepContent>Overview</StepContent>
          </Step>

          <Step key="step4" onClick={() => setActiveStep(3)}>
            <StepLabel StepIconComponent={CustomStepIcon}>Show Review</StepLabel>
            <StepContent>Overview</StepContent>
          </Step>
        </Stepper>
      </div>

      {/* Chart */}
      <div className="ml-80 flex flex-col items-center">
        <SpiderRadarChart
          defaultVals={defaultVals}
          selfVals={selfVals}
          managerVals={[]} // optional
          achievedVals={[]} // optional
          type={SelectedType.Self}
          category={categories}
          groupMap={groupMap}
        />

        {/* Buttons Below the Chart */}
        <div className="mt-20 flex gap-4">
          <button className="px-6 py-2 bg-gray-300 text-black rounded-xl hover:bg-gray-400">
            Default Goals
          </button>
          <button
            className="px-6 py-2 bg-[#ffd566] text-gray-700 rounded-xl hover:bg-[#ffc700]"
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
