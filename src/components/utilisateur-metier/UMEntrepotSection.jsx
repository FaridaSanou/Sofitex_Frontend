import { formatDate } from "../../utils/date";

export default function UMEntrepotSection({ entrepotData, entrepotRecherche, onRechercheChange }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Entrepôt de données</h2>
      <p className="text-sm text-gray-500 mb-3">Toutes les données collectées.</p>
      <div className="mb-3">
        <input value={entrepotRecherche} onChange={e => onRechercheChange(e.target.value)}
          placeholder="Rechercher dans l'entrepôt..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
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
              {entrepotData
                .filter(d => !entrepotRecherche || d.personneNomComplet?.toLowerCase().includes(entrepotRecherche.toLowerCase()) || d.typeDonneeNom?.toLowerCase().includes(entrepotRecherche.toLowerCase()) || d.valeur?.toLowerCase().includes(entrepotRecherche.toLowerCase()))
                .slice(0, 20)
                .map(d => (
                <tr key={d.idDonnee} className="hover:bg-green-50">
                  <td className="px-4 py-2 font-medium text-gray-800">{d.personneNomComplet || "—"}</td>
                  <td className="px-4 py-2 text-gray-600">{d.typeDonneeNom}</td>
                  <td className="px-4 py-2 text-gray-600">{d.valeur}</td>
                  <td className="px-4 py-2 text-xs text-gray-500">{formatDate(d.dateCollecte)}</td>
                </tr>
              ))}
              {entrepotData.length === 0 && (
                <tr><td colSpan={4} className="py-8 text-center text-gray-400 text-sm">Aucune donnée dans l'entrepôt</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
