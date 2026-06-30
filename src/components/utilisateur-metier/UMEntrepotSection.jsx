import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { formatDate } from "../../utils/date";
import ModalAjouterDonnees from "./ModalAjouterDonnees";

export default function UMEntrepotSection({ entrepotData, entrepotRecherche, onRechercheChange, traitements, onAjouterDonnees }) {
  const [showAjout, setShowAjout] = useState(false);
  const [selectedTraitement, setSelectedTraitement] = useState("");

  const defaultId = traitements.length === 1 ? String(traitements[0].idTraitement) : "";
  const resolvedId = selectedTraitement || defaultId;
  const filtered = entrepotData.filter(d => !entrepotRecherche
    || d.personneNomComplet?.toLowerCase().includes(entrepotRecherche.toLowerCase())
    || d.typeDonneeNom?.toLowerCase().includes(entrepotRecherche.toLowerCase())
    || d.valeur?.toLowerCase().includes(entrepotRecherche.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Entrepôt de données</h2>
        <button onClick={() => setShowAjout(true)} className="flex items-center gap-2 px-4 py-2 bg-green-700 text-white rounded-xl text-sm font-semibold hover:bg-green-800 transition">
          <Plus className="w-4 h-4" /> Ajouter des données
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={entrepotRecherche} onChange={e => onRechercheChange(e.target.value)}
          placeholder="Rechercher une donnée (nom, type, valeur...)"
          className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-green-50 text-green-800">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Personne</th>
                <th className="px-4 py-2 text-left font-semibold">Type</th>
                <th className="px-4 py-2 text-left font-semibold">Valeur</th>
                <th className="px-4 py-2 text-left font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.slice(0, 50).map(d => (
                <tr key={d.idDonnee} className="hover:bg-green-50">
                  <td className="px-4 py-2 font-medium text-gray-800">{d.personneNomComplet || "—"}</td>
                  <td className="px-4 py-2 text-gray-600">{d.typeDonneeNom}</td>
                  <td className="px-4 py-2 text-gray-600">{d.valeur}</td>
                  <td className="px-4 py-2 text-xs text-gray-500">{formatDate(d.dateCollecte)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={4} className="py-12 text-center text-gray-400 text-sm">Aucune donnée trouvée</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAjout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowAjout(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Ajouter des données</h3>
            {traitements.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">Créez d'abord un traitement.</p>
            ) : (
              <>
                {traitements.length > 1 && (
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Traitement destinataire</label>
                    <select value={resolvedId} onChange={e => setSelectedTraitement(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                      <option value="">-- Sélectionner --</option>
                      {traitements.map(t => (<option key={t.idTraitement} value={t.idTraitement}>{t.description || t.nom || `#${t.idTraitement}`}</option>))}
                    </select>
                  </div>
                )}
                <div className="space-y-3">
                  <button onClick={() => { if (resolvedId) { const t = traitements.find(t => t.idTraitement === Number(resolvedId)); if (t) { setShowAjout(false); onAjouterDonnees(t); } } }} disabled={!resolvedId} className="w-full py-3 bg-[#F0FDF4] border border-green-500 rounded-xl text-green-800 font-semibold text-sm hover:bg-green-100 disabled:opacity-40">Saisie manuelle</button>
                  <button onClick={() => { if (resolvedId) { const t = traitements.find(t => t.idTraitement === Number(resolvedId)); if (t) { setShowAjout(false); onAjouterDonnees(t); } } }} disabled={!resolvedId} className="w-full py-3 bg-[#F0FDF4] border border-green-500 rounded-xl text-green-800 font-semibold text-sm hover:bg-green-100 disabled:opacity-40">Import Excel</button>
                </div>
              </>
            )}
            <button onClick={() => setShowAjout(false)} className="w-full mt-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
}
