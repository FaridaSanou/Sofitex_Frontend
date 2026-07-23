import { Icon } from "../ui/Icon";
import NotificationBell from "../ui/NotificationBell";

const HEADER_TITLES = {
  dashboard: "Tableau de bord", sessions: "Sessions de collecte",
  traitements: "Mes Traitements", demandes: "Demandes des Usagers",
  entrepot: "Entrepôt", historique: "Historique",
};

export default function UMHeader({ activeSection, sidebarOpen, onToggleSidebar, newSessionCount, onNewSessionClick, demandesEnAttente, onDemandesClick, utilisateurId }) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-4">
        <button onClick={onToggleSidebar} className="text-gray-500 hover:text-gray-700">
          <Icon name="menu" className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-gray-800">{HEADER_TITLES[activeSection] || activeSection}</h1>
          <p className="text-xs text-gray-400">
            {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {newSessionCount > 0 && (
          <button onClick={onNewSessionClick} className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
            <Icon name="calendar" className="w-5 h-5" />
            <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">{newSessionCount > 9 ? '9+' : newSessionCount}</span>
          </button>
        )}
        {utilisateurId ? (
          <NotificationBell utilisateurId={utilisateurId} onNavigate={() => onDemandesClick?.()} />
        ) : demandesEnAttente > 0 && (
          <button onClick={onDemandesClick} className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
            <Icon name="bell" className="w-5 h-5" />
            <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">{demandesEnAttente > 9 ? '9+' : demandesEnAttente}</span>
          </button>
        )}
      </div>
    </header>
  );
}
