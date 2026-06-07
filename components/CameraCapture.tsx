'use client';

import { useRef, useState } from 'react';
import { Camera, Upload } from 'lucide-react';
import {
  extractPlateFromCanvas,
  extractIndianPlate,
  validatePlateNumber,
  getPlateCropRegion,
  preprocessPlateImage,
} from '@/lib/plate-ocr';

interface CameraCaptureProps {
  onPlateDetected: (plateNumber: string, confidence: number) => void;
}

export default function CameraCapture({ onPlateDetected }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<string>('');
  const [confidence, setConfidence] = useState<number>(0);
  const [manualInput, setManualInput] = useState<string>('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [lastCapturePreview, setLastCapturePreview] = useState<string>('');

  // Start camera
  const startCamera = async () => {
    try {
      setStatusMessage('📷 Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
        setStatusMessage('✅ Camera ready. Center the plate and tap Capture.');
      }
    } catch (err) {
      console.error('❌ Camera error:', err);
      setStatusMessage('❌ Cannot access camera. Check permissions.');
      alert('Camera permission denied. Please allow camera access in settings.');
    }
  };

  // Capture photo and process with OCR
  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsProcessing(true);
    setStatusMessage('📸 Capturing image...');

    try {
      const context = canvasRef.current.getContext('2d');
      if (!context) throw new Error('Canvas context not available');

      // Draw video frame to canvas
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);

      // Store preview
      setLastCapturePreview(canvasRef.current.toDataURL('image/jpeg', 0.8));

      setStatusMessage('🎬 Running OCR (this may take 10-20 seconds)...');

      // Extract plate with preprocessing
      const result = await extractPlateFromCanvas(canvasRef.current, true);

      console.log('✅ OCR Result:', result);

      setOcrResult(result.plateNumber);
      setConfidence(result.confidence);

      if (result.success) {
        setStatusMessage(`✅ Plate detected: ${result.plateNumber}`);
        // Auto-fill and proceed
        onPlateDetected(result.plateNumber, result.confidence);
        stopCamera();
      } else {
        // Show manual input option if detection failed
        setStatusMessage(
          `⚠️ OCR confidence low. Raw text: "${result.rawText}". Please enter manually.`
        );
        setShowManualInput(true);
      }
    } catch (err) {
      console.error('❌ Capture error:', err);
      setStatusMessage(`❌ Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setShowManualInput(true);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setStatusMessage('📁 Processing uploaded image...');

    try {
      // Create canvas from uploaded image
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas context failed');

        ctx.drawImage(img, 0, 0);
        setLastCapturePreview(canvas.toDataURL('image/jpeg', 0.8));

        setStatusMessage('🎬 Running OCR on uploaded image...');
        const result = await extractPlateFromCanvas(canvas, true);

        console.log('✅ Upload OCR Result:', result);

        setOcrResult(result.plateNumber);
        setConfidence(result.confidence);

        if (result.success) {
          setStatusMessage(`✅ Plate detected: ${result.plateNumber}`);
          onPlateDetected(result.plateNumber, result.confidence);
        } else {
          setStatusMessage('⚠️ Manual entry required. Please type the plate number.');
          setShowManualInput(true);
        }

        setIsProcessing(false);
      };

      img.onerror = () => {
        setStatusMessage('❌ Failed to load image');
        setIsProcessing(false);
      };

      img.src = URL.createObjectURL(file);
    } catch (err) {
      console.error('❌ File upload error:', err);
      setStatusMessage('❌ Error processing image');
      setIsProcessing(false);
    }
  };

  // Handle manual input
  const handleManualSubmit = () => {
    const plate = manualInput.toUpperCase().trim();

    if (!validatePlateNumber(plate)) {
      alert('❌ Invalid plate format.\n\nExample: UP32AB1234\n\nFormat: 2 letters + 2 digits + 2-3 letters + 4 digits');
      return;
    }

    setStatusMessage(`✅ Manual entry: ${plate}`);
    onPlateDetected(plate, 0); // Confidence = 0 for manual entry
    setShowManualInput(false);
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach((track) => track.stop());
      setIsCameraActive(false);
      setStatusMessage('📹 Camera stopped');
    }
  };

  const resetCapture = () => {
    setOcrResult('');
    setManualInput('');
    setShowManualInput(false);
    setStatusMessage('');
    setLastCapturePreview('');
    setConfidence(0);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Status Message */}
      {statusMessage && (
        <div className={`w-full p-3 rounded text-center text-sm font-semibold ${
          statusMessage.includes('✅') || statusMessage.includes('detected')
            ? 'bg-green-100 text-green-800'
            : statusMessage.includes('❌')
            ? 'bg-red-100 text-red-800'
            : 'bg-blue-100 text-blue-800'
        }`}>
          {statusMessage}
        </div>
      )}

      {/* Camera Section */}
      <div className="w-full max-w-md bg-gray-900 rounded-lg overflow-hidden border-2 border-orange-600">
        {!isCameraActive ? (
          <div className="aspect-video flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-gray-900 to-gray-800">
            <Camera className="w-16 h-16 text-orange-500 opacity-50" />
            <p className="text-gray-300 text-center px-4 text-sm">
              📍 Point camera at vehicle number plate
            </p>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-auto"
            />
            {/* Plate Guide Overlay */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <div className="w-80 h-32 border-4 border-yellow-400 rounded-lg opacity-70 shadow-lg"></div>
              <p className="text-yellow-300 text-center mt-2 text-xs font-bold bg-black/50 px-2 py-1 rounded">
                Center plate in frame
              </p>
            </div>
          </>
        )}
      </div>

      {/* Last Capture Preview */}
      {lastCapturePreview && (
        <div className="w-full max-w-md">
          <p className="text-xs text-gray-600 mb-1">📸 Last capture:</p>
          <img
            src={lastCapturePreview}
            alt="Last capture"
            className="w-full rounded border border-gray-300"
          />
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-2 w-full max-w-md flex-wrap justify-center">
        {!isCameraActive ? (
          <>
            <button
              onClick={startCamera}
              disabled={isProcessing}
              className="flex-1 min-w-[120px] bg-orange-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              <Camera className="w-4 h-4" />
              Start Camera
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="flex-1 min-w-[120px] bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Image
            </button>
          </>
        ) : (
          <>
            <button
              onClick={capturePhoto}
              disabled={isProcessing}
              className="flex-1 min-w-[140px] bg-green-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4" />
                  Capture Plate
                </>
              )}
            </button>
            <button
              onClick={stopCamera}
              className="flex-1 min-w-[100px] bg-gray-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-gray-700 transition"
            >
              ✕ Cancel
            </button>
          </>
        )}
      </div>

      {/* OCR Result Display */}
      {ocrResult && (
        <div className="w-full max-w-md p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg">
          <p className="text-xs text-gray-600 font-semibold mb-1">🏷️ DETECTED PLATE:</p>
          <p className="text-3xl font-black text-blue-900 tracking-widest text-center font-mono">
            {ocrResult}
          </p>
          <div className="flex justify-between items-center mt-2 text-xs text-gray-600">
            <span>📊 Confidence: {confidence.toFixed(0)}%</span>
            {confidence < 50 && <span className="text-yellow-600">⚠️ Low confidence</span>}
          </div>
        </div>
      )}

      {/* Manual Input Section */}
      {showManualInput && (
        <div className="w-full max-w-md p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-400 rounded-lg">
          <p className="text-sm font-semibold mb-3 text-gray-800">
            ✋ Enter Vehicle Number Manually:
          </p>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="UP32AB1234"
              maxLength={10}
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value.toUpperCase())}
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg font-mono text-lg tracking-widest focus:border-orange-500 focus:outline-none"
            />
            <button
              onClick={handleManualSubmit}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition"
            >
              ✓
            </button>
          </div>
          <p className="text-xs text-gray-600 text-center">
            Format: <code className="bg-white px-2 py-1 rounded">XX##XX####</code>
            <br />
            Example: <code className="bg-white px-2 py-1 rounded">UP32AB1234</code>
          </p>
        </div>
      )}

      {/* Reset Button */}
      {(ocrResult || showManualInput) && (
        <button
          onClick={resetCapture}
          className="text-sm text-gray-600 hover:text-gray-900 underline"
        >
          ↻ Start Over
        </button>
      )}

      {/* Hidden Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}