import { useState, useEffect } from "react";
import DashboardLayout from "../layouts/DashboardLayout";

// ─── Données Mock ────────────────────────────────────────────────
const mockSessions = [
  { idSession: 1, dateDebut: "2026-05-01T08:00:00", dateFin: "2026-06-30T18:00:00", statutSession: "EN_COURS", typeCollecte: "EN_LIGNE", lieu: "Bobo-Dioulasso", description: "Collecte des données RH", dpoId: 1, dpoNomComplet: "Kaboré Moussa", nombreTraitements: 3 },
  { idSession: 2, dateDebut: "2026-04-15T09:00:00", dateFin: "2026-05-15T17:00:00", statutSession: "TERMINEE", typeCollecte: "TERRAIN", lieu: "Ouagadougou", description: "Enquête producteurs coton", dpoId: 1, dpoNomComplet: "Kaboré Moussa", nombreTraitements: 5 },
  { idSession: 3, dateDebut: "2026-06-01T08:00:00", dateFin: "2026-07-31T18:00:00", statutSession: "EN_COURS", typeCollecte: "EN_LIGNE", lieu: "Banfora", description: "Campagne de sensibilisation", dpoId: 1, dpoNomComplet: "Kaboré Moussa", nombreTraitements: 1 },
];

const mockTraitements = [
  { idTraitement: 1, department: "DRH", description: "Gestion des salaires", texte: "Permettre le paiement des employés", certificationSecurite: "ISO 27001", dureeConservation: 60, dateCreation: "2026-05-10T09:00:00", dateFin: "2031-05-10T00:00:00", nombreDonnee: 3, sessionCollecteId: 1, utilisateurMetierId: 1, utilisateurMetierNom: "Ouedraogo Amadou" },
  { idTraitement: 2, department: "DSI", description: "Gestion des accès réseau", texte: "Contrôler les accès aux systèmes", certificationSecurite: "En cours", dureeConservation: 12, dateCreation: "2026-05-15T14:00:00", dateFin: "2027-05-15T00:00:00", nombreDonnee: 1, sessionCollecteId: 2, utilisateurMetierId: 1, utilisateurMetierNom: "Ouedraogo Amadou" },
  { idTraitement: 3, department: "Direction Commerciale", description: "Gestion des commandes clients", texte: "Suivi des ventes et facturation", certificationSecurite: "ISO 27001", dureeConservation: 36, dateCreation: "2026-05-20T10:00:00", dateFin: "2029-05-20T00:00:00", nombreDonnee: 12, sessionCollecteId: 1, utilisateurMetierId: 2, utilisateurMetierNom: "Traoré Fatimata" },
  { idTraitement: 4, department: "DRH", description: "Suivi des formations", texte: "Gérer les inscriptions aux formations", certificationSecurite: "Non renseigné", dureeConservation: 24, dateCreation: "2026-06-01T08:00:00", dateFin: "2028-06-01T00:00:00", nombreDonnee: 0, sessionCollecteId: null, utilisateurMetierId: 1, utilisateurMetierNom: "Ouedraogo Amadou" },
  { idTraitement: 5, department: "Direction Technique", description: "Maintenance des équipements", texte: "Planifier les maintenances préventives", certificationSecurite: "En cours", dureeConservation: 60, dateCreation: "2026-06-05T11:00:00", dateFin: "2031-06-05T00:00:00", nombreDonnee: 8, sessionCollecteId: null, utilisateurMetierId: 2, utilisateurMetierNom: "Traoré Fatimata" },
  { idTraitement: 6, department: "DSI", description: "Gestion de la messagerie", texte: "Administration des boîtes mail", certificationSecurite: "ISO 27001", dureeConservation: 12, dateCreation: "2026-06-10T09:00:00", dateFin: "2027-06-10T00:00:00", nombreDonnee: 0, sessionCollecteId: 3, utilisateurMetierId: 1, utilisateurMetierNom: "Ouedraogo Amadou" },
];

