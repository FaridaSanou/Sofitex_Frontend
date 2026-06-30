import { Icon } from "../ui/Icon";

export default function NotificationsPanel({ onVoirDemandes, onClose }) {
  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-200 z-50">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h3 className="font-bold text-gray-800">Notifications</h3>
        <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
          <Icon name="close" className="w-4 h-4" />
        </button>
      </div>
      <div className="px-5 py-8 text-center text-gray-500 text-sm">
        <Icon name="bell" className="w-10 h-10 mx-auto mb-3 text-gray-300" />
        <p>Vous avez de nouvelles demandes</p>
        <p className="text-xs text-gray-400 mt-1">Cliquez ci-dessous pour les voir</p>
      </div>
      <div className="px-5 py-3 border-t border-gray-100">
        <button onClick={onVoirDemandes} className="w-full py-2.5 text-sm font-medium text-white bg-green-700 rounded-xl hover:bg-green-800 transition">
          Voir les demandes
        </button>
      </div>
    </div>
  );
}
