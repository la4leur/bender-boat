export default function CrewChanges() {
  const label = 'Crew Changes';
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-2">{label}</h1>
      <p className="text-slate-400 mb-6">Module coming in Week 2-3 build sprint</p>
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center">
        <div className="text-6xl mb-4">🚧</div>
        <h2 className="text-xl font-semibold text-white mb-2">Under Construction</h2>
        <p className="text-slate-400 max-w-md mx-auto">
          This module will be wired to live Supabase data in the 10-week build sprint.
          The architecture and schema are already deployed.
        </p>
      </div>
    </div>
  );
}
