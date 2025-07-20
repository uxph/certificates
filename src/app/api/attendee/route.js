import { NextResponse } from "next/server";
import { getFirebaseAdmin } from "@/services/firebaseAdmin";

export async function POST(req) {
    let body = await req.json();
    let { ticketId, title } = body;
    try {
        let data = await getFirebaseAdmin()
            .firestore()
            .collection("helixpay_event_attendees")
            .where("event_name", "==", title)
            .where("qr_code_text", "==", ticketId)
            .get();
        data = data.docs.map((doc) => doc.data());
        if (data.length === 0) throw new Error("Ticket not found. Please check and try again.");
        return NextResponse.json({ success: true, data: data[0] });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ success: false, error: e?.message || "Internal Server Error" });
    }
}
