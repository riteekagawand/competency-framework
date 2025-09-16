import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import path from "path";
import fs from "fs/promises";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Received payload:", body);

    const { Default, Changed } = body;
    if (!Default || !Changed) {
      return NextResponse.json({ error: "Missing Default or Changed in body" }, { status: 400 });
    }

    const allGoals = { Default, Changed };

    const client = await clientPromise;
    const db = client.db("competencyDB");

    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;


    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(session, JWT_SECRET) as {
      EmployeeId: string;
      name: string;
      role: string;
    };

    const { EmployeeId, name, role } = decoded;

    const user = await db.collection("users").findOne({ EmployeeId });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { Department, Level } = user;

    if (!Level || !Department) {
      return NextResponse.json({ error: "Incomplete user data" }, { status: 400 });
    }

    const filePath = path.join(
      process.cwd(),
      "public",
      "Data",
      "Band 1",
      "Band1.json"
    );

    console.log("Loading role file:", filePath);

    const fileContents = await fs.readFile(filePath, "utf-8");
    const allRoles = JSON.parse(fileContents);

    const userRecord = allRoles.find(
      (item: any) =>
        item.Department === Department &&
        item.Level === Level &&
        item.Role === role
    );

    if (!userRecord || !userRecord.Manager) {
      return NextResponse.json(
        { error: "Manager role not found in JSON" },
        { status: 400 }
      );
    }

    const managerRole = userRecord.Manager;

    const managerUser = await db.collection("users").findOne({ Role: managerRole });

    if (!managerUser) {
      return NextResponse.json(
        { error: "Manager user not found in database" },
        { status: 404 }
      );
    }

    await db.collection("submittedGoals").insertOne({
      userId: EmployeeId,
      name,
      role,
      level: Level,
      department: Department,
      goals: allGoals,
      status: "pending",
      submittedAt: new Date(),
      managerId: managerUser.EmployeeId,
      managerComments: null,
      approvedAt: null
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Goal submission failed:", error);
    return NextResponse.json(
      { error: "Failed to submit goals", details: String(error) },
      { status: 500 }
    );
  }
}
