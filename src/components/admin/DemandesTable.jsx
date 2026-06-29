import { Icon } from "../ui/Icon";
import { typeBadge, statutBadge } from "../ui/BadgeStatut";
import { formatDate } from "../../utils/date";
import { SkeletonRow } from "../ui/SkeletonRow";

export default function DemandesTable({ demandesFiltered, loading, setDetailModal, handleValider, setRejetModal }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {["Demandeur", "Type", "Statut", "Date", "Actions"].map((h, i) => (
                <th key={h} className={`px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide ${i === 4 ? "text-center" : "text-left"}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading
              ? [1, 2, 3].map((i) => <SkeletonRow key={i} />)
              : demandesFiltered.map((d) => (
                  <tr key={d.idDemande} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-green-700 font-bold text-xs">{(d.prenom ?? "?")[0].toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{d.prenom} {d.nom}</p>
                          <p className="text-xs text-gray-400">{d.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">{typeBadge(d.typeUtilisateur)}</td>
                    <td className="px-5 py-4">{statutBadge(d.statutDemandeAcces)}</td>
                    <td className="px-5 py-4 text-gray-500 text-xs">{formatDate(d.dateDemande)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => setDetailModal(d)} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition" title="Détails">
                          <Icon name="eye" className="w-4 h-4" />
                        </button>
                        {d.statutDemandeAcces === "EN_ATTENTE" && (
                          <>
                            <button onClick={() => handleValider(d.idDemande)} className="p-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition" title="Approuver">
                              <Icon name="check" className="w-4 h-4" />
                            </button>
                            <button onClick={() => setRejetModal(d)} className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition" title="Rejeter">
                              <Icon name="close" className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
        {!loading && demandesFiltered.length === 0 && (
          <div className="py-12 text-center text-gray-400 text-sm">Aucune demande trouvée</div>
        )}
      </div>
    </div>
  );
}
