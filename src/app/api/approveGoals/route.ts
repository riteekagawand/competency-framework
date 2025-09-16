import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
  const { goalId, beyondRole } = await req.json();

  const client = await clientPromise;
  const db = client.db();

  await db.collection("submittedGoals").updateOne(
    { _id: new ObjectId(goalId) },
    {
      $set: {
        status: "Approved",
        beyondRole: beyondRole || [], // ✅ save selected tasks
      },
    }
  );

  return NextResponse.json({ success: true, message: "Approved" });
}
