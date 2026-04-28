import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import { stringify } from 'csv-stringify/sync';
import { config } from './config.js';
import { requireAuth } from './middleware/auth.js';
import { appendLog, deleteLog, getLogs, updateLog } from './services/sheetsService.js';
import { signToken } from './utils/token.js';

const app = express();

app.use(cors({ origin: config.clientOrigin }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

function validatePayload(payload) {
  if (!payload.date || !payload.workout) return 'Date and workout are required.';
  if (!Array.isArray(payload.exercises)) return 'Exercises must be an array.';
  if (Number.isNaN(Number(payload.protein))) return 'Protein must be numeric.';
  return null;
}

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'Gym Tracker Pro API' });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (email !== config.appUserEmail || password !== config.appUserPassword) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  const token = signToken({ email });
  return res.json({ token, email });
});

app.post('/api/log-workout', requireAuth, async (req, res) => {
  const validationError = validatePayload(req.body);
  if (validationError) return res.status(400).json({ error: validationError });

  try {
    await appendLog(req.body);
    return res.status(201).json({ message: 'Workout logged successfully.' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get('/api/logs', requireAuth, async (_req, res) => {
  try {
    const logs = await getLogs();
    return res.json(logs.filter((log) => log.date || log.workout));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.put('/api/logs/:rowNumber', requireAuth, async (req, res) => {
  const rowNumber = Number(req.params.rowNumber);
  if (!rowNumber) return res.status(400).json({ error: 'Invalid row number.' });

  const validationError = validatePayload(req.body);
  if (validationError) return res.status(400).json({ error: validationError });

  try {
    await updateLog(rowNumber, req.body);
    return res.json({ message: 'Log updated successfully.' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.delete('/api/logs/:rowNumber', requireAuth, async (req, res) => {
  const rowNumber = Number(req.params.rowNumber);
  if (!rowNumber) return res.status(400).json({ error: 'Invalid row number.' });

  try {
    await deleteLog(rowNumber);
    return res.json({ message: 'Log deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get('/api/summary', requireAuth, async (_req, res) => {
  try {
    const logs = (await getLogs()).filter((log) => log.date || log.workout);

    const weekly = logs.slice(-7);
    const totalWorkouts = weekly.filter((x) => Boolean(x.workout)).length;
    const avgProtein = weekly.length
      ? Math.round(weekly.reduce((sum, x) => sum + x.protein, 0) / weekly.length)
      : 0;

    // Streak counts consecutive logs from latest backward where diet and workout were followed.
    let streak = 0;
    const sorted = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date));
    for (const entry of sorted) {
      if (entry.diet && entry.workout) streak += 1;
      else break;
    }

    return res.json({ totalWorkouts, avgProtein, streak });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get('/api/export-data', requireAuth, async (_req, res) => {
  try {
    const logs = (await getLogs()).filter((log) => log.date || log.workout);

    const rows = logs.map((log) => ({
      Date: log.date,
      Workout: log.workout,
      Exercises: log.exercises.map((e) => `${e.name} ${e.sets}x${e.reps}@${e.weight}`).join('; '),
      Protein: log.protein,
      Whey: log.whey ? 'Yes' : 'No',
      Diet: log.diet ? 'Yes' : 'No',
      Pushups: log.pushupsDone ? log.pushupsReps : 0,
      Cardio: log.cardioDone ? log.cardioMinutes : 0,
      Notes: log.notes
    }));

    const csv = stringify(rows, { header: true });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="gym-tracker-pro-data.csv"');
    return res.send(csv);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.listen(config.port, () => {
  console.log(`Gym Tracker Pro API running on port ${config.port}`);
});
