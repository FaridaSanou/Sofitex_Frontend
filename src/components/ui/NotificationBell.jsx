import { useState, useEffect, useRef } from "react";
import api from "../../services/api";
import { Icon } from "./Icon";

export default function NotificationBell({ utilisateurId, onNavigate }) {
  const [notifications, setNotifications] = useState([]);
  const [nonLues, setNonLues] = useState(0);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!utilisateurId) return;
    const fetchNotifs = () => {
      api.get(`/notifications/${utilisateurId}/non-lues`)
        .then(res => { if (res.data) { setNotifications(res.data); setNonLues(res.data.length); } })
        .catch(() => {});
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, [utilisateurId]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const marquerLue = (id) => {
    api.patch(`/notifications/${id}/lire`).catch(() => {});
    setNotifications(prev => prev.filter(n => n.idNotification !== id));
    setNonLues(prev => Math.max(0, prev - 1));
  };

  const marquerToutLue = () => {
    api.patch(`/notifications/${utilisateurId}/lire-tout`).catch(() => {});
    setNotifications([]);
    setNonLues(0);
  };

  const handleNotifClick = (notif) => {
    marquerLue(notif.idNotification);
    if (onNavigate) onNavigate(notif);
    setOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setOpen(o => !o)} className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
        <Icon name="bell" className="w-5 h-5" />
        {nonLues > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {nonLues > 9 ? '9+' : nonLues}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-96 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-800">Notifications</h3>
            {nonLues > 0 && (
              <button onClick={marquerToutLue} className="text-xs text-green-700 font-medium hover:underline">Tout marquer lu</button>
            )}
          </div>
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-sm">Aucune notification</div>
            ) : (
              notifications.map(n => (
                <button key={n.idNotification} onClick={() => handleNotifClick(n)}
                  className="w-full text-left px-4 py-3 hover:bg-green-50 border-b border-gray-50 transition flex gap-3">
                  <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${n.typeNotification === "ALERTE" ? "bg-red-500" : n.typeNotification === "CONFIRMATION" ? "bg-green-500" : "bg-amber-500"}`} />
                  <div className="min-w-0">
                    <p className="text-sm text-gray-700 leading-snug">{n.contenu}</p>
                    <p className="text-xs text-gray-400 mt-1">{n.dateEnvoi}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}