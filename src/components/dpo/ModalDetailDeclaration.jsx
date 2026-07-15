import { formatDate } from "../../utils/date";
import { telechargerDeclarationPdf } from "../../utils/pdf";

export default function ModalDetailDeclaration({ declaration, onClose, onModifier, onSupprimer }) {
  if (!declaration) return null;
  const Row = ({ label, value }) => (
    <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-500 font-semibold">{label}</p><p className="font-medium text-sm">{value || "—"}</p></div>
  );
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="bg-green-800 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center sticky top-0 z-10">
          <h3 className="font-bold text-lg">Déclaration #{declaration.idDeclaration}</h3>
          <button onClick={onClose} className="text-green-200 hover:text-white text-2xl leading-none">✕</button>
        </div>
        <div className="p-6 space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <Row label="Type" value={declaration.typeDeclaration} />
            <Row label="Statut" value={declaration.statut} />
            <div className="col-span-2"><Row label="Traitement" value={declaration.traitementDescription || declaration.denominationTraitement} /></div>
            <Row label="Date de soumission" value={formatDate(declaration.dateSoumission)} />
            <Row label="Secteur" value={declaration.secteur} />
            <Row label="Responsable" value={declaration.responsableDeclaration} />
            <Row label="Contact confidentialité" value={declaration.contactConfidentialite} />
            <Row label="Conservation" value={declaration.dureeConservation} />
            <Row label="Lieu de stockage" value={declaration.lieuStockage} />
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => telechargerDeclarationPdf(declaration)} className="flex-1 px-4 py-2 rounded-lg bg-green-700 text-white text-sm font-medium hover:bg-green-800">Télécharger PDF</button>
            {declaration.statut === "BROUILLON" && onModifier && (
              <button onClick={() => { onModifier(declaration); onClose(); }} className="px-4 py-2 rounded-lg border border-green-600 text-green-700 text-sm font-semibold hover:bg-green-50">Modifier</button>
            )}
            {onSupprimer && (
              <button onClick={() => { if (window.confirm(`Supprimer la déclaration #${declaration.idDeclaration} ?`)) { onSupprimer(declaration.idDeclaration); onClose(); } }} className="px-4 py-2 rounded-lg border border-red-400 text-red-600 text-sm font-semibold hover:bg-red-50">Supprimer</button>
            )}
            <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50">Fermer</button>
          </div>
        </div>
      </div>
    </div>
  );
}
