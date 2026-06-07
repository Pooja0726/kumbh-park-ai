import { NextResponse } from "next/server";
import { getZone, getZones } from "@/lib/store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id) {
    const zone = getZone(id);
    if (!zone) {
      return NextResponse.json({ error: "Zone not found" }, { status: 404 });
    }
    return NextResponse.json({ zone });
  }

  return NextResponse.json({ zones: getZones() });
}
