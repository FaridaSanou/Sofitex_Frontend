export default function DemandesFilters({ filterStatut, setFilterStatut, demandes }) {
  const filters = [
    { key: "TOUS", label: "Toutes" },
    { key: "EN_ATTENTE", label: "En attente" },
    { key: "APPROUVEE", label: "Approuvées" },
    { key: "REJETEE", label: "Rejetées" },
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((f) => (
        <button key={f.key} onClick={() => setFilterStatut(f.key)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
            filterStatut === f.key
              ? "bg-green-700 text-white shadow"
              : "bg-white text-gray-600 border border-gray-200 hover:border-green-400"
          }`}>
          {f.label}
          <span className="ml-2 text-xs opacity-70">
            ({f.key === "TOUS" ? demandes.length : demandes.filter((d) => d.statutDemandeAcces === f.key).length})
          </span>
        </button>
      ))}
    </div>
  );
}
