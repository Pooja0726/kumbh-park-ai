import { NextResponse } from "next/server";
import { mockOcrPlate } from "@/lib/store";

export async function POST(request: Request) {
  const body = await request.json();
  const { imageData } = body as { imageData?: string };

  if (!imageData) {
    return NextResponse.json({ error: "No image provided" }, { status: 400 });
  }

  // Demo: simulate OCR processing delay and return mock plate
  await new Promise((r) => setTimeout(r, 800));
  const plate = mockOcrPlate(imageData);

  return NextResponse.json({
    plate,
    confidence: 0.92,
    message: "Mock ANPR — replace with EasyOCR / Cloud Vision in production",
  });
}
