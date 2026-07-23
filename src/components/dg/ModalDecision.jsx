import { useState } from "react";
import { Icon } from "../ui/Icon";
import { BadgeStatut } from "../ui/BadgeStatut";
import { formatDate } from "../../utils/date";

const TYPE_LABELS = {
  NORMALE: "Normale",
  AUTORISATION: "Autorisation",
  COLLECTE_SITE: "Collecte site",
  VIDEO_SURVEILLANCE: "Vidéosurveillance",
};

export default function ModalDecision({ declaration, onClose, onValider, onRejeter }) {
  const [commentaire, setCommentaire] = useState("");
  const [action, setAction] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!action) return;
    setLoading(true);
    try {
      if (action === "VALIDE") {
        await onValider(declaration.idDeclaration);
      } else {
        await onRejeter(declaration.idDeclaration, commentaire);
      }
      onClose();
    } catch { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
        <div className="bg-green-900 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center flex-shrink-0">
          <div>
            <h3 className="font-bold text-lg">Décision sur la déclaration</h3>
            <p className="text-green-300 text-xs">#{declaration.idDeclaration} — {declaration.traitementDescription || declaration.typeDeclaration}</p>
          </div>
           <button onClick={onClose} className="text-green-300 hover:text-white">
            <Icon name="close" className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-sm overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 font-semibold mb-0.5">Type</p>
              <p className="font-medium text-gray-800">{TYPE_LABELS[declaration.typeDeclaration] || declaration.typeDeclaration || "—"}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 font-semibold mb-0.5">Statut</p>
              <BadgeStatut statut={declaration.statut} />
            </div>
            <div className="bg-gray-50 rounded-xl p-3 col-span-2">
              <p className="text-xs text-gray-400 font-semibold mb-0.5">Dénomination</p>
              <p className="text-gray-800">{declaration.traitementDescription || "—"}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 font-semibold mb-0.5">Secteur</p>
              <p className="text-gray-800">{declaration.secteur || "—"}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 font-semibold mb-0.5">Date soumission</p>
              <p className="text-gray-800">{formatDate(declaration.dateSoumission)}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 font-semibold mb-0.5">Responsable</p>
              <p className="text-gray-800">{declaration.responsableDeclaration || "—"}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 font-semibold mb-0.5">Contact confidentialité</p>
              <p className="text-gray-800">{declaration.contactConfidentialite || "—"}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 font-semibold mb-0.5">DPO responsable</p>
              <p className="text-gray-800">{declaration.dpoNomPrenom || "—"}</p>
            </div>
          </div>

          {declaration.statut === "EN_ATTENTE" && (
            <>
              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">Votre décision <span className="text-red-500">*</span></p>
                <div className="flex gap-3">
                  <button onClick={() => setAction("VALIDE")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all shadow-sm ${action === "VALIDE" ? "bg-green-700 text-white shadow-md ring-2 ring-green-300" : "bg-green-50 text-green-700 hover:bg-green-100 active:bg-green-200"}`}>
                    <Icon name="check" className="w-5 h-5" /> Valider
                  </button>
                  <button onClick={() => setAction("REJETE")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all shadow-sm ${action === "REJETE" ? "bg-red-600 text-white shadow-md ring-2 ring-red-300" : "bg-red-50 text-red-600 hover:bg-red-100 active:bg-red-200"}`}>
                    <Icon name="close" className="w-5 h-5" /> Rejeter
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Commentaire {action === "REJETE" && <span className="text-red-500">*</span>}
                </label>
                <textarea rows={3} value={commentaire} onChange={e => setCommentaire(e.target.value)}
                  placeholder={action === "REJETE" ? "Motif du rejet obligatoire..." : "Commentaire optionnel..."}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50">Annuler</button>
                <button onClick={handleConfirm} disabled={!action || (action === "REJETE" && !commentaire.trim())}
                  className={`px-5 py-2 rounded-lg text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all ${action === "REJETE" ? "bg-red-500 hover:bg-red-600" : "bg-green-700 hover:bg-green-800"}`}>
                  {action === "VALIDE" ? <><Icon name="check" className="w-4 h-4 mr-1.5" />Confirmer la validation</> : action === "REJETE" ? <><Icon name="close" className="w-4 h-4 mr-1.5" />Confirmer le rejet</> : "Choisir une décision"}
                </button>
              </div>
            </>
          )}

          {declaration.statut !== "EN_ATTENTE" && (
            <div className={`rounded-xl p-4 text-sm font-medium flex items-center gap-2 ${declaration.statut === "APPROUVEE_DG" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
              <Icon name={declaration.statut === "APPROUVEE_DG" ? "check" : "close"} className="w-4 h-4" />
              Cette déclaration a déjà été {declaration.statut === "APPROUVEE_DG" ? "validée" : "rejetée"}.
              <button onClick={onClose} className="ml-auto underline text-xs">Fermer</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
