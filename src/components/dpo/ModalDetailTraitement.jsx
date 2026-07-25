import { useState } from "react";
import { formatDate } from "../../utils/date";
import { BadgeStatut } from "../ui/BadgeStatut";
import { telechargerTraitementPdf } from "../../utils/pdf";

const steps = ["Traitement", "Détails & Conformité", "Responsable"];

export default function ModalDetailTraitement({ traitement, onClose }) {
  const [etape, setEtape] = useState(1);
  if (!traitement) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="bg-green-800 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center shrink-0">
          <h3 className="font-bold text-lg">Détail du traitement #{traitement.idTraitement}</h3>
          <button onClick={onClose} className="text-green-200 hover:text-white text-2xl leading-none">✕</button>
        </div>

        <div className="px-6 pt-6 pb-0">
          <div className="flex items-center justify-between relative mb-2">
            {steps.map((s, i) => {
              const stepNum = i + 1;
              const isCompleted = stepNum < etape;
              const isActive = stepNum === etape;
              return (
                <div key={i} className="flex flex-col items-center relative z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${isCompleted ? "bg-green-600 text-white shadow-md" : isActive ? "bg-green-600 text-white shadow-lg animate-pulse" : "bg-white border-2 border-gray-300 text-gray-400"}`}>
                    {isCompleted ? (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>) : stepNum}
                  </div>
                  <span className={`text-xs mt-2 font-medium ${isActive ? "text-[#1e293b]" : "text-gray-400"}`}>{s}</span>
                </div>
              );
            })}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-0" style={{ transform: 'translateY(-50%)' }}>
              <div className="h-full bg-green-600 transition-all duration-500" style={{ width: `${((etape - 1) / (steps.length - 1)) * 100}%` }} />
            </div>
          </div>
        </div>

        <hr className="border-t border-gray-200 my-4 mx-6" />

        <div className="px-6 space-y-4 text-sm overflow-y-auto flex-1">
          {etape === 1 && (
            <div className="bg-green-50 rounded-xl p-4 border border-green-100">
              <h4 className="font-bold text-green-800 mb-3">Informations du Traitement</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-lg p-3"><p className="text-xs text-green-600 font-semibold">Nom</p><p className="font-medium">{traitement.nom || traitement.description || "—"}</p></div>
                <div className="bg-white rounded-lg p-3"><p className="text-xs text-green-600 font-semibold">Finalité</p><p className="font-medium">{traitement.texte || "—"}</p></div>
                <div className="bg-white rounded-lg p-3"><p className="text-xs text-green-600 font-semibold">Dénomination</p><p>{traitement.denomination || "—"}</p></div>
                <div className="bg-white rounded-lg p-3"><p className="text-xs text-green-600 font-semibold">Statut</p><BadgeStatut statut={traitement.statut} envoyeAuDpo={traitement.envoyeAuDpo} /></div>
                <div className="bg-white rounded-lg p-3 col-span-2"><p className="text-xs text-green-600 font-semibold">Date mise en œuvre</p><p>{traitement.dateMiseEnOeuvre || "—"}</p></div>
              </div>
            </div>
          )}

          {etape === 2 && (
            <div className="bg-green-50 rounded-xl p-4 border border-green-100">
              <h4 className="font-bold text-green-800 mb-3">Détails & Conformité</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-lg p-3"><p className="text-xs text-green-600 font-semibold">Conservation</p><p>{traitement.dureeConservation ? `${traitement.dureeConservation} mois` : "—"}</p></div>
                <div className="bg-white rounded-lg p-3"><p className="text-xs text-green-600 font-semibold">Nb personnes</p><p>{traitement.nombrePersonnesConcernees || "—"}</p></div>
                <div className="bg-white rounded-lg p-3"><p className="text-xs text-green-600 font-semibold">Catégorie personnes</p><p>{traitement.categoriesDonnees || "—"}</p></div>
                <div className="bg-white rounded-lg p-3"><p className="text-xs text-green-600 font-semibold">Origine données</p><p>{traitement.origineDonnees || "—"}</p></div>
                <div className="bg-white rounded-lg p-3"><p className="text-xs text-green-600 font-semibold">Lieu stockage</p><p>{traitement.lieuStockage || "—"}</p></div>
                <div className="bg-white rounded-lg p-3"><p className="text-xs text-green-600 font-semibold">Session</p><p>{traitement.sessionCollecteId ? `#${traitement.sessionCollecteId}` : "Aucune session"}</p></div>
              </div>
            </div>
          )}

          {etape === 3 && (
            <div className="bg-green-50 rounded-xl p-4 border border-green-100">
              <h4 className="font-bold text-green-800 mb-3">Responsable du Traitement</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-lg p-3"><p className="text-xs text-green-600 font-semibold">Nom complet</p><p>{traitement.nomPrenomResponsable || "—"}</p></div>
                <div className="bg-white rounded-lg p-3"><p className="text-xs text-green-600 font-semibold">Département</p><p>{traitement.department || "—"}</p></div>
                <div className="bg-white rounded-lg p-3"><p className="text-xs text-green-600 font-semibold">Fonction</p><p>{traitement.fonctionResponsable || "—"}</p></div>
                <div className="bg-white rounded-lg p-3"><p className="text-xs text-green-600 font-semibold">Email</p><p>{traitement.contactConfidentialite || "—"}</p></div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 pb-6 flex justify-between items-center border-t border-gray-200 pt-4 mt-4 shrink-0">
          <button onClick={() => etape > 1 ? setEtape(e => e - 1) : onClose()}
            className="px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-600 text-sm font-medium hover:bg-green-50 hover:border-green-300 transition-all">
            ← Précédent
          </button>
          {etape < steps.length ? (
            <button onClick={() => setEtape(e => e + 1)}
              className="px-6 py-2.5 rounded-lg bg-green-600 text-white text-sm font-bold hover:bg-green-700 transition-all shadow-sm">
              Suivant →
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => telechargerTraitementPdf(traitement)} className="px-4 py-2.5 rounded-lg bg-green-700 text-white text-sm font-medium hover:bg-green-800">Télécharger PDF</button>
              <button onClick={onClose} className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50">Fermer</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}