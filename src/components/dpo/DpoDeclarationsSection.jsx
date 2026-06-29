import { formatDate } from "../../utils/date";
import { declarationStatutBadge } from "../ui/BadgeStatut";

export default function DpoDeclarationsSection({
  declarations, onNew, onDetail, onSoumettre,
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Déclarations</h2>
        <button onClick={onNew} className="px-4 py-2 bg-green-700 text-white rounded-xl text-sm font-medium hover:bg-green-800 transition">
          + Nouvelle déclaration
        </button>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">ID</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Dénomination</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Statut</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {declarations.map((d) => (
                <tr key={d.idDeclaration} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-4 font-mono text-xs text-gray-400">#{d.idDeclaration}</td>
                  <td className="px-5 py-4">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{d.typeDeclaration || "N/A"}</span>
                  </td>
                  <td className="px-5 py-4 font-medium text-gray-800">{d.traitementDescription || d.denominationTraitement || "—"}</td>
                  <td className="px-5 py-4 text-xs text-gray-500">{formatDate(d.dateSoumission)}</td>
                  <td className="px-5 py-4">{declarationStatutBadge(d.statut)}</td>
                  <td className="px-5 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => onDetail(d)} className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200">Voir</button>
                      {d.statut === "BROUILLON" && (
                        <button onClick={() => onSoumettre(d)} className="px-3 py-1 bg-green-700 text-white rounded-lg text-xs font-medium hover:bg-green-800">
                          Envoyer au DG
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {declarations.length === 0 && <div className="py-12 text-center text-gray-400 text-sm">Aucune déclaration</div>}
        </div>
      </div>
    </div>
  );
}
