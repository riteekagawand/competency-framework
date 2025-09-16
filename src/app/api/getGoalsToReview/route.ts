// app/api/getGoalsToReview/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import clientPromise from "@/lib/mongodb";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export async function GET() {
  try {
    const cookieStore = cookies();
    const session = cookieStore.get("session")?.value;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(session, JWT_SECRET) as { EmployeeId: string };

    const client = await clientPromise;
    const db = client.db("competencyDB");

    const goals = await db
      .collection("submittedGoals")
      .find({ managerId: decoded.EmployeeId })
      .sort({ submittedAt: -1 })
      .toArray();

    return NextResponse.json(goals);
  } catch (error) {
    console.error("Error fetching manager goals:", error);
    return NextResponse.json({ error: "Failed to load goals" }, { status: 500 });
  }
}
