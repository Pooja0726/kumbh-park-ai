import Tesseract from 'tesseract.js';

/** Extract Indian vehicle plate from OCR text (e.g UP32AB1234) */
export function extractIndianPlate(text: string): string | null {
  const upper = text.toUpperCase();
  // Remove all non-alphanumeric characters
  const compact = upper.replace(/[^A-Z0-9]/g, '');

  // Common OCR misreads: fix O/0, I/1, S/5, B/8 etc.
  const corrected = compact
    .replace(/O/g, '0')  // we'll try both interpretations
    .replace(/I/g, '1')
    .replace(/S/g, '5');

  // Try multiple variants for better matching
  const variants = [compact, corrected, upper.replace(/[^A-Z0-9 ]/g, '').replace(/\s+/g, '')];

  for (const text of variants) {
    // Standard Indian plate: XX00XX0000 (state + district + series + number)
    const regex = /[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}/g;
    const match = text.match(regex);
    if (match?.length) return match[0];
  }

  // Try with spaces (e.g. "RM 00 YZ 0123")
  const spaced = upper.match(/[A-Z]{2}\s?[0-9]{1,2}\s?[A-Z]{1,3}\s?[0-9]{3,4}/g);
  if (spaced?.length) {
    return spaced[0].replace(/\s/g, '');
  }

  // Sliding window over compact text
  for (const text of [compact, corrected]) {
    for (let i = 0; i <= text.length - 9; i++) {
      for (let len = 9; len <= 11; len++) {
        if (i + len > text.length) break;
        const candidate = text.slice(i, i + len);
        if (/^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}$/.test(candidate)) {
          return candidate;
        }
      }
    }
  }

  return null;
}

/**
 * Preprocess image for OCR with proper binarization.
 * Steps: crop → scale up → grayscale → adaptive threshold → output
 */
export function preprocessPlateImage(
  source: HTMLCanvasElement,
  crop?: { x: number; y: number; w: number; h: number }
): string {
  // Step 1: Crop the region
  const sw = crop?.w ?? source.width;
  const sh = crop?.h ?? source.height;

  // Step 2: Scale up small images (Tesseract works better on larger images)
  const MIN_HEIGHT = 150;
  const scale = sh < MIN_HEIGHT ? Math.ceil(MIN_HEIGHT / sh) : 1;
  const outW = sw * scale;
  const outH = sh * scale;

  const out = document.createElement('canvas');
  out.width = outW;
  out.height = outH;
  const ctx = out.getContext('2d');
  if (!ctx) return source.toDataURL('image/jpeg', 0.95);

  // Use better image scaling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  if (crop) {
    ctx.drawImage(source, crop.x, crop.y, crop.w, crop.h, 0, 0, outW, outH);
  } else {
    ctx.drawImage(source, 0, 0, source.width, source.height, 0, 0, outW, outH);
  }

  // Step 3: Convert to grayscale
  const imageData = ctx.getImageData(0, 0, outW, outH);
  const d = imageData.data;
  const grayValues: number[] = [];

  for (let i = 0; i < d.length; i += 4) {
    const gray = Math.round(0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]);
    grayValues.push(gray);
    d[i] = d[i + 1] = d[i + 2] = gray;
  }

  // Step 4: Calculate Otsu threshold for binarization
  const threshold = otsuThreshold(grayValues);
  console.log(`🔲 Otsu threshold: ${threshold}`);

  // Step 5: Apply binary threshold (black text on white background)
  for (let i = 0; i < d.length; i += 4) {
    const val = d[i] < threshold ? 0 : 255;
    d[i] = d[i + 1] = d[i + 2] = val;
  }

  ctx.putImageData(imageData, 0, 0);

  // Step 6: Add white padding around the image (helps Tesseract)
  const padded = document.createElement('canvas');
  const pad = 20;
  padded.width = outW + pad * 2;
  padded.height = outH + pad * 2;
  const pCtx = padded.getContext('2d');
  if (!pCtx) return out.toDataURL('image/png');

  pCtx.fillStyle = '#ffffff';
  pCtx.fillRect(0, 0, padded.width, padded.height);
  pCtx.drawImage(out, pad, pad);

  return padded.toDataURL('image/png');
}

/**
 * Otsu's method to find optimal binary threshold
 */
