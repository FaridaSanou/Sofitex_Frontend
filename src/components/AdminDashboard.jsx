import { useState } from "react";

// ═══════════════════════════════════════════════════════════════════
// DONNÉES SIMULÉES
// ═══════════════════════════════════════════════════════════════════

const mockDemandes = [
  { id: 1, nomUtilisateur: "Ouedraogo", prenomUtilisateur: "Amadou", emailUtilisateur: "amadou@sofitex.bf", typeUtilisateur: "CIL", statut: "EN_ATTENTE", dateDemande: "2026-05-18T10:30:00", dateValidation: null, motif: null },
  { id: 2, nomUtilisateur: "Traoré", prenomUtilisateur: "Fatima", emailUtilisateur: "fatima@example.com", typeUtilisateur: "USAGER", statut: "EN_ATTENTE", dateDemande: "2026-05-19T08:15:00", dateValidation: null, motif: null },
  { id: 3, nomUtilisateur: "Kaboré", prenomUtilisateur: "Issouf", emailUtilisateur: "issouf@sofitex.bf", typeUtilisateur: "DPO", statut: "VALIDEE", dateDemande: "2026-05-15T14:00:00", dateValidation: "2026-05-16T09:00:00", motif: null },
  { id: 4, nomUtilisateur: "Sawadogo", prenomUtilisateur: "Marie", emailUtilisateur: "marie@example.com", typeUtilisateur: "DG", statut: "REJETEE", dateDemande: "2026-05-14T11:00:00", dateValidation: "2026-05-14T16:00:00", motif: "Informations incomplètes" },
  { id: 5, nomUtilisateur: "Zongo", prenomUtilisateur: "Paul", emailUtilisateur: "paul@sofitex.bf", typeUtilisateur: "UTILISATEUR_METIER", statut: "EN_ATTENTE", dateDemande: "2026-05-20T07:45:00", dateValidation: null, motif: null },
];

const mockUtilisateurs = [
  { id: 1, nom: "Kaboré", prenom: "Issouf", email: "issouf@sofitex.bf", statutUtilisateur: "ACTIF", typeUtilisateur: "DPO", dateCreation: "2026-05-16T09:00:00" },
  { id: 2, nom: "Diallo", prenom: "Aminata", email: "aminata@sofitex.bf", statutUtilisateur: "ACTIF", typeUtilisateur: "CIL", dateCreation: "2026-05-10T10:00:00" },
  { id: 3, nom: "Compaoré", prenom: "Luc", email: "luc@example.com", statutUtilisateur: "ACTIF", typeUtilisateur: "USAGER", dateCreation: "2026-05-12T14:30:00" },
  { id: 4, nom: "Nikiema", prenom: "Rose", email: "rose@sofitex.bf", statutUtilisateur: "INACTIF", typeUtilisateur: "UTILISATEUR_METIER", dateCreation: "2026-05-08T08:00:00" },
];

// ═══════════════════════════════════════════════════════════════════
// HELPERS — Fonctions utilitaires réutilisables
// ═══════════════════════════════════════════════════════════════════

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
};

