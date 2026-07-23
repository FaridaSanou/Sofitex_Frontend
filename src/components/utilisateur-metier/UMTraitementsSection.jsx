import { Fragment } from "react";
import { Icon } from "../ui/Icon";
import { BadgeStatut } from "../ui/BadgeStatut";
import { formatDate } from "../../utils/date";

export default function UMTraitementsSection({
  traitementsFiltres, recherche, onRechercheChange,
  traitementFilterMode, setTraitementFilterMode, selectedSessionId, setSelectedSessionId,
  sessions, onNew, expandedTraitementId, onToggleExpand,
  traitementDonneesMap, traitementDonneesLoading, onDetail, onDonnees, onEnvoyer,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="p-5 border-b border-gray-100 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
          <h2 className="font-bold text-gray-800">Mes Traitements ({traitementsFiltres.length})</h2>
          <div className="flex gap-3 w-full sm:w-auto">
            <input value={recherche} onChange={e => onRechercheChange(e.target.value)} placeholder="Rechercher..."
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 flex-1 sm:w-48" />
            <button onClick={onNew} className="bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-800 whitespace-nowrap">+ Nouveau</button>
          </div>
        </div>
        <div className="flex gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Filtrer</label>
            <div className="flex gap-2">
              <button onClick={() => { setTraitementFilterMode("tous"); setSelectedSessionId(""); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${traitementFilterMode === "tous" ? "bg-green-700 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>Tous</button>
              <button onClick={() => setTraitementFilterMode("parSession")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${traitementFilterMode === "parSession" ? "bg-green-700 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>Par session</button>
            </div>
          </div>
          {traitementFilterMode === "parSession" && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Session</label>
              <select value={selectedSessionId} onChange={e => setSelectedSessionId(e.target.value)} className="h-8 px-2 rounded-lg border border-gray-300 text-xs">
                <option value="">Sélectionner...</option>
                {sessions.map(s => (<option key={s.idSession} value={s.idSession}>{s.nomSession || s.description || `Session #${s.idSession}`}</option>))}
              </select>
            </div>
          )}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-green-50 text-green-800">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">#</th>
               <th className="px-4 py-3 text-left font-semibold">Nom</th>
              <th className="px-4 py-3 text-left font-semibold">Département</th>
              <th className="px-4 py-3 text-left font-semibold">Conservation</th>
              <th className="px-4 py-3 text-left font-semibold">Date fin</th>
              <th className="px-4 py-3 text-left font-semibold">Statut</th>
              <th className="px-4 py-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {traitementsFiltres.map(t => (
              <tr key={t.idTraitement} className="hover:bg-green-50 transition-colors">
                <td className="px-4 py-3 text-gray-400 text-xs">#{t.idTraitement}</td>
                <td className="px-4 py-3 font-medium text-gray-800">{t.nom || t.description}</td>
                <td className="px-4 py-3 text-gray-600">{t.department}</td>
                <td className="px-4 py-3 text-gray-600">{t.dureeConservation ? `${t.dureeConservation} mois` : "—"}</td>
                <td className="px-4 py-3 text-gray-600">{formatDate(t.dateFin)}</td>
                <td className="px-4 py-3"><BadgeStatut statut={t.statut} envoyeAuDpo={t.envoyeAuDpo} /></td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={(e) => { e.stopPropagation(); onDetail(t); }} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-lg hover:bg-green-200">Voir</button>
                    <button onClick={(e) => { e.stopPropagation(); onDonnees(t); }} className="text-xs bg-green-600 text-white px-2 py-1 rounded-lg hover:bg-green-700 flex items-center gap-1">
                      <Icon name="upload" className="w-3.5 h-3.5" />Données
                    </button>
                    {!t.envoyeAuDpo && t.sessionCollecteId && (
                      <button onClick={(e) => { e.stopPropagation(); onEnvoyer(t.idTraitement); }} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-lg hover:bg-green-200 flex items-center gap-1">
                        <Icon name="send" className="w-3.5 h-3.5" />DPO
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {traitementsFiltres.length === 0 && (
          <div className="py-12 text-center text-gray-400 text-sm">
            <Icon name="clipboard" className="w-10 h-10 mb-2 mx-auto text-gray-300" />
            Aucun traitement trouvé
          </div>
        )}
      </div>
    </div>
  );
}
