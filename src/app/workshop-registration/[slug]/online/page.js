import path from "path";
import fsPromises from "fs/promises";

import WorkshopRegistration from "@/components/WorkshopRegistration";
import { notFound } from "next/navigation";

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

export default async function Page({ params }) {
    let { slug } = await params;
    let workshopBlocks = await getWorkshopInfo({ slug });
    let eventInfo = await getEventInfo({ slug });

    if (!workshopBlocks || !eventInfo) return notFound();

    return (
        <WorkshopRegistration 
            workshopBlocks={workshopBlocks}
            title="Workshop Registration"
            subtitle={eventInfo.title}
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
