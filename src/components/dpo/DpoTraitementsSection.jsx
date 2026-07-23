import { formatDateTime } from "../../utils/date";

export default function DpoTraitementsSection({
  traitementsToShow, traitementFilterMode, setTraitementFilterMode,
  selectedSessionId, setSelectedSessionId, sessions,
  onDetail, onCreateDeclaration,
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Traitements</h2>
      </div>
      <div className="flex gap-4 items-end">
        <div className="max-w-xs">
          <label className="block text-sm font-medium text-gray-700 mb-1">Filtrer</label>
          <div className="flex gap-2">
            <button onClick={() => { setTraitementFilterMode("tous"); setSelectedSessionId(""); }}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition ${traitementFilterMode === "tous" ? "bg-green-700 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>Tous</button>
            <button onClick={() => setTraitementFilterMode("parSession")}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition ${traitementFilterMode === "parSession" ? "bg-green-700 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>Par session</button>
          </div>
        </div>
        {traitementFilterMode === "parSession" && (
          <div className="max-w-xs">
            <label className="block text-sm font-medium text-gray-700 mb-1">Session de collecte</label>
            <select value={selectedSessionId} onChange={(e) => setSelectedSessionId(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm">
              <option value="">Sélectionner une session...</option>
                  {sessions.map((s) => (
                <option key={s.idSession} value={s.idSession}>
                  {s.nomSession || s.description || `Session #${s.idSession}`} - {s.typeCollecte}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Nom</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Département</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Session</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Données</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Date création</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {traitementsToShow.map((t) => (
                <tr key={t.idTraitement} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-gray-800">{t.nom || t.description || `Traitement #${t.idTraitement}`}</p>
                  </td>
                  <td className="px-5 py-4 text-gray-600 text-sm">{t.department || "—"}</td>
                  <td className="px-5 py-4 text-gray-600 text-sm">#{t.sessionCollecteId || "Sans session"}</td>
                  <td className="px-5 py-4">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">{t.nombreDonnee || 0}</span>
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-500">{formatDateTime(t.dateCreation)}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => onDetail(t)} className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200">Voir</button>
                      <button onClick={() => onCreateDeclaration(t)} className={`px-3 py-1 rounded-lg text-xs font-medium hover:bg-purple-200 ${t.declarationId ? "bg-amber-100 text-amber-700" : "bg-purple-100 text-purple-700"}`}>{t.declarationId ? "Modifier" : "Déclaration"}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {traitementsToShow.length === 0 && <div className="py-12 text-center text-gray-400 text-sm">Aucun traitement</div>}
        </div>
      </div>
    </div>
  );
}
