import clientPromise from "@/lib/mongodb";
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(); // ← no need to pass name if it's in the URI
    console.log("Using DB:", db.databaseName);

    const goalsCollection = db.collection("submittedGoals");

    const all = await goalsCollection.find().toArray();
    console.log("Total in collection:", all.length);
    console.log("Sample doc:", all[0]);

    const approvedGoals = await goalsCollection
      .find({ status: "Approved" })
      .sort({ submittedAt: -1 })
      .toArray();

    console.log("Approved goals:", approvedGoals);

    return Response.json(approvedGoals);
  } catch (error) {
    console.error("Error fetching approved goals:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
