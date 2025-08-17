import { NextResponse } from "next/server";
import { getFirebaseAdmin } from "@/services/firebaseAdmin";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventSlug = searchParams.get("eventSlug");

    if (!eventSlug) {
      return NextResponse.json(
        { success: false, error: "Missing required query parameter 'eventSlug'" },
        { status: 400 }
      );
    }

    const db = getFirebaseAdmin().firestore();

    const snapshot = await db
      .collection("workshops_counter")
      .where("eventSlug", "==", eventSlug)
      .get();

    const slotsMap = {};
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data?.workshopId) {
        slotsMap[data.workshopId] = +data.slotsLeft ?? 0;
      }
    });

    return NextResponse.json({ success: true, data: slotsMap });
  } catch (error) {
    console.error("Workshop slots fetch error:", error);
    return NextResponse.json(
      { success: false, error: "An internal server error occurred" },
      { status: 500 }
    );
  }
}
