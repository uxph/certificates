import generateEventCode from "@/components/OnsiteRegistration/services/generateEventCode";
import eventCodes from "../../../../data/codes.json";
import { getFirebaseAdmin } from "@/services/firebaseAdmin";

export async function POST(req) {
    try {
        const body = await req.json();
        const { firstName, lastName, email, eventId, eventCode, eventName } = body;

        if (!firstName || !lastName || !email || !eventId || !eventCode) {
            return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
        }
        const expected = eventCodes[eventId];
        if (!expected) {
            return new Response(JSON.stringify({ error: "Please verify that the code for the event is correct." }), {
                status: 400,
            });
        }

        if (expected !== eventCode.trim()) {
            return new Response(JSON.stringify({ error: "Invalid event code." }), { status: 401 });
        }

        let code = generateEventCode(eventId, lastName);

        const attendeesCollection = process.env.ATTENDEES_COLLECTION || "helixpay_event_attendees";

        await getFirebaseAdmin()
            .firestore()
            .collection(attendeesCollection)
            .add({
                event_name: eventName.label,
                customer_name: `${firstName} ${lastName}`,
                qr_code_text: code,
                dateCreated: new Date(),
            });

        // ✅ Passed validation
        return new Response(JSON.stringify({ message: "Registration verified!", code, eventName: eventName.label }), {
            status: 200,
        });
    } catch (err) {
        console.error(err);
        return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
    }
}
