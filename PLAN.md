# Yashoda Lodge Mohol — Guest Desk roadmap

The guest desk is an installable tablet app (PWA) for running Yashoda Lodge, Mohol:
14 rooms over two floors (101–107, 201–207) and a 10-bed hall on the third floor.

## Milestone 1 — Product surface ✅
- Room board with live status per room/bed, occupancy and dues summary.
- Check-in flow: up to 4 document photos (camera, gallery, live AI text scanner),
  auto-fill of guest fields, room & stay, advance payment, remaining dues, digital signature.
- Guest register with search (name, mobile, Aadhaar, room) and in-house/past filters.
- Payments screen: today's collection by mode, remaining dues, full payment history.
- Stay sheet: bill, payment history, record payment/advance/refund, check-out.
- Installable PWA (manifest, icons, service worker) laid out for an 8.7" tablet.
- Data is stubbed in `src/lib/fixtures.ts` and held in session state (`src/lib/lodge-store.tsx`).

## Milestone 2 — Permanent storage
- Netlify Database (Postgres + Drizzle) schema: `units`, `guests`, `stays`, `payments`.
- Server functions for check-in, add payment, check-out, list/search; replace
  `LodgeProvider` actions with them, seed units from fixtures.

## Milestone 3 — Real AI document scanning
- Server function that sends the captured photo to a Gemini vision model via
  Netlify AI Gateway and returns structured JSON (name, DOB, gender, address,
  ID type, ID number). Replace the `scan()` stand-in in `src/routes/check-in.tsx`.
- Support Aadhaar front/back, PAN, driving licence, voter ID, passport; Marathi/Hindi text.

## Milestone 4 — Photo & signature storage
- Upload document photos and signature PNGs to Netlify Blobs; store keys on the guest.
- Mask Aadhaar numbers in lists (show last 4 digits only).

## Milestone 5 — Staff login
- Netlify Identity login for owner and desk staff; protect all screens and server functions.
- Owner-only actions (refunds, deleting records, reports).

## Milestone 6 — Reports & receipts
- Printable / shareable (WhatsApp) receipt and guest registration form (Form C style).
- Daily and monthly collection reports, occupancy history, CSV export for police verification.

## Milestone 7 — Android APK packaging
- Package the PWA as an APK/AAB with a Trusted Web Activity (PWABuilder or Bubblewrap),
  add `/.well-known/assetlinks.json`, and test camera/storage permissions on the tablet.
