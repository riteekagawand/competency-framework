import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export async function POST(req: Request) {
  try {
    const { Name, EmployeeId, Department, Level, Role } = await req.json();
    const client = await clientPromise;
    const db = client.db("competencyDB");

    // 🔍 Check if user already exists
    const existingUser = await db.collection("users").findOne({ EmployeeId });
    if (!existingUser) {
      await db.collection("users").insertOne({ Name, EmployeeId, Department, Level, Role });
    }

    // ✅ Include more fields in JWT
    const token = jwt.sign({ EmployeeId, name: Name, role: Role }, JWT_SECRET, {
      expiresIn: "1h",
    });

    const res = NextResponse.json({ message: "Login successful" });
    res.cookies.set("session", token, { httpOnly: true, path: "/" });
    return res;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
