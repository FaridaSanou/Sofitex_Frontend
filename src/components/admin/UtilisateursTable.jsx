import { Icon } from "../ui/Icon";
import { typeBadge, statutBadge } from "../ui/BadgeStatut";
import { formatDate } from "../../utils/date";
import { SkeletonRow } from "../ui/SkeletonRow";

export default function UtilisateursTable({ utilisateursFiltres, loading, handleSupprimer, handleReactiver, handleDesactiver }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {["Utilisateur", "Type", "Statut", "Date création", "Actions"].map((h, i) => (
                <th key={h} className={`px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide ${i === 4 ? "text-center" : "text-left"}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading
              ? [1, 2, 3].map((i) => <SkeletonRow key={i} cols={5} />)
              : utilisateursFiltres.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-green-700 font-bold text-xs">{(u.prenom ?? "?")[0].toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{u.prenom} {u.nom}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">{typeBadge(u.typeUtilisateur)}</td>
                    <td className="px-5 py-4">{statutBadge(u.statutUtilisateur)}</td>
                    <td className="px-5 py-4 text-gray-500 text-xs">{formatDate(u.dateCreation)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {u.statutUtilisateur === "ACTIF" ? (
                          <>
                            <button onClick={() => handleSupprimer(u.id)} className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition" title="Supprimer">
                              <Icon name="trash" className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDesactiver(u.id)} className="p-1.5 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition" title="Désactiver">
                              <Icon name="close" className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <button onClick={() => handleReactiver(u.id)} className="p-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition" title="Réactiver">
                            <Icon name="check" className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
        {!loading && utilisateursFiltres.length === 0 && (
          <div className="py-12 text-center text-gray-400 text-sm">Aucun utilisateur trouvé</div>
        )}
      </div>
    </div>
  );
}
