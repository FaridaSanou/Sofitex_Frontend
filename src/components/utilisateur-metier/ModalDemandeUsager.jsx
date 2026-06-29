import { useState } from "react";
import { Icon } from "../ui/Icon";

export default function ModalDemandeUsager({ demande, onClose, onTraiter }) {
  const [reponse, setReponse] = useState("");
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="bg-green-800 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center">
          <h3 className="font-bold text-lg">Demande de {demande.type === "MODIFICATION" ? "Modification" : "Suppression"}</h3>
          <button onClick={onClose} className="text-green-200 hover:text-white"><Icon name="close" className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-green-50 rounded-xl p-4 space-y-2 text-sm">
            <p><span className="font-semibold text-green-800">Usager :</span> {demande.usager || demande.usagerNom}</p>
            <p><span className="font-semibold text-green-800">Traitement concerné :</span> {demande.traitement || demande.traitementNom}</p>
            <p><span className="font-semibold text-green-800">Détail :</span> {demande.detail || demande.descriptionDemande}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Votre réponse / action</label>
            <textarea rows={3} value={reponse} onChange={e => setReponse(e.target.value)}
              placeholder="Décrivez l'action effectuée ou votre réponse à l'usager..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50">Annuler</button>
            <button onClick={() => { if (reponse.trim()) { onTraiter(demande.id, reponse); onClose(); } }}
              disabled={!reponse.trim()}
              className="px-4 py-2 rounded-lg bg-green-700 text-white text-sm font-semibold hover:bg-green-800 disabled:opacity-40">
              <Icon name="check" className="w-4 h-4 mr-1.5" /> Marquer comme traité
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