const mockDeclarations = [
  { idDeclaration: 1, typeDeclaration: "NORMALE", denominationTraitement: "Gestion des salaires", dateSoumission: "2026-05-25", statut: "APPROUVEE" },
  { idDeclaration: 2, typeDeclaration: "AUTORISATION", denominationTraitement: "Gestion des accès réseau", dateSoumission: "2026-06-01", statut: "EN_ATTENTE" },
  { idDeclaration: 3, typeDeclaration: "NORMALE", denominationTraitement: "Gestion des commandes clients", dateSoumission: "2026-06-10", statut: "EN_ATTENTE" },
];

const mockDemandes = [
  { id: 1, usager: "Traoré Fatima", usagerNom: "Traoré Fatima", type: "MODIFICATION", typeDemande: "MODIFICATION", traitement: "Gestion des salaires", traitementNom: "Gestion des salaires", date: "2026-05-20T10:00:00", dateDemande: "2026-05-20T10:00:00", statut: "EN_ATTENTE", statutDemande: "EN_ATTENTE", detail: "Demande de correction de l'adresse mail enregistrée.", descriptionDemande: "Demande de correction de l'adresse mail enregistrée.", utilisateurMetierNom: "Ouedraogo Amadou" },
  { id: 2, usager: "Kaboré Issouf", usagerNom: "Kaboré Issouf", type: "SUPPRESSION", typeDemande: "SUPPRESSION", traitement: "Gestion des accès réseau", traitementNom: "Gestion des accès réseau", date: "2026-05-21T08:30:00", dateDemande: "2026-05-21T08:30:00", statut: "EN_ATTENTE", statutDemande: "EN_ATTENTE", detail: "Demande de suppression des données suite à fin de contrat.", descriptionDemande: "Demande de suppression des données suite à fin de contrat.", utilisateurMetierNom: "Ouedraogo Amadou" },
  { id: 3, usager: "Sawadogo Paul", usagerNom: "Sawadogo Paul", type: "MODIFICATION", typeDemande: "MODIFICATION", traitement: "Gestion des salaires", traitementNom: "Gestion des salaires", date: "2026-05-18T16:00:00", dateDemande: "2026-05-18T16:00:00", statut: "TRAITE", statutDemande: "TRAITE", detail: "Correction du numéro de téléphone.", descriptionDemande: "Correction du numéro de téléphone.", utilisateurMetierNom: "Ouedraogo Amadou" },
];

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

const formatDateShort = (d) =>
  d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const statutBadge = (s) => {
  const map = {
    EN_COURS: "bg-blue-100 text-blue-800",
    TERMINEE: "bg-green-100 text-green-800",
    ANNULEE: "bg-red-100 text-red-800",
  };
  const labels = { EN_COURS: "En cours", TERMINEE: "Terminée", ANNULEE: "Annulée" };
  return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${map[s] || "bg-gray-100"}`}>{labels[s] || s}</span>;
};

const declarationStatutBadge = (s) => {
  const map = {
    EN_ATTENTE: "bg-yellow-100 text-yellow-800",
    APPROUVEE: "bg-green-100 text-green-800",
    REJETEE: "bg-red-100 text-red-800",
  };
  const labels = { EN_ATTENTE: "En attente", APPROUVEE: "Approuvée", REJETEE: "Rejetée" };
  return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${map[s] || "bg-gray-100"}`}>{labels[s] || s}</span>;
};

const demandeStatutBadge = (s) => {
  if (s === "EN_ATTENTE") return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">En attente</span>;
  if (s === "TRAITE") return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">Traitée</span>;
  return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">{s}</span>;
};

