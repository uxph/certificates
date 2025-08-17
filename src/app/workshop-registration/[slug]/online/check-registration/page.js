import path from "path";
import fsPromises from "fs/promises";
import CheckRegistration from "@/components/WorkshopRegistration/CheckRegistration";
import { notFound } from "next/navigation";

async function getWorkshopInfo({ slug }) {
  const filePath = path.join(process.cwd(), "data/workshops.json");
  const data = JSON.parse(await fsPromises.readFile(filePath));
  return data["2025"]?.[slug];
}

async function getEventInfo({ slug }) {
  const filePath = path.join(process.cwd(), "data/events.json");
  const data = JSON.parse(await fsPromises.readFile(filePath));
  return data["2025"]?.[slug];
}

export default async function Page({ params, searchParams }) {
  const { slug } = params;
  const initialCode = searchParams?.helixpayCode || "";

  const workshopBlocks = await getWorkshopInfo({ slug });
  const eventInfo = await getEventInfo({ slug });

  if (!workshopBlocks) return notFound();

  return (
    <CheckRegistration
      workshopBlocks={workshopBlocks}
      eventSlug={slug}
      initialCode={initialCode}
      helixpayPattern={eventInfo?.validator?.pattern || "HLX-XXXXXX-XXXXXX-XXXXX"}
      helixpayRegex={eventInfo?.validator?.regex || "^HLX-[A-Za-z0-9]{6}-\\d{6}-\\d{5}$"}
    />
  );
}
