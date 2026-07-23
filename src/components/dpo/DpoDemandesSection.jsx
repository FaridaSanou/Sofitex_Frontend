import { useState, useMemo } from "react";
import { formatDate } from "../../utils/date";
import { demandeStatutBadge } from "../ui/BadgeStatut";
import { Icon } from "../ui/Icon";

function ModalDetailDemande({ demande, onClose }) {
  if (!demande) return null;
  const estModification = (demande.typeDemande || demande.type) === "MODIFICATION";
  const statut = demande.statutDemande || demande.statut;
  const dejaTraitee = statut !== "EN_COURS" && statut !== "EN_ATTENTE";
  const estAcceptee = statut === "ACCEPTEE" || statut === "TRAITE";

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
              {demandeStatutBadge(statut)}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 font-semibold mb-1">Donnée concernée</p>
            <p>{demande.donneeValeur || "—"}</p>
          </div>

          {demande.traitementNom && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 font-semibold mb-1">Traitement</p>
              <p>{demande.traitementNom}{demande.traitementDescription ? ` — ${demande.traitementDescription}` : ""}</p>
            </div>
          )}

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
  const [filterStatut, setFilterStatut] = useState("TOUS");
  const [filterType, setFilterType] = useState("TOUS");
  const [search, setSearch] = useState("");

  const stats = useMemo(() => {
    const total = demandes.length;
    const enCours = demandes.filter(d => (d.statutDemande || d.statut) === "EN_COURS" || (d.statutDemande || d.statut) === "EN_ATTENTE").length;
    const acceptees = demandes.filter(d => (d.statutDemande || d.statut) === "ACCEPTEE" || (d.statutDemande || d.statut) === "TRAITE").length;
    const rejetees = demandes.filter(d => (d.statutDemande || d.statut) === "REJETEE").length;
    return { total, enCours, acceptees, rejetees };
  }, [demandes]);

  const demandesFiltered = useMemo(() => {
    return demandes.filter(d => {
      const statut = d.statutDemande || d.statut;
      const type = d.typeDemande || d.type;
      const usager = (d.usagerNomComplet || d.usagerNom || d.usager || "").toLowerCase();
      if (filterStatut !== "TOUS" && filterStatut !== "EN_ATTENTE" && statut !== filterStatut) return false;
      if (filterStatut === "EN_ATTENTE" && statut !== "EN_ATTENTE" && statut !== "EN_COURS") return false;
      if (filterType !== "TOUS" && type !== filterType) return false;
      if (search && !usager.includes(search.toLowerCase())) return false;
      return true;
    });
  }, [demandes, filterStatut, filterType, search]);

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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Icon name="bell" className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-yellow-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
              <Icon name="clock" className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-700">{stats.enCours}</p>
              <p className="text-xs text-gray-500">En attente</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-green-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <Icon name="check" className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-700">{stats.acceptees}</p>
              <p className="text-xs text-gray-500">Acceptées</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-red-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <Icon name="close" className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-700">{stats.rejetees}</p>
              <p className="text-xs text-gray-500">Rejetées</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Icon name="search" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher par nom d'usager..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <select
            value={filterStatut}
            onChange={e => setFilterStatut(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="TOUS">Tous les statuts</option>
            <option value="EN_ATTENTE">En attente</option>
            <option value="EN_COURS">En cours</option>
            <option value="ACCEPTEE">Acceptée</option>
            <option value="REJETEE">Rejetée</option>
          </select>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="TOUS">Tous les types</option>
            <option value="MODIFICATION">Modification</option>
            <option value="SUPPRESSION">Suppression</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Usager</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Traitement</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Statut</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {demandesFiltered.map((d) => (
                <tr key={d.idDemande || d.id} className="hover:bg-gray-50 transition cursor-pointer" onClick={() => setSelectedDemande(d)}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-green-700 font-bold text-xs">{((d.usagerNomComplet || d.usagerNom || d.usager || "?")[0] || "?").toUpperCase()}</span>
                      </div>
                      <span className="font-medium text-gray-800">{d.usagerNomComplet || d.usagerNom || d.usager || "—"}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${(d.typeDemande || d.type) === "MODIFICATION" ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"}`}>
                      {d.typeDemande || d.type || "—"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-600 text-sm max-w-xs truncate">{d.traitementNom || d.descriptionDemande || "—"}</td>
                  <td className="px-5 py-4 text-gray-500 text-xs">{formatDate(d.dateDemande || d.date)}</td>
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
          {demandesFiltered.length === 0 && (
            <div className="py-12 text-center text-gray-400 text-sm">
              {demandes.length === 0 ? "Aucune demande" : "Aucune demande ne correspond aux filtres"}
            </div>
          )}
        </div>
      </div>

      {selectedDemande && <ModalDetailDemande demande={selectedDemande} onClose={() => setSelectedDemande(null)} />}
    </div>
  );
}
