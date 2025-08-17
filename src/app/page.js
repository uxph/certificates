import path from "path";
import fsPromises from "fs/promises";

import Certificate from "@/components/Certificate";
import { notFound } from "next/navigation";
import OnsiteRegistration from "@/components/OnsiteRegistration";

async function getEvents() {
    const filePath = path.join(process.cwd(), "data/events.json");
    let data = JSON.parse(await fsPromises.readFile(filePath));
    return Object.keys(data)
        .map((year) => Object.keys(data[year]).map((ev) => ({ value: ev, label: data[year][ev].title })))
        .flat();
}
path;
export default async function Page({ params }) {
    let events = await getEvents();
    console.log(events);

    return <OnsiteRegistration options={events} />;
}

export const generateMetadata = async ({ params }) => {
    return {
        title: `Onsite Registration`,
        description: "...",
    };
};
