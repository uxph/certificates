import { NextResponse } from "next/server";
import { getFirebaseAdmin } from "@/services/firebaseAdmin";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get("ids");

    if (!idsParam) {
      return NextResponse.json(
        { success: false, error: "Missing required query parameter 'ids'" },
        { status: 400 }
      );
    }

    const ids = idsParam
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    if (ids.length === 0) {
      return NextResponse.json({ success: true, data: {} });
    }

    const db = getFirebaseAdmin().firestore();

    const slotsMap = {};
    const chunkSize = 10; // Firestore 'in' limitation
    for (let i = 0; i < ids.length; i += chunkSize) {
      const chunk = ids.slice(i, i + chunkSize);
      const snapshot = await db
        .collection("workshops_counter")
        .where("workshopId", "in", chunk)
        .get();

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data?.workshopId) {
          slotsMap[data.workshopId] = +data.slotsLeft ?? 0;
        }
      });
    }

    return NextResponse.json({ success: true, data: slotsMap });
  } catch (error) {
    console.error("Workshop slots fetch error:", error);
    return NextResponse.json(
      { success: false, error: "An internal server error occurred" },
      { status: 500 }
    );
  }
}
