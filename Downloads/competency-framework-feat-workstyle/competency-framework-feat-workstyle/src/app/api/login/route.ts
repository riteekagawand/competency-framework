// app/api/login/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret"; // keep in .env

export async function POST(req: Request) {
  try {
    const { Name, EmployeeId, Department, Level, Role } = await req.json();
    const client = await clientPromise;
    const db = client.db("competencyDB");

    // Store user in DB
    await db.collection("users").insertOne({ Name, EmployeeId, Department, Level, Role });

    // --- create session token ---
    const token = jwt.sign({ EmployeeId }, JWT_SECRET, { expiresIn: "1h" });

    const res = NextResponse.json({ message: "Login successful" });
    res.cookies.set("session", token, { httpOnly: true, path: "/" });
    return res;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
