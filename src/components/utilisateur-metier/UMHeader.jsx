import { useState, useEffect, useRef } from "react";
import { Icon } from "../ui/Icon";

const HEADER_TITLES = {
  dashboard: "Tableau de bord", sessions: "Sessions de collecte",
  traitements: "Mes Traitements", demandes: "Demandes des Usagers",
  entrepot: "Entrepôt", historique: "Historique",
};

function NotificationDropdown({ notifications, unreadCount, onMarkRead, onDemandesClick }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const typeStyle = (type) => {
    if (type === "DEMANDE_MODIFICATION" || type === "DEMANDE_SUPPRESSION") return "bg-blue-100 text-blue-700";
    if (type === "CONFIRMATION") return "bg-green-100 text-green-700";
    if (type === "ALERTE") return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-700";
  };

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
        <Icon name="bell" className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 max-h-[70vh] flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
            <h3 className="font-bold text-gray-800 text-sm">Notifications</h3>
            <button onClick={() => setOpen(false)} className="p-1 text-gray-400 hover:text-gray-600">
              <Icon name="close" className="w-4 h-4" />
            </button>
          </div>
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="px-5 py-8 text-center text-gray-400 text-sm">
                <Icon name="bell" className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                <p>Aucune notification</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map(n => (
                  <button
                    key={n.idNotification}
                    onClick={() => {
                      if (n.statut === "NON_LUE") onMarkRead(n.idNotification);
                    }}
                    className={`w-full text-left px-5 py-3 hover:bg-gray-50 transition flex items-start gap-3 ${n.statut === "NON_LUE" ? "bg-blue-50/50" : ""}`}
                  >
                    <span className={`mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 ${typeStyle(n.typeNotification)}`}>
                      {n.typeNotification === "DEMANDE_MODIFICATION" ? "Modification"
                        : n.typeNotification === "DEMANDE_SUPPRESSION" ? "Suppression"
                        : n.typeNotification === "CONFIRMATION" ? "Confirmé"
                        : n.typeNotification === "ALERTE" ? "Alerte"
                        : n.typeNotification}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-700 leading-relaxed line-clamp-2">{n.contenu}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{n.dateEnvoi}</p>
                    </div>
                    {n.statut === "NON_LUE" && <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1" />}
                  </button>
                ))}
              </div>
            )}
          </div>
          {unreadCount > 0 && (
            <div className="px-5 py-3 border-t border-gray-100">
              <button onClick={() => { onDemandesClick(); setOpen(false); }} className="w-full py-2 text-xs font-medium text-white bg-green-700 rounded-xl hover:bg-green-800 transition">
                Voir les demandes en attente
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function UMHeader({ activeSection, sidebarOpen, onToggleSidebar, newSessionCount, onNewSessionClick, demandesEnAttente, onDemandesClick, notifications, unreadCount, onMarkRead }) {
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
        <NotificationDropdown
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkRead={onMarkRead}
          onDemandesClick={onDemandesClick}
        />
      </div>
    </header>
  );
}
