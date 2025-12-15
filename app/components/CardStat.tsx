export default function CardStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`p-5 rounded-xl text-white shadow-md ${color}`}>
      <p className="text-sm opacity-80">{label}</p>
      <h2 className="text-3xl font-bold">{value}</h2>
    </div>
  );
}
