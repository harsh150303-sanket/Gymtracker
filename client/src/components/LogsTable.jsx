export default function LogsTable({ logs, onEdit, onDelete }) {
  return (
    <div className="overflow-auto border border-zinc-700 rounded-xl">
      <table className="w-full text-sm text-left text-zinc-300">
        <thead className="bg-zinc-800 text-zinc-200">
          <tr>
            <th className="p-3">Date</th>
            <th className="p-3">Workout</th>
            <th className="p-3">Protein</th>
            <th className="p-3">Diet</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.rowNumber} className="border-t border-zinc-700">
              <td className="p-3">{log.date}</td>
              <td className="p-3">{log.workout}</td>
              <td className="p-3">{log.protein} g</td>
              <td className="p-3">{log.diet ? '✅' : '❌'}</td>
              <td className="p-3 flex gap-2">
                <button className="px-3 py-1 bg-zinc-700 rounded" onClick={() => onEdit(log)}>Edit</button>
                <button className="px-3 py-1 bg-red-500/80 rounded" onClick={() => onDelete(log.rowNumber)}>Delete</button>
              </td>
            </tr>
          ))}
          {!logs.length && (
            <tr>
              <td className="p-4 text-zinc-500" colSpan="5">No logs yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
