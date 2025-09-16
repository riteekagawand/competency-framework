// app/api/getUser/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import clientPromise from "@/lib/mongodb";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export async function GET() {
  const cookieStore = await cookies(); // ✅ Await here
  const token = cookieStore.get("session")?.value;

  if (!token) {
    return NextResponse.json({ error: "No session" }, { status: 401 });
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const client = await clientPromise;
    const db = client.db("competencyDB");

    const user = await db.collection("users").findOne({ EmployeeId: decoded.EmployeeId });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (err) {
    console.error("JWT verification failed:", err);
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }
}
