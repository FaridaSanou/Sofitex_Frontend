import { Icon } from "../ui/Icon";
import sofitexLogo from "../../assets/image.png";

export default function AdminSidebar({ sidebarOpen, activeTab, setActiveTab, stats }) {
  const navItems = [
    { id: "dashboard", label: "Tableau de bord", icon: "home" },
    { id: "demandes", label: "Demandes d'accès", icon: "demande", badge: stats.enAttente },
    { id: "utilisateurs", label: "Utilisateurs", icon: "users" },
    { id: "historique", label: "Historique", icon: "history" },
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
              <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-1.5 py-0.5 rounded-full">{item.badge}</span>
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
            <button onClick={() => { ["token","role","email","userId","dpoId","utilisateurMetierId"].forEach(k => localStorage.removeItem(k)); window.location.href = "/"; }}
              className="text-green-300 hover:text-white">
              <Icon name="logout" className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
