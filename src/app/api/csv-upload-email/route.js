import { NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/services/firebaseAdmin';
import csv from 'csvtojson';

const CHUNK_SIZE = 10; // Firestore 'in' queries support max 10 values

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a CSV file.' },
        { status: 400 }
      );
    }

    const fileBuffer = await file.arrayBuffer();
    const fileContent = new TextDecoder().decode(fileBuffer);

    const data = await csv({ noheader: false, output: 'json' }).fromString(fileContent);

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { error: 'No data found in CSV file' },
        { status: 400 }
      );
    }

    const results = {
      totalRecords: data.length,
      updatedRecords: 0,
      missingQRCodeCount: 0,
      missingEmailCount: 0,
      notFoundCount: 0,
      errors: [],
      notFound: [],
      missingEmail: [],
    };

    const qrCodeToRecord = new Map();
    const duplicateQrCodes = new Set();

    const sanitize = (value) => {
      if (typeof value === 'string') {
        return value.trim();
      }
      if (typeof value === 'number') {
        return String(value);
      }
      return '';
    };

    const sanitizeEmail = (value) => {
      const cleaned = sanitize(value);
      if (!cleaned) {
        return '';
      }

      const normalized = cleaned.toLowerCase();
      if (normalized === '-' || normalized === '--' || normalized === '—') {
        return '';
      }

      return cleaned;
    };

    data.forEach((record, index) => {
      const recordPosition = index + 1;
      const qrCode = sanitize(record['qr_code_text'] ?? record['QR Code']);
      const email = sanitizeEmail(record['Email Address']) || sanitizeEmail(record['School Email']);
      const customerName = sanitize(record['customer_name'] ?? record['Customer Name']);

      if (!qrCode) {
        results.missingQRCodeCount += 1;
        results.errors.push(`Record ${recordPosition}: Missing qr_code_text`);
        return;
      }

      if (!email) {
        results.missingEmailCount += 1;
        results.missingEmail.push(`QR ${qrCode}${customerName ? ` (${customerName})` : ''}`);
        return;
      }

      if (qrCodeToRecord.has(qrCode)) {
        duplicateQrCodes.add(qrCode);
        return;
      }

      qrCodeToRecord.set(qrCode, {
        email,
        customerName,
        recordPosition,
      });
    });

    duplicateQrCodes.forEach((qrCode) => {
      results.errors.push(`Duplicate QR code detected in upload: ${qrCode}`);
    });

    if (qrCodeToRecord.size === 0) {
      return NextResponse.json(
        {
          ...results,
          error: 'No valid records to process. Ensure qr_code_text and email fields are present.',
        },
        { status: 400 }
      );
    }

    const firebaseAdmin = getFirebaseAdmin();
    const db = firebaseAdmin.firestore();
    const attendeesCollection = process.env.ATTENDEES_COLLECTION || 'helixpay_event_attendees';
    const collectionRef = db.collection(attendeesCollection);
    const processedQrCodes = new Set();

    const qrCodes = Array.from(qrCodeToRecord.keys());

    for (let i = 0; i < qrCodes.length; i += CHUNK_SIZE) {
      const chunk = qrCodes.slice(i, i + CHUNK_SIZE);
      const snapshot = await collectionRef.where('qr_code_text', 'in', chunk).get();

      const batch = db.batch();
      let updatesInBatch = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();
        const qrCode = data.qr_code_text;
        const record = qrCodeToRecord.get(qrCode);
        if (!record) {
          return;
        }

        batch.update(doc.ref, {
          email: record.email,
          updated_at: new Date(),
        });

        updatesInBatch += 1;
        processedQrCodes.add(qrCode);
        results.updatedRecords += 1;
      });

      if (updatesInBatch > 0) {
        await batch.commit();
      }
    }

    qrCodes.forEach((qrCode) => {
      if (!processedQrCodes.has(qrCode)) {
        const record = qrCodeToRecord.get(qrCode);
        results.notFoundCount += 1;
        results.notFound.push(
          `QR ${qrCode}${record?.customerName ? ` (${record.customerName})` : ''}`
        );
      }
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error('CSV email processing error:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing the CSV file' },
      { status: 500 }
    );
  }
}
