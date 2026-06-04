import { useState, useEffect, useCallback } from "react";
import sofitexLogo from "../assets/image.png";

const API_BASE = "http://localhost:8080/api";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
});

// ── Helpers ──────────────────────────────────────────────────────

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
  });
};

// statutDemandeAcces (backend) → label + couleur
const statutBadge = (statut) => {
  const map = {
    EN_ATTENTE: "bg-yellow-100 text-yellow-800",
    APPROUVEE:  "bg-green-100 text-green-800",
    REJETEE:    "bg-red-100 text-red-800",
    ACTIF:      "bg-green-100 text-green-800",
    INACTIF:    "bg-gray-100 text-gray-600",
    SUSPENDU:   "bg-orange-100 text-orange-800",
  };
  const labels = {
    EN_ATTENTE: "En attente",
    APPROUVEE:  "Approuvée",
    REJETEE:    "Rejetée",
    ACTIF:      "Actif",
    INACTIF:    "Inactif",
    SUSPENDU:   "Suspendu",
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${map[statut] || "bg-gray-100 text-gray-600"}`}>
      {labels[statut] || statut}
    </span>
  );
};

// typeUtilisateur = nom de la classe Java (Usager, DPO, CIL, DG, UtilisateurMetier)
const typeBadge = (type) => {
  const map = {
    CIL:              "bg-blue-100 text-blue-700",
    DPO:              "bg-purple-100 text-purple-700",
    DG:               "bg-indigo-100 text-indigo-700",
    Usager:           "bg-teal-100 text-teal-700",
    UtilisateurMetier:"bg-orange-100 text-orange-700",
    // fallback pour les anciens noms enum
    USAGER:           "bg-teal-100 text-teal-700",
    UTILISATEUR_METIER:"bg-orange-100 text-orange-700",
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${map[type] || "bg-gray-100 text-gray-600"}`}>
      {type}
    </span>
  );
};

// ── Icônes ────────────────────────────────────────────────────────

const Icon = ({ name, className = "w-5 h-5" }) => {
  const icons = {
    dashboard: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
    users:     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />,
    requests:  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />,
    check:     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />,
    x:         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />,
    eye:       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />,
    logout:    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />,
    bell:      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />,
    search:    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />,
    menu:      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />,
    refresh:   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />,
  };
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {icons[name]}
    </svg>
  );
};

// ── Toast ─────────────────────────────────────────────────────────

const Toast = ({ toast }) => {
  if (!toast) return null;
  return (
    <div className={`fixed bottom-6 right-6 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium z-50 ${
      toast.type === "error" ? "bg-red-500" : "bg-green-700"
    }`}>
      {toast.msg}
    </div>
  );
};

// ── Skeleton ──────────────────────────────────────────────────────

const SkeletonRow = ({ cols = 5 }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-5 py-4">
        <div className="h-4 bg-gray-100 rounded animate-pulse" />
      </td>
    ))}
  </tr>
);

// ── Modal Rejet ───────────────────────────────────────────────────

