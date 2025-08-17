import { NextResponse } from "next/server";
import { getFirebaseAdmin } from "@/services/firebaseAdmin";

export async function POST(request) {
  try {
    const { eventSlug, helixpayCode, workshopSelections } =
      await request.json();

    const db = getFirebaseAdmin().firestore();

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

    // Validate workshop selections (should have Block A and Block B)
    if (!workshopSelections["Block A"] || !workshopSelections["Block B"]) {
      return NextResponse.json(
        {
          success: false,
          error: "Please select one workshop from both Block A and Block B",
        },
        { status: 400 }
      );
    }

    const attendeesRef = db.collection("helixpay_event_attendees");
    const attendeeQuery = await attendeesRef
      .where("qr_code_text", "==", helixpayCode.trim())
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

    // Get the attendee document
    const attendeeDoc = attendeeQuery.docs[0];
    const attendeeData = attendeeDoc.data();

    const existingRegistration = await attendeeDoc.ref
      .collection("workshop_registrations")
      .doc(eventSlug)
      .get();

    if (existingRegistration.exists) {
      return NextResponse.json(
        {
          success: false,
          error: "You have already registered for workshops for this event",
        },
        { status: 409 }
      );
    }

    const registrationData = {
      ...workshopSelections,
      registrationDate: new Date(),
      status: "registered",
    };

    await attendeeDoc.ref
      .collection("workshop_registrations")
      .doc(eventSlug)
      .set(registrationData);

    return NextResponse.json({
      success: true,
      message: "Workshop registration successful!",
      data: {
        attendeeName: attendeeData.customer_name,
        eventSlug: eventSlug,
        workshopSelections: workshopSelections,
        registrationDate: registrationData.registrationDate.toISOString(),
      },
    });
  } catch (error) {
    console.error("Workshop registration error:", error);
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

    // Query helixpay_event_attendees collection
    const attendeesRef = db.collection("helixpay_event_attendees");
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
