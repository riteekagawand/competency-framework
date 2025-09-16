// models/competancy.ts
import mongoose, { Schema, Document } from "mongoose";

// -------------------------
// Sub-schemas
// -------------------------

interface IExpectedCompetency {
  Title: string;
  Weightage: string;
  Competencies: string[];
  DefaultCompetencies: number;
}

const ExpectedCompetencySchema = new Schema<IExpectedCompetency>({
  Title: { type: String, required: true },
  Weightage: { type: String, required: true },
  Competencies: [{ type: String, required: true }],
  DefaultCompetencies: { type: Number, required: true },
});

interface IGoalArea {
  Name: string;
  TotalWeightage: string;
  ExpectedCompetancy: IExpectedCompetency[];
}

const GoalAreaSchema = new Schema<IGoalArea>({
  Name: { type: String, required: true },
  TotalWeightage: { type: String, required: true },
  ExpectedCompetancy: [ExpectedCompetencySchema],
});

interface IBand extends Document {
  Department: string;
  Level: string;
  Role: string;
  CompetencyFramework: {
    GoalAreas: IGoalArea[];
  };
}

// -------------------------
// Main schema
// -------------------------

const BandSchema = new Schema<IBand>({
  Department: { type: String, required: true },
  Level: { type: String, required: true },
  Role: { type: String, required: true },
  CompetencyFramework: {
    GoalAreas: [GoalAreaSchema],
  },
});

// -------------------------
// Model
// -------------------------

const BandModel =
  mongoose.models.Band || mongoose.model<IBand>("Band", BandSchema);

export default BandModel;
