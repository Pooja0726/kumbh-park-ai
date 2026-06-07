import Tesseract from 'tesseract.js';

/** Extract Indian vehicle plate from OCR text (e.g UP32AB1234) */
export function extractIndianPlate(text: string): string | null {
  const upper = text.toUpperCase();
  const compact = upper.replace(/[^A-Z0-9]/g, '');

  const regex = /[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}/g;
  const spaced = upper.match(/[A-Z]{2}\s?[0-9]{1,2}\s?[A-Z]{1,3}\s?[0-9]{4}/g);

  if (spaced?.length) {
    return spaced[0].replace(/\s/g, '');
  }

  const direct = compact.match(regex);
  if (direct?.length) {
    return direct[0];
  }

  for (let i = 0; i <= compact.length - 9; i++) {
    for (let len = 9; len <= 11; len++) {
      const candidate = compact.slice(i, i + len);
      if (/^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}$/.test(candidate)) {
        return candidate;
      }
    }
  }

  return null;
}

/** Preprocess captured image on canvas for better OCR (grayscale + contrast) */
export function preprocessPlateImage(
  source: HTMLCanvasElement,
  crop?: { x: number; y: number; w: number; h: number }
): string {
  const out = document.createElement('canvas');
  const sw = crop?.w ?? source.width;
  const sh = crop?.h ?? source.height;
  out.width = sw;
  out.height = sh;
  const ctx = out.getContext('2d');
  if (!ctx) return source.toDataURL('image/jpeg', 0.95);

  if (crop) {
    ctx.drawImage(source, crop.x, crop.y, crop.w, crop.h, 0, 0, sw, sh);
  } else {
    ctx.drawImage(source, 0, 0);
  }

  const imageData = ctx.getImageData(0, 0, sw, sh);
  const d = imageData.data;
  for (let i = 0; i < d.length; i += 4) {
    const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    const contrast = Math.min(255, Math.max(0, (gray - 128) * 1.8 + 128));
    d[i] = d[i + 1] = d[i + 2] = contrast;
  }
  ctx.putImageData(imageData, 0, 0);
  return out.toDataURL('image/png');
}

export function getPlateCropRegion(
  videoWidth: number,
  videoHeight: number
): { x: number; y: number; w: number; h: number } {
  const w = Math.round(videoWidth * 0.88);
  const h = Math.round(videoHeight * 0.38);
  return {
    x: Math.round((videoWidth - w) / 2),
    y: Math.round((videoHeight - h) / 2),
    w,
    h,
  };
}

/** Validate plate format */
export function validatePlateNumber(plate: string): boolean {
  const plateRegex = /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}$/;
  return plateRegex.test(plate.toUpperCase());
}

export interface OCRResult {
  plateNumber: string;
  confidence: number;
  success: boolean;
  rawText: string;
}

/**
 * Process image and extract vehicle number plate using Tesseract
 */
export async function extractPlateFromImage(
  imageDataOrFile: string | Blob,
  preprocess = true
): Promise<OCRResult> {
  try {
    // Convert blob to data URL if needed
    let imageSource = imageDataOrFile;

    if (imageDataOrFile instanceof Blob) {
      imageSource = await blobToDataUrl(imageDataOrFile);
    }

    console.log('🎬 Starting OCR...');

    // Run Tesseract OCR with Hindi+English language support
    const result = await Tesseract.recognize(imageSource, 'eng+hin', {
      logger: (m) => {
        if (m.status === 'recognizing') {
          console.log(`📊 OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
    });

    const rawText = result.data.text.trim();
    const confidence = result.data.confidence || 0;

    console.log('📝 Raw OCR Text:', rawText);
    console.log('📈 Confidence:', confidence);

    // Extract plate from OCR text
    const plateNumber = extractIndianPlate(rawText);

    console.log('🏷️ Extracted Plate:', plateNumber);
    console.log('✅ Valid Format:', validatePlateNumber(plateNumber || ''));

    return {
      plateNumber: plateNumber || '',
      confidence,
      success: validatePlateNumber(plateNumber || ''),
      rawText,
    };
  } catch (error) {
    console.error('❌ OCR Error:', error);
    return {
      plateNumber: '',
      confidence: 0,
      success: false,
      rawText: 'Error processing image',
    };
  }
}

/**
 * Extract plate from canvas with preprocessing
 */
export async function extractPlateFromCanvas(
  canvas: HTMLCanvasElement,
  preprocess = true
): Promise<OCRResult> {
  try {
    // Get plate region crop
    const cropRegion = getPlateCropRegion(canvas.width, canvas.height);

    // Preprocess for better OCR
    let processedImage = canvas.toDataURL('image/jpeg', 0.95);

    if (preprocess) {
      processedImage = preprocessPlateImage(canvas, cropRegion);
      console.log('🖼️ Image preprocessed (grayscale + contrast)');
    }

    return extractPlateFromImage(processedImage, false);
  } catch (error) {
    console.error('❌ Canvas extraction error:', error);
    return {
      plateNumber: '',
      confidence: 0,
      success: false,
      rawText: 'Canvas processing failed',
    };
  }
}

/**
 * Convert Blob to Data URL
 */
function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}