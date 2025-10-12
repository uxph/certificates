import { NextResponse } from "next/server";
import { getFirebaseAdmin } from "@/services/firebaseAdmin";
import admin from "firebase-admin";
import { isWorkshopRegistrationOpen } from "@/services/workshopRegistrationSettings";

export async function POST(request) {
  try {
    const { eventSlug, helixpayCode, workshopSelections, title } =
      await request.json();

    const db = getFirebaseAdmin().firestore();
    const attendeesCollection =
      process.env.ATTENDEES_COLLECTION || "helixpay_event_attendees";

    // Validate required fields
    if (!eventSlug || !helixpayCode || !workshopSelections) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: eventSlug, helixpayCode, or workshopSelections",
        },
        { status: 400 }
      );
    }

    if (!workshopSelections["blockA"] || !workshopSelections["blockB"]) {
      return NextResponse.json(
        {
          success: false,
          error: "Please select one workshop from both Block A and Block B",
        },
        { status: 400 }
      );
    }

    const registrationOpen = await isWorkshopRegistrationOpen(eventSlug);
    if (!registrationOpen) {
      return NextResponse.json(
        {
          success: false,
          error: "Workshop registration is currently closed for this event.",
        },
        { status: 403 }
      );
    }

    // Find attendee by Helixpay code and event title
    const attendeesRef = db.collection(attendeesCollection);
    const attendeeQuery = await attendeesRef
      .where("qr_code_text", "==", helixpayCode.trim())
      .where("event_name", "==", title)
      .limit(1)
      .get();

    if (attendeeQuery.empty) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid Helixpay code. Please check your code and try again.",
        },
        { status: 404 }
      );
    }

    const attendeeDoc = attendeeQuery.docs[0];
    const attendeeDocRef = attendeeDoc.ref;

    // Run a transaction to: (1) verify not already registered, (2) ensure slots available, (3) decrement slots, (4) create registration
    const result = await db.runTransaction(async (tx) => {
      const registrationRef = attendeeDocRef
        .collection("workshop_registrations")
        .doc(eventSlug);

      const existingRegSnap = await tx.get(registrationRef);
      if (existingRegSnap.exists) {
        throw new Error("ALREADY_REGISTERED");
      }

      // Helper to locate counter doc by workshopId with eventSlug, fallback without
      const findCounterDocRef = async (workshopId) => {
        const base = db.collection("workshops_counter");
        // Query by workshopId only to avoid composite index requirements, then filter by eventSlug in memory
        const q = base.where("workshopId", "==", workshopId).limit(10);
        const snap = await tx.get(q);
        if (snap.empty) return null;
        const match = snap.docs.find((d) => (d.data()?.eventSlug || null) === eventSlug);
        return (match || snap.docs[0]).ref;
      };

      const blockAId = workshopSelections["blockA"];
      const blockBId = workshopSelections["blockB"];

      // Find counter refs
      const blockARef = await findCounterDocRef(blockAId);
      if (!blockARef) throw new Error("BLOCK_A_NOT_FOUND");

      let blockBRef = null;
      const isSame = blockBId === blockAId;
      if (!isSame) {
        blockBRef = await findCounterDocRef(blockBId);
        if (!blockBRef) throw new Error("BLOCK_B_NOT_FOUND");
      }

      // Read current counters inside transaction
      const blockASnap = await tx.get(blockARef);
      if (!blockASnap.exists) throw new Error("BLOCK_A_NOT_FOUND");
      const aSlots = Number(blockASnap.data()?.slotsLeft ?? 0);
      if (aSlots <= 0) throw new Error("BLOCK_A_FULL");

      let bSlots = 0;
      let blockBSnap = null;
      if (!isSame) {
        blockBSnap = await tx.get(blockBRef);
        if (!blockBSnap.exists) throw new Error("BLOCK_B_NOT_FOUND");
        bSlots = Number(blockBSnap.data()?.slotsLeft ?? 0);
        if (bSlots <= 0) throw new Error("BLOCK_B_FULL");
      }

      // Decrement counters atomically in this transaction
      tx.set(
        blockARef,
        {
          slotsLeft: admin.firestore.FieldValue.increment(-1),
          lastRegistration: new Date(),
        },
        { merge: true }
      );

      if (!isSame) {
        tx.set(
          blockBRef,
          {
            slotsLeft: admin.firestore.FieldValue.increment(-1),
            lastRegistration: new Date(),
          },
          { merge: true }
        );
      }

      const registrationData = {
        ...workshopSelections,
        registrationDate: new Date(),
        status: "registered",
      };

      tx.set(registrationRef, registrationData);

      return registrationData;
    });

    const attendeeData = attendeeDoc.data();

    return NextResponse.json({
      success: true,
      message: "Workshop registration successful!",
      data: {
        attendeeName: attendeeData.attendee_name || attendeeData.customer_name,
        eventSlug: eventSlug,
        workshopSelections: workshopSelections,
        registrationDate: result.registrationDate.toISOString(),
      },
    });
  } catch (error) {
    console.error("Workshop registration error:", error);
    // Map known errors to user-friendly responses
    if (error?.message === "ALREADY_REGISTERED") {
      return NextResponse.json(
        { success: false, error: "You have already registered for workshops for this event" },
        { status: 409 }
      );
    }
    if (error?.message === "BLOCK_A_FULL") {
      return NextResponse.json(
        { success: false, error: "Block A workshop is full. Please select another workshop." },
        { status: 409 }
      );
    }
    if (error?.message === "BLOCK_B_FULL") {
      return NextResponse.json(
        { success: false, error: "Block B workshop is full. Please select another workshop." },
        { status: 409 }
      );
    }
    if (error?.message === "BLOCK_A_NOT_FOUND" || error?.message === "BLOCK_B_NOT_FOUND") {
      return NextResponse.json(
        { success: false, error: "Selected workshop not found. Please refresh and try again." },
        { status: 404 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: "An internal server error occurred. Please try again later.",
      },
      { status: 500 }
    );
  }
}

// Optional: GET method to check registration status
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const helixpayCode = searchParams.get("helixpayCode");
    const eventSlug = searchParams.get("eventSlug");

    if (!helixpayCode || !eventSlug) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required parameters: helixpayCode and eventSlug",
        },
        { status: 400 }
      );
    }

    const db = getFirebaseAdmin().firestore();
    const attendeesCollection =
      process.env.ATTENDEES_COLLECTION || "helixpay_event_attendees";

    // Query helixpay_event_attendees collection
    const attendeesRef = db.collection(attendeesCollection);
    const attendeeQuery = await attendeesRef
      .where("qr_code_text", "==", helixpayCode.trim())
      .get();

    if (attendeeQuery.empty) {
      return NextResponse.json(
        { success: false, error: "Invalid Helixpay code" },
        { status: 404 }
      );
    }

    const attendeeDoc = attendeeQuery.docs[0];

    // Check if registration exists
    const registrationDoc = await attendeeDoc.ref
      .collection("workshop_registrations")
      .doc(eventSlug)
      .get();

    if (registrationDoc.exists) {
      const registrationData = registrationDoc.data();
      return NextResponse.json({
        success: true,
        isRegistered: true,
        data: registrationData,
      });
    } else {
      return NextResponse.json({
        success: true,
        isRegistered: false,
        attendeeName: attendeeDoc.data().customer_name,
      });
    }
  } catch (error) {
    console.error("Registration check error:", error);
    return NextResponse.json(
      { success: false, error: "An internal server error occurred" },
      { status: 500 }
    );
  }
}
