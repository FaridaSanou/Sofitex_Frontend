import { useState } from "react";
import { BadgeStatut } from "../ui/BadgeStatut";
import { formatDateTime } from "../../utils/date";
import api from "../../services/api";

export default function UMSessionsSection({ sessions, traitements, onDetailTraitement }) {
  const [selectedSessionDetail, setSelectedSessionDetail] = useState(null);
  const [sessionTraitements, setSessionTraitements] = useState([]);
  const [loadingSession, setLoadingSession] = useState(false);

  const handleToggleSession = (s) => {
    if (selectedSessionDetail?.idSession === s.idSession) {
      setSelectedSessionDetail(null);
      setSessionTraitements([]);
      return;
    }
    setSelectedSessionDetail(s);
    setLoadingSession(true);
    api.get(`/traitements/session/${s.idSession}`)
      .then(res => setSessionTraitements(res.data))
      .catch(() => {
        const local = traitements.filter(t => t.sessionCollecteId === Number(s.idSession));
        setSessionTraitements(local);
      })
      .finally(() => setLoadingSession(false));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Sessions de collecte ({sessions.length})</h2>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-green-50 text-green-800">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Nom</th>
                <th className="px-4 py-3 text-left font-semibold">Type</th>
                <th className="px-4 py-3 text-left font-semibold">Dates</th>
                <th className="px-4 py-3 text-left font-semibold">Statut</th>
                <th className="px-4 py-3 text-left font-semibold">DPO</th>
                <th className="px-4 py-3 text-center font-semibold">Traitements</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sessions.map(s => {
                const nbTraitements = s.nombreTraitements ?? 0;
                return (
                  <tr key={s.idSession} className="hover:bg-green-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800">{s.nomSession || s.description || `Session #${s.idSession}`}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{s.typeCollecte === "EN_LIGNE" ? "En ligne" : "Terrain"}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      <p>Du {formatDateTime(s.dateDebut)}</p>
                      <p>Au {formatDateTime(s.dateFin)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s.statutSession === "EN_COURS" ? "bg-green-100 text-green-700" : s.statutSession === "TERMINEE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {s.statutSession === "EN_COURS" ? "En cours" : s.statutSession === "TERMINEE" ? "Terminée" : "Annulée"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{s.dpoNomComplet || "—"}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => handleToggleSession(s)}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200">
                        {nbTraitements} traitement{nbTraitements !== 1 ? "s" : ""} {selectedSessionDetail?.idSession === s.idSession ? "▲" : "▼"}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {sessions.length === 0 && (
                <tr><td colSpan={6} className="py-12 text-center text-gray-400 text-sm">Aucune session de collecte</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedSessionDetail && (
        <div className="bg-white rounded-2xl shadow-sm border border-green-200 overflow-hidden">
          <div className="p-4 border-b border-green-100 bg-green-50 flex items-center gap-3">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {loadingSession ? "..." : sessionTraitements.length}
            </div>
            <div>
              <h3 className="font-bold text-green-800">Traitements liés à la session</h3>
              <p className="text-xs text-green-600">{selectedSessionDetail.description || `Session #${selectedSessionDetail.idSession}`}</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            {loadingSession ? (
              <div className="py-8 text-center text-gray-400 text-sm">Chargement...</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-500">Nom du traitement</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-500">Département</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-500">Statut</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-500">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sessionTraitements.map(t => (
                    <tr key={t.idTraitement} className="hover:bg-green-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">{t.description || t.nom || "—"}</p>
                        {t.texte && <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[250px]">{t.texte}</p>}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{t.department || "—"}</td>
                      <td className="px-4 py-3"><BadgeStatut statut={t.statut} envoyeAuDpo={t.envoyeAuDpo} /></td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => onDetailTraitement(t)} className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-200 font-medium">Voir détails</button>
                      </td>
                    </tr>
                  ))}
                  {sessionTraitements.length === 0 && (
                    <tr><td colSpan={4} className="py-8 text-center text-gray-400 text-sm">Aucun traitement lié à cette session</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
