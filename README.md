# Kotayba Landing Page

React + Vite + Tailwind v4 + Firebase (Firestore, Auth).

## Setup

1. **Logo**: Place `Logo.jpeg` in `app/public/Logo.jpeg` so the header can display it (or leave missing for text fallback).
2. **Env**: Copy `.env.example` to `.env` and set all `VITE_FIREBASE_*` from Firebase Console (Project Settings → General → Your apps → SDK setup). Optionally set `VITE_RESEND_API_KEY` (from [Resend](https://resend.com)) so the admin gets an email after each successful consultation submit.
3. **Firebase**: Create a project, enable Email/Password auth, create Firestore, deploy rules. See `firebase/README.md`.

## Run

- `npm run dev` — development
- `npm run build` — production build
- `npm run preview` — preview build

## Routes

- `/`, `/en`, `/ar` — main page (link-in-bio)
- `/en/consultation`, `/ar/consultation` — consultation form
- `/admin` — admin login
- `/admin/dashboard` — consultations list (protected)
- `/admin/analytics` — analytics (protected)
