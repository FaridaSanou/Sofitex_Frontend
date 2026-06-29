import { Icon } from "../ui/Icon";

export default function AdminHeader({ activeTab, sidebarOpen, setSidebarOpen, stats, onRefresh }) {
  const titles = {
    dashboard: "Tableau de bord",
    demandes: "Demandes d'accès",
    utilisateurs: "Gestion des utilisateurs",
  };
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-4">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500 hover:text-gray-700">
          <Icon name="menu" className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-gray-800">{titles[activeTab]}</h1>
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
}
