export function StatCard({ label, value, color = "bg-green-700", sub }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3`}>
        <span className="text-white font-bold text-lg">{value}</span>
      </div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-sm font-medium text-gray-700">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

export function SimpleStatCard({ label, value, color = "bg-green-500", borderColor = "border-green-100", textColor = "text-green-600" }) {
  return (
    <div className={`bg-white rounded-2xl p-5 shadow-sm border ${borderColor}`}>
      <p className={`text-3xl font-black ${textColor}`}>{value}</p>
      <p className="text-sm font-semibold text-gray-700 mt-1">{label}</p>
    </div>
  );
}
