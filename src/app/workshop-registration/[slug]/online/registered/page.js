import path from "path";
import fsPromises from "fs/promises";
import { notFound, redirect } from "next/navigation";
import SelectionSummary from "@/components/WorkshopRegistration/SelectionSummary";
import { getFirebaseAdmin } from "@/services/firebaseAdmin";

async function getWorkshopInfo({ slug }) {
  const filePath = path.join(process.cwd(), "data/workshops.json");
  const data = JSON.parse(await fsPromises.readFile(filePath));
  return data["2025"]?.[slug];
}

export default async function RegisteredPage({ params, searchParams }) {
  const { slug } = params;
  const helixpayCode = searchParams?.helixpayCode;

  if (!helixpayCode) {
    // No code – go back to registration page
    redirect(`/workshop-registration/${slug}/online`);
  }

  // Fetch registration from Firestore
  const db = getFirebaseAdmin().firestore();
  const attendeesRef = db.collection("helixpay_event_attendees");
  const attendeeQuery = await attendeesRef
    .where("qr_code_text", "==", helixpayCode.trim())
    .get();

  if (attendeeQuery.empty) {
    return notFound();
  }

  const attendeeDoc = attendeeQuery.docs[0];
  const registrationDoc = await attendeeDoc.ref
    .collection("workshop_registrations")
    .doc(slug)
    .get();

  if (!registrationDoc.exists) {
    // Not registered – redirect back
    redirect(`/workshop-registration/${slug}/online`);
  }

  const registrationData = registrationDoc.data(); // contains blockA & blockB ids
  const workshopBlocks = await getWorkshopInfo({ slug });

  const selectedWorkshops = {
    blockA: registrationData.blockA,
    blockB: registrationData.blockB,
  };

  return (
    <main className="flex flex-col items-center py-10 space-y-6">
      <h1 className="text-3xl md:text-5xl font-bold text-center text-[#1b50d8]">
        You are already registered!
      </h1>
      <p className="text-center max-w-xl text-gray-700">
        Below are the workshops you successfully registered for.
      </p>
      <SelectionSummary
        selectedWorkshops={selectedWorkshops}
        workshopBlocks={workshopBlocks}
      />
    </main>
  );
}
