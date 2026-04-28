import dotenv from 'dotenv';

dotenv.config();

const required = ['JWT_SECRET', 'APP_USER_EMAIL', 'APP_USER_PASSWORD', 'GOOGLE_SHEET_ID'];

for (const key of required) {
  if (!process.env[key]) {
    // Keep startup deterministic and fail early when configuration is missing.
    console.warn(`[config] Missing environment variable: ${key}`);
  }
}

export const config = {
  port: Number(process.env.PORT || 4000),
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  appUserEmail: process.env.APP_USER_EMAIL || 'coach@gymtrackerpro.dev',
  appUserPassword: process.env.APP_USER_PASSWORD || 'change-me',
  googleSheetId: process.env.GOOGLE_SHEET_ID || '',
  googleServiceAccountJson: process.env.GOOGLE_SERVICE_ACCOUNT_JSON || '',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173'
};

export const SHEET_NAME = 'GymTrackerLogs';
export const SHEET_HEADERS = [
  'Date',
  'Workout',
  'Exercises',
  'Protein',
  'Whey',
  'Diet',
  'Pushups',
  'Cardio',
  'Notes'
];
