import { Icon } from "../ui/Icon";
import { statutBadge } from "../ui/BadgeStatut";
import { formatDate } from "../../utils/date";

export default function DetailModal({ demande, onClose }) {
  const nomComplet = `${demande.prenom ?? ""} ${demande.nom ?? ""}`.trim();
  const fields = [
    ["Nom complet", nomComplet],
    ["Email", demande.email ?? "—"],
    ["Type", demande.typeUtilisateur ?? "—"],
    ["Téléphone", demande.telephone ?? "—"],
    ["Ville", demande.ville ?? "—"],
    ["Organisme", demande.organisme ?? "—"],
    ["Fonction", demande.fonction ?? "—"],
    ["Date de demande", formatDate(demande.dateDemande)],
    ["Date de validation", formatDate(demande.dateValidation)],
    ["Motif de rejet", demande.motif ?? "—"],
    ["Admin traitant", demande.adminTraitantNom ?? "—"],
    ["Departement", demande.departement ?? "—"],
  ];
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-lg p-5 w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-base font-bold text-gray-800">Détail de la demande</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" type="button">
            <Icon name="close" className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-2">
          {fields.map(([label, value]) => (
            <div key={label}>
              {value === "—" ? null : (
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-xs text-gray-500">{label}</span>
                  <span className="text-xs font-medium text-gray-800">{value}</span>
                </div>
              )}
            </div>
          ))}
          <div className="flex justify-between py-1.5">
            <span className="text-xs text-gray-500">Statut demande</span>
            {statutBadge(demande.statutDemandeAcces)}
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-xs text-gray-500">Statut compte</span>
            {statutBadge(demande.statutUtilisateur)}
          </div>
        </div>
      </div>
    </div>
  );
}
