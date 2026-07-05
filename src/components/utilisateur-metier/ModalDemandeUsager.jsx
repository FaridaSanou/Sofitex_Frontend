import { useState } from "react";
import { Icon } from "../ui/Icon";

export default function ModalDemandeUsager({ demande, onClose, onAccepter, onRejeter }) {
  const [action, setAction] = useState("accept");
  const [motifRejet, setMotifRejet] = useState("");

  const dejaTraitee = demande.statut !== "EN_COURS" && demande.statutDemande !== "EN_COURS";

  const handleSubmit = () => {
    if (action === "accept") {
      onAccepter(demande.id || demande.idDemande);
    } else {
      if (!motifRejet.trim()) return;
      onRejeter(demande.id || demande.idDemande, motifRejet.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="bg-green-800 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center">
          <h3 className="font-bold text-lg">
            Demande de {(demande.type || demande.typeDemande) === "MODIFICATION" ? "Modification" : "Suppression"}
          </h3>
          <button onClick={onClose} className="text-green-200 hover:text-white"><Icon name="close" className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-green-50 rounded-xl p-4 space-y-2 text-sm">
            <p><span className="font-semibold text-green-800">Usager :</span> {demande.usager || demande.usagerNom}</p>
            <p><span className="font-semibold text-green-800">Donnée concernée :</span> {demande.traitement || demande.traitementNom || demande.donneeValeur}</p>
            <p><span className="font-semibold text-green-800">Détail :</span> {demande.detail || demande.descriptionDemande}</p>
            {demande.nouvelleValeur && (
              <p><span className="font-semibold text-green-800">Nouvelle valeur demandée :</span> {demande.nouvelleValeur}</p>
            )}
          </div>

          {dejaTraitee ? (
            <div className={`rounded-xl p-4 text-sm ${demande.statut === "ACCEPTEE" ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
              <p className="font-semibold mb-1">
                {demande.statut === "ACCEPTEE" ? "Demande déjà acceptée" : "Demande déjà rejetée"}
              </p>
              {demande.reponse && <p>{demande.reponse}</p>}
              {demande.motifRejet && <p>Motif : {demande.motifRejet}</p>}
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Action</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setAction("accept")}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold border-2 transition ${action === "accept" ? "bg-green-700 text-white border-green-700" : "border-gray-200 text-gray-600 hover:border-green-500"
                      }`}
                  >
                    <Icon name="check" className="w-4 h-4 mr-1.5 inline" /> Accepter
                  </button>
                  <button
                    type="button"
                    onClick={() => setAction("reject")}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold border-2 transition ${action === "reject" ? "bg-red-600 text-white border-red-600" : "border-gray-200 text-gray-600 hover:border-red-500"
                      }`}
                  >
                    <Icon name="close" className="w-4 h-4 mr-1.5 inline" /> Rejeter
                  </button>
                </div>
              </div>

              {action === "reject" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Motif du rejet <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={motifRejet}
                    onChange={e => setMotifRejet(e.target.value)}
                    placeholder="Raison du rejet..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              )}

              {action === "accept" && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-700 flex items-start gap-2">
                  <Icon name="check" className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>La demande sera acceptée et l'usager recevra une notification automatique.</span>
                </div>
              )}

              <div className="flex gap-3 justify-end pt-2">
                <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50">
                  Annuler
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={action === "reject" && !motifRejet.trim()}
                  className={`px-4 py-2 rounded-lg text-white text-sm font-semibold disabled:opacity-40 ${action === "reject" ? "bg-red-600 hover:bg-red-700" : "bg-green-700 hover:bg-green-800"
                    }`}
                >
                  <Icon name="check" className="w-4 h-4 mr-1.5 inline" />
                  {action === "reject" ? "Rejeter la demande" : "Accepter la demande"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}