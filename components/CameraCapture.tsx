"use client";

import { useCallback, useRef, useState } from "react";
import { Camera, RefreshCw, ScanLine } from "lucide-react";
import { cn } from "@/lib/utils";

interface CameraCaptureProps {
  onPlateDetected: (plate: string) => void;
  className?: string;
}

export function CameraCapture({ onPlateDetected, className }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [active, setActive] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 } },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setActive(true);
      }
    } catch {
      setError("Camera access denied. Use manual entry or allow camera permission.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    const stream = videoRef.current?.srcObject as MediaStream | null;
    stream?.getTracks().forEach((t) => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    setActive(false);
  }, []);

  const captureAndScan = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setScanning(true);
    setError(null);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const imageData = canvas.toDataURL("image/jpeg", 0.8);

    try {
      const res = await fetch("/api/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageData }),
      });
      const data = await res.json();
      if (data.plate) {
        onPlateDetected(data.plate);
      } else {
        setError(data.error ?? "Could not read plate. Try again or enter manually.");
      }
    } catch {
      setError("OCR service unavailable. Enter plate manually.");
    } finally {
      setScanning(false);
    }
  }, [onPlateDetected]);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-kumbh-300 bg-gray-900">
        <video
          ref={videoRef}
          className={cn(
            "aspect-video w-full object-cover",
            !active && "hidden"
          )}
          playsInline
          muted
        />
        {!active && (
          <div className="flex aspect-video flex-col items-center justify-center gap-3 bg-gray-100 p-6 text-center">
            <Camera className="h-12 w-12 text-kumbh-400" />
            <p className="text-sm text-gray-600">
              Point camera at vehicle number plate
            </p>
            <button
              type="button"
              onClick={startCamera}
              className="rounded-lg bg-kumbh-600 px-4 py-2 text-sm font-medium text-white hover:bg-kumbh-700"
            >
              Start Camera
            </button>
          </div>
        )}
        {active && (
          <div className="absolute inset-x-0 bottom-0 flex justify-center gap-2 bg-black/50 p-3">
            <button
              type="button"
              onClick={captureAndScan}
              disabled={scanning}
              className="flex items-center gap-2 rounded-lg bg-kumbh-500 px-4 py-2 text-sm font-medium text-white hover:bg-kumbh-600 disabled:opacity-60"
            >
              {scanning ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <ScanLine className="h-4 w-4" />
              )}
              {scanning ? "Scanning..." : "Scan Plate"}
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="rounded-lg bg-white/20 px-4 py-2 text-sm text-white hover:bg-white/30"
            >
              Stop
            </button>
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
    </div>
  );
}
