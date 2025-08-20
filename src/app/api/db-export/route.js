import { NextResponse } from "next/server";
import { getFirebaseAdmin } from "@/services/firebaseAdmin";
import ExcelJS from "exceljs";

export async function POST(req) {
  try {
    const { collection } = await req.json();
    
    if (!collection) {
      return NextResponse.json(
        { error: "Collection parameter is required" },
        { status: 400 }
      );
    }

    // Get data from Firebase
    const firestore = getFirebaseAdmin().firestore();
    const snapshot = await firestore.collection(collection).get();
    
    if (snapshot.empty) {
      return NextResponse.json(
        { error: "No data found in collection" },
        { status: 404 }
      );
    }

    const documents = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Create Excel workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(collection);

    // Get all unique keys from the documents
    const allKeys = new Set();
    documents.forEach(doc => {
      Object.keys(doc).forEach(key => allKeys.add(key));
    });

    const headers = Array.from(allKeys);

    // Add headers
    const headerRow = worksheet.addRow(headers);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Add data rows
    documents.forEach(doc => {
      const rowData = headers.map(header => {
        const value = doc[header];
        if (value === null || value === undefined) {
          return '';
        }
        if (typeof value === 'object') {
          return JSON.stringify(value);
        }
        return value;
      });
      worksheet.addRow(rowData);
    });

    // Auto-fit columns
    headers.forEach((header, index) => {
      const column = worksheet.getColumn(index + 1);
      column.width = Math.max(
        header.length,
        ...documents.map(doc => {
          const value = doc[header];
          if (value === null || value === undefined) return 0;
          if (typeof value === 'object') return JSON.stringify(value).length;
          return String(value).length;
        })
      ) + 2;
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Return the Excel file
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${collection}_${new Date().toISOString().split('T')[0]}.xlsx"`,
        'Content-Length': buffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
