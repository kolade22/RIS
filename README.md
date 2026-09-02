# Radial RIS

Radial is a multi-tenant radiology operations system for diagnostic centres in Nigeria. This repository currently contains the first runnable UI slice: a responsive operations overview with examination queue, shift context, film stock alerts, and local-demo interaction states.

## Run locally

```bash
npm install
npm run dev
```

Build the production bundle with `npm run build`, then preview it with `npm run preview`.

## Product boundary

Radial manages intake, examinations, film inventory, shifts, payments, reconciliation, reporting, and tenant operations. It does not store or view diagnostic images, implement DICOM/PACS, provide AI diagnosis, or replace an EHR. The current UI uses fictional local-demo data only; Firebase authentication, Firestore rules, Cloud Functions, and emulator-backed tests are the next implementation phase.

## Visual direction

The interface is designed as a dark night-shift operations console: dense but scannable, with mint for healthy activity and coral for operational attention. It is responsive down to mobile widths and supports reduced-motion preferences.
