export function BadgeStatut({ statut, envoyeAuDpo }) {
  if (envoyeAuDpo) {
    return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 whitespace-nowrap">Envoyé DPO</span>;
  }
  const map = {
    VALIDE: { label: "Validé", cls: "bg-green-100 text-green-700" },
    REJETE: { label: "Rejeté", cls: "bg-red-100 text-red-700" },
    EN_COURS: { label: "En cours", cls: "bg-yellow-100 text-yellow-700" },
    EN_ATTENTE: { label: "En attente", cls: "bg-yellow-100 text-yellow-800" },
    APPROUVEE_DG: { label: "Validée", cls: "bg-green-100 text-green-800" },
    REJETEE_DG: { label: "Rejetée", cls: "bg-red-100 text-red-800" },
    APPROUVEE: { label: "Approuvée", cls: "bg-green-100 text-green-800" },
    REJETEE: { label: "Rejetée", cls: "bg-red-100 text-red-800" },
    ACTIF: { label: "Actif", cls: "bg-green-100 text-green-800" },
    INACTIF: { label: "Inactif", cls: "bg-gray-100 text-gray-600" },
    SUSPENDU: { label: "Suspendu", cls: "bg-orange-100 text-orange-800" },
    TRAITE: { label: "Traitée", cls: "bg-green-100 text-green-800" },
    BROUILLON: { label: "Brouillon", cls: "bg-gray-200 text-gray-700" },
    TERMINEE: { label: "Terminée", cls: "bg-green-100 text-green-800" },
    ANNULEE: { label: "Annulée", cls: "bg-red-100 text-red-800" },
  };
  const s = map[statut] || { label: statut, cls: "bg-gray-100 text-gray-600" };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s.cls}`}>{s.label}</span>;
}

export function statutBadge(statut) {
  const map = {
    EN_ATTENTE: "bg-yellow-100 text-yellow-800",
    APPROUVEE: "bg-green-100 text-green-800",
    REJETEE: "bg-red-100 text-red-800",
    ACTIF: "bg-green-100 text-green-800",
    INACTIF: "bg-gray-100 text-gray-600",
    SUSPENDU: "bg-orange-100 text-orange-800",
  };
  const labels = {
    EN_ATTENTE: "En attente",
    APPROUVEE: "Approuvée",
    REJETEE: "Rejetée",
    ACTIF: "Actif",
    INACTIF: "Inactif",
    SUSPENDU: "Suspendu",
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${map[statut] || "bg-gray-100 text-gray-600"}`}>
      {labels[statut] || statut}
    </span>
  );
}

export function typeBadge(type) {
  const map = {
    CIL: "bg-green-100 text-green-700",
    DPO: "bg-purple-100 text-purple-700",
    DG: "bg-indigo-100 text-indigo-700",
    Usager: "bg-teal-100 text-teal-700",
    UtilisateurMetier: "bg-orange-100 text-orange-700",
    USAGER: "bg-teal-100 text-teal-700",
    UTILISATEUR_METIER: "bg-orange-100 text-orange-700",
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${map[type] || "bg-gray-100 text-gray-600"}`}>
      {type}
    </span>
  );
}

export function declarationStatutBadge(s) {
  const map = {
    BROUILLON: "bg-gray-200 text-gray-700",
    EN_ATTENTE: "bg-yellow-100 text-yellow-800",
    APPROUVEE_DG: "bg-green-100 text-green-800",
    REJETEE_DG: "bg-red-100 text-red-800",
    APPROUVEE: "bg-green-100 text-green-800",
    REJETEE: "bg-red-100 text-red-800",
  };
  const labels = { BROUILLON: "Brouillon", EN_ATTENTE: "En attente", APPROUVEE_DG: "Approuvée DG", REJETEE_DG: "Rejetée DG", APPROUVEE: "Approuvée", REJETEE: "Rejetée" };
  return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${map[s] || "bg-gray-100"}`}>{labels[s] || s}</span>;
}

export function demandeStatutBadge(s) {
  if (s === "EN_ATTENTE") return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">En attente</span>;
  if (s === "TRAITE") return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">Traitée</span>;
  return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">{s}</span>;
}
