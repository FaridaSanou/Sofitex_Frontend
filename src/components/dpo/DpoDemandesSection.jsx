import { useState } from "react";
import { formatDate } from "../../utils/date";
import { demandeStatutBadge } from "../ui/BadgeStatut";
import { Icon } from "../ui/Icon";

function ModalDetailDemande({ demande, onClose }) {
  if (!demande) return null;
  const estModification = (demande.typeDemande || demande.type) === "MODIFICATION";
  const dejaTraitee = (demande.statutDemande || demande.statut) !== "EN_COURS";
  const estAcceptee = (demande.statutDemande || demande.statut) === "ACCEPTEE";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="bg-green-800 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center sticky top-0 z-10">
          <div>
            <h3 className="font-bold text-lg">
              Demande {estModification ? "de modification" : "de suppression"}
            </h3>
            <p className="text-green-300 text-xs">#{demande.idDemande || demande.id}</p>
          </div>
          <button onClick={onClose} className="text-green-200 hover:text-white"><Icon name="close" className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 font-semibold">Usager</p>
              <p className="font-medium">{demande.usagerNomComplet || demande.usagerNom || demande.usager || "—"}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 font-semibold">Type</p>
              <p className="font-medium">{estModification ? "Modification" : "Suppression"}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 font-semibold">Date de la demande</p>
              <p>{formatDate(demande.dateDemande || demande.date)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 font-semibold">Statut</p>
              {demandeStatutBadge(demande.statutDemande || demande.statut)}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 font-semibold mb-1">Donnée concernée</p>
            <p>{demande.donneeValeur || demande.traitementNom || demande.traitement || "—"}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 font-semibold mb-1">Description</p>
            <p>{demande.descriptionDemande || demande.detail || "—"}</p>
          </div>

          {demande.nouvelleValeur && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-600 font-semibold mb-1">Nouvelle valeur demandée</p>
              <p className="text-blue-800">{demande.nouvelleValeur}</p>
            </div>
          )}

          {demande.utilisateurMetierNomComplet && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 font-semibold mb-1">Traité par</p>
              <p>{demande.utilisateurMetierNomComplet}</p>
            </div>
          )}

          {dejaTraitee && (
            <div className={`rounded-lg p-3 ${estAcceptee ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
              <p className={`font-semibold mb-1 ${estAcceptee ? "text-green-700" : "text-red-700"}`}>
                {estAcceptee ? "Demande acceptée" : "Demande rejetée"}
              </p>
              {demande.reponse && <p className={estAcceptee ? "text-green-600" : "text-red-600"}>{demande.reponse}</p>}
              {demande.motifRejet && <p className="text-red-600 mt-1">Motif : {demande.motifRejet}</p>}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50">
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DpoDemandesSection({ demandes, demandesEnAttente }) {
  const [selectedDemande, setSelectedDemande] = useState(null);

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
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {demandes.map((d) => (
                <tr key={d.idDemande || d.id} className="hover:bg-gray-50 transition cursor-pointer" onClick={() => setSelectedDemande(d)}>
                  <td className="px-5 py-4 font-medium text-gray-800">{d.usagerNomComplet || d.usagerNom || d.usager || "—"}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${(d.typeDemande || d.type) === "MODIFICATION" ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"}`}>
                      {d.typeDemande || d.type || "—"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-600 text-sm max-w-xs truncate">{d.descriptionDemande || d.detail || "—"}</td>
                  <td className="px-5 py-4 text-xs text-gray-500">{formatDate(d.dateDemande || d.date)}</td>
                  <td className="px-5 py-4">{demandeStatutBadge(d.statutDemande || d.statut)}</td>
                  <td className="px-5 py-4 text-center">
                    <button onClick={(e) => { e.stopPropagation(); setSelectedDemande(d); }}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200">
                      <Icon name="eye" className="w-3.5 h-3.5 mr-1 inline" /> Voir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {demandes.length === 0 && <div className="py-12 text-center text-gray-400 text-sm">Aucune demande</div>}
        </div>
      </div>

      {selectedDemande && <ModalDetailDemande demande={selectedDemande} onClose={() => setSelectedDemande(null)} />}
    </div>
  );
}
