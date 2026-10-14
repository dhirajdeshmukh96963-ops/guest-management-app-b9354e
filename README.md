# Yashoda Lodge Mohol — Guest Desk

A tablet-first guest management app for Yashoda Lodge, Mohol. Front-desk staff can see
every room and hall bed at a glance, check guests in by scanning their Aadhaar or other
ID, capture up to four document photos, take an advance, track remaining dues, and collect
the guest's digital signature.

The app is a Progressive Web App: open it in Chrome on the Android tablet and choose
**Add to Home screen / Install app** to run it full-screen like a native app. It can also be
packaged as an APK (see PLAN.md, milestone 7).

## Screens
- **Rooms** (`/`) — floor-by-floor board for rooms 101–107, 201–207 and hall beds 1–10.
- **Check-in** (`/check-in`) — document scan & auto-fill, guest details, stay, payment, signature.
- **Guests** (`/guests`) — searchable guest register.
- **Payments** (`/payments`) — today's collection, pending dues, payment history.

## Tech
TanStack Start (React 19), Tailwind CSS 4, shadcn/ui, deployed on Netlify.

## Run locally
```bash
pnpm install
netlify dev   # or: pnpm dev
```

## Roadmap
Data currently lives in `src/lib/fixtures.ts` for the session. Next up: permanent storage in
Netlify Database, real AI document extraction through Netlify AI Gateway, photo/signature
storage in Netlify Blobs, staff login, receipts & reports, and APK packaging. See `PLAN.md`.
