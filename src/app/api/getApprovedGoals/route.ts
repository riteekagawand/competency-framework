import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const sourceId = url.searchParams.get("sourceId");
    const userId = url.searchParams.get("userId");

    const client = await clientPromise;
    const db = client.db("competencyDB");

    const approvedCollection = db.collection("approvedGoals");

    const filter: Record<string, unknown> = {};
    if (sourceId) {
      try {
        filter.sourceId = new ObjectId(sourceId);
      } catch {
        filter.sourceId = sourceId; // fallback if not a valid ObjectId
      }
    }
    if (userId) filter.userId = userId;

    // eslint-disable-next-line no-console
    console.log("[getApprovedGoals] filter:", filter);

    let approvedGoals = await approvedCollection
      .find(filter)
      .sort({ approvedAt: -1 })
      .toArray();

    // eslint-disable-next-line no-console
    console.log(
      "[getApprovedGoals] approvedGoals count:",
      approvedGoals?.length ?? 0,
    );

    // Fallback to submittedGoals if approvedGoals empty (initial compatibility)
    if (!approvedGoals || approvedGoals.length === 0) {
      const submittedFilter: Record<string, unknown> = { status: "Approved" };
      if (userId) submittedFilter.userId = userId;
      // eslint-disable-next-line no-console
      console.log("[getApprovedGoals] fallback filter:", submittedFilter);
      const submitted = await db
        .collection("submittedGoals")
        .find(submittedFilter)
        .sort({ submittedAt: -1 })
        .toArray();
      // eslint-disable-next-line no-console
      console.log(
        "[getApprovedGoals] submitted fallback count:",
        submitted?.length ?? 0,
      );
      approvedGoals = submitted as any;
    }

    return Response.json(approvedGoals);
  } catch (error) {
    console.error("Error fetching approved goals:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
