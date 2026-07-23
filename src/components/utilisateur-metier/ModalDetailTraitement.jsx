import { useState } from "react";
import { Icon } from "../ui/Icon";
import { BadgeStatut } from "../ui/BadgeStatut";
import { formatDate } from "../../utils/date";
import { telechargerTraitementPdf } from "../../utils/pdf";

export default function ModalDetailTraitement({ traitement, onClose, onEnvoyer, dpos, onAjouterDonnees, onModifier, onSupprimer }) {
  const aUneSession = !!traitement.sessionCollecteId;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="bg-green-800 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center shrink-0">
          <h3 className="font-bold text-lg">Détail du traitement #{traitement.idTraitement}</h3>
          <button onClick={onClose} className="text-green-200 hover:text-white"><Icon name="close" className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-3 text-sm overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 rounded-lg p-3"><p className="text-xs text-green-600 font-semibold">Département</p><p className="font-medium">{traitement.department}</p></div>
            <div className="bg-green-50 rounded-lg p-3"><p className="text-xs text-green-600 font-semibold">Statut</p><BadgeStatut statut={traitement.statut} envoyeAuDpo={traitement.envoyeAuDpo} /></div>
            <div className="bg-green-50 rounded-lg p-3 col-span-2"><p className="text-xs text-green-600 font-semibold">Description</p><p>{traitement.description}</p></div>
            <div className="bg-green-50 rounded-lg p-3 col-span-2"><p className="text-xs text-green-600 font-semibold">Texte / Finalité</p><p>{traitement.texte}</p></div>
            <div className="bg-green-50 rounded-lg p-3"><p className="text-xs text-green-600 font-semibold">Certification sécurité</p><p>{traitement.certificationSecurite || "—"}</p></div>
            <div className="bg-green-50 rounded-lg p-3"><p className="text-xs text-green-600 font-semibold">Conservation</p><p>{traitement.dureeConservation ? `${traitement.dureeConservation} mois` : "—"}</p></div>
            <div className="bg-green-50 rounded-lg p-3"><p className="text-xs text-green-600 font-semibold">Date création</p><p>{formatDate(traitement.dateCreation)}</p></div>
            <div className="bg-green-50 rounded-lg p-3"><p className="text-xs text-green-600 font-semibold">Date fin</p><p>{formatDate(traitement.dateFin)}</p></div>
            <div className="bg-green-50 rounded-lg p-3"><p className="text-xs text-green-600 font-semibold">Nb données</p><p>{traitement.nombreDonnee}</p></div>
            <div className="bg-green-50 rounded-lg p-3"><p className="text-xs text-green-600 font-semibold">Session</p><p>#{traitement.sessionCollecteId || "Aucune"}</p></div>
          </div>
          <div className="flex gap-3 justify-end pt-2 flex-wrap">
            {!traitement.envoyeAuDpo && (
              <button onClick={() => { onModifier?.(traitement); onClose(); }}
                className="px-4 py-2 rounded-lg border border-green-600 text-green-700 text-sm font-semibold hover:bg-green-50">
                Modifier
              </button>
            )}
            <button onClick={() => { if (window.confirm(`Supprimer le traitement #${traitement.idTraitement} "${traitement.description}" ?`)) { onSupprimer?.(traitement.idTraitement); onClose(); } }}
              className="px-4 py-2 rounded-lg border border-red-400 text-red-600 text-sm font-semibold hover:bg-red-50">
              Supprimer
            </button>
            <button onClick={() => telechargerTraitementPdf(traitement)} className="px-4 py-2 rounded-lg bg-green-700 text-white text-sm font-medium hover:bg-green-800">Télécharger PDF</button>
            <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50">Fermer</button>
            {!traitement.envoyeAuDpo && (
              <button onClick={() => { onEnvoyer(traitement.idTraitement); onClose(); }}
                className="px-4 py-2 rounded-lg bg-green-700 text-white text-sm font-semibold hover:bg-green-800">
                <Icon name="send" className="w-4 h-4 mr-1.5" /> Envoyer au DPO
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
