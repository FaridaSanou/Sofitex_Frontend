import { useState } from "react";
import sofitexLogo from "../assets/image.png";
import NotificationBell from "../components/ui/NotificationBell";

const Icon = ({ name, className = "w-5 h-5" }) => {
  const icons = {
    dashboard: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
    users: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />,
    sessions: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
    traitements: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />,
    plaintes: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
    declarations: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
    verification: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />,
    demande: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />,
    logout: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />,
    bell: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />,
    menu: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />,
    donnees: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />,
  };
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {icons[name]}
    </svg>
  );
};

const ROLE_CONFIG = {
  ROLE_ADMINISTRATEUR: {
    label: "Administrateur",
    initials: "A",
    nav: [
      { id: "dashboard", label: "Tableau de bord", icon: "dashboard" },
      { id: "demandes", label: "Demandes d'accès", icon: "demande" },
      { id: "utilisateurs", label: "Utilisateurs", icon: "users" },
    ],
  },
  ROLE_DPO: {
    label: "DPO",
    initials: "D",
    nav: [
      { id: "dashboard", label: "Tableau de bord", icon: "dashboard" },
      { id: "sessions", label: "Sessions de collecte", icon: "sessions" },
      { id: "traitements", label: "Traitements", icon: "traitements" },
      { id: "declarations", label: "Déclarations", icon: "declarations" },
      { id: "demandes", label: "Demandes usagers", icon: "demande" },
      { id: "historique", label: "Historique", icon: "donnees" },
    ],
  },
  ROLE_DG: {
    label: "Directeur Général",
    initials: "D",
    nav: [
      { id: "dashboard", label: "Tableau de bord", icon: "dashboard" },
      { id: "sessions", label: "Sessions", icon: "sessions" },
      { id: "utilisateurs", label: "Utilisateurs", icon: "users" },
    ],
  },
  ROLE_UTILISATEUR_METIER: {
    label: "Utilisateur Métier",
    initials: "U",
    nav: [
      { id: "dashboard", label: "Tableau de bord", icon: "dashboard" },
      { id: "sessions", label: "Sessions de collecte", icon: "sessions" },
      { id: "traitements", label: "Traitements", icon: "traitements" },
      { id: "demandes", label: "Demandes", icon: "demande" },
      { id: "historique", label: "Historique", icon: "donnees" },
    ],
  },
};

export default function DashboardLayout({ children, activeTab, setActiveTab, badge, notificationsCount = 0, onBellClick, utilisateurId }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const role = localStorage.getItem("role") || "ROLE_ADMINISTRATEUR";
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.ROLE_ADMINISTRATEUR;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    localStorage.removeItem("dpoId");
    window.location.href = "/";
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      <aside className={`${sidebarOpen ? "w-64" : "w-16"} bg-green-800 text-white flex flex-col transition-all duration-300 flex-shrink-0`}>
        <div className="flex items-center gap-3 px-4 py-5 border-b border-green-700">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
            <img src={sofitexLogo} alt="Sofitex" className="w-8 h-8 object-contain" />
          </div>
          {sidebarOpen && (
            <div>
              <p className="font-bold text-sm leading-tight">Sofitex</p>
              <p className="text-green-300 text-xs">Plateforme CIL</p>
            </div>
          )}
        </div>

        <nav className="flex-1 py-4 space-y-1 px-2">
          {config.nav.map((item) => (
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
              {sidebarOpen && badge?.[item.id] > 0 && (
                <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {badge[item.id]}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-green-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">{config.initials}</span>
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{config.label}</p>
                <p className="text-green-300 text-xs truncate">{localStorage.getItem("email") || ""}</p>
              </div>
            )}
            {sidebarOpen && (
              <button onClick={handleLogout} className="text-green-300 hover:text-white">
                <Icon name="logout" className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500 hover:text-gray-700">
              <Icon name="menu" className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-800">
                {config.nav.find((n) => n.id === activeTab)?.label || "Tableau de bord"}
              </h1>
              <p className="text-xs text-gray-400">
                {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          </div>
          {utilisateurId ? (
            <NotificationBell utilisateurId={utilisateurId} onNavigate={() => onBellClick?.()} />
          ) : (
            <button onClick={onBellClick} className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
              <Icon name="bell" className="w-5 h-5" />
              {notificationsCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {notificationsCount > 9 ? '9+' : notificationsCount}
                </span>
              )}
            </button>
          )}
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
