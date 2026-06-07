# KumbhPark AI

Smart parking and mobility management system for **Mahakumbh** — ANPR entry, mis-park detection, tiered owner alerts, and authority command dashboard.

## Features

- **Entry Gate** (`/entry`) — Webcam plate scan (mock OCR) + vehicle registration
- **Parking Pass** (`/my-pass`) — QR pass with slot assignment and ghat route guide
- **Live Lots** (`/lots`) — Real-time occupancy across parking zones
- **Command Dashboard** (`/dashboard`) — Violations, notification log, zone overview
- **Zone Monitor** (`/dashboard/zone/[id]`) — Interactive grid, simulate mis-park alerts
- **Marshal View** (`/dashboard/marshal`) — Field dispatch for urgent violations

## Quick Start

```bash
cd kumbh-park-ai
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Demo Flow

1. Go to **Entry** → Start camera → Scan plate (or enter `UP32AB1234` manually)
2. Enter phone + destination → Get parking pass
3. Open **My Pass** to see QR and route to ghat
4. Open **Dashboard → Zone** → Click occupied slot → Trigger mis-park
5. Watch SMS/WhatsApp/call logs on dashboard → Escalate to marshal

## Tech Stack

- Next.js 15 (App Router)
- TypeScript + Tailwind CSS
- In-memory store (swap for PostgreSQL in production)
- Mock OCR & notifications (swap for EasyOCR + Twilio)

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/register` | POST | Register vehicle, assign slot |
| `/api/ocr` | POST | Mock plate recognition |
| `/api/zones` | GET | List zones or single zone |
| `/api/pass` | GET | Lookup parking pass |
| `/api/dashboard` | GET | Stats, violations, notifications |
| `/api/violations` | POST/PATCH | Report, escalate, resolve |

## Production Upgrades

- Replace mock OCR with EasyOCR or Google Cloud Vision
- Connect Twilio for real SMS/voice calls
- RTSP camera feeds with YOLOv8 slot detection
- PostgreSQL + Redis for multi-gate deployment
- Hindi/regional TTS for IVR calls
