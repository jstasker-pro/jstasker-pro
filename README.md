# JS TASKER PRO

Task marketplace: buyers create tasks, workers submit screenshot proof, buyers approve/reject.
Free stack: Firebase Auth + Firestore, hosted on GitHub Pages. No server code.

## Files
- `index.html` – the public app
- `admin.html` – private admin panel (RENAME it to a secret name only you know, e.g. `panel-7x92k.html`)
- `firebase-config.js` – paste your Firebase web config
- `firestore.rules` – paste into Firebase > Firestore > Rules (replace `ADMIN_EMAIL_HERE`)
- `style.css`, `core.js`, `user.js`, `admin.js`, `backend-firebase.js` – app code

## Setup (once)
1. Firebase console: create a project, add a Web app, copy the config into `firebase-config.js`.
2. Authentication > Sign-in method: enable **Email/Password**. Authentication > Users: add your admin (real email + password).
3. Firestore Database: create (production mode).
4. Firestore > Rules: paste `firestore.rules`, set your admin email, Publish.
5. Upload every file to a public GitHub repo, enable Pages. Rename `admin.html` to your secret name.
6. Open the secret admin page, sign in. Settings are created automatically. Open **Setup Guide** and press **Start numbering** to choose the first JS ID.
7. In **Settings > Methods** replace the placeholder wallet numbers with your real ones.

## Default rules (all editable in Admin > Settings)
Deposit fee 1% · Task creation fee 5% · Worker commission 2% · Withdraw fee 10% · Referral 10% lifetime
Minimum price per worker: 1 screenshot $0.01 · 2 screenshots $0.02 · 3 screenshots $0.03

## Notes
- Money is held by Firestore Security Rules (no server). Rules block balance tampering, but for large volume move credits behind a server.
- Proof screenshots are stored inside Firestore documents (small, compressed). Approved proofs are cleared automatically when the worker is paid.
