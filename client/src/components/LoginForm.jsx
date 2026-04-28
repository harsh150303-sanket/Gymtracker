import { useState } from 'react';

export default function LoginForm({ onLogin }) {
  const [email, setEmail] = useState('coach@gymtrackerpro.dev');
  const [password, setPassword] = useState('change-me');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await onLogin(email, password);
    } catch (err) {
      setError(err?.response?.data?.error || 'Login failed.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <form onSubmit={submit} className="w-full max-w-sm bg-zinc-900 p-6 rounded-2xl shadow-xl border border-zinc-700">
        <h1 className="text-2xl font-bold text-white mb-5">Gym Tracker Pro</h1>
        <p className="text-zinc-400 mb-4 text-sm">Secure login to manage your daily fitness data.</p>

        <label className="block text-zinc-300 text-sm mb-2">Email</label>
        <input className="w-full mb-4 p-3 rounded-lg bg-zinc-800 text-white border border-zinc-700" value={email} onChange={(e) => setEmail(e.target.value)} />

        <label className="block text-zinc-300 text-sm mb-2">Password</label>
        <input type="password" className="w-full mb-4 p-3 rounded-lg bg-zinc-800 text-white border border-zinc-700" value={password} onChange={(e) => setPassword(e.target.value)} />

        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

        <button className="w-full bg-emerald-500 hover:bg-emerald-400 transition p-3 rounded-lg text-black font-semibold">Login</button>
      </form>
    </div>
  );
}
