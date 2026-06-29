export default function CilStatCards() {
  const items = [
    { label: "Déclarations", value: 0, color: "bg-green-500" },
    { label: "Plaintes", value: 0, color: "bg-yellow-500" },
    { label: "Notifications", value: 0, color: "bg-green-500" },
  ];
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {items.map(s => (
        <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center mb-3`}>
            <span className="text-white font-bold text-lg">{s.value}</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{s.value}</p>
          <p className="text-sm font-medium text-gray-700">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
