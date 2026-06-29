import { formatDate } from "../../utils/date";
import { demandeStatutBadge } from "../ui/BadgeStatut";

export default function DpoDemandesSection({ demandes, demandesEnAttente }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Demandes des usagers</h2>
        {demandesEnAttente > 0 && (
          <span className="bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1 rounded-full">
            {demandesEnAttente} en attente
          </span>
        )}
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Usager</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Description</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Statut</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Traité par</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {demandes.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-4 font-medium text-gray-800">{d.usagerNom || d.usager || "—"}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${d.type === "MODIFICATION" || d.typeDemande === "MODIFICATION" ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"}`}>
                      {d.type || d.typeDemande || "—"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-600 text-sm max-w-xs truncate">{d.descriptionDemande || d.detail || "—"}</td>
                  <td className="px-5 py-4 text-xs text-gray-500">{formatDate(d.dateDemande || d.date)}</td>
                  <td className="px-5 py-4">{demandeStatutBadge(d.statut || d.statutDemande)}</td>
                  <td className="px-5 py-4 text-sm text-gray-600">{d.utilisateurMetierNom || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {demandes.length === 0 && <div className="py-12 text-center text-gray-400 text-sm">Aucune demande</div>}
        </div>
      </div>
    </div>
  );
}