const StatCard = ({ label, value, color }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
    <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3`}>
      <span className="text-white font-bold text-lg">{value}</span>
    </div>
    <p className="text-2xl font-bold text-gray-800">{value}</p>
    <p className="text-sm font-medium text-gray-700">{label}</p>
  </div>
);

const TYPES_DECLARATION = [
  { id: "NORMALE", label: "Déclaration Normale", desc: "Traitement standard de données" },
  { id: "AUTORISATION", label: "Demande d'Autorisation", desc: "Traitement nécessitant une autorisation" },
  { id: "COLLECTE_SITE_INTERNET", label: "Collecte via Site Internet", desc: "Données collectées via formulaire web" },
  { id: "SYSTEME_VIDEO_SURVEILLANCE", label: "Système de Vidéosurveillance", desc: "Surveillance par caméras" },
];

// ─── Modal Créer Déclaration ─────────────────────────────────────
function ModalCreerDeclaration({ traitements, onClose, onSave }) {
  const [step, setStep] = useState(1);
  const [selectedTraitementId, setSelectedTraitementId] = useState("");
  const [typeDeclaration, setTypeDeclaration] = useState("");
  const [form, setForm] = useState({
    secteur: "", denominationTraitement: "", texteJuridique: "",
    certificationSecurite: "", dureeConservation: "", responsableDeclaration: "",
    natureDemande: "PREMIERE",
    dateMiseEnOeuvre: "", lieuStockage: "", categoriesDonnees: "", origineDonnees: "",
    categoriesPersonnesConcernees: "", nombrePersonnesConcernees: "", typeTraitement: "",
    caracteristiquesTechniques: "", fonctionnalitesSysteme: "", politiqueAccesSystemes: false,
    finaliteTraitement: "", mesuresSecurite: "", destinataireNom: "", destinataireAdresse: "",
    communicationAutresOrganismes: false, transfertPaysEtranger: false, recoursSousTraitant: false,
    finalites: "", adresseInstallation: "", emplacementCameras: "", nombreTotalCameras: "",
    donneesConnexion: false, cookies: false, dureeConservationCookies: "",
  });

  const selectedTraitement = traitements.find(t => t.idTraitement === parseInt(selectedTraitementId));

  useEffect(() => {
    if (selectedTraitement) {
      setForm(prev => ({
        ...prev,
        secteur: selectedTraitement.department || "",
        denominationTraitement: selectedTraitement.description || "",
        texteJuridique: selectedTraitement.texte || "",
        certificationSecurite: selectedTraitement.certificationSecurite || "",
        dureeConservation: selectedTraitement.dureeConservation ? `${selectedTraitement.dureeConservation} mois` : "",
        responsableDeclaration: selectedTraitement.utilisateurMetierNom || "",
      }));
    }
  }, [selectedTraitement]);

  const handleSave = () => {
    if (!selectedTraitementId || !typeDeclaration) return;
    onSave({
      traitementId: parseInt(selectedTraitementId),
      typeDeclaration,
      ...form,
    });
    onClose();
  };

  const canSave = selectedTraitementId && typeDeclaration;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-screen overflow-y-auto">
        <div className="bg-green-800 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center sticky top-0 z-10">
          <div>
            <h3 className="font-bold text-lg">Nouvelle Déclaration</h3>
            <p className="text-green-200 text-xs">{step === 1 ? "Choisir le traitement" : step === 2 ? "Type de déclaration" : "Formulaire"}</p>
          </div>
          <button onClick={onClose} className="text-green-200 hover:text-white text-xl">✕</button>
        </div>

        <div className="flex bg-green-900">
          {[1, 2, 3].map(s => (
            <div key={s} className={`flex-1 py-2 text-center text-xs font-semibold ${step === s ? "bg-green-600 text-white" : step > s ? "bg-green-700 text-green-200" : "text-green-400"}`}>
              {step > s ? "✓ " : `${s}. `}{s === 1 ? "Traitement" : s === 2 ? "Type" : "Détails"}
            </div>
          ))}
        </div>

        <div className="p-6 space-y-5">
          {step === 1 && (
            <div className="space-y-4">
              <h4 className="font-bold text-green-800">Sélectionner le traitement</h4>
              <select value={selectedTraitementId} onChange={e => setSelectedTraitementId(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="">-- Choisir un traitement --</option>
                {traitements.map(t => (
                  <option key={t.idTraitement} value={t.idTraitement}>
                    {t.description || `Traitement #${t.idTraitement}`} — {t.department || "N/A"}
                  </option>
                ))}
              </select>
              {selectedTraitement && (
                <div className="bg-green-50 rounded-xl p-4 space-y-2 text-sm">
                  <p><span className="font-semibold">Description :</span> {selectedTraitement.description}</p>
                  <p><span className="font-semibold">Département :</span> {selectedTraitement.department}</p>
                  <p><span className="font-semibold">Texte juridique :</span> {selectedTraitement.texte}</p>
                  <p><span className="font-semibold">Certification sécurité :</span> {selectedTraitement.certificationSecurite}</p>
                  <p><span className="font-semibold">Conservation :</span> {selectedTraitement.dureeConservation} mois</p>
                  <p><span className="font-semibold">Responsable :</span> {selectedTraitement.utilisateurMetierNom}</p>
                </div>
              )}
              <div className="flex justify-end">
                <button onClick={() => setStep(2)} disabled={!selectedTraitementId} className="px-5 py-2 rounded-lg bg-green-700 text-white text-sm font-semibold hover:bg-green-800 disabled:opacity-40">
                  Suivant →
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h4 className="font-bold text-green-800">Type de déclaration</h4>
              <div className="grid gap-3">
                {TYPES_DECLARATION.map(t => (
                  <label key={t.id} className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${typeDeclaration === t.id ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-green-300"}`}>
                    <input type="radio" name="typeDecl" value={t.id} checked={typeDeclaration === t.id} onChange={e => setTypeDeclaration(e.target.value)} className="mt-1 accent-green-600" />
                    <div>
                      <p className="font-semibold text-gray-800">{t.label}</p>
                      <p className="text-sm text-gray-500">{t.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
              <div className="flex justify-between">
                <button onClick={() => setStep(1)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm">← Précédent</button>
                <button onClick={() => setStep(3)} disabled={!typeDeclaration} className="px-5 py-2 rounded-lg bg-green-700 text-white text-sm font-semibold hover:bg-green-800 disabled:opacity-40">
                  Suivant →
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <h4 className="font-bold text-green-800">Informations de la déclaration</h4>

              {/* Champs pré-remplis depuis le traitement (readonly) */}
              <div className="bg-green-50 rounded-xl p-4 space-y-3">
                <p className="font-semibold text-green-700 text-sm">✅ Champs pré-remplis depuis le traitement</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Secteur</label>
                    <input value={form.secteur} readOnly className="w-full h-9 px-3 rounded-lg border border-green-200 bg-green-100 text-sm text-gray-700" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Dénomination traitement</label>
                    <input value={form.denominationTraitement} readOnly className="w-full h-9 px-3 rounded-lg border border-green-200 bg-green-100 text-sm text-gray-700" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-600">Texte juridique</label>
                    <textarea value={form.texteJuridique} readOnly rows={2} className="w-full px-3 py-2 rounded-lg border border-green-200 bg-green-100 text-sm text-gray-700" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Certification sécurité</label>
                    <input value={form.certificationSecurite} readOnly className="w-full h-9 px-3 rounded-lg border border-green-200 bg-green-100 text-sm text-gray-700" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600">Durée de conservation</label>
                    <input value={form.dureeConservation} readOnly className="w-full h-9 px-3 rounded-lg border border-green-200 bg-green-100 text-sm text-gray-700" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-600">Responsable déclaration</label>
                    <input value={form.responsableDeclaration} readOnly className="w-full h-9 px-3 rounded-lg border border-green-200 bg-green-100 text-sm text-gray-700" />
                  </div>
                </div>
              </div>

              {/* Champs à remplir par le DPO */}
              <div className="border-t border-gray-200 pt-4">
                <p className="font-semibold text-gray-700 text-sm mb-3">📝 Informations à renseigner</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nature de la demande</label>
                    <select value={form.natureDemande} onChange={e => setForm(p => ({ ...p, natureDemande: e.target.value }))} className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm">
                      <option value="PREMIERE">Première déclaration</option>
                      <option value="MODIFICATION">Modification</option>
                      <option value="SUPPRESSION">Suppression</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date mise en œuvre</label>
                    <input type="date" value={form.dateMiseEnOeuvre} onChange={e => setForm(p => ({ ...p, dateMiseEnOeuvre: e.target.value }))} className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lieu de stockage</label>
                    <input value={form.lieuStockage} onChange={e => setForm(p => ({ ...p, lieuStockage: e.target.value }))} className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Catégories de données</label>
                    <input value={form.categoriesDonnees} onChange={e => setForm(p => ({ ...p, categoriesDonnees: e.target.value }))} className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Origine des données</label>
                    <input value={form.origineDonnees} onChange={e => setForm(p => ({ ...p, origineDonnees: e.target.value }))} className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mesures de sécurité</label>
                    <textarea value={form.mesuresSecurite} onChange={e => setForm(p => ({ ...p, mesuresSecurite: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm" />
                  </div>

                  {typeDeclaration === "NORMALE" && (
                    <>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Finalité du traitement</label>
                        <textarea value={form.finaliteTraitement} onChange={e => setForm(p => ({ ...p, finaliteTraitement: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Catégories de personnes concernées</label>
                        <input value={form.categoriesPersonnesConcernees} onChange={e => setForm(p => ({ ...p, categoriesPersonnesConcernees: e.target.value }))} className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de personnes</label>
                        <input type="number" value={form.nombrePersonnesConcernees} onChange={e => setForm(p => ({ ...p, nombrePersonnesConcernees: e.target.value }))} className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type de traitement</label>
                        <input value={form.typeTraitement} onChange={e => setForm(p => ({ ...p, typeTraitement: e.target.value }))} className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Caractéristiques techniques</label>
                        <textarea value={form.caracteristiquesTechniques} onChange={e => setForm(p => ({ ...p, caracteristiquesTechniques: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm" />
                      </div>
                    </>
                  )}

                  {typeDeclaration === "AUTORISATION" && (
                    <>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Finalité du traitement</label>
                        <textarea value={form.finaliteTraitement} onChange={e => setForm(p => ({ ...p, finaliteTraitement: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fonctionnalités du système</label>
                        <textarea value={form.fonctionnalitesSysteme} onChange={e => setForm(p => ({ ...p, fonctionnalitesSysteme: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Destinataire</label>
                        <input value={form.destinataireNom} onChange={e => setForm(p => ({ ...p, destinataireNom: e.target.value }))} className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm" />
                      </div>
                      <div>
                        <label className="flex items-center gap-2 pt-6">
                          <input type="checkbox" checked={form.politiqueAccesSystemes} onChange={e => setForm(p => ({ ...p, politiqueAccesSystemes: e.target.checked }))} className="accent-green-600" />
                          <span className="text-sm">Politique d'accès aux systèmes</span>
                        </label>
                      </div>
                    </>
                  )}

                  {typeDeclaration === "COLLECTE_SITE_INTERNET" && (
                    <>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Finalité du traitement</label>
                        <textarea value={form.finaliteTraitement} onChange={e => setForm(p => ({ ...p, finaliteTraitement: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm" />
                      </div>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked={form.donneesConnexion} onChange={e => setForm(p => ({ ...p, donneesConnexion: e.target.checked }))} className="accent-green-600" />
                        <span className="text-sm">Données de connexion</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked={form.cookies} onChange={e => setForm(p => ({ ...p, cookies: e.target.checked }))} className="accent-green-600" />
                        <span className="text-sm">Utilisation de cookies</span>
                      </label>
                      {form.cookies && (
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Durée de conservation des cookies</label>
                          <input value={form.dureeConservationCookies} onChange={e => setForm(p => ({ ...p, dureeConservationCookies: e.target.value }))} className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm" />
                        </div>
                      )}
                    </>
                  )}

                  {typeDeclaration === "SYSTEME_VIDEO_SURVEILLANCE" && (
                    <>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Finalités du système</label>
                        <textarea value={form.finalites} onChange={e => setForm(p => ({ ...p, finalites: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Adresse d'installation</label>
                        <input value={form.adresseInstallation} onChange={e => setForm(p => ({ ...p, adresseInstallation: e.target.value }))} className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Emplacement caméras</label>
                        <input value={form.emplacementCameras} onChange={e => setForm(p => ({ ...p, emplacementCameras: e.target.value }))} className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de caméras</label>
                        <input type="number" value={form.nombreTotalCameras} onChange={e => setForm(p => ({ ...p, nombreTotalCameras: e.target.value }))} className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm" />
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-gray-100">
                <button onClick={() => setStep(2)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm">← Précédent</button>
                <button onClick={handleSave} disabled={!canSave} className="px-6 py-2 rounded-lg bg-green-700 text-white text-sm font-semibold hover:bg-green-800 disabled:opacity-40">
                  Créer la déclaration
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DpoDashboard() {
  // Forcer le rôle DPO pour l'affichage des onglets dans le DashboardLayout
  if (!localStorage.getItem("role") || localStorage.getItem("role") !== "ROLE_DPO") {
    localStorage.setItem("role", "ROLE_DPO");
    localStorage.setItem("email", "dpo@sofitex.bf");
  }

  const [activeTab, setActiveTab] = useState("dashboard");
  const [sessions, setSessions] = useState(mockSessions);
  const [traitements, setTraitements] = useState([]);
  const [allTraitements, setAllTraitements] = useState(mockTraitements);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ dateDebut: "", dateFin: "", typeCollecte: "EN_LIGNE", lieu: "", description: "" });
  const [toast, setToast] = useState(null);
  const [declarations, setDeclarations] = useState(mockDeclarations);
  const [demandes, setDemandes] = useState(mockDemandes);
  const [notificationsCount, setNotificationsCount] = useState(mockDemandes.filter(d => d.statut === "EN_ATTENTE").length);
  const [showCreerDeclaration, setShowCreerDeclaration] = useState(false);
  const [traitementFilterMode, setTraitementFilterMode] = useState("tous");

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreateSession = (e) => {
    e.preventDefault();
    const newSession = {
      idSession: sessions.length + 1,
      ...form,
      dateDebut: form.dateDebut ? new Date(form.dateDebut).toISOString() : null,
      dateFin: form.dateFin ? new Date(form.dateFin).toISOString() : null,
      statutSession: "EN_COURS",
      dpoId: 1,
      dpoNomComplet: "Kaboré Moussa",
      nombreTraitements: 0,
    };
    setSessions((prev) => [...prev, newSession]);
    setShowForm(false);
    setForm({ dateDebut: "", dateFin: "", typeCollecte: "EN_LIGNE", lieu: "", description: "" });
    showToast("Session créée avec succès");
  };

  const handleChangeStatut = (id, valeur) => {
    setSessions((prev) => prev.map((s) => s.idSession === id ? { ...s, statutSession: valeur } : s));
    showToast("Statut mis à jour");
  };

  const handleCreateDeclaration = (data) => {
    const newDecl = {
      idDeclaration: declarations.length + 1,
      typeDeclaration: data.typeDeclaration,
      denominationTraitement: data.denominationTraitement || "Nouvelle déclaration",
      dateSoumission: new Date().toISOString().split("T")[0],
      statut: "EN_ATTENTE",
    };
    setDeclarations((prev) => [...prev, newDecl]);
    showToast("Déclaration créée avec succès");
  };

  const stats = {
    sessionsTotal: sessions.length,
    enCours: sessions.filter((s) => s.statutSession === "EN_COURS").length,
    terminees: sessions.filter((s) => s.statutSession === "TERMINEE").length,
    traitementsTotal: allTraitements.length,
    demandesEnAttente: demandes.filter(d => d.statut === "EN_ATTENTE" || d.statutDemande === "EN_ATTENTE").length,
  };

  useEffect(() => {
    if (selectedSessionId) {
      setTraitements(allTraitements.filter(t => t.sessionCollecteId === parseInt(selectedSessionId)));
    } else {
      setTraitements([]);
    }
  }, [selectedSessionId, allTraitements]);

  const traitementsToShow = traitementFilterMode === "tous" ? allTraitements : traitements;

  return (
    <DashboardLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      notificationsCount={notificationsCount}
      onBellClick={() => setActiveTab("demandes")}
    >
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-800">Vue d'ensemble</h2>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard label="Sessions totales" value={stats.sessionsTotal} color="bg-green-700" />
            <StatCard label="En cours" value={stats.enCours} color="bg-blue-500" />
            <StatCard label="Terminées" value={stats.terminees} color="bg-emerald-500" />
            <StatCard label="Traitements" value={stats.traitementsTotal} color="bg-purple-500" />
            <StatCard label="Demandes en attente" value={stats.demandesEnAttente} color="bg-orange-500" />
          </div>
        </div>
      )}

      {activeTab === "sessions" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Sessions de collecte</h2>
            <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-green-700 text-white rounded-xl text-sm font-medium hover:bg-green-800 transition">
              + Nouvelle session
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleCreateSession} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
              <h3 className="font-bold text-gray-800">Créer une session</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date début</label>
                  <input type="datetime-local" value={form.dateDebut} onChange={(e) => setForm((p) => ({ ...p, dateDebut: e.target.value }))} required className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
                  <input type="datetime-local" value={form.dateFin} onChange={(e) => setForm((p) => ({ ...p, dateFin: e.target.value }))} required className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select value={form.typeCollecte} onChange={(e) => setForm((p) => ({ ...p, typeCollecte: e.target.value }))} className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm">
                    <option value="EN_LIGNE">En ligne</option>
                    <option value="TERRAIN">Terrain</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lieu</label>
                  <input type="text" value={form.lieu} onChange={(e) => setForm((p) => ({ ...p, lieu: e.target.value }))} className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm" />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="px-6 py-2 bg-green-700 text-white rounded-xl text-sm font-medium hover:bg-green-800 transition">Créer</button>
                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 border border-gray-300 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition">Annuler</button>
              </div>
            </form>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Session</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Dates</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Statut</th>
                    <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {sessions.map((s) => (
                    <tr key={s.idSession} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-800">{s.description || `Session #${s.idSession}`}</p>
                        <p className="text-xs text-gray-400">{s.lieu || "—"}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{s.typeCollecte === "EN_LIGNE" ? "En ligne" : "Terrain"}</span>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-500">
                        <p>Du {formatDate(s.dateDebut)}</p>
                        <p>Au {formatDate(s.dateFin)}</p>
                      </td>
                      <td className="px-5 py-4">{statutBadge(s.statutSession)}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {s.statutSession === "EN_COURS" && (
                            <>
                              <button onClick={() => handleChangeStatut(s.idSession, "TERMINEE")} className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200">Terminer</button>
                              <button onClick={() => handleChangeStatut(s.idSession, "ANNULEE")} className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-xs font-medium hover:bg-red-200">Annuler</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {sessions.length === 0 && <div className="py-12 text-center text-gray-400 text-sm">Aucune session</div>}
            </div>
          </div>
        </div>
      )}

      {activeTab === "traitements" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Traitements</h2>
          </div>
          <div className="flex gap-4 items-end">
            <div className="max-w-xs">
              <label className="block text-sm font-medium text-gray-700 mb-1">Filtrer</label>
              <div className="flex gap-2">
                <button onClick={() => { setTraitementFilterMode("tous"); setSelectedSessionId(""); }} className={`px-3 py-2 rounded-lg text-xs font-medium transition ${traitementFilterMode === "tous" ? "bg-green-700 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>Tous</button>
                <button onClick={() => setTraitementFilterMode("parSession")} className={`px-3 py-2 rounded-lg text-xs font-medium transition ${traitementFilterMode === "parSession" ? "bg-green-700 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>Par session</button>
              </div>
            </div>
            {traitementFilterMode === "parSession" && (
              <div className="max-w-xs">
                <label className="block text-sm font-medium text-gray-700 mb-1">Session de collecte</label>
                <select value={selectedSessionId} onChange={(e) => setSelectedSessionId(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm">
                  <option value="">Sélectionner une session...</option>
                  {sessions.map((s) => (
                    <option key={s.idSession} value={s.idSession}>
                      {s.description || `Session #${s.idSession}`} - {s.typeCollecte}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Description</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Département</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Session</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Données</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Date création</th>
                    <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {traitementsToShow.map((t) => (
                    <tr key={t.idTraitement} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-800">{t.description || `Traitement #${t.idTraitement}`}</p>
                      </td>
                      <td className="px-5 py-4 text-gray-600 text-sm">{t.department || "—"}</td>
                      <td className="px-5 py-4 text-gray-600 text-sm">#{t.sessionCollecteId || "Sans session"}</td>
                      <td className="px-5 py-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">{t.nombreDonnee || 0}</span>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-500">{formatDate(t.dateCreation)}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => { setAllTraitements(current => current); showToast(`Traitement: ${t.description}`, "success"); }} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-200">Voir</button>
                          <button onClick={() => { setActiveTab("declarations"); setShowCreerDeclaration(true); }} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium hover:bg-purple-200">Déclaration</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {traitementsToShow.length === 0 && <div className="py-12 text-center text-gray-400 text-sm">Aucun traitement</div>}
            </div>
          </div>
        </div>
      )}

      {activeTab === "declarations" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Déclarations</h2>
            <button onClick={() => setShowCreerDeclaration(true)} className="px-4 py-2 bg-green-700 text-white rounded-xl text-sm font-medium hover:bg-green-800 transition">
              + Nouvelle déclaration
            </button>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">ID</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Dénomination</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {declarations.map((d) => (
                    <tr key={d.idDeclaration} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-4 font-mono text-xs text-gray-400">#{d.idDeclaration}</td>
                      <td className="px-5 py-4">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{d.typeDeclaration || "N/A"}</span>
                      </td>
                      <td className="px-5 py-4 font-medium text-gray-800">{d.denominationTraitement || "—"}</td>
                      <td className="px-5 py-4 text-xs text-gray-500">{formatDateShort(d.dateSoumission)}</td>
                      <td className="px-5 py-4">{declarationStatutBadge(d.statut)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {declarations.length === 0 && <div className="py-12 text-center text-gray-400 text-sm">Aucune déclaration</div>}
            </div>
          </div>
        </div>
      )}

      {activeTab === "demandes" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Demandes des usagers</h2>
            {stats.demandesEnAttente > 0 && (
              <span className="bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1 rounded-full">
                {stats.demandesEnAttente} en attente
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
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Traité par</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {demandes.map((d) => (
                    <tr key={d.id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-4 font-medium text-gray-800">{d.usagerNom || d.usager || "—"}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${d.type === "MODIFICATION" || d.typeDemande === "MODIFICATION" ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"}`}>
                          {d.type || d.typeDemande || "—"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-600 text-sm max-w-xs truncate">{d.descriptionDemande || d.detail || "—"}</td>
                      <td className="px-5 py-4 text-xs text-gray-500">{formatDateShort(d.dateDemande || d.date)}</td>
                      <td className="px-5 py-4">{demandeStatutBadge(d.statut || d.statutDemande)}</td>
                      <td className="px-5 py-4 text-sm text-gray-600">{d.utilisateurMetierNom || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {demandes.length === 0 && <div className="py-12 text-center text-gray-400 text-sm">Aucune demande</div>}
            </div>
          </div>
        </div>
      )}

      {showCreerDeclaration && (
        <ModalCreerDeclaration
          traitements={allTraitements}
          onClose={() => setShowCreerDeclaration(false)}
          onSave={handleCreateDeclaration}
        />
      )}

      {toast && (
        <div className={`fixed bottom-6 right-6 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium z-50 ${toast.type === "error" ? "bg-red-500" : "bg-green-700"}`}>
          {toast.msg}
        </div>
      )}
    </DashboardLayout>
  );
}

export default DpoDashboard;