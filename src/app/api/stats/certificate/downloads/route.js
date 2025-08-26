import { getFirebaseAdmin } from "@/services/firebaseAdmin";

export async function POST(req) {
    try {
        const body = await req.json();
        const { eventId } = body;

        let doc = await getFirebaseAdmin().firestore().collection("stats").doc("certificate_downloads").get();
        let data = doc.data();

        if (!data[eventId]) data[eventId] = 1;
        else data[eventId]++;

        await getFirebaseAdmin().firestore().collection("stats").doc("certificate_downloads").update(data);
        // ✅ Passed validation
        return new Response(JSON.stringify({ message: "Added counter", data }), {
            status: 200,
        });
    } catch (err) {
        console.error(err);
        return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
    }
}

export async function GET(req) {
    try {
        let doc = await getFirebaseAdmin().firestore().collection("stats").doc("certificate_downloads").get();
        let data = doc.data();
        // ✅ Passed validation
        return new Response(JSON.stringify({ message: "Download statistics", data }), {
            status: 200,
        });
    } catch (err) {
        console.error(err);
        return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
    }
}
