import { Icon } from "../ui/Icon";
import { formatDate } from "../../utils/date";

export default function UMDemandesSection({ demandes, demandesEnAttente, onTraiter }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="p-5 border-b border-gray-100 flex justify-between items-center">
        <h2 className="font-bold text-gray-800">Demandes des Usagers ({demandes.length})</h2>
        {demandesEnAttente > 0 && (
          <span className="bg-red-100 text-red-700 text-xs font-semibold px-3 py-1 rounded-full">{demandesEnAttente} en attente</span>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-green-50 text-green-800">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Usager</th>
              <th className="px-4 py-3 text-left font-semibold">Type</th>
              <th className="px-4 py-3 text-left font-semibold">Traitement concerné</th>
              <th className="px-4 py-3 text-left font-semibold">Date</th>
              <th className="px-4 py-3 text-left font-semibold">Statut</th>
              <th className="px-4 py-3 text-left font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {demandes.map(d => (
              <tr key={d.id} className="hover:bg-green-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-800">{d.usager || d.usagerNom}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${(d.type === "MODIFICATION" || d.typeDemande === "MODIFICATION") ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"}`}>
                    {(d.type === "MODIFICATION" || d.typeDemande === "MODIFICATION")
                      ? <><Icon name="edit" className="w-3.5 h-3.5" />Modification</>
                      : <><Icon name="trash" className="w-3.5 h-3.5" />Suppression</>}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{d.traitement || d.traitementNom}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(d.date || d.dateDemande)}</td>
                <td className="px-4 py-3">
                  {(d.statut === "EN_ATTENTE" || d.statutDemande === "EN_ATTENTE")
                    ? <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit"><Icon name="clock" className="w-3 h-3" />En attente</span>
                    : <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit"><Icon name="check" className="w-3 h-3" />Traité</span>
                  }
                </td>
                <td className="px-4 py-3">
                  {(d.statut === "EN_ATTENTE" || d.statutDemande === "EN_ATTENTE") ? (
                    <button onClick={() => onTraiter(d)} className="text-xs bg-green-700 text-white px-3 py-1 rounded-lg hover:bg-green-800">Traiter</button>
                  ) : (
                    <span className="text-gray-400 text-xs flex items-center gap-1"><Icon name="check" className="w-3 h-3" />Traité</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {demandes.length === 0 && (
          <div className="py-12 text-center text-gray-400 text-sm">Aucune demande</div>
        )}
      </div>
    </div>
  );
}
