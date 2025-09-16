// app/api/reviewGoal/route.ts
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  const { goalId, action, comments } = await req.json();

  const client = await clientPromise;
  const db = client.db("competencyDB");

  const update: any = {
    status: action === "approve" ? "approved" : "rejected",
    managerComments: comments || null,
  };

  if (action === "approve") {
    update.approvedAt = new Date();
  }

  const result = await db.collection("userGoals").updateOne(
    { _id: new (require("mongodb").ObjectId)(goalId) },
    { $set: update }
  );

  if (result.modifiedCount === 0) {
    return NextResponse.json({ error: "Update failed" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
