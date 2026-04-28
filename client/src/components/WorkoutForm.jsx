import { useState } from 'react';

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between bg-zinc-800 px-3 py-2 rounded-lg border border-zinc-700">
      <span className="text-zinc-300 text-sm">{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4" />
    </label>
  );
}

const emptyExercise = { name: '', sets: '', reps: '', weight: '' };

export default function WorkoutForm({ onSubmit, initialData, submitLabel = 'Save Log' }) {
  const [form, setForm] = useState(
    initialData || {
      date: new Date().toISOString().split('T')[0],
      workout: '',
      exercises: [{ ...emptyExercise }],
      protein: 0,
      whey: false,
      diet: false,
      pushupsDone: false,
      pushupsReps: 0,
      cardioDone: false,
      cardioMinutes: 0,
      notes: ''
    }
  );

  const handleExerciseChange = (index, key, value) => {
    const clone = [...form.exercises];
    clone[index][key] = value;
    setForm({ ...form, exercises: clone });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      ...form,
      protein: Number(form.protein),
      pushupsReps: Number(form.pushupsReps),
      cardioMinutes: Number(form.cardioMinutes),
      exercises: form.exercises.filter((item) => item.name.trim())
    });
    if (!initialData) {
      setForm({
        ...form,
        workout: '',
        exercises: [{ ...emptyExercise }],
        notes: ''
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input className="p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
        <input className="p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white" placeholder="Workout details" value={form.workout} onChange={(e) => setForm({ ...form, workout: e.target.value })} required />
      </div>

      <div className="bg-zinc-800/70 p-3 rounded-xl border border-zinc-700">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-white font-semibold">Exercises</h3>
          <button type="button" className="text-emerald-400 text-sm" onClick={() => setForm({ ...form, exercises: [...form.exercises, { ...emptyExercise }] })}>+ Add</button>
        </div>

        {form.exercises.map((exercise, idx) => (
          <div key={idx} className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
            <input className="p-2 rounded bg-zinc-900 border border-zinc-700 text-white" placeholder="Exercise" value={exercise.name} onChange={(e) => handleExerciseChange(idx, 'name', e.target.value)} />
            <input className="p-2 rounded bg-zinc-900 border border-zinc-700 text-white" placeholder="Sets" value={exercise.sets} onChange={(e) => handleExerciseChange(idx, 'sets', e.target.value)} />
            <input className="p-2 rounded bg-zinc-900 border border-zinc-700 text-white" placeholder="Reps" value={exercise.reps} onChange={(e) => handleExerciseChange(idx, 'reps', e.target.value)} />
            <input className="p-2 rounded bg-zinc-900 border border-zinc-700 text-white" placeholder="Weight" value={exercise.weight} onChange={(e) => handleExerciseChange(idx, 'weight', e.target.value)} />
          </div>
        ))}
      </div>

      <input type="number" min="0" className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white" value={form.protein} onChange={(e) => setForm({ ...form, protein: e.target.value })} placeholder="Protein intake (grams)" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Toggle label="Whey protein taken?" checked={form.whey} onChange={(v) => setForm({ ...form, whey: v })} />
        <Toggle label="Followed diet?" checked={form.diet} onChange={(v) => setForm({ ...form, diet: v })} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-2">
          <Toggle label="Push-ups done?" checked={form.pushupsDone} onChange={(v) => setForm({ ...form, pushupsDone: v })} />
          {form.pushupsDone && (
            <input type="number" min="0" className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white" value={form.pushupsReps} onChange={(e) => setForm({ ...form, pushupsReps: e.target.value })} placeholder="Push-up reps" />
          )}
        </div>

        <div className="space-y-2">
          <Toggle label="Cardio done?" checked={form.cardioDone} onChange={(v) => setForm({ ...form, cardioDone: v })} />
          {form.cardioDone && (
            <input type="number" min="0" className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white" value={form.cardioMinutes} onChange={(e) => setForm({ ...form, cardioMinutes: e.target.value })} placeholder="Cardio minutes" />
          )}
        </div>
      </div>

      <textarea className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white" rows="3" placeholder="Notes (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />

      <button className="w-full p-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold">{submitLabel}</button>
    </form>
  );
}