const statutBadge = (statut) => {
  const map = {
    EN_ATTENTE: "bg-yellow-100 text-yellow-800",
    VALIDEE: "bg-green-100 text-green-800",
    REJETEE: "bg-red-100 text-red-800",
    ACTIF: "bg-green-100 text-green-800",
    INACTIF: "bg-gray-100 text-gray-600",
    SUSPENDU: "bg-orange-100 text-orange-800",
  };
  const labels = {
    EN_ATTENTE: "En attente",
    VALIDEE: "Validée",
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
};

const typeBadge = (type) => {
  const map = {
    CIL: "bg-blue-100 text-blue-700",
    DPO: "bg-purple-100 text-purple-700",
    DG: "bg-indigo-100 text-indigo-700",
    USAGER: "bg-teal-100 text-teal-700",
    UTILISATEUR_METIER: "bg-orange-100 text-orange-700",
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${map[type] || "bg-gray-100 text-gray-600"}`}>
      {type}
    </span>
  );
};

// ═══════════════════════════════════════════════════════════════════
// COMPOSANT : Icon — Affiche une icône SVG par son nom
// Props : name (string), className (string, optionnel)
// ═══════════════════════════════════════════════════════════════════

const Icon = ({ name, className = "w-5 h-5" }) => {
  const icons = {
    dashboard: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
    users: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />,
    requests: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />,
    check: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />,
    x: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />,
    eye: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />,
    logout: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />,
    bell: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />,
    search: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />,
    menu: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />,
  };
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {icons[name]}
    </svg>
  );
};

// ═══════════════════════════════════════════════════════════════════
// COMPOSANT : Toast — Notification en bas à droite
// Props : toast ({ msg: string, type: "success" | "error" } | null)
// ═══════════════════════════════════════════════════════════════════

const Toast = ({ toast }) => {
  if (!toast) return null;
  return (
    <div className={`fixed bottom-6 right-6 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium z-50 transition-all ${
      toast.type === "error" ? "bg-red-500" : "bg-green-700"
    }`}>
      {toast.msg}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// COMPOSANT : RejetModal — Fenêtre modale pour rejeter une demande
// Props : demande (objet), onConfirm(motif: string), onClose()
// ═══════════════════════════════════════════════════════════════════

const RejetModal = ({ demande, onConfirm, onClose }) => {
  const [motif, setMotif] = useState("");
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2">Rejeter la demande</h3>
        <p className="text-sm text-gray-500 mb-4">
          Demande de <strong>{demande.prenomUtilisateur} {demande.nomUtilisateur}</strong>
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

// ═══════════════════════════════════════════════════════════════════
// COMPOSANT : DetailModal — Fenêtre modale affichant le détail d'une demande
// Props : demande (objet), onClose()
// ═══════════════════════════════════════════════════════════════════

const DetailModal = ({ demande, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg mx-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">Détail de la demande #{demande.id}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <Icon name="x" className="w-5 h-5" />
        </button>
      </div>
      <div className="space-y-3">
        {[
          ["Nom complet", `${demande.prenomUtilisateur} ${demande.nomUtilisateur}`],
          ["Email", demande.emailUtilisateur],
          ["Type", demande.typeUtilisateur],
          ["Date de demande", formatDate(demande.dateDemande)],
          ["Date de validation", formatDate(demande.dateValidation)],
          ["Motif de rejet", demande.motif || "—"],
        ].map(([label, value]) => (
          <div key={label} className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-500">{label}</span>
            <span className="text-sm font-medium text-gray-800">{value}</span>
          </div>
        ))}
        <div className="flex justify-between py-2">
          <span className="text-sm text-gray-500">Statut</span>
          {statutBadge(demande.statut)}
        </div>
      </div>
      <button onClick={onClose} className="mt-5 w-full py-2 rounded-lg bg-green-700 text-white text-sm font-semibold hover:bg-green-800 transition">
        Fermer
      </button>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════
// COMPOSANT : Sidebar — Barre latérale de navigation
// Props : sidebarOpen (bool), activeTab (string), setActiveTab(fn), stats (objet)
// ═══════════════════════════════════════════════════════════════════

const Sidebar = ({ sidebarOpen, activeTab, setActiveTab, stats }) => {
  const navItems = [
    { id: "dashboard", label: "Tableau de bord", icon: "dashboard" },
    { id: "demandes", label: "Demandes d'accès", icon: "requests", badge: stats.enAttente },
    { id: "utilisateurs", label: "Utilisateurs", icon: "users" },
  ];

  return (
    <aside className={`${sidebarOpen ? "w-64" : "w-16"} bg-green-800 text-white flex flex-col transition-all duration-300 flex-shrink-0`}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-green-700">
        <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-green-800 font-black text-sm">S</span>
        </div>
        {sidebarOpen && (
          <div>
            <p className="font-bold text-sm leading-tight">Sofitex</p>
            <p className="text-green-300 text-xs">Plateforme CIL</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 space-y-1 px-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === item.id
                ? "bg-white text-green-800 shadow"
                : "text-green-100 hover:bg-green-700"
            }`}
          >
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

      {/* Admin info */}
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
            <button className="text-green-300 hover:text-white">
              <Icon name="logout" className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

// ═══════════════════════════════════════════════════════════════════
// COMPOSANT : Header — En-tête avec titre, date et notification
// Props : activeTab (string), sidebarOpen (bool), setSidebarOpen(fn), stats (objet)
// ═══════════════════════════════════════════════════════════════════

const Header = ({ activeTab, sidebarOpen, setSidebarOpen, stats }) => (
  <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
    <div className="flex items-center gap-4">
      <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500 hover:text-gray-700">
        <Icon name="menu" className="w-5 h-5" />
      </button>
      <div>
        <h1 className="text-lg font-bold text-gray-800">
          {activeTab === "dashboard" && "Tableau de bord"}
          {activeTab === "demandes" && "Demandes d'accès"}
          {activeTab === "utilisateurs" && "Gestion des utilisateurs"}
        </h1>
        <p className="text-xs text-gray-400">
          {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
        <Icon name="bell" className="w-5 h-5" />
        {stats.enAttente > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        )}
      </button>
    </div>
  </header>
);

// ═══════════════════════════════════════════════════════════════════
// COMPOSANT : StatCards — 4 cartes de statistiques en haut du dashboard
// Props : stats ({ total, enAttente, validees, utilisateurs })
// ═══════════════════════════════════════════════════════════════════

const StatCards = ({ stats }) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    {[
      { label: "Total demandes", value: stats.total, color: "bg-green-700", sub: "Toutes les demandes" },
      { label: "En attente", value: stats.enAttente, color: "bg-yellow-500", sub: "À traiter" },
      { label: "Validées", value: stats.validees, color: "bg-emerald-500", sub: "Comptes créés" },
      { label: "Utilisateurs actifs", value: stats.utilisateurs, color: "bg-blue-500", sub: "Comptes actifs" },
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

// ═══════════════════════════════════════════════════════════════════
// COMPOSANT : RecentDemandes — Liste des 3 dernières demandes en attente
// Props : demandes (array), setActiveTab(fn), handleValider(fn), setRejetModal(fn)
// ═══════════════════════════════════════════════════════════════════

const RecentDemandes = ({ demandes, setActiveTab, handleValider, setRejetModal }) => {
  const enAttente = demandes.filter((d) => d.statut === "EN_ATTENTE");
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
          <div key={d.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-700 font-bold text-sm">{d.prenomUtilisateur[0]}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{d.prenomUtilisateur} {d.nomUtilisateur}</p>
                <p className="text-xs text-gray-400">{d.emailUtilisateur}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {typeBadge(d.typeUtilisateur)}
              <span className="text-xs text-gray-400">{formatDate(d.dateDemande)}</span>
              <div className="flex gap-1">
                <button onClick={() => handleValider(d.id)} className="p-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition" title="Valider">
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
};

// ═══════════════════════════════════════════════════════════════════
// COMPOSANT : TypeRepartition — Barres de répartition par type d'utilisateur
// Props : demandes (array)
// ═══════════════════════════════════════════════════════════════════

const TypeRepartition = ({ demandes }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
    <h2 className="font-bold text-gray-800 mb-4">Répartition par type d'utilisateur</h2>
    <div className="space-y-3">
      {["CIL", "DPO", "DG", "USAGER", "UTILISATEUR_METIER"].map((type) => {
        const count = demandes.filter((d) => d.typeUtilisateur === type).length;
        const pct = demandes.length ? Math.round((count / demandes.length) * 100) : 0;
        return (
          <div key={type} className="flex items-center gap-3">
            <span className="text-xs font-medium text-gray-600 w-32 flex-shrink-0">{type}</span>
            <div className="flex-1 bg-gray-100 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full transition-all" style={{ width: `${pct}%` }}></div>
            </div>
            <span className="text-xs text-gray-500 w-8 text-right">{count}</span>
          </div>
        );
      })}
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════
// COMPOSANT : DemandesFilters — Boutons de filtrage par statut
// Props : filterStatut (string), setFilterStatut(fn), demandes (array)
// ═══════════════════════════════════════════════════════════════════

const DemandesFilters = ({ filterStatut, setFilterStatut, demandes }) => (
  <div className="flex flex-wrap gap-2">
    {["TOUS", "EN_ATTENTE", "VALIDEE", "REJETEE"].map((s) => (
      <button
        key={s}
        onClick={() => setFilterStatut(s)}
        className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
          filterStatut === s
            ? "bg-green-700 text-white shadow"
            : "bg-white text-gray-600 border border-gray-200 hover:border-green-400"
        }`}
      >
        {s === "TOUS" ? "Toutes" : s === "EN_ATTENTE" ? "En attente" : s === "VALIDEE" ? "Validées" : "Rejetées"}
        <span className="ml-2 text-xs opacity-70">
          ({s === "TOUS" ? demandes.length : demandes.filter((d) => d.statut === s).length})
        </span>
      </button>
    ))}
  </div>
);

// ═══════════════════════════════════════════════════════════════════
// COMPOSANT : DemandesTable — Tableau complet des demandes avec actions
// Props : demandesFiltered (array), setDetailModal(fn), handleValider(fn), setRejetModal(fn)
// ═══════════════════════════════════════════════════════════════════

const DemandesTable = ({ demandesFiltered, setDetailModal, handleValider, setRejetModal }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Demandeur</th>
            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Statut</th>
            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
            <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {demandesFiltered.map((d) => (
            <tr key={d.id} className="hover:bg-gray-50 transition">
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-700 font-bold text-xs">{d.prenomUtilisateur[0]}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{d.prenomUtilisateur} {d.nomUtilisateur}</p>
                    <p className="text-xs text-gray-400">{d.emailUtilisateur}</p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-4">{typeBadge(d.typeUtilisateur)}</td>
              <td className="px-5 py-4">{statutBadge(d.statut)}</td>
              <td className="px-5 py-4 text-gray-500 text-xs">{formatDate(d.dateDemande)}</td>
              <td className="px-5 py-4">
                <div className="flex items-center justify-center gap-2">
                  <button onClick={() => setDetailModal(d)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Voir détails">
                    <Icon name="eye" className="w-4 h-4" />
                  </button>
                  {d.statut === "EN_ATTENTE" && (
                    <>
                      <button onClick={() => handleValider(d.id)} className="p-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition" title="Valider">
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
          ))}
        </tbody>
      </table>
      {demandesFiltered.length === 0 && (
        <div className="py-12 text-center text-gray-400 text-sm">Aucune demande trouvée</div>
      )}
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════
// COMPOSANT : UtilisateursSearch — Barre de recherche d'utilisateurs
// Props : searchUser (string), setSearchUser(fn)
// ═══════════════════════════════════════════════════════════════════

const UtilisateursSearch = ({ searchUser, setSearchUser }) => (
  <div className="relative max-w-sm">
    <Icon name="search" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
    <input
      type="text"
      placeholder="Rechercher un utilisateur..."
      value={searchUser}
      onChange={(e) => setSearchUser(e.target.value)}
      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
    />
  </div>
);

// ═══════════════════════════════════════════════════════════════════
// COMPOSANT : UtilisateursTable — Tableau des utilisateurs existants
// Props : utilisateursFiltres (array)
// ═══════════════════════════════════════════════════════════════════

const UtilisateursTable = ({ utilisateursFiltres }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Utilisateur</th>
            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Statut</th>
            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date création</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {utilisateursFiltres.map((u) => (
            <tr key={u.id} className="hover:bg-gray-50 transition">
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-700 font-bold text-xs">{u.prenom[0]}</span>
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
            </tr>
          ))}
        </tbody>
      </table>
      {utilisateursFiltres.length === 0 && (
        <div className="py-12 text-center text-gray-400 text-sm">Aucun utilisateur trouvé</div>
      )}
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL : AdminDashboard — Assemble tous les sous-composants
// Gère l'état global (onglet actif, données, filtres, modals, toast)
// ═══════════════════════════════════════════════════════════════════

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [demandes, setDemandes] = useState(mockDemandes);
  const [utilisateurs] = useState(mockUtilisateurs);
  const [filterStatut, setFilterStatut] = useState("TOUS");
  const [searchUser, setSearchUser] = useState("");
  const [rejetModal, setRejetModal] = useState(null);
  const [detailModal, setDetailModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Affiche un toast temporaire (3 secondes)
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Valide une demande : change le statut + affiche toast
  const handleValider = (id) => {
    setDemandes((prev) =>
      prev.map((d) => d.id === id ? { ...d, statut: "VALIDEE", dateValidation: new Date().toISOString() } : d)
    );
    showToast("Demande validée avec succès ✓");
  };

  // Rejette une demande avec motif + affiche toast
  const handleRejeter = (id, motif) => {
    setDemandes((prev) =>
      prev.map((d) => d.id === id ? { ...d, statut: "REJETEE", motif, dateValidation: new Date().toISOString() } : d)
    );
    setRejetModal(null);
    showToast("Demande rejetée", "error");
  };

  // Filtrage des demandes par statut
  const demandesFiltered = demandes.filter((d) =>
    filterStatut === "TOUS" ? true : d.statut === filterStatut
  );

  // Filtrage des utilisateurs par recherche textuelle
  const utilisateursFiltres = utilisateurs.filter((u) =>
    `${u.nom} ${u.prenom} ${u.email}`.toLowerCase().includes(searchUser.toLowerCase())
  );

  // Calcul des statistiques
  const stats = {
    total: demandes.length,
    enAttente: demandes.filter((d) => d.statut === "EN_ATTENTE").length,
    validees: demandes.filter((d) => d.statut === "VALIDEE").length,
    rejetees: demandes.filter((d) => d.statut === "REJETEE").length,
    utilisateurs: utilisateurs.length,
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* ── Sidebar ── */}
      <Sidebar sidebarOpen={sidebarOpen} activeTab={activeTab} setActiveTab={setActiveTab} stats={stats} />

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header activeTab={activeTab} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} stats={stats} />

        {/* ── Content ── */}
        <main className="flex-1 overflow-y-auto p-6">

          {/* ── ONGLET : Tableau de bord ── */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <StatCards stats={stats} />
              <RecentDemandes
                demandes={demandes}
                setActiveTab={setActiveTab}
                handleValider={handleValider}
                setRejetModal={setRejetModal}
              />
              <TypeRepartition demandes={demandes} />
            </div>
          )}

          {/* ── ONGLET : Demandes d'accès ── */}
          {activeTab === "demandes" && (
            <div className="space-y-4">
              <DemandesFilters filterStatut={filterStatut} setFilterStatut={setFilterStatut} demandes={demandes} />
              <DemandesTable
                demandesFiltered={demandesFiltered}
                setDetailModal={setDetailModal}
                handleValider={handleValider}
                setRejetModal={setRejetModal}
              />
            </div>
          )}

          {/* ── ONGLET : Gestion des utilisateurs ── */}
          {activeTab === "utilisateurs" && (
            <div className="space-y-4">
              <UtilisateursSearch searchUser={searchUser} setSearchUser={setSearchUser} />
              <UtilisateursTable utilisateursFiltres={utilisateursFiltres} />
            </div>
          )}
        </main>
      </div>

      {/* ── Modals ── */}
      {rejetModal && (
        <RejetModal
          demande={rejetModal}
          onConfirm={(motif) => handleRejeter(rejetModal.id, motif)}
          onClose={() => setRejetModal(null)}
        />
      )}
      {detailModal && (
        <DetailModal demande={detailModal} onClose={() => setDetailModal(null)} />
      )}

      {/* ── Toast ── */}
      <Toast toast={toast} />
    </div>
  );
}

export default AdminDashboard;
