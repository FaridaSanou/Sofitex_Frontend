import { useState, useEffect } from "react";
import { X, Plus, Database, Search } from "lucide-react";
import { formatDate } from "../../utils/date";
import api from "../../services/api";

export default function ModalDonneesTraitement({ traitement, onClose, onAjouterDonnees }) {
  const [donnees, setDonnees] = useState([]);
  const [recherche, setRecherche] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get("/donnees/par-traitement", { params: { traitementId: traitement.idTraitement } })
      .then(res => setDonnees(res.data))
      .catch(() => setDonnees([]))
      .finally(() => setLoading(false));
  }, [traitement.idTraitement]);

  const filtered = donnees.filter(d => !recherche
    || d.personneNomComplet?.toLowerCase().includes(recherche.toLowerCase())
    || d.typeDonneeNom?.toLowerCase().includes(recherche.toLowerCase())
    || d.valeur?.toLowerCase().includes(recherche.toLowerCase()));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-800">{traitement.description}</h2>
            <p className="text-xs text-gray-500">{traitement.department} · {donnees.length} donnée(s)</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
        </div>

        {donnees.length > 0 && (
          <div className="px-6 py-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={recherche} onChange={e => setRecherche(e.target.value)}
                placeholder="Rechercher dans les données..."
                className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <p className="text-center text-gray-400 text-sm py-8">Chargement...</p>
          ) : donnees.length === 0 ? (
            <div className="text-center py-8">
              <Database className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm mb-1">Aucune donnée associée à ce traitement</p>
              <p className="text-gray-400 text-xs">Ajoutez des données manuellement ou importez un fichier Excel.</p>
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">Aucune donnée trouvée</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-green-700 border-b border-green-200">
                  <th className="px-3 py-2 text-left font-semibold">Personne</th>
                  <th className="px-3 py-2 text-left font-semibold">Type</th>
                  <th className="px-3 py-2 text-left font-semibold">Valeur</th>
                  <th className="px-3 py-2 text-left font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(d => (
                  <tr key={d.idDonnee} className="hover:bg-green-50">
                    <td className="px-3 py-2 font-medium text-gray-800">{d.personneNomComplet || "—"}</td>
                    <td className="px-3 py-2 text-gray-600">{d.typeDonneeNom}</td>
                    <td className="px-3 py-2 text-gray-600">{d.valeur}</td>
                    <td className="px-3 py-2 text-xs text-gray-500">{formatDate(d.dateCollecte)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="border-t border-gray-100 px-6 py-4 flex justify-end">
          <button onClick={() => onAjouterDonnees(traitement)} className="flex items-center gap-2 px-5 py-2.5 bg-green-700 text-white rounded-xl text-sm font-semibold hover:bg-green-800 transition">
            <Plus className="w-4 h-4" /> Ajouter des données
          </button>
        </div>
      </div>
    </div>
  );
}
