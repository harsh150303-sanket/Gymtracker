export default function SummaryCards({ summary }) {
  const cards = [
    { label: 'Weekly Workouts', value: summary.totalWorkouts },
    { label: 'Avg Protein', value: `${summary.avgProtein} g` },
    { label: 'Streak', value: `${summary.streak} days` }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {cards.map((card) => (
        <div key={card.label} className="bg-zinc-900 border border-zinc-700 rounded-xl p-4">
          <p className="text-zinc-400 text-sm">{card.label}</p>
          <p className="text-2xl text-white font-bold mt-1">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
