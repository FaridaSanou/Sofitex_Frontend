import { Icon } from "../ui/Icon";

export default function DgSidebar({ sidebarOpen, activeSection, setActiveSection, enAttente }) {
  const navItems = [
    { id: "dashboard", label: "Tableau de bord", icon: "home" },
    { id: "declarations", label: "Déclarations", icon: "clipboard", badge: enAttente },
    { id: "historique", label: "Historique", icon: "history" },
  ];

  return (
    <aside className={`${sidebarOpen ? "w-64" : "w-16"} bg-green-900 text-white flex flex-col transition-all duration-300 shadow-xl`}>
      <div className="flex items-center gap-3 px-4 py-5 border-b border-green-800">
        <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-green-900 font-black text-sm">DG</span>
        </div>
        {sidebarOpen && (
          <div>
            <p className="font-bold text-sm leading-tight">Direction Générale</p>
            <p className="text-green-400 text-xs">SOFITEX · Plateforme CIL</p>
          </div>
        )}
      </div>

      <nav className="flex-1 py-4 space-y-1 px-2">
        {navItems.map(item => (
          <button key={item.id} onClick={() => setActiveSection(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeSection === item.id ? "bg-white text-green-900 shadow" : "text-green-200 hover:bg-green-800"}`}>
            <Icon name={item.icon} className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="flex-1 text-left">{item.label}</span>}
            {sidebarOpen && item.badge > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">{item.badge}</span>
            )}
          </button>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-green-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-700 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">DG</span>
          </div>
          {sidebarOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">Directeur Général</p>
              <p className="text-green-400 text-xs truncate">{localStorage.getItem("email") || ""}</p>
            </div>
          )}
          {sidebarOpen && (
            <button onClick={() => { localStorage.clear(); window.location.href = "/"; }} className="text-green-400 hover:text-white">
              <Icon name="logout" className="w-4 h-4" />
            </button>
          )}
        </div>
        <button onClick={() => setSidebarOpen(o => !o)} className="w-full flex items-center justify-center py-2 mt-2 rounded-lg text-green-400 hover:bg-green-800 text-sm">
          {sidebarOpen ? "◀ Réduire" : "▶"}
        </button>
      </div>
    </aside>
  );
}
