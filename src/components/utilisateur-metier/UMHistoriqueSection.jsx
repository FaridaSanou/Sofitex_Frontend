import { Icon } from "../ui/Icon";
import { formatDate } from "../../utils/date";

export default function UMHistoriqueSection({ traitementsEnvoyesDpo, demandesTraitees, sessionsTerminees }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Historique</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-1.5"><Icon name="send" className="w-4 h-4" /> Traitements envoyés au DPO</h3>
          <div className="space-y-2">
            {traitementsEnvoyesDpo.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">Aucun traitement envoyé</p>
            )}
            {traitementsEnvoyesDpo.slice(0, 10).map(t => (
              <div key={t.idTraitement} className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                <div>
                  <p className="font-semibold text-sm text-gray-800">{t.description}</p>
                  <p className="text-xs text-gray-400">{t.department} · {formatDate(t.dateCreation)}</p>
                </div>
                <span className="text-xs text-green-600 font-medium flex items-center gap-1"><Icon name="send" className="w-3 h-3" />Envoyé</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-1.5"><Icon name="check" className="w-4 h-4" /> Demandes usagers traitées</h3>
          <div className="space-y-2">
            {demandesTraitees.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">Aucune demande traitée</p>
            )}
            {demandesTraitees.slice(0, 10).map(d => (
              <div key={d.id} className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                <div>
                  <p className="font-semibold text-sm text-gray-800">{d.usager || d.usagerNom}</p>
                  <p className="text-xs text-gray-400">{d.traitement || d.traitementNom} · {formatDate(d.date || d.dateDemande)}</p>
                </div>
                <span className="text-xs text-green-600 font-medium flex items-center gap-1"><Icon name="check" className="w-3 h-3" />Traité</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-1.5"><Icon name="calendar" className="w-4 h-4" /> Sessions de collecte terminées</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-gray-500 text-xs">Description</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-500 text-xs">Type</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-500 text-xs">Date fin</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-500 text-xs">DPO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sessionsTerminees.map(s => (
                <tr key={s.idSession} className="hover:bg-green-50">
                  <td className="px-4 py-2 font-medium text-gray-800">{s.description || `Session #${s.idSession}`}</td>
                  <td className="px-4 py-2 text-gray-600">{s.typeCollecte === "EN_LIGNE" ? "En ligne" : "Terrain"}</td>
                  <td className="px-4 py-2 text-xs text-gray-500">{formatDate(s.dateFin)}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{s.dpoNomComplet || "—"}</td>
                </tr>
              ))}
              {sessionsTerminees.length === 0 && (
                <tr><td colSpan={4} className="py-8 text-center text-gray-400 text-sm">Aucune session terminée</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