const RejetModal = ({ demande, onConfirm, onClose }) => {
  const [motif, setMotif] = useState("");
  // Utilise les vrais noms de champs du backend : prenom / nom
  const nomComplet = `${demande.prenom ?? ""} ${demande.nom ?? ""}`.trim();
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2">Rejeter la demande</h3>
        <p className="text-sm text-gray-500 mb-4">
          Demande de <strong>{nomComplet}</strong>
        </p>
        <label className="block text-sm font-medium text-gray-700 mb-1">Motif du rejet *</label>
        <textarea
          className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          rows={4}
          placeholder="Expliquez la raison du rejet..."
          value={motif}
          onChange={(e) => setMotif(e.target.value)}
        />
        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50 transition">
            Annuler
          </button>
          <button
            onClick={() => motif.trim() && onConfirm(motif)}
            disabled={!motif.trim()}
            className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Confirmer le rejet
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Modal Détail ──────────────────────────────────────────────────

const DetailModal = ({ demande, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
    <div className="bg-white rounded-xl shadow-lg p-5 w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-base font-bold text-gray-800">Détail de la demande</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600" type="button">
          <Icon name="x" className="w-5 h-5" />
        </button>
      </div>
      <div className="space-y-2">
        {[
          ["Nom complet",        `${demande.prenom ?? ""} ${demande.nom ?? ""}`.trim()],
          ["Email",              demande.email ?? "—"],
          ["Type",               demande.typeUtilisateur ?? "—"],
          ["Téléphone",          demande.telephone ?? "—"],
          ["Ville",              demande.ville ?? "—"],
          ["Organisme",          demande.organisme ?? "—"],
          ["Fonction",           demande.fonction ?? "—"],
          ["Date de demande",    formatDate(demande.dateDemande)],
          ["Date de validation", formatDate(demande.dateValidation)],
          ["Motif de rejet",     demande.motif ?? "—"],
          ["Admin traitant",     demande.adminTraitantNom ?? "—"],
          ["Departement",        demande.departement ?? "—"],
        ].map(([label, value]) => (
          <div key={label} className="">
               {value === "—" ? ('') : ( <div className="flex justify-between py-1.5 border-b border-gray-100">
                      <span className="text-xs text-gray-500">{label}</span>
                      <span className="text-xs font-medium text-gray-800">{value}</span>
               </div> )}
          </div>
        ))}
        <div className="flex justify-between py-1.5">
          <span className="text-xs text-gray-500">Statut demande</span>
          {statutBadge(demande.statutDemandeAcces)}
        </div>
        <div className="flex justify-between py-1.5">
          <span className="text-xs text-gray-500">Statut compte</span>
          {statutBadge(demande.statutUtilisateur)}
        </div>
      </div>
    </div>
  </div>
);

// ── Sidebar ───────────────────────────────────────────────────────

const Sidebar = ({ sidebarOpen, activeTab, setActiveTab, stats }) => {
  const navItems = [
    { id: "dashboard",    label: "Tableau de bord",  icon: "dashboard" },
    { id: "demandes",     label: "Demandes d'accès", icon: "requests", badge: stats.enAttente },
    { id: "utilisateurs", label: "Utilisateurs",     icon: "users" },
  ];
  return (
    <aside className={`${sidebarOpen ? "w-64" : "w-16"} bg-green-800 text-white flex flex-col transition-all duration-300 flex-shrink-0`}>
      <div className="flex items-center gap-3 px-4 py-5 border-b border-green-700">
        <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center flex-shrink-0">
          <img src={sofitexLogo} alt="Sofitex" className="w-7 h-7 object-contain" />
        </div>
        {sidebarOpen && (
          <div>
            <p className="font-bold text-sm leading-tight">Sofitex</p>
            <p className="text-green-300 text-xs">Plateforme CIL</p>
          </div>
        )}
      </div>
      <nav className="flex-1 py-4 space-y-1 px-2">
        {navItems.map((item) => (
          <button key={item.id} onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === item.id ? "bg-white text-green-800 shadow" : "text-green-100 hover:bg-green-700"
            }`}>
            <Icon name={item.icon} className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="flex-1 text-left">{item.label}</span>}
            {sidebarOpen && item.badge > 0 && (
              <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-1.5 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-green-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">A</span>
          </div>
          {sidebarOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">Administrateur</p>
              <p className="text-green-300 text-xs truncate">admin@cil.com</p>
            </div>
          )}
          {sidebarOpen && (
            <button onClick={() => { localStorage.removeItem("token"); window.location.href = "/"; }}
              className="text-green-300 hover:text-white">
              <Icon name="logout" className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

// ── Header ────────────────────────────────────────────────────────

const Header = ({ activeTab, sidebarOpen, setSidebarOpen, stats, onRefresh }) => (
  <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
    <div className="flex items-center gap-4">
      <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500 hover:text-gray-700">
        <Icon name="menu" className="w-5 h-5" />
      </button>
      <div>
        <h1 className="text-lg font-bold text-gray-800">
          {activeTab === "dashboard"    && "Tableau de bord"}
          {activeTab === "demandes"     && "Demandes d'accès"}
          {activeTab === "utilisateurs" && "Gestion des utilisateurs"}
        </h1>
        <p className="text-xs text-gray-400">
          {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <button onClick={onRefresh} title="Rafraîchir" className="p-2 text-gray-500 hover:text-green-700 hover:bg-green-50 rounded-lg transition">
        <Icon name="refresh" className="w-5 h-5" />
      </button>
      <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
        <Icon name="bell" className="w-5 h-5" />
        {stats.enAttente > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />}
      </button>
    </div>
  </header>
);

// ── Stat Cards ────────────────────────────────────────────────────

const StatCards = ({ stats }) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    {[
      { label: "Total demandes",      value: stats.total,       color: "bg-green-700",  sub: "Toutes les demandes" },
      { label: "En attente",          value: stats.enAttente,   color: "bg-yellow-500", sub: "À traiter" },
      { label: "Approuvées",          value: stats.approuvees,  color: "bg-emerald-500",sub: "Comptes activés" },
      { label: "Utilisateurs actifs", value: stats.utilisateurs,color: "bg-blue-500",   sub: "Comptes actifs" },
    ].map((s) => (
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

// ── Recent Demandes ───────────────────────────────────────────────

const RecentDemandes = ({ demandes, setActiveTab, handleValider, setRejetModal }) => {
  const enAttente = demandes.filter((d) => d.statutDemandeAcces === "EN_ATTENTE");
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h2 className="font-bold text-gray-800">Demandes récentes en attente</h2>
        <button onClick={() => setActiveTab("demandes")} className="text-green-700 text-sm font-medium hover:underline">
          Voir tout →
        </button>
      </div>
      <div className="divide-y divide-gray-50">
        {enAttente.slice(0, 3).map((d) => (
          <div key={d.idDemande} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-700 font-bold text-sm">
                  {(d.prenom ?? "?")[0].toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{d.prenom} {d.nom}</p>
                <p className="text-xs text-gray-400">{d.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {typeBadge(d.typeUtilisateur)}
              <span className="text-xs text-gray-400">{formatDate(d.dateDemande)}</span>
              <div className="flex gap-1">
                <button onClick={() => handleValider(d.idDemande)} className="p-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition" title="Approuver">
                  <Icon name="check" className="w-4 h-4" />
                </button>
                <button onClick={() => setRejetModal(d)} className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition" title="Rejeter">
                  <Icon name="x" className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {enAttente.length === 0 && (
          <div className="px-6 py-8 text-center text-gray-400 text-sm">Aucune demande en attente</div>
        )}
      </div>
    </div>
  );
}
// ── Répartition par type ──────────────────────────────────────────

const TypeRepartition = ({ demandes }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
    <h2 className="font-bold text-gray-800 mb-4">Répartition par type d'utilisateur</h2>
    <div className="space-y-3">
      {["CIL","DPO","DG","Usager","UtilisateurMetier"].map((type) => {
        const count = demandes.filter((d) => d.typeUtilisateur === type).length;
        const pct   = demandes.length ? Math.round((count / demandes.length) * 100) : 0;
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

// ── Filtres ───────────────────────────────────────────────────────

const DemandesFilters = ({ filterStatut, setFilterStatut, demandes }) => (
  <div className="flex flex-wrap gap-2">
    {["TOUS","EN_ATTENTE","APPROUVEE","REJETEE"].map((s) => (
      <button key={s} onClick={() => setFilterStatut(s)}
        className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
          filterStatut === s
            ? "bg-green-700 text-white shadow"
            : "bg-white text-gray-600 border border-gray-200 hover:border-green-400"
        }`}>
        {s === "TOUS" ? "Toutes" : s === "EN_ATTENTE" ? "En attente" : s === "APPROUVEE" ? "Approuvées" : "Rejetées"}
        <span className="ml-2 text-xs opacity-70">
          ({s === "TOUS" ? demandes.length : demandes.filter((d) => d.statutDemandeAcces === s).length})
        </span>
      </button>
    ))}
  </div>
);

// ── Tableau Demandes ──────────────────────────────────────────────

const DemandesTable = ({ demandesFiltered, loading, setDetailModal, handleValider, setRejetModal }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            {["Demandeur","Type","Statut","Date","Actions"].map((h, i) => (
              <th key={h} className={`px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide ${i === 4 ? "text-center" : "text-left"}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {loading
            ? [1,2,3].map((i) => <SkeletonRow key={i} />)
            : demandesFiltered.map((d) => (
              <tr key={d.idDemande} className="hover:bg-gray-50 transition">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-green-700 font-bold text-xs">
                        {(d.prenom ?? "?")[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{d.prenom} {d.nom}</p>
                      <p className="text-xs text-gray-400">{d.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">{typeBadge(d.typeUtilisateur)}</td>
                <td className="px-5 py-4">{statutBadge(d.statutDemandeAcces)}</td>
                <td className="px-5 py-4 text-gray-500 text-xs">{formatDate(d.dateDemande)}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => setDetailModal(d)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Détails">
                      <Icon name="eye" className="w-4 h-4" />
                    </button>
                    {d.statutDemandeAcces === "EN_ATTENTE" && (
                      <>
                        <button onClick={() => handleValider(d.idDemande)} className="p-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition" title="Approuver">
                          <Icon name="check" className="w-4 h-4" />
                        </button>
                        <button onClick={() => setRejetModal(d)} className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition" title="Rejeter">
                          <Icon name="x" className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>
      {!loading && demandesFiltered.length === 0 && (
        <div className="py-12 text-center text-gray-400 text-sm">Aucune demande trouvée</div>
      )}
    </div>
  </div>
);

// ── Tableau Utilisateurs ──────────────────────────────────────────

const UtilisateursSearch = ({ searchUser, setSearchUser }) => (
  <div className="relative max-w-sm">
    <Icon name="search" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
    <input type="text" placeholder="Rechercher un utilisateur..."
      value={searchUser} onChange={(e) => setSearchUser(e.target.value)}
      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
    />
  </div>
);

const UtilisateursTable = ({ utilisateursFiltres, loading, handleSuspendre, handleReactiver, handleDesactiver }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            {["Utilisateur","Type","Statut","Date création","Actions"].map((h, i) => (
              <th key={h} className={`px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide ${i === 4 ? "text-center" : "text-left"}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {loading
            ? [1,2,3].map((i) => <SkeletonRow key={i} cols={5} />)
            : utilisateursFiltres.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50 transition">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-700 font-bold text-xs">
                        {(u.prenom ?? "?")[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{u.prenom} {u.nom}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">{typeBadge(u.typeUtilisateur)}</td>
                <td className="px-5 py-4">{statutBadge(u.statutUtilisateur)}</td>
                <td className="px-5 py-4 text-gray-500 text-xs">{formatDate(u.dateCreation)}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-center gap-2">
                    {u.statutUtilisateur === "ACTIF" ? (
                      <>
                        <button onClick={() => handleSuspendre(u.id)} className="p-1.5 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition" title="Suspendre">
                          <Icon name="x" className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDesactiver(u.id)} className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition" title="Désactiver">
                          <Icon name="x" className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <button onClick={() => handleReactiver(u.id)} className="p-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition" title="Réactiver">
                        <Icon name="check" className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>
      {!loading && utilisateursFiltres.length === 0 && (
        <div className="py-12 text-center text-gray-400 text-sm">Aucun utilisateur trouvé</div>
      )}
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════════

function AdminDashboard() {
  const [activeTab, setActiveTab]             = useState("dashboard");
  const [demandes, setDemandes]               = useState([]);
  const [utilisateurs, setUtilisateurs]       = useState([]);
  const [loadingDemandes, setLoadingDemandes] = useState(false);
  const [loadingUsers, setLoadingUsers]       = useState(false);
  const [filterStatut, setFilterStatut]       = useState("TOUS");
  const [searchUser, setSearchUser]           = useState("");
  const [rejetModal, setRejetModal]           = useState(null);
  const [detailModal, setDetailModal]         = useState(null);
  const [toast, setToast]                     = useState(null);
  const [sidebarOpen, setSidebarOpen]         = useState(true);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // GET /api/admin/demandes
  const fetchDemandes = useCallback(async () => {
    setLoadingDemandes(true);
    try {
      const res = await fetch(`${API_BASE}/admin/demandes`, { headers: authHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setDemandes(await res.json());
    } catch (err) {
      showToast("Impossible de charger les demandes", "error");
    } finally {
      setLoadingDemandes(false);
    }
  }, []);

  // GET /api/admin/utilisateurs
  const fetchUtilisateurs = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch(`${API_BASE}/admin/utilisateurs`, { headers: authHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setUtilisateurs(await res.json());
    } catch (err) {
      showToast("Impossible de charger les utilisateurs", "error");
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    fetchDemandes();
    fetchUtilisateurs();
  }, [fetchDemandes, fetchUtilisateurs]);

  // PUT /api/admin/demandes/{id}/valider
  const handleValider = async (idDemande) => {
    try {
      const res = await fetch(`${API_BASE}/admin/demandes/${idDemande}/valider`, {
        method: "PUT",
        headers: authHeaders(),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `HTTP ${res.status}`);
      }
      setDemandes((prev) =>
        prev.map((d) => d.idDemande === idDemande
          ? { ...d, statutDemandeAcces: "APPROUVEE", dateValidation: new Date().toISOString() }
          : d
        )
      );
      showToast("Demande approuvée avec succès ✓");
    } catch (err) {
      showToast(err.message || "Erreur lors de l'approbation", "error");
    }
  };

  // PUT /api/admin/demandes/{id}/rejeter
  const handleRejeter = async (idDemande, motif) => {
    try {
      const res = await fetch(`${API_BASE}/admin/demandes/${idDemande}/rejeter`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ motif }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `HTTP ${res.status}`);
      }
      setDemandes((prev) =>
        prev.map((d) => d.idDemande === idDemande
          ? { ...d, statutDemandeAcces: "REJETEE", motif, dateValidation: new Date().toISOString() }
          : d
        )
      );
      setRejetModal(null);
      showToast("Demande rejetée", "error");
    } catch (err) {
      showToast(err.message || "Erreur lors du rejet", "error");
    }
  };

  // PUT /api/admin/utilisateurs/{id}/suspendre
  const handleSuspendre = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/admin/utilisateurs/${id}/suspendre`, {
        method: "PUT", headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setUtilisateurs((prev) => prev.map((u) => u.id === id ? { ...u, statutUtilisateur: "SUSPENDU" } : u));
      showToast("Compte suspendu", "error");
    } catch (err) {
      showToast(err.message || "Erreur lors de la suspension", "error");
    }
  };

  // PUT /api/admin/utilisateurs/{id}/reactiver
  const handleReactiver = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/admin/utilisateurs/${id}/reactiver`, {
        method: "PUT", headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setUtilisateurs((prev) => prev.map((u) => u.id === id ? { ...u, statutUtilisateur: "ACTIF" } : u));
      showToast("Compte réactivé ✓");
    } catch (err) {
      showToast(err || "Erreur lors de la réactivation", "error");
    }
  };

  // PUT /api/admin/utilisateurs/{id}/desactiver
  const handleDesactiver = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/admin/utilisateurs/${id}/desactiver`, {
        method: "PUT", headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setUtilisateurs((prev) => prev.map((u) => u.id === id ? { ...u, statutUtilisateur: "INACTIF" } : u));
      showToast("Compte désactivé", "error");
    } catch (err) {
      showToast(err.message || "Erreur lors de la désactivation", "error");
    }
  };

  const handleRefresh = () => { fetchDemandes(); fetchUtilisateurs(); };

  // Filtrage sur statutDemandeAcces (champ réel du backend)
  const demandesFiltered = demandes.filter((d) =>
    filterStatut === "TOUS" ? true : d.statutDemandeAcces === filterStatut
  );

  const utilisateursFiltres = utilisateurs.filter((u) =>
    `${u.nom ?? ""} ${u.prenom ?? ""} ${u.email ?? ""}`.toLowerCase().includes(searchUser.toLowerCase())
  );

  const stats = {
    total:        demandes.length,
    enAttente:    demandes.filter((d) => d.statutDemandeAcces === "EN_ATTENTE").length,
    approuvees:   demandes.filter((d) => d.statutDemandeAcces === "APPROUVEE").length,
    rejetees:     demandes.filter((d) => d.statutDemandeAcces === "REJETEE").length,
    utilisateurs: utilisateurs.filter((u) => u.statutUtilisateur === "ACTIF").length,
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} activeTab={activeTab} setActiveTab={setActiveTab} stats={stats} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header activeTab={activeTab} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} stats={stats} onRefresh={handleRefresh} />

        <main className="flex-1 overflow-y-auto p-6">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <StatCards stats={stats} />
              <RecentDemandes demandes={demandes} setActiveTab={setActiveTab} handleValider={handleValider} setRejetModal={setRejetModal} />
              <TypeRepartition demandes={demandes} />
            </div>
          )}
          {activeTab === "demandes" && (
            <div className="space-y-4">
              <DemandesFilters filterStatut={filterStatut} setFilterStatut={setFilterStatut} demandes={demandes} />
              <DemandesTable demandesFiltered={demandesFiltered} loading={loadingDemandes} setDetailModal={setDetailModal} handleValider={handleValider} setRejetModal={setRejetModal} />
            </div>
          )}
          {activeTab === "utilisateurs" && (
            <div className="space-y-4">
              <UtilisateursSearch searchUser={searchUser} setSearchUser={setSearchUser} />
              <UtilisateursTable utilisateursFiltres={utilisateursFiltres} loading={loadingUsers} handleSuspendre={handleSuspendre} handleReactiver={handleReactiver} handleDesactiver={handleDesactiver} />
            </div>
          )}
        </main>
      </div>

      {rejetModal && (
        <RejetModal demande={rejetModal} onConfirm={(motif) => handleRejeter(rejetModal.idDemande, motif)} onClose={() => setRejetModal(null)} />
      )}
      {detailModal && (
        <DetailModal demande={detailModal} onClose={() => setDetailModal(null)} />
      )}
      <Toast toast={toast} />
    </div>
  );
}

export default AdminDashboard;
