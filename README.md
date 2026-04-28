# Gym Tracker Pro

Gym Tracker Pro is a full-stack, mobile-friendly web app for logging workout, nutrition, and habit data directly into Google Sheets.

## Features

- JWT-based login (single-user credentials from environment variables).
- Daily logging form with repeatable exercises.
- Dark, gym-style responsive dashboard.
- Google Sheets used as the primary storage.
- Past logs table with edit/delete actions.
- CSV export endpoint and one-click frontend download.
- Weekly summary cards:
  - Total workouts (last 7 entries)
  - Average protein intake
  - Streak counter (consecutive diet + workout days)

## Project Structure

```txt
/client   # React + Tailwind UI
/server   # Express + Google Sheets API backend
```

---

## 1) Google Sheets API Setup

1. Open [Google Cloud Console](https://console.cloud.google.com/).
2. Create/select a project.
3. Enable **Google Sheets API**.
4. Create a **Service Account**.
5. Generate a JSON key.
6. Create a spreadsheet and rename one tab to `GymTrackerLogs`.
7. Share the sheet with the service account email (Editor role).
8. Copy spreadsheet ID from URL:
   `https://docs.google.com/spreadsheets/d/<THIS_PART>/edit`
9. Put the JSON key content into `GOOGLE_SERVICE_ACCOUNT_JSON` (raw JSON or base64).

> The server automatically ensures header row:  
> `Date | Workout | Exercises | Protein | Whey | Diet | Pushups | Cardio | Notes`

---

## 2) Local Setup

### Backend

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

### Frontend

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

Frontend runs by default on `http://localhost:5173` and API on `http://localhost:4000`.

---

## 3) Authentication

Set the login credentials in `server/.env`:

```env
APP_USER_EMAIL=coach@gymtrackerpro.dev
APP_USER_PASSWORD=change-me
```

Use these values to sign in from the UI.

---

## 4) API Endpoints

- `POST /api/login`
- `POST /api/log-workout` (auth required)
- `GET /api/logs` (auth required)
- `PUT /api/logs/:rowNumber` (auth required)
- `DELETE /api/logs/:rowNumber` (auth required)
- `GET /api/summary` (auth required)
- `GET /api/export-data` (auth required, CSV download)

---

## 5) Sample Data Test

A sample payload is available at:

- `server/sample-data/workout-sample.json`

Use it with curl after login:

```bash
TOKEN=$(curl -s -X POST http://localhost:4000/api/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"coach@gymtrackerpro.dev","password":"change-me"}' | jq -r '.token')

curl -X POST http://localhost:4000/api/log-workout \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  --data @server/sample-data/workout-sample.json
```

If configured correctly, the entry appears in Google Sheets immediately.

---

## 6) Deployment (Optional)

### Frontend (Vercel)

- Root directory: `client`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_URL=https://<render-api-domain>/api`

### Backend (Render)

- Root directory: `server`
- Build command: `npm install`
- Start command: `npm start`
- Add all values from `server/.env.example` as Render environment variables.

---

## Notes

- For edit/delete, logs are referenced by Google Sheet row number.
- Delete operation clears row contents while preserving row index.
