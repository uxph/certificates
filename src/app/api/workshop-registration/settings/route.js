import { NextResponse } from "next/server";
import {
  fetchWorkshopRegistrationSettings,
  isWorkshopRegistrationOpen,
  setWorkshopRegistrationOpen,
} from "@/services/workshopRegistrationSettings";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventSlug = searchParams.get("eventSlug");

    if (eventSlug) {
      const isOpen = await isWorkshopRegistrationOpen(eventSlug);
      return NextResponse.json({
        success: true,
        data: { [eventSlug]: { isOpen } },
      });
    }

    const data = await fetchWorkshopRegistrationSettings();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Workshop registration settings GET error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Unable to load workshop registration settings.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { eventSlug, isOpen } = await request.json();

    if (!eventSlug || typeof isOpen !== "boolean") {
      return NextResponse.json(
        {
          success: false,
          error: "eventSlug and isOpen (boolean) are required.",
        },
        { status: 400 }
      );
    }

    const updated = await setWorkshopRegistrationOpen(eventSlug, isOpen);

    return NextResponse.json({
      success: true,
      data: { eventSlug, ...updated },
    });
  } catch (error) {
    console.error("Workshop registration settings POST error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Unable to update workshop registration setting.",
      },
      { status: 500 }
    );
  }
}
