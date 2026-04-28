import { useEffect, useMemo, useState } from 'react';
import LoginForm from './components/LoginForm.jsx';
import LogsTable from './components/LogsTable.jsx';
import SummaryCards from './components/SummaryCards.jsx';
import WorkoutForm from './components/WorkoutForm.jsx';
import { createLog, editLog, fetchLogs, fetchSummary, login, removeLog, setAuthToken } from './services/api.js';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('gtp_token'));
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState({ totalWorkouts: 0, avgProtein: 0, streak: 0 });
  const [editingLog, setEditingLog] = useState(null);
  const [message, setMessage] = useState('');

  const exportUrl = useMemo(() => `${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/export-data`, []);

  async function refreshData() {
    const [logsData, summaryData] = await Promise.all([fetchLogs(), fetchSummary()]);
    setLogs(logsData);
    setSummary(summaryData);
  }

  useEffect(() => {
    if (!token) return;
    setAuthToken(token);
    refreshData().catch((error) => setMessage(error?.response?.data?.error || 'Failed to load dashboard.'));
  }, [token]);

  const handleLogin = async (email, password) => {
    const data = await login(email, password);
    localStorage.setItem('gtp_token', data.token);
    setAuthToken(data.token);
    setToken(data.token);
  };

  const handleCreate = async (payload) => {
    await createLog(payload);
    setMessage('Log saved successfully.');
    await refreshData();
  };

  const handleUpdate = async (payload) => {
    await editLog(editingLog.rowNumber, payload);
    setEditingLog(null);
    setMessage('Log updated successfully.');
    await refreshData();
  };

  const handleDelete = async (rowNumber) => {
    await removeLog(rowNumber);
    setMessage('Log deleted successfully.');
    await refreshData();
  };

  if (!token) return <LoginForm onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Gym Tracker Pro</h1>
            <p className="text-zinc-400 text-sm">Track workouts, habits, and nutrition in one place.</p>
          </div>
          <button
            className="px-3 py-2 text-sm rounded bg-zinc-800 border border-zinc-700"
            onClick={() => {
              localStorage.removeItem('gtp_token');
              setAuthToken(null);
              setToken(null);
            }}
          >
            Logout
          </button>
        </header>

        <SummaryCards summary={summary} />

        {message && <p className="text-emerald-400 text-sm">{message}</p>}

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-zinc-900 rounded-2xl border border-zinc-700 p-4">
            <h2 className="text-lg font-semibold mb-3">Today&apos;s Log</h2>
            <WorkoutForm onSubmit={handleCreate} />
          </div>

          {editingLog && (
            <div className="bg-zinc-900 rounded-2xl border border-zinc-700 p-4">
              <h2 className="text-lg font-semibold mb-3">Edit Log</h2>
              <WorkoutForm onSubmit={handleUpdate} initialData={editingLog} submitLabel="Update Log" />
            </div>
          )}
        </section>

        <section className="bg-zinc-900 rounded-2xl border border-zinc-700 p-4 space-y-4">
          <div className="flex flex-wrap gap-3 justify-between items-center">
            <h2 className="text-lg font-semibold">Past Logs</h2>
            <button className="px-3 py-2 rounded-lg bg-emerald-500 text-black text-sm font-semibold" onClick={async () => {
              const response = await fetch(exportUrl, {
                headers: { Authorization: `Bearer ${token}` }
              });
              const blob = await response.blob();
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = 'gym-tracker-pro-data.csv';
              link.click();
              window.URL.revokeObjectURL(url);
            }}>
              Download Data (CSV)
            </button>
          </div>
          <LogsTable logs={logs} onEdit={setEditingLog} onDelete={handleDelete} />
        </section>
      </div>
    </div>
  );
}
