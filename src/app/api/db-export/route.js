import { NextResponse } from "next/server";
import { getFirebaseAdmin } from "@/services/firebaseAdmin";
import ExcelJS from "exceljs";
import path from "path";
import fsPromises from "fs/promises";

async function getEventInfo({ slug, year }) {
  const filePath = path.join(process.cwd(), "data/events.json");
  let data = JSON.parse(await fsPromises.readFile(filePath));

  return data[year]?.[slug];
}

async function getWorkshopInfo({ slug }) {
  const filePath = path.join(process.cwd(), "data/workshops.json");
  let data = JSON.parse(await fsPromises.readFile(filePath));

  return data["2025"]?.[slug];
}

export async function POST(req) {
  try {
    const { venue } = await req.json();

    if (!venue) {
      return NextResponse.json(
        { error: "Venue parameter is required" },
        { status: 400 }
      );
    }

    // Valid event IDs from events.json (excluding business-of-design)
    const validEventIds = ["mini-conf-mnl", "mini-conf-ceb", "mini-conf-dvo"];

    if (!validEventIds.includes(venue)) {
      return NextResponse.json(
        {
          error:
            "Invalid venue. Must be 'mini-conf-mnl', 'mini-conf-ceb', or 'mini-conf-dvo'",
        },
        { status: 400 }
      );
    }

    const eventInfo = await getEventInfo({ slug: venue, year: "2025" });
    const workshopInfo = await getWorkshopInfo({ slug: venue });

    const attendeeList = {
      blockA: workshopInfo.blockA.reduce((acc, workshop) => {
        acc[workshop.id] = [];
        return acc;
      }, {}),
      blockB: workshopInfo.blockB.reduce((acc, workshop) => {
        acc[workshop.id] = [];
        return acc;
      }, {}),
    };
    const registeredAttendeeIds = new Set();

    // Get workshop registrations from Firebase
    const db = getFirebaseAdmin().firestore();

    const attendeesCollection = process.env.ATTENDEES_COLLECTION || "helixpay_event_attendees";

    const attendees = await db
      .collection(attendeesCollection)
      .where("event_name", "==", eventInfo.title)
      .get();

    for (const attendee of attendees.docs) {
      const data = attendee.data();
      const registration = await db
        .collection(attendeesCollection)
        .doc(attendee.id)
        .collection("workshop_registrations")
        .doc(venue)
        .get();
      // console.log(registration);
      if (!registration.exists) {
        continue;
      }
      const registrationData = registration.data();
      // console.log(registrationData);
      const attendeeName = data.attendee_name || data.customer_name;
      let hasRegistered = false;

      const blockASelection = attendeeList["blockA"][registrationData.blockA];
      if (blockASelection) {
        blockASelection.push({
          id: data.id,
          name: attendeeName,
        });
        hasRegistered = true;
      }

      // Make blockB registration optional since we have sessions occupying 2 blocks
      if (registrationData.blockB) {
        const blockBSelection = attendeeList["blockB"]?.[registrationData.blockB];
        if (blockBSelection) {
          blockBSelection.push({
            id: data.id,
            name: attendeeName,
          });
          hasRegistered = true;
        }
      }

      if (hasRegistered) {
        registeredAttendeeIds.add(data.id);
      }
    }

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'UXPH Portal';
    workbook.lastModifiedBy = 'UXPH Portal';
    workbook.created = new Date();
    workbook.modified = new Date();

    // Create sheets for Block A workshops
    Object.entries(attendeeList.blockA).forEach(([workshopId, attendees]) => {
      if (attendees.length === 0) return;

      // Find workshop details from workshopInfo
      const workshop = workshopInfo.blockA.find(w => w.id === workshopId);
      const sheetName = workshop ? workshop.title : workshopId;

      // Create worksheet
      const worksheet = workbook.addWorksheet(workshopId, {
        properties: { tabColor: { argb: 'FF4F81BD' } }
      });

      // Add headers
      const headers = ['ID', 'Customer Name'];
      const headerRow = worksheet.addRow(headers);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4F81BD' }
      };

      // Add attendee data
      attendees.forEach(attendee => {
        worksheet.addRow([attendee.id, attendee.name]);
      });

      // Auto-fit columns
      worksheet.getColumn(1).width = Math.max(2, ...attendees.map(a => String(a.id).length)) + 2;
      worksheet.getColumn(2).width = Math.max(12, ...attendees.map(a => String(a.name).length)) + 2;

      // Add borders to all cells
      worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell, colNumber) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      });
    });

    // Create sheets for Block B workshops
    Object.entries(attendeeList.blockB).forEach(([workshopId, attendees]) => {
      if (attendees.length === 0) return;

      // Find workshop details from workshopInfo
      const workshop = workshopInfo.blockB.find(w => w.id === workshopId);
      const sheetName = workshop ? workshop.title : workshopId;

      // Create worksheet
      const worksheet = workbook.addWorksheet(workshopId, {
        properties: { tabColor: { argb: 'FF70AD47' } }
      });

      // Add headers
      const headers = ['ID', 'Customer Name'];
      const headerRow = worksheet.addRow(headers);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF70AD47' }
      };

      // Add attendee data
      attendees.forEach(attendee => {
        worksheet.addRow([attendee.id, attendee.name]);
      });

      // Auto-fit columns
      worksheet.getColumn(1).width = Math.max(2, ...attendees.map(a => String(a.id).length)) + 2;
      worksheet.getColumn(2).width = Math.max(12, ...attendees.map(a => String(a.name).length)) + 2;

      // Add borders to all cells
      worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell, colNumber) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      });
    });

    // Add a summary sheet
    const summarySheet = workbook.addWorksheet('Summary', {
      properties: { tabColor: { argb: 'FFFFC000' } }
    });

    // Summary information
    const now = new Date();
    const exportDate = now.toLocaleDateString('en-US', { timeZone: 'Asia/Manila' });
    const exportTime = now.toLocaleTimeString('en-US', {
      timeZone: 'Asia/Manila',
      hour12: false,
    });

    summarySheet.addRow(['Event ID', venue]);
    summarySheet.addRow(['Event Name', eventInfo.title]);
    summarySheet.addRow(['Total Registered Attendees', registeredAttendeeIds.size]);
    summarySheet.addRow(['Total Attendee Records', attendees.docs.length]);
    
    // Count total workshops with attendees
    const totalWorkshops = Object.values(attendeeList.blockA).filter(a => a.length > 0).length +
                          Object.values(attendeeList.blockB).filter(a => a.length > 0).length;
    summarySheet.addRow(['Total Workshops with Attendees', totalWorkshops]);

    summarySheet.addRow([]);
    summarySheet.addRow(['Block A Workshops', 'Attendee Count']);
    workshopInfo.blockA.forEach(workshop => {
      const attendees = attendeeList.blockA[workshop.id] || [];
      summarySheet.addRow([workshop.title, attendees.length]);
    });

    summarySheet.addRow([]);
    summarySheet.addRow(['Block B Workshops', 'Attendee Count']);
    workshopInfo.blockB.forEach(workshop => {
      const attendees = attendeeList.blockB[workshop.id] || [];
      summarySheet.addRow([workshop.title, attendees.length]);
    });

    summarySheet.addRow(['Export Date (PH GMT+8)', exportDate]);
    summarySheet.addRow(['Export Time (PH GMT+8)', exportTime]);

    // Format summary sheet
    summarySheet.getColumn(1).width = 25;
    summarySheet.getColumn(2).width = 40;

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Return the Excel file
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="workshop_attendees_${venue}_${new Date().toISOString().split('T')[0]}.xlsx"`,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}
