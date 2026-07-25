import { formatDateTime } from "../../utils/date";
import { statutBadge } from "../ui/BadgeStatut";

export default function ModalDetailSession({ session, onClose }) {
  if (!session) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="bg-green-800 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center shrink-0">
          <h3 className="font-bold text-lg">{session.nomSession || `Session #${session.idSession}`}</h3>
          <button onClick={onClose} className="text-green-200 hover:text-white text-2xl leading-none">✕</button>
        </div>

        <div className="px-6 pt-6 pb-0 space-y-4 text-sm overflow-y-auto flex-1">
          <div className="bg-green-50 rounded-xl p-4 border border-green-100">
            <h4 className="font-bold text-green-800 mb-3">Informations de la session</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-green-600 font-semibold">Nom</p>
                <p className="font-medium">{session.nomSession || "—"}</p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-green-600 font-semibold">Type</p>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                  {session.typeCollecte === "EN_LIGNE" ? "En ligne" : "Terrain"}
                </span>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-green-600 font-semibold">Date début</p>
                <p>{formatDateTime(session.dateDebut)}</p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-green-600 font-semibold">Date fin</p>
                <p>{formatDateTime(session.dateFin)}</p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-green-600 font-semibold">Lieu</p>
                <p>{session.lieu || "—"}</p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-green-600 font-semibold">Statut</p>
                {statutBadge(session.statutSession)}
              </div>
              <div className="bg-white rounded-lg p-3 col-span-2">
                <p className="text-xs text-green-600 font-semibold">Description</p>
                <p>{session.description || "—"}</p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-green-600 font-semibold">DPO</p>
                <p>{session.dpoNomComplet || "—"}</p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-green-600 font-semibold">Traitements</p>
                <p>{session.nombreTraitements ?? 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 flex justify-end border-t border-gray-200 pt-4 mt-4 shrink-0">
          <button onClick={onClose} className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-all">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
