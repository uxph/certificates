import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/services/firebaseAdmin';
import csv from 'csvtojson';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Check file type
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a CSV file.' },
        { status: 400 }
      );
    }

    // Read file content
    const fileBuffer = await file.arrayBuffer();
    
    const fileContent = new TextDecoder().decode(fileBuffer);

    // Parse CSV using csvtojson
    const data = await csv({
      noheader: false,
      output: 'json'
    }).fromString(fileContent);

    if (data.length === 0) {
      return NextResponse.json(
        { error: 'No data found in CSV file' },
        { status: 400 }
      );
    }

    // Validate required fields
    const requiredFields = ['qr_code_text', 'customer_name', 'event_name'];
    const missingFields = data.some(record => 
      requiredFields.some(field => !record[field] || record[field].trim() === '')
    );

    if (missingFields) {
      return NextResponse.json(
        { error: 'CSV must contain qr_code_text, customer_name, and event_name fields' },
        { status: 400 }
      );
    }

    // Initialize Firebase
    const firebaseAdmin = getFirebaseAdmin();
    const db = firebaseAdmin.firestore();
    const collectionRef = db.collection('helixpay_event_attendees');

    const results = {
      totalRecords: data.length,
      newRecords: 0,
      duplicates: 0,
      errors: []
    };

    // Process records in batches
    const batchSize = 50;
    const batches = [];
    
    for (let i = 0; i < data.length; i += batchSize) {
      batches.push(data.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      // Check for duplicates in this batch
      const qrCodes = batch.map(record => record.qr_code_text.trim());
      const existingDocs = await collectionRef
        .where('qr_code_text', 'in', qrCodes)
        .get();

      const existingQrCodes = new Set();
      existingDocs.forEach(doc => {
        existingQrCodes.add(doc.data().qr_code_text);
      });

      // Filter out duplicates and prepare new records
      const newRecords = batch.filter(record => {
        const qrCode = record.qr_code_text.trim();
        if (existingQrCodes.has(qrCode)) {
          results.duplicates++;
          return false;
        }
        return true;
      });

      // Upload new records
      if (newRecords.length > 0) {
        const writeBatch = db.batch();
        
        newRecords.forEach(record => {
          const docRef = collectionRef.doc();
          
          // Parse and clean the data
          const cleanRecord = {
            qr_code_text: record.qr_code_text.trim(),
            customer_name: record.customer_name.trim(),
            event_name: record.event_name.trim(),
            event_date: record.event_date ? new Date(record.event_date) : null,
            event_location: record.event_location ? record.event_location.trim() : '',
            event_start_time: record.event_start_time ? record.event_start_time.trim() : '',
            expires_at: record.expires_at ? new Date(record.expires_at) : null,
            order_id: record.order_id ? record.order_id.trim() : '',
            order_status_id: record.order_status_id ? record.order_status_id.trim() : '',
            price: record.price ? parseFloat(record.price) || 0 : 0,
            product_name: record.product_name ? record.product_name.trim() : '',
            seat: record.seat ? record.seat.trim() : '',
            status: record.status ? record.status.trim() : '',
            ticket_count_label: record.ticket_count_label ? record.ticket_count_label.trim() : '',
            details: record.details ? record.details.trim() : '',
            image_path: record.image_path ? record.image_path.trim() : '',
            // Add any additional fields from CSV that might not be in the standard structure
            ...Object.fromEntries(
              Object.entries(record)
                .filter(([key]) => ![
                  'qr_code_text', 'customer_name', 'event_name', 'event_date', 
                  'event_location', 'event_start_time', 'expires_at', 'order_id', 
                  'order_status_id', 'price', 'product_name', 'seat', 'status', 
                  'ticket_count_label', 'details', 'image_path'
                ].includes(key))
                .map(([key, value]) => [key, value ? value.trim() : ''])
            ),
            created_at: new Date(),
            updated_at: new Date()
          };
          
          writeBatch.set(docRef, cleanRecord);
        });

        await writeBatch.commit();
        results.newRecords += newRecords.length;
      }
    }

    return NextResponse.json(results);

  } catch (error) {
    console.error('CSV processing error:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing the CSV file' },
      { status: 500 }
    );
  }
}
