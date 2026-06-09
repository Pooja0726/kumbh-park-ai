// lib/sms-service.ts

export interface SMSOptions {
  phoneNumber: string;
  message: string;
  language?: 'en' | 'hi';
}

export interface SMSResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  message?: string;
}

/**
 * Format phone number to Twilio format (+91...)
 * Handles Indian numbers with various formats
 */
export function formatPhoneNumber(phone: string): string {
  // Remove spaces, dashes, parentheses, plus signs
  let cleaned = phone.replace(/[\s\-()]/g, '');

  // Handle leading +91
  if (cleaned.startsWith('+91')) {
    return cleaned;
  }

  // Remove leading 0 if present
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }

  // Add +91 if not present
  if (!cleaned.startsWith('+')) {
    cleaned = '+91' + cleaned;
  }

  return cleaned;
}

/**
 * Validate Indian phone number
 * Accepts: 10 digits, +91XXXXXXXXXX, 0XXXXXXXXXX, +91 XXXXXXXXXX
 */
export function isValidIndianPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-()]/g, '');

  // Valid if it's 10 digits (Indian mobile) OR +91 + 10 digits
  const validPatterns = [
    /^[6-9]\d{9}$/, // 10 digits starting with 6-9
    /^\+91[6-9]\d{9}$/, // +91 + 10 digits
    /^0[6-9]\d{9}$/, // 0 + 10 digits
  ];

  return validPatterns.some((pattern) => pattern.test(cleaned));
}

/**
 * Create SMS message content in Hindi or English
 */
export function createAlertMessage(
  vehicleNumber: string,
  alertType: 'mis-park' | 'entry' | 'exit',
  language: 'en' | 'hi' = 'en',
  slotNumber?: string
): string {
  const slot = slotNumber || 'A-12';

  const messages: Record<string, Record<string, string>> = {
    'mis-park': {
      en: `⚠️ ALERT: Vehicle ${vehicleNumber} is mis-parked. Please relocate immediately. Contact: 8800XXXXX - Smart Parking System`,
      hi: `⚠️ सचेत: वाहन ${vehicleNumber} गलत स्थान पर पार्क है। कृपया तुरंत स्थानांतरित करें। संपर्क: 8800XXXXX - Smart Parking System`,
    },
    entry: {
      en: `✅ Welcome! Vehicle ${vehicleNumber} registered. Parking Slot: ${slot}. Show QR pass at gate. - Smart Parking System`,
      hi: `✅ स्वागत है! वाहन ${vehicleNumber} पंजीकृत। पार्किंग स्लॉट: ${slot}। गेट पर QR पास दिखाएं। - Smart Parking System`,
    },
    exit: {
      en: `👋 Thank you for visiting! Vehicle ${vehicleNumber} exit recorded. Have a safe journey! - Smart Parking System`,
      hi: `👋 आने के लिए धन्यवाद! वाहन ${vehicleNumber} प्रस्थान दर्ज। आपकी यात्रा सुरक्षित हो! - Smart Parking System`,
    },
  };

  return messages[alertType]?.[language] || messages[alertType]?.['en'] || 'Smart Parking Message';
}

/**
 * Send SMS via backend API (calls /api/send-sms)
 * More secure than sending API key from frontend
 */
export async function sendSMS(options: SMSOptions): Promise<SMSResponse> {
  const { phoneNumber, message } = options;

  console.log('📱 SMS Service: Preparing to send SMS...');
  console.log('📞 Phone:', phoneNumber);
  console.log('💬 Message:', message);

  // Validate phone number
  if (!phoneNumber) {
    console.error('❌ Phone number is empty');
    return {
      success: false,
      error: 'Phone number is required',
    };
  }

  if (!isValidIndianPhone(phoneNumber)) {
    console.error('❌ Invalid Indian phone number:', phoneNumber);
    return {
      success: false,
      error: `Invalid phone number format. Got: ${phoneNumber}. Expected: 10 digits or +91XXXXXXXXXX`,
    };
  }

  const formattedPhone = formatPhoneNumber(phoneNumber);
  console.log('✓ Formatted phone:', formattedPhone);

  try {
    console.log('🔄 Calling /api/send-sms...');

    const response = await fetch('/api/send-sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber: formattedPhone,
        message,
      }),
    });

    console.log('📊 API Response Status:', response.status);

    const data = await response.json();

    console.log('📋 API Response:', data);

    if (!response.ok) {
      console.error('❌ SMS API Error:', data);
      return {
        success: false,
        error: data.error || `HTTP ${response.status}: Failed to send SMS`,
      };
    }

    console.log('✅ SMS sent successfully!');
    return {
      success: true,
      messageId: data.messageId || data.sid,
      message: `SMS sent to ${formattedPhone}`,
    };
  } catch (error) {
    console.error('❌ SMS Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Send SMS with retry logic (try up to 3 times)
 */
export async function sendSMSWithRetry(
  options: SMSOptions,
  maxRetries = 3
): Promise<SMSResponse> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`📤 SMS Send Attempt ${attempt}/${maxRetries}...`);
    const result = await sendSMS(options);

    if (result.success) {
      return result;
    }

    if (attempt < maxRetries) {
      console.log(`⏳ Retrying in 2 seconds...`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  return {
    success: false,
    error: `Failed to send SMS after ${maxRetries} attempts`,
  };
}

/**
 * Send SMS without awaiting (fire and forget)
 * Useful when you don't want to block the user experience
 */
export function sendSMSAsync(options: SMSOptions): void {
  sendSMS(options).then((result) => {
    if (result.success) {
      console.log('✅ SMS delivered:', result.messageId);
    } else {
      console.error('❌ SMS delivery failed:', result.error);
    }
  });
}

/**
 * Check if Twilio credentials are configured in environment
 */
export function isSmsConfigured(): boolean {
  return !!(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_PHONE_NUMBER
  );
}

/**
 * Send SMS server-side via Twilio REST API directly.
 * Used by API routes (register/route.ts) — does NOT use fetch('/api/send-sms')
 * because Next.js API routes cannot call other API routes via relative URL.
 *
 * Falls back to mock mode when Twilio is not configured.
 */
export async function sendSms(
  phone: string,
  message: string
): Promise<{ sent: boolean; mode: 'live' | 'mock'; error?: string }> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    console.warn('⚠️ Twilio not configured — running in mock SMS mode');
    console.log(`📱 [MOCK SMS] To: ${phone}`);
    console.log(`💬 [MOCK SMS] Message: ${message}`);
    return { sent: false, mode: 'mock' };
  }

  // Format phone number
  const formattedPhone = formatPhoneNumber(phone);
  console.log(`📱 [SMS] Sending to ${formattedPhone} via Twilio...`);

  try {
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

    const twilioResponse = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: fromNumber,
          To: formattedPhone,
          Body: message,
        }).toString(),
      }
    );

    const data = await twilioResponse.json();

    if (!twilioResponse.ok) {
      console.error('❌ Twilio API error:', data);
      return {
        sent: false,
        mode: 'live',
        error: data.message || `Twilio error ${twilioResponse.status}`,
      };
    }

    console.log('✅ SMS sent! SID:', data.sid);
    return { sent: true, mode: 'live' };
  } catch (error) {
    console.error('❌ SMS send error:', error);
    return {
      sent: false,
      mode: 'live',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}