function otsuThreshold(grayValues: number[]): number {
  const histogram = new Array(256).fill(0);
  for (const val of grayValues) {
    histogram[val]++;
  }

  const total = grayValues.length;
  let sum = 0;
  for (let i = 0; i < 256; i++) sum += i * histogram[i];

  let sumB = 0;
  let wB = 0;
  let wF = 0;
  let maxVariance = 0;
  let threshold = 128;

  for (let t = 0; t < 256; t++) {
    wB += histogram[t];
    if (wB === 0) continue;
    wF = total - wB;
    if (wF === 0) break;

    sumB += t * histogram[t];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;
    const variance = wB * wF * (mB - mF) * (mB - mF);

    if (variance > maxVariance) {
      maxVariance = variance;
      threshold = t;
    }
  }

  return threshold;
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
 * Run Tesseract OCR with plate-optimized settings
 */
async function runPlateOCR(imageSource: string): Promise<{ rawText: string; confidence: number }> {
  const worker = await Tesseract.createWorker('eng', 1, {
    logger: (m) => {
      if (m.status === 'recognizing') {
        console.log(`📊 OCR Progress: ${Math.round(m.progress * 100)}%`);
      }
    },
  });

  // Configure for license plate reading
  await worker.setParameters({
    tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ',
    tessedit_pageseg_mode: Tesseract.PSM.SPARSE_TEXT, // Find text anywhere in image
  });

  const { data } = await worker.recognize(imageSource);
  const rawText = data.text.trim();
  const confidence = data.confidence || 0;

  await worker.terminate();

  return { rawText, confidence };
}

/**
 * Process image and extract vehicle number plate using Tesseract
 */
export async function extractPlateFromImage(
  imageDataOrFile: string | Blob,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _preprocess = true
): Promise<OCRResult> {
  try {
    let source: string;
    if (imageDataOrFile instanceof Blob) {
      source = await blobToDataUrl(imageDataOrFile);
    } else {
      source = imageDataOrFile;
    }

    console.log('🎬 Starting plate OCR...');

    const { rawText, confidence } = await runPlateOCR(source);

    console.log('📝 Raw OCR Text:', rawText);
    console.log('📈 Confidence:', confidence);

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
 * Get crop regions to try — prioritize where plates typically appear
 */
function getCropRegions(
  w: number,
  h: number
): Array<{ label: string; x: number; y: number; w: number; h: number } | null> {
  return [
    null, // full image
    { label: 'bottom-half', x: 0, y: Math.round(h * 0.45), w, h: Math.round(h * 0.55) },
    { label: 'bottom-third', x: Math.round(w * 0.05), y: Math.round(h * 0.55), w: Math.round(w * 0.9), h: Math.round(h * 0.45) },
    { label: 'center-band', x: Math.round(w * 0.05), y: Math.round(h * 0.25), w: Math.round(w * 0.9), h: Math.round(h * 0.5) },
  ];
}

/**
 * Extract plate from canvas — tries multiple crop regions with binarized preprocessing.
 * Returns as soon as a valid plate is found.
 */
export async function extractPlateFromCanvas(
  canvas: HTMLCanvasElement,
  preprocess = true
): Promise<OCRResult> {
  const regions = getCropRegions(canvas.width, canvas.height);
  let bestResult: OCRResult = {
    plateNumber: '',
    confidence: 0,
    success: false,
    rawText: '',
  };
  const allRawTexts: string[] = [];

  for (const region of regions) {
    try {
      const label = region?.label ?? 'full-image';
      console.log(`🔍 Trying OCR on: ${label}...`);

      // Preprocess with binarization
      const processedImage = preprocess
        ? preprocessPlateImage(canvas, region ?? undefined)
        : canvas.toDataURL('image/jpeg', 0.95);

      const result = await extractPlateFromImage(processedImage, false);
      allRawTexts.push(result.rawText);

      if (result.success) {
        console.log(`✅ Plate found in ${label}: ${result.plateNumber}`);
        return result;
      }

      if (result.confidence > bestResult.confidence) {
        bestResult = result;
      }
    } catch (error) {
      console.warn(`⚠️ OCR failed for region:`, error);
    }
  }

  // Last resort: try to find plate in combined raw text from all regions
  const combined = allRawTexts.join(' ');
  const lastChance = extractIndianPlate(combined);
  if (lastChance && validatePlateNumber(lastChance)) {
    console.log(`✅ Plate found in combined text: ${lastChance}`);
    return {
      plateNumber: lastChance,
      confidence: bestResult.confidence,
      success: true,
      rawText: combined,
    };
  }

  console.log('⚠️ No valid plate found. Raw texts:', allRawTexts);
  return bestResult;
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