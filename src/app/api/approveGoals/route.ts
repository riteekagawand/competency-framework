import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
  const { goalId, beyondRole, managerChanged } = await req.json();

  const client = await clientPromise;
  const db = client.db("competencyDB");

  const updateDoc: any = {
    $set: {
      status: "Approved",
      beyondRole: beyondRole || [],
    },
  };

  if (managerChanged && typeof managerChanged === "object") {
    updateDoc.$set["goals.Changed"] = managerChanged;
  }

  await db.collection("submittedGoals").updateOne(
    { _id: new ObjectId(goalId) },
    updateDoc,
  );

  // Fetch the finalized document to insert into approvedGoals
  const approved = await db.collection("submittedGoals").findOne({ _id: new ObjectId(goalId) });
  let insertedApproved: any = null;
  if (approved) {
    const docToInsert = {
      userId: approved.userId,
      name: approved.name,
      role: approved.role,
      level: approved.level,
      department: approved.department,
      goals: approved.goals, // includes Default and possibly Changed (manager edits)
      beyondRole: approved.beyondRole || [],
      status: approved.status,
      submittedAt: approved.submittedAt,
      approvedAt: new Date(),
      sourceId: approved._id,
      managerId: approved.managerId,
    };
    const ins = await db.collection("approvedGoals").insertOne(docToInsert);
    insertedApproved = { _id: ins.insertedId, ...docToInsert };
  }

  return NextResponse.json({ success: true, message: "Approved", approved: insertedApproved });
}
