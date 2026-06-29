const TYPES = [
  { value: "DPO", label: "DPO", icon: "🔒", description: "Délégué à la Protection des Données" },
  { value: "UTILISATEUR_METIER", label: "Utilisateur Métier", icon: "💼", description: "Utilisateur interne de l'organisation" },
  { value: "DG", label: "DG", icon: "🏛️", description: "Directeur Général" },
];

export default function AccountTypeSelector({ typeChoisi, setTypeChoisi }) {
  return (
    <>
      <p className="text-sm font-medium text-gray-700 mb-4">
        Choisissez votre type de compte <span className="text-red-500">*</span>
      </p>
      <div className="grid grid-cols-3 gap-3 mb-6">
        {TYPES.map((t) => (
          <button key={t.value} type="button" onClick={() => setTypeChoisi(t.value)}
            className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all text-center"
            style={{
              background: "linear-gradient(135deg, #15803d, #166534)",
              border: "2px solid #15803d",
              boxShadow: "0 0 0 3px rgba(21,128,61,0.12), 0 2px 8px rgba(21,128,61,0.1)",
              color: "white",
            }}>
            <span className="text-3xl">{t.icon}</span>
            <span className="text-sm font-semibold text-white">{t.label}</span>
            <span className="text-xs text-green-100">{t.description}</span>
          </button>
        ))}
      </div>
    </>
  );
}

export { TYPES };
