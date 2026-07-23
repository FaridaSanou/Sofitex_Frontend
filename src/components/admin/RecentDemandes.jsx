import { Icon } from "../ui/Icon";
import { typeBadge } from "../ui/BadgeStatut";
import { formatDate } from "../../utils/date";

export default function RecentDemandes({ demandes, setActiveTab, handleValider, setRejetModal }) {
  const enAttente = demandes.filter((d) => d.statutDemandeAcces === "EN_ATTENTE");
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
          <div key={d.idDemande} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-700 font-bold text-sm">{(d.prenom || "?")[0].toUpperCase()}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{d.prenom} {d.nom}</p>
                <p className="text-xs text-gray-400">{d.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {typeBadge(d.typeUtilisateur)}
              <span className="text-xs text-gray-400">{formatDate(d.dateDemande)}</span>
              <div className="flex gap-1">
                <button onClick={() => handleValider(d.idDemande)} className="p-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition" title="Approuver">
                  <Icon name="check" className="w-4 h-4" />
                </button>
                <button onClick={() => setRejetModal(d)} className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition" title="Rejeter">
                  <Icon name="close" className="w-4 h-4" />
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
}
