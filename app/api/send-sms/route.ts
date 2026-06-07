// app/api/send-sms/route.ts

import { NextRequest, NextResponse } from 'next/server';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

export async function POST(request: NextRequest) {
  try {
    console.log('🔵 [SMS API] Received request');

    // Parse request body
    const { phoneNumber, message } = await request.json();

    console.log('📞 [SMS API] Phone:', phoneNumber);
    console.log('💬 [SMS API] Message length:', message?.length);

    // Validate inputs
    if (!phoneNumber) {
      console.error('❌ [SMS API] Missing phoneNumber');
      return NextResponse.json(
        { success: false, error: 'Missing phoneNumber parameter' },
        { status: 400 }
      );
    }

    if (!message) {
      console.error('❌ [SMS API] Missing message');
      return NextResponse.json(
        { success: false, error: 'Missing message parameter' },
        { status: 400 }
      );
    }

    // Validate Twilio credentials
    if (!accountSid || !authToken || !fromNumber) {
      console.error('❌ [SMS API] Missing Twilio credentials in environment');
      console.error('accountSid:', accountSid ? '✓ set' : '✗ missing');
      console.error('authToken:', authToken ? '✓ set' : '✗ missing');
      console.error('fromNumber:', fromNumber ? '✓ set' : '✗ missing');

      return NextResponse.json(
        {
          success: false,
          error: 'Twilio not properly configured. Check environment variables.',
          details: {
            accountSid: accountSid ? 'SET' : 'MISSING',
            authToken: authToken ? 'SET' : 'MISSING',
            fromNumber: fromNumber ? 'SET' : 'MISSING',
          },
        },
        { status: 500 }
      );
    }

    console.log('✓ [SMS API] Twilio credentials found');

    // Create Basic Auth header for Twilio
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

    console.log('🔐 [SMS API] Sending to Twilio API...');

    // Send SMS via Twilio REST API
    const twilioResponse = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: fromNumber,
          To: phoneNumber,
          Body: message,
        }).toString(),
      }
    );

    console.log('📊 [SMS API] Twilio Response Status:', twilioResponse.status);

    // Parse Twilio response
    const twilioData = await twilioResponse.json();

    console.log('📋 [SMS API] Twilio Response:', twilioData);

    if (!twilioResponse.ok) {
      console.error('❌ [SMS API] Twilio Error:', twilioData);

      return NextResponse.json(
        {
          success: false,
          error: twilioData.message || `Twilio API Error: ${twilioResponse.status}`,
          twilioError: twilioData.code,
          details: twilioData,
        },
        { status: twilioResponse.status || 400 }
      );
    }

    console.log('✅ [SMS API] SMS sent successfully!');
    console.log('📧 [SMS API] Message SID:', twilioData.sid);

    return NextResponse.json(
      {
        success: true,
        messageId: twilioData.sid,
        status: twilioData.status,
        phoneNumber: twilioData.to,
        message: 'SMS sent successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ [SMS API] Unexpected Error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        type: error instanceof Error ? error.constructor.name : 'Unknown',
      },
      { status: 500 }
    );
  }
}

// Add a GET endpoint for testing
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'SMS API is running',
    method: 'POST',
    body: {
      phoneNumber: '+91XXXXXXXXXX (required)',
      message: 'Your message here (required)',
    },
    credentials: {
      TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID ? '✓ SET' : '✗ MISSING',
      TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN ? '✓ SET' : '✗ MISSING',
      TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER ? '✓ SET' : '✗ MISSING',
    },
  });
}