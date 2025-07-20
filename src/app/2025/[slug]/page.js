import path from "path";
import fsPromises from "fs/promises";

import Certificate from "@/components/Certificate";
import { notFound } from "next/navigation";

async function getEventInfo({ slug }) {
    const filePath = path.join(process.cwd(), "data/events.json");
    let data = JSON.parse(await fsPromises.readFile(filePath));

    return data["2025"]?.[slug];
}
path;
export default async function Page({ params }) {
    let { slug } = await params;
    let eventInfo = await getEventInfo({ slug });

    if (!eventInfo) return notFound();

    return <Certificate {...eventInfo} />;
}

export const generateMetadata = async ({ params }) => {
    let { slug } = await params;
    let eventInfo = await getEventInfo({ slug });

    return {
        title: `Generate Certificate | ${eventInfo.title}`,
        description: "...",
    };
};
