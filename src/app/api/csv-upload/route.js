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

    // Validate required fields - check for either the CSV column names or the mapped field names
    const requiredFields = ['QR Code', 'Customer Name', 'Event Name', 'qr_code_text', 'customer_name', 'event_name'];
    
    // Check if CSV contains at least one of each required field type (new format OR old format)
    const hasNewFormatFields = data.length > 0 && (
      data[0].hasOwnProperty('QR Code') && 
      data[0].hasOwnProperty('Customer Name') && 
      data[0].hasOwnProperty('Event Name')
    );
    
    const hasOldFormatFields = data.length > 0 && (
      data[0].hasOwnProperty('qr_code_text') && 
      data[0].hasOwnProperty('customer_name') && 
      data[0].hasOwnProperty('event_name')
    );
    
    const missingFields = !hasNewFormatFields && !hasOldFormatFields;

    console.log('Has new format fields:', hasNewFormatFields);
    console.log('Has old format fields:', hasOldFormatFields);
    console.log('Missing fields:', missingFields);

    if (missingFields) {
      return NextResponse.json(
        { error: 'CSV must contain QR Code/qr_code_text, Customer Name/customer_name, and Event Name/event_name fields' },
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
    const batchSize = 20;
    const batches = [];
    
    for (let i = 0; i < data.length; i += batchSize) {
      batches.push(data.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      // Check for duplicates in this batch
      const qrCodes = batch.map(record => {
        // Try to get QR code from either format
        const qrCode = record['QR Code']?.trim() || record.qr_code_text?.trim();
        return qrCode;
      }).filter(Boolean); // Filter out any undefined/null values
      const existingDocs = await collectionRef
        .where('qr_code_text', 'in', qrCodes)
        .get();

      const existingQrCodes = new Set();
      existingDocs.forEach(doc => {
        existingQrCodes.add(doc.data().qr_code_text);
      });

      // Filter out duplicates and prepare new records
      const newRecords = batch.filter(record => {
        const qrCode = record['QR Code']?.trim() || record.qr_code_text?.trim();
        if (!qrCode || existingQrCodes.has(qrCode)) {
          if (qrCode) results.duplicates++;
          return false;
        }
        
        // Skip records with product name "TEST TICKET"
        const productName = record['Product Title']?.trim() || record.product_name?.trim();
        if (productName === 'TEST TICKET') {
          return false;
        }
        
        return true;
      });

      // Upload new records
      if (newRecords.length > 0) {
        const writeBatch = db.batch();
        
        newRecords.forEach(record => {
          const docRef = collectionRef.doc();
          
          // Map CSV columns to database fields
          const cleanRecord = {
            // Map CSV columns to database fields - try both formats
            id: record['Ticket ID']?.trim() || record.id || '',
            order_id: record['Order ID']?.trim() || record.order_id || '',
            qr_code_text: record['QR Code']?.trim() || record.qr_code_text || '',
            status: record['Status']?.trim() || record.status || 'ACTIVE',
            event_name: record['Event Name']?.trim() || record.event_name || '',
            event_location: record['Event Location']?.trim() || record.event_location || '',
            event_date: record['Event Date'] ? new Date(record['Event Date']) : (record.event_date ? new Date(record.event_date) : null),
            event_start_time: record['Event Start Time']?.trim() || record.event_start_time || '',
            customer_name: record['Customer Name']?.trim() || record.customer_name || '',
            attendee_name: record['Attendee Name']?.trim() || record.attendee_name || '',
            price: record['Price'] ? parseFloat(record['Price']) || 0 : (record.price ? parseFloat(record.price) || 0 : 0),
            product_name: record['Product Title']?.trim() || record.product_name || '',
            ticket_count_label: record['Ticket Count']?.trim() || record.ticket_count_label || '',
            seat: record['Seat Code']?.trim() || record.seat || '-',
            
            // Set default values for fields not in CSV
            details: record.details?.trim() || '',
            image_path: record.image_path?.trim() || '',
            order_status_id: record.order_status_id?.trim() || '2',
            expires_at: record.expires_at ? new Date(record.expires_at) : null,
            
            // Add any additional fields from CSV that might not be in the standard structure
            // ...Object.fromEntries(
            //   Object.entries(record)
            //     .filter(([key]) => ![
            //       'Ticket ID', 'Order ID', 'QR Code', 'Status', 'Event Name', 'Event Location', 
            //       'Event Date', 'Event Start Time', 'Customer Name', 'Price', 'Product Title', 
            //       'Ticket Count', 'Seat Code', 'id', 'order_id', 'qr_code_text', 'status', 
            //       'event_name', 'event_location', 'event_date', 'event_start_time', 'customer_name', 
            //       'price', 'product_name', 'ticket_count_label', 'seat', 'details', 'image_path', 
            //       'order_status_id', 'expires_at'
            //     ].includes(key))
            //     .map(([key, value]) => [key, value ? value.trim() : ''])
            // ),
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
