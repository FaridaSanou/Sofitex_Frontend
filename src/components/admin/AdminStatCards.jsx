export default function AdminStatCards({ stats }) {
  const items = [
    { label: "Total demandes", value: stats.total, color: "bg-green-700", sub: "Toutes les demandes" },
    { label: "En attente", value: stats.enAttente, color: "bg-yellow-500", sub: "À traiter" },
    { label: "Approuvées", value: stats.approuvees, color: "bg-emerald-500", sub: "Comptes activés" },
    { label: "Utilisateurs actifs", value: stats.utilisateurs, color: "bg-green-500", sub: "Comptes actifs" },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((s) => (
        <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center mb-3`}>
            <span className="text-white font-bold text-lg">{s.value}</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{s.value}</p>
          <p className="text-sm font-medium text-gray-700">{s.label}</p>
          <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
        </div>
      ))}
    </div>
  );
}
