import path from "path";
import fsPromises from "fs/promises";

import WorkshopRegistration from "@/components/WorkshopRegistration";
import { notFound } from "next/navigation";
import { getFirebaseAdmin } from "@/services/firebaseAdmin";

async function getWorkshopInfo({ slug }) {
    const filePath = path.join(process.cwd(), "data/workshops.json");
    let data = JSON.parse(await fsPromises.readFile(filePath));

    return data["2025"]?.[slug];
}

async function getEventInfo({ slug }) {
    const filePath = path.join(process.cwd(), "data/events.json");
    let data = JSON.parse(await fsPromises.readFile(filePath));

    return data["2025"]?.[slug];
}

// Helper to attach `slotsLeft` from Firestore to each workshop
async function attachSlotsLeft(workshopBlocks) {
    if (!workshopBlocks) return workshopBlocks;

    const db = getFirebaseAdmin().firestore();
    const allWorkshops = Object.values(workshopBlocks).flat();
    const ids = allWorkshops.map((w) => w.id);

    const slotsMap = {};
    const chunkSize = 10; // Firestore 'in' query limitation
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

    // Build new object preserving original structure but with slotsLeft
    const enriched = {};
    for (const [blockName, workshops] of Object.entries(workshopBlocks)) {
        enriched[blockName] = workshops.map((w) => ({
            ...w,
            slotsLeft: slotsMap[w.id] ?? 0,
        }));
    }

    return enriched;
}

export default async function Page({ params }) {
    let { slug } = await params;
    let workshopBlocks = await getWorkshopInfo({ slug });
    workshopBlocks = await attachSlotsLeft(workshopBlocks);
    let eventInfo = await getEventInfo({ slug });

    if (!workshopBlocks || !eventInfo) return notFound();

    return (
        <WorkshopRegistration 
            workshopBlocks={workshopBlocks}
            title="Workshop Registration"
            subtitle={eventInfo.title}
            eventSlug={slug}
            helixpayPattern={eventInfo?.validator?.pattern || "HLX-XXXXXX-XXXXXX-XXXXX"}
            helixpayRegex={eventInfo?.validator?.regex || "^HLX-[A-Za-z0-9]{6}-\\d{6}-\\d{5}$"}
        />
    );
}

export const generateMetadata = async ({ params }) => {
    let { slug } = await params;
    let eventInfo = await getEventInfo({ slug });

    return {
        title: `Workshop Registration | ${eventInfo?.title || "Event"}`,
        description: "Register for workshops and sessions.",
    };
};
