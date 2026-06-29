export default function TypeRepartition({ demandes }) {
  const types = ["CIL", "DPO", "DG", "Usager", "UtilisateurMetier"];
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="font-bold text-gray-800 mb-4">Répartition par type d'utilisateur</h2>
      <div className="space-y-3">
        {types.map((type) => {
          const count = demandes.filter((d) => d.typeUtilisateur === type).length;
          const pct = demandes.length ? Math.round((count / demandes.length) * 100) : 0;
          return (
            <div key={type} className="flex items-center gap-3">
              <span className="text-xs font-medium text-gray-600 w-36 flex-shrink-0">{type}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-xs text-gray-500 w-8 text-right">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
