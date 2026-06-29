import { useState } from "react";
import { Icon } from "../ui/Icon";
import { BadgeStatut } from "../ui/BadgeStatut";
import { formatDate } from "../../utils/date";

export default function ModalDetailTraitement({ traitement, onClose, onEnvoyer, dpos, onAjouterDonnees }) {
  const [dpoSelection, setDpoSelection] = useState("");
  const aUneSession = !!traitement.sessionCollecteId;
  const dpoRequis = !aUneSession && dpos && dpos.length > 0;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="bg-green-800 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center">
          <h3 className="font-bold text-lg">Détail du traitement #{traitement.idTraitement}</h3>
          <button onClick={onClose} className="text-green-200 hover:text-white"><Icon name="close" className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 rounded-lg p-3"><p className="text-xs text-green-600 font-semibold">Département</p><p className="font-medium">{traitement.department}</p></div>
            <div className="bg-green-50 rounded-lg p-3"><p className="text-xs text-green-600 font-semibold">Statut</p><BadgeStatut statut={traitement.statut} envoyeAuDpo={traitement.envoyeAuDpo} /></div>
            <div className="bg-green-50 rounded-lg p-3 col-span-2"><p className="text-xs text-green-600 font-semibold">Description</p><p>{traitement.description}</p></div>
            <div className="bg-green-50 rounded-lg p-3 col-span-2"><p className="text-xs text-green-600 font-semibold">Texte / Finalité</p><p>{traitement.texte}</p></div>
            <div className="bg-green-50 rounded-lg p-3"><p className="text-xs text-green-600 font-semibold">Certification sécurité</p><p>{traitement.certificationSecurite}</p></div>
            <div className="bg-green-50 rounded-lg p-3"><p className="text-xs text-green-600 font-semibold">Conservation</p><p>{traitement.dureeConservation} mois</p></div>
            <div className="bg-green-50 rounded-lg p-3"><p className="text-xs text-green-600 font-semibold">Date création</p><p>{formatDate(traitement.dateCreation)}</p></div>
            <div className="bg-green-50 rounded-lg p-3"><p className="text-xs text-green-600 font-semibold">Date fin</p><p>{formatDate(traitement.dateFin)}</p></div>
            <div className="bg-green-50 rounded-lg p-3"><p className="text-xs text-green-600 font-semibold">Nb données</p><p>{traitement.nombreDonnee}</p></div>
            <div className="bg-green-50 rounded-lg p-3"><p className="text-xs text-green-600 font-semibold">Session</p><p>#{traitement.sessionCollecteId || "Aucune"}</p></div>
          </div>
          {dpoRequis && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
              <label className="block text-sm font-semibold text-yellow-800 mb-1">Sélectionnez un DPO <span className="text-red-500">*</span></label>
              <p className="text-xs text-yellow-600 mb-2">Ce traitement n'est lié à aucune session. Veuillez choisir un DPO destinataire.</p>
              <select value={dpoSelection} onChange={e => setDpoSelection(e.target.value)} className="w-full border border-yellow-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="">-- Sélectionner un DPO --</option>
                {dpos.map(d => (<option key={d.dpoId} value={d.dpoId}>{d.dpoNomComplet}</option>))}
              </select>
            </div>
          )}
          {!aUneSession && (!dpos || dpos.length === 0) && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-sm text-red-700">Aucun DPO disponible. Ce traitement n'a pas de session, créez d'abord une session de collecte.</p>
            </div>
          )}
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50">Fermer</button>
            <button onClick={() => { onAjouterDonnees(traitement); onClose(); }} className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700">
              <Icon name="upload" className="w-4 h-4 mr-1.5" /> Ajouter des données
            </button>
            {!traitement.envoyeAuDpo && (
              <button onClick={() => { const dpoId = dpoRequis ? Number(dpoSelection) : undefined; if (dpoRequis && !dpoSelection) return; onEnvoyer(traitement.idTraitement, dpoId); onClose(); }}
                disabled={dpoRequis && !dpoSelection}
                className="px-4 py-2 rounded-lg bg-green-700 text-white text-sm font-semibold hover:bg-green-800 disabled:opacity-40 disabled:cursor-not-allowed">
                <Icon name="send" className="w-4 h-4 mr-1.5" /> Envoyer au DPO
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
