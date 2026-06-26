// ═══════════════════════════════════════════════════════════════════
// MODULE : Tableau de bord DPO (DpoDashboard)
// Point d'entrée : Délégue le layout (sidebar + onglets) à DashboardLayout
// Contenu : Sessions, Traitements, Déclarations, Demandes usagers
// ═══════════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";

// ═══════════════════════════════════════════════════════════════════
// MODULE 1 : (réservé)
// ═══════════════════════════════════════════════════════════════════

const mockDemandes = [
  { id: 1, usager: "Traoré Fatima", usagerNom: "Traoré Fatima", type: "MODIFICATION", typeDemande: "MODIFICATION", traitement: "Gestion des salaires", traitementNom: "Gestion des salaires", date: "2026-05-20T10:00:00", dateDemande: "2026-05-20T10:00:00", statut: "EN_ATTENTE", statutDemande: "EN_ATTENTE", detail: "Demande de correction de l'adresse mail enregistrée.", descriptionDemande: "Demande de correction de l'adresse mail enregistrée.", utilisateurMetierNom: "Ouedraogo Amadou" },
  { id: 2, usager: "Kaboré Issouf", usagerNom: "Kaboré Issouf", type: "SUPPRESSION", typeDemande: "SUPPRESSION", traitement: "Gestion des accès réseau", traitementNom: "Gestion des accès réseau", date: "2026-05-21T08:30:00", dateDemande: "2026-05-21T08:30:00", statut: "EN_ATTENTE", statutDemande: "EN_ATTENTE", detail: "Demande de suppression des données suite à fin de contrat.", descriptionDemande: "Demande de suppression des données suite à fin de contrat.", utilisateurMetierNom: "Ouedraogo Amadou" },
  { id: 3, usager: "Sawadogo Paul", usagerNom: "Sawadogo Paul", type: "MODIFICATION", typeDemande: "MODIFICATION", traitement: "Gestion des salaires", traitementNom: "Gestion des salaires", date: "2026-05-18T16:00:00", dateDemande: "2026-05-18T16:00:00", statut: "TRAITE", statutDemande: "TRAITE", detail: "Correction du numéro de téléphone.", descriptionDemande: "Correction du numéro de téléphone.", utilisateurMetierNom: "Ouedraogo Amadou" },
];

// ═══════════════════════════════════════════════════════════════════
// MODULE 2 : Utilitaires de formatage des dates
// toDate() gère aussi bien les chaînes ISO que le format tableau
// Jackson (ex: [2026,4,10,9,0]) renvoyé par le backend
// ═══════════════════════════════════════════════════════════════════
const toDate = (d) => {
  if (!d) return null;
  if (Array.isArray(d)) return new Date(d[0], d[1] - 1, d[2], d[3] || 0, d[4] || 0);
  return new Date(d);
};

const formatDate = (d) => {
  const date = toDate(d);
  return date instanceof Date && !isNaN(date)
    ? date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "—";
};

const formatDateShort = (d) => {
  const date = toDate(d);
  return date instanceof Date && !isNaN(date)
    ? date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
    : "—";
};

const toLocalDateTime = (d) => {
  if (!d) return null;
  const date = new Date(d);
  if (isNaN(date)) return null;
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

// ═══════════════════════════════════════════════════════════════════
// MODULE 3 : Insignes de statut (Badges)
// statutBadge → Sessions (EN_COURS / TERMINEE / ANNULEE)
// declarationStatutBadge → Déclarations (EN_ATTENTE / APPROUVEE / REJETEE)
// demandeStatutBadge → Demandes usagers (EN_ATTENTE / TRAITE)
// ═══════════════════════════════════════════════════════════════════
const statutBadge = (s) => {
  const map = {
    EN_COURS: "bg-green-100 text-green-800",
    TERMINEE: "bg-green-100 text-green-800",
    ANNULEE: "bg-red-100 text-red-800",
  };
  const labels = { EN_COURS: "En cours", TERMINEE: "Terminée", ANNULEE: "Annulée" };
  return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${map[s] || "bg-gray-100"}`}>{labels[s] || s}</span>;
};

const declarationStatutBadge = (s) => {
  const map = {
    BROUILLON: "bg-gray-200 text-gray-700",
    EN_ATTENTE: "bg-yellow-100 text-yellow-800",
    APPROUVEE_DG: "bg-green-100 text-green-800",
    REJETEE_DG: "bg-red-100 text-red-800",
    APPROUVEE: "bg-green-100 text-green-800",
    REJETEE: "bg-red-100 text-red-800",
  };
  const labels = { BROUILLON: "Brouillon", EN_ATTENTE: "En attente", APPROUVEE_DG: "Approuvée DG", REJETEE_DG: "Rejetée DG", APPROUVEE: "Approuvée", REJETEE: "Rejetée" };
  return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${map[s] || "bg-gray-100"}`}>{labels[s] || s}</span>;
};

const demandeStatutBadge = (s) => {
  if (s === "EN_ATTENTE") return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">En attente</span>;
  if (s === "TRAITE") return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">Traitée</span>;
  return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">{s}</span>;
};

// ═══════════════════════════════════════════════════════════════════
// MODULE 4 : Composants d'affichage
// StatCard → Carte de statistique (utilisée dans la vue d'ensemble)
// TYPES_DECLARATION → Liste des types de déclaration disponibles
// ═══════════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════════
// MODULE 5 : Modal Créer Déclaration
// Fenêtre modale en 3 étapes (Traitement → Type → Détails)
// Pré-remplit les champs depuis le traitement sélectionné
// ═══════════════════════════════════════════════════════════════════
// ── Composant champ réutilisable ──────────────────────────────────
function Field({ label, children, required }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-600 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function Input({ name, value, onChange, type = "text", placeholder = "" }) {
  return (
    <input
      type={type} name={name} value={value} onChange={onChange}
      placeholder={placeholder}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
    />
  );
}

function Textarea({ name, value, onChange, rows = 2, placeholder = "" }) {
  return (
    <textarea
      name={name} value={value} onChange={onChange} rows={rows}
      placeholder={placeholder}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
    />
  );
}

function CheckField({ label, name, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
      <input type="checkbox" name={name} checked={checked} onChange={onChange} className="w-4 h-4 accent-green-700" />
      {label}
    </label>
  );
}

function SectionTitle({ title }) {
  return (
    <h5 className="font-bold text-green-800 text-sm uppercase border-b border-green-200 pb-1 mt-4 mb-3">{title}</h5>
  );
}

// ── MODAL PRINCIPAL ───────────────────────────────────────────────
function ModalCreerDeclaration({ traitements, onClose, onSave, preFillTraitement }) {
  const [step, setStep] = useState(1);
  const [selectedTraitementId, setSelectedTraitementId] = useState("");
  const [typeDeclaration, setTypeDeclaration] = useState("");

  const initForm = {
    // ── Champs communs (Declaration.java) ──
    secteur: "", natureDemande: "PREMIERE",
    responsableDeclaration: "", contactConfidentialite: "",
    dateMiseEnOeuvre: "", nomPrenomResponsable: "", fonctionResponsable: "",
    categoriesDonnees: "", origineDonnees: "", dureeConservation: "", lieuStockage: "",
    communicationAutresOrganismes: false, destinataireNom: "", destinataireAdresse: "",
    texteJuridiqueCommunication: "", finaliteCommunication: "",
    destinataireConformeCil: false, transfertPaysEtranger: false,
    recoursSousTraitant: false, contratConfidentialiteSousTraitant: false,
    rolesSousTraitants: "", categoriesPersonnesAcces: "",
    politiqueAccesBatiments: false, mesuresSecurite: "",
    mesuresSensibilisation: false, moyensInformationDroits: "",
    moyensExerciceDroits: "", coordonneesExerciceDroits: "",
    delaiCommunicationDroits: "",

    // ── Déclaration Normale (DeclarationNormale.java) ──
    denominationTraitement: "", finaliteTraitement: "", texteJuridique: "",
    categoriesPersonnesConcernees: "", nombrePersonnesConcernees: "",
    typeTraitement: "", descriptionProcedureManuelle: false,
    caracteristiquesTechniques: "", caracteristiquesSysteme: "",
    politiqueAccesSystemes: false, modalitesDiffusionResultats: false,
    protocoleRecherche: false, descriptionConnexionFichiers: false,
    motifsInterconnexion: "", identiteFichiersInterconnexion: "",

    // ── Déclaration Autorisation (DeclarationAutorisation.java) ──
    fonctionnalitesSysteme: "", certificationSecurite: "",
    descriptionFichier: "", modeTransfert: "",
    traitementDonneesSante: false, professionalSante: false,
    modalitesDiffusionResultatsAuto: "", destinataireCie: "",
    connexionFichiers: false, categoriesDonneesInterconnexion: "",
    dureeInterconnexion: "", paysDestinationProtectionDonnees: false,
    descriptionFichierTransfert: "", nombrePersonnesTransfert: "",
    categoriesDonneesTransfert: "", fondementJuridique: "",
    consentementPersonnesConcernees: false, methodeRecueilConsentement: "",
    mesuresSecuriteTransfert: "", destinataireNomPrenom: "",
    dureeConservationSante: "", descriptionSensibilisation: "",

    // ── Collecte Site Internet (DeclarationCollecteSiteInternet.java) ──
    caracteristiquesMainStructure: "", donneesConnexion: false,
    descriptionDonneesConnexion: "", cookies: false,
    descriptionCookies: "", dureeConservationCookies: "",
    telechargementTraitement: "",

    // ── Vidéosurveillance (DeclarationSystemeVideoSurveillance.java) ──
    finalites: "", adresseInstallation: "", natureEnvironnement: "",
    emplacementCameras: "", nombreTotalCameras: "", modeleDispositif: "",
    visualisationTempsReel: false, modeTransfertVideo: "", sonDeSon: false,
    typeEnregistrement: "", natureEnregistrement: "", liaisonReseau: "",
    utilisationSystemesExperts: false, descriptionSystemesExperts: "",
    fonctionnalitesTraitement: "", accesImagesDistance: false,
    accesPhysique: "", accesLogique: "", mesuresSuppression: false,
    localisationPictogrammes: "",
  };

  const [form, setForm] = useState(initForm);

  useEffect(() => {
    if (!preFillTraitement) return;
    setSelectedTraitementId(String(preFillTraitement.idTraitement));

    const baseFill = (prev) => ({
      ...prev,
      secteur: preFillTraitement.department || prev.secteur,
      denominationTraitement: preFillTraitement.description || prev.denominationTraitement,
      finaliteTraitement: preFillTraitement.texte || prev.finaliteTraitement,
      dureeConservation: preFillTraitement.dureeConservation ? String(preFillTraitement.dureeConservation) + " mois" : prev.dureeConservation,
      lieuStockage: preFillTraitement.lieuStockage || prev.lieuStockage,
      nomPrenomResponsable: preFillTraitement.utilisateurMetierNom || prev.nomPrenomResponsable,
      responsableDeclaration: preFillTraitement.utilisateurMetierNom || prev.responsableDeclaration,
    });

    if (preFillTraitement.declarationId) {
      api.get(`/declarations/${preFillTraitement.declarationId}`)
        .then((res) => {
          const d = res.data;
          setForm(prev => ({
            ...baseFill(prev),
            dateMiseEnOeuvre: d.dateMiseEnOeuvre || prev.dateMiseEnOeuvre,
            responsableDeclaration: d.responsableDeclaration || prev.responsableDeclaration,
            contactConfidentialite: d.contactConfidentialite || prev.contactConfidentialite,
            secteur: d.secteur || prev.secteur,
          }));
        })
        .catch(() => setForm(baseFill));
    } else {
      setForm(baseFill);
    }
  }, [preFillTraitement]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const selectedTraitement = traitements.find(t => t.idTraitement === parseInt(selectedTraitementId));

  const handleSave = () => {
    onSave({ traitementId: parseInt(selectedTraitementId), typeDeclaration, ...form });
    onClose();
  };

  const stepTitles = ["Traitement", "Type", "Identification", "Données & Sécurité", "Droits & Sous-traitance", "Spécifique"];
  const totalSteps = 6;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 font-sans text-left">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="bg-green-800 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center flex-shrink-0">
          <div>
            <h3 className="font-bold text-lg">Nouvelle Déclaration CIL</h3>
            <p className="text-xs opacity-80">Étape {step}/{totalSteps} — {stepTitles[step - 1]}</p>
          </div>
          <button onClick={onClose} className="text-2xl leading-none">✕</button>
        </div>

        {/* Barre de progression */}
        <div className="flex gap-1 px-6 pt-3 flex-shrink-0">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i < step ? "bg-green-600" : "bg-gray-200"}`} />
          ))}
        </div>

        {/* Contenu scrollable */}
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-3">

          {/* ── ÉTAPE 1 : Choix du traitement ── */}
          {step === 1 && (
            <div className="space-y-4">
              <SectionTitle title="Sélectionner le traitement associé" />
              <Field label="Traitement métier" required>
                <select value={selectedTraitementId} onChange={e => setSelectedTraitementId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
                  <option value="">-- Choisir un traitement --</option>
                  {traitements.map(t => (
                    <option key={t.idTraitement} value={t.idTraitement}>{t.description} ({t.department})</option>
                  ))}
                </select>
              </Field>
              {selectedTraitement && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm">
                  <p><span className="font-bold">Traitement :</span> {selectedTraitement.description}</p>
                  <p><span className="font-bold">Département :</span> {selectedTraitement.department}</p>
                </div>
              )}
            </div>
          )}

          {/* ── ÉTAPE 2 : Type de déclaration ── */}
          {step === 2 && (
            <div className="space-y-3">
              <SectionTitle title="Type de formalité CIL" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {TYPES_DECLARATION.map(t => (
                  <button key={t.id} onClick={() => setTypeDeclaration(t.id)}
                    className={`p-4 border-2 rounded-xl text-left transition-all ${typeDeclaration === t.id ? "border-green-600 bg-green-50" : "border-gray-200 hover:border-green-300"}`}>
                    <p className="font-bold text-green-900 text-sm">{t.label}</p>
                    <p className="text-xs text-gray-500 mt-1">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── ÉTAPE 3 : Identification ── */}
          {step === 3 && (
            <div className="space-y-3">
              <SectionTitle title="Identification & Responsable" />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Nom & Prénom Responsable" required>
                  <Input name="nomPrenomResponsable" value={form.nomPrenomResponsable} onChange={handleChange} placeholder="Ex: Koné Mamadou" />
                </Field>
                <Field label="Fonction du Responsable" required>
                  <Input name="fonctionResponsable" value={form.fonctionResponsable} onChange={handleChange} placeholder="Ex: Directeur DSI" />
                </Field>
                <Field label="Secteur / Département" required>
                  <Input name="secteur" value={form.secteur} onChange={handleChange} placeholder="Ex: DRH" />
                </Field>
                <Field label="Contact Confidentialité">
                  <Input name="contactConfidentialite" value={form.contactConfidentialite} onChange={handleChange} placeholder="email ou téléphone" />
                </Field>
                <Field label="Nature de la Demande" required>
                  <select name="natureDemande" value={form.natureDemande} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
                    <option value="PREMIERE">Première déclaration</option>
                    <option value="MODIFICATION">Modification</option>
                    <option value="RENOUVELLEMENT">Renouvellement</option>
                  </select>
                </Field>
                <Field label="Date de mise en œuvre">
                  <Input name="dateMiseEnOeuvre" value={form.dateMiseEnOeuvre} onChange={handleChange} type="date" />
                </Field>
              </div>
            </div>
          )}

          {/* ── ÉTAPE 4 : Données & Sécurité ── */}
          {step === 4 && (
            <div className="space-y-3">
              <SectionTitle title="Données Traitées" />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Catégories de données">
                  <Input name="categoriesDonnees" value={form.categoriesDonnees} onChange={handleChange} placeholder="Ex: Identité, Santé..." />
                </Field>
                <Field label="Origine des données">
                  <Input name="origineDonnees" value={form.origineDonnees} onChange={handleChange} placeholder="Ex: Formulaire, Tiers..." />
                </Field>
                <Field label="Durée de conservation">
                  <Input name="dureeConservation" value={form.dureeConservation} onChange={handleChange} placeholder="Ex: 5 ans" />
                </Field>
                <Field label="Lieu de stockage">
                  <Input name="lieuStockage" value={form.lieuStockage} onChange={handleChange} placeholder="Ex: Serveur local, Cloud..." />
                </Field>
              </div>

              <SectionTitle title="Communication & Destinataires" />
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 flex flex-wrap gap-4">
                  <CheckField label="Communication à d'autres organismes" name="communicationAutresOrganismes" checked={form.communicationAutresOrganismes} onChange={handleChange} />
                  <CheckField label="Destinataire conforme CIL" name="destinataireConformeCil" checked={form.destinataireConformeCil} onChange={handleChange} />
                  <CheckField label="Transfert vers pays étranger" name="transfertPaysEtranger" checked={form.transfertPaysEtranger} onChange={handleChange} />
                </div>
                {form.communicationAutresOrganismes && (
                  <>
                    <Field label="Nom du destinataire">
                      <Input name="destinataireNom" value={form.destinataireNom} onChange={handleChange} />
                    </Field>
                    <Field label="Adresse du destinataire">
                      <Input name="destinataireAdresse" value={form.destinataireAdresse} onChange={handleChange} />
                    </Field>
                    <Field label="Texte juridique communication">
                      <Textarea name="texteJuridiqueCommunication" value={form.texteJuridiqueCommunication} onChange={handleChange} />
                    </Field>
                    <Field label="Finalité de la communication">
                      <Input name="finaliteCommunication" value={form.finaliteCommunication} onChange={handleChange} />
                    </Field>
                  </>
                )}
              </div>

              <SectionTitle title="Mesures de Sécurité" />
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Field label="Mesures de sécurité mises en place">
                    <Textarea name="mesuresSecurite" value={form.mesuresSecurite} onChange={handleChange} placeholder="Chiffrement, contrôle d'accès..." rows={2} />
                  </Field>
                </div>
                <CheckField label="Mesures de sensibilisation du personnel" name="mesuresSensibilisation" checked={form.mesuresSensibilisation} onChange={handleChange} />
                <CheckField label="Politique d'accès aux bâtiments" name="politiqueAccesBatiments" checked={form.politiqueAccesBatiments} onChange={handleChange} />
                <Field label="Catégories de personnes ayant accès">
                  <Input name="categoriesPersonnesAcces" value={form.categoriesPersonnesAcces} onChange={handleChange} placeholder="Ex: Admins, RH..." />
                </Field>
              </div>
            </div>
          )}

          {/* ── ÉTAPE 5 : Droits & Sous-traitance ── */}
          {step === 5 && (
            <div className="space-y-3">
              <SectionTitle title="Droits des Personnes Concernées" />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Moyens d'information sur les droits">
                  <Textarea name="moyensInformationDroits" value={form.moyensInformationDroits} onChange={handleChange} placeholder="Affichage, email, site web..." />
                </Field>
                <Field label="Moyens d'exercice des droits">
                  <Textarea name="moyensExerciceDroits" value={form.moyensExerciceDroits} onChange={handleChange} placeholder="Formulaire, courrier..." />
                </Field>
                <Field label="Coordonnées pour exercer les droits">
                  <Input name="coordonneesExerciceDroits" value={form.coordonneesExerciceDroits} onChange={handleChange} placeholder="Email, adresse postale..." />
                </Field>
                <Field label="Délai de communication des droits">
                  <Input name="delaiCommunicationDroits" value={form.delaiCommunicationDroits} onChange={handleChange} placeholder="Ex: 30 jours" />
                </Field>
              </div>

              <SectionTitle title="Sous-traitance" />
              <div className="space-y-3">
                <div className="flex flex-wrap gap-4">
                  <CheckField label="Recours à un sous-traitant" name="recoursSousTraitant" checked={form.recoursSousTraitant} onChange={handleChange} />
                  {form.recoursSousTraitant && (
                    <CheckField label="Contrat de confidentialité signé" name="contratConfidentialiteSousTraitant" checked={form.contratConfidentialiteSousTraitant} onChange={handleChange} />
                  )}
                </div>
                {form.recoursSousTraitant && (
                  <Field label="Rôles des sous-traitants">
                    <Textarea name="rolesSousTraitants" value={form.rolesSousTraitants} onChange={handleChange} placeholder="Hébergement, maintenance..." />
                  </Field>
                )}
              </div>
            </div>
          )}

          {/* ── ÉTAPE 6 : Champs spécifiques au type ── */}
          {step === 6 && (
            <div className="space-y-3">

              {/* ── NORMALE ── */}
              {typeDeclaration === "NORMALE" && (
                <>
                  <SectionTitle title="Identification du Traitement" />
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Dénomination du traitement" required>
                      <Input name="denominationTraitement" value={form.denominationTraitement} onChange={handleChange} />
                    </Field>
                    <Field label="Finalité du traitement" required>
                      <Input name="finaliteTraitement" value={form.finaliteTraitement} onChange={handleChange} />
                    </Field>
                    <div className="col-span-2">
                      <Field label="Texte juridique">
                        <Textarea name="texteJuridique" value={form.texteJuridique} onChange={handleChange} placeholder="Base légale..." />
                      </Field>
                    </div>
                    <Field label="Catégories de personnes concernées">
                      <Input name="categoriesPersonnesConcernees" value={form.categoriesPersonnesConcernees} onChange={handleChange} placeholder="Employés, clients..." />
                    </Field>
                    <Field label="Nombre de personnes concernées">
                      <Input type="number" name="nombrePersonnesConcernees" value={form.nombrePersonnesConcernees} onChange={handleChange} />
                    </Field>
                    <Field label="Type de traitement">
                      <Input name="typeTraitement" value={form.typeTraitement} onChange={handleChange} placeholder="Automatisé, Manuel..." />
                    </Field>
                    <Field label="Caractéristiques techniques">
                      <Input name="caracteristiquesTechniques" value={form.caracteristiquesTechniques} onChange={handleChange} />
                    </Field>
                    <div className="col-span-2">
                      <Field label="Caractéristiques du système">
                        <Textarea name="caracteristiquesSysteme" value={form.caracteristiquesSysteme} onChange={handleChange} />
                      </Field>
                    </div>
                  </div>
                  <SectionTitle title="Options supplémentaires" />
                  <div className="flex flex-wrap gap-4">
                    <CheckField label="Procédure manuelle décrite" name="descriptionProcedureManuelle" checked={form.descriptionProcedureManuelle} onChange={handleChange} />
                    <CheckField label="Politique d'accès aux systèmes" name="politiqueAccesSystemes" checked={form.politiqueAccesSystemes} onChange={handleChange} />
                    <CheckField label="Modalités de diffusion des résultats" name="modalitesDiffusionResultats" checked={form.modalitesDiffusionResultats} onChange={handleChange} />
                    <CheckField label="Protocole de recherche" name="protocoleRecherche" checked={form.protocoleRecherche} onChange={handleChange} />
                    <CheckField label="Connexion à d'autres fichiers" name="descriptionConnexionFichiers" checked={form.descriptionConnexionFichiers} onChange={handleChange} />
                  </div>
                  {form.descriptionConnexionFichiers && (
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <Field label="Motifs d'interconnexion">
                        <Input name="motifsInterconnexion" value={form.motifsInterconnexion} onChange={handleChange} />
                      </Field>
                      <Field label="Identité des fichiers interconnectés">
                        <Input name="identiteFichiersInterconnexion" value={form.identiteFichiersInterconnexion} onChange={handleChange} />
                      </Field>
                    </div>
                  )}
                </>
              )}

              {/* ── AUTORISATION ── */}
              {typeDeclaration === "AUTORISATION" && (
                <>
                  <SectionTitle title="Identification du Traitement" />
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Dénomination du traitement" required>
                      <Input name="denominationTraitement" value={form.denominationTraitement} onChange={handleChange} />
                    </Field>
                    <Field label="Finalité du traitement" required>
                      <Input name="finaliteTraitement" value={form.finaliteTraitement} onChange={handleChange} />
                    </Field>
                    <div className="col-span-2">
                      <Field label="Texte juridique">
                        <Textarea name="texteJuridique" value={form.texteJuridique} onChange={handleChange} />
                      </Field>
                    </div>
                    <Field label="Catégories de personnes concernées">
                      <Input name="categoriesPersonnesConcernees" value={form.categoriesPersonnesConcernees} onChange={handleChange} />
                    </Field>
                    <Field label="Nombre de personnes concernées">
                      <Input type="number" name="nombrePersonnesConcernees" value={form.nombrePersonnesConcernees} onChange={handleChange} />
                    </Field>
                    <Field label="Type de traitement">
                      <Input name="typeTraitement" value={form.typeTraitement} onChange={handleChange} />
                    </Field>
                    <Field label="Caractéristiques techniques">
                      <Input name="caracteristiquesTechniques" value={form.caracteristiquesTechniques} onChange={handleChange} />
                    </Field>
                    <div className="col-span-2">
                      <Field label="Fonctionnalités du système">
                        <Textarea name="fonctionnalitesSysteme" value={form.fonctionnalitesSysteme} onChange={handleChange} />
                      </Field>
                    </div>
                    <Field label="Certification sécurité">
                      <Input name="certificationSecurite" value={form.certificationSecurite} onChange={handleChange} placeholder="ISO 27001..." />
                    </Field>
                    <Field label="Description du fichier">
                      <Input name="descriptionFichier" value={form.descriptionFichier} onChange={handleChange} />
                    </Field>
                    <Field label="Mode de transfert">
                      <Input name="modeTransfert" value={form.modeTransfert} onChange={handleChange} placeholder="FTP, API, Email..." />
                    </Field>
                    <Field label="Destinataire (Nom/Prénom)">
                      <Input name="destinataireNomPrenom" value={form.destinataireNomPrenom} onChange={handleChange} />
                    </Field>
                    <Field label="Destinataire (Entreprise)">
                      <Input name="destinataireCie" value={form.destinataireCie} onChange={handleChange} />
                    </Field>
                    <Field label="Origine des données">
                      <Input name="origineDonnees" value={form.origineDonnees} onChange={handleChange} />
                    </Field>
                    <Field label="Durée conservation données santé">
                      <Input name="dureeConservationSante" value={form.dureeConservationSante} onChange={handleChange} />
                    </Field>
                    <Field label="Fondement juridique">
                      <Input name="fondementJuridique" value={form.fondementJuridique} onChange={handleChange} />
                    </Field>
                    <Field label="Méthode de recueil du consentement">
                      <Input name="methodeRecueilConsentement" value={form.methodeRecueilConsentement} onChange={handleChange} />
                    </Field>
                    <Field label="Mesures sécurité transfert">
                      <Input name="mesuresSecuriteTransfert" value={form.mesuresSecuriteTransfert} onChange={handleChange} />
                    </Field>
                    <Field label="Catégories données interconnexion">
                      <Input name="categoriesDonneesInterconnexion" value={form.categoriesDonneesInterconnexion} onChange={handleChange} />
                    </Field>
                    <Field label="Durée interconnexion">
                      <Input name="dureeInterconnexion" value={form.dureeInterconnexion} onChange={handleChange} />
                    </Field>
                    <Field label="Identité fichiers interconnectés">
                      <Input name="identiteFichiersInterconnexion" value={form.identiteFichiersInterconnexion} onChange={handleChange} />
                    </Field>
                    <Field label="Catégories données transférées">
                      <Input name="categoriesDonneesTransfert" value={form.categoriesDonneesTransfert} onChange={handleChange} />
                    </Field>
                    <Field label="Nombre personnes transférées">
                      <Input type="number" name="nombrePersonnesTransfert" value={form.nombrePersonnesTransfert} onChange={handleChange} />
                    </Field>
                    <Field label="Description fichier transfert">
                      <Input name="descriptionFichierTransfert" value={form.descriptionFichierTransfert} onChange={handleChange} />
                    </Field>
                    <div className="col-span-2">
                      <Field label="Description sensibilisation">
                        <Textarea name="descriptionSensibilisation" value={form.descriptionSensibilisation} onChange={handleChange} />
                      </Field>
                    </div>
                    <Field label="Modalités diffusion résultats">
                      <Input name="modalitesDiffusionResultatsAuto" value={form.modalitesDiffusionResultatsAuto} onChange={handleChange} />
                    </Field>
                  </div>
                  <SectionTitle title="Options" />
                  <div className="flex flex-wrap gap-4">
                    <CheckField label="Traitement données de santé" name="traitementDonneesSante" checked={form.traitementDonneesSante} onChange={handleChange} />
                    <CheckField label="Professionnel de santé" name="professionalSante" checked={form.professionalSante} onChange={handleChange} />
                    <CheckField label="Connexion à d'autres fichiers" name="connexionFichiers" checked={form.connexionFichiers} onChange={handleChange} />
                    <CheckField label="Pays destination protège les données" name="paysDestinationProtectionDonnees" checked={form.paysDestinationProtectionDonnees} onChange={handleChange} />
                    <CheckField label="Consentement des personnes concernées" name="consentementPersonnesConcernees" checked={form.consentementPersonnesConcernees} onChange={handleChange} />
                    <CheckField label="Politique d'accès aux systèmes" name="politiqueAccesSystemes" checked={form.politiqueAccesSystemes} onChange={handleChange} />
                  </div>
                </>
              )}

              {/* ── COLLECTE SITE INTERNET ── */}
              {typeDeclaration === "COLLECTE_SITE_INTERNET" && (
                <>
                  <SectionTitle title="Identification du Traitement" />
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Dénomination du traitement" required>
                      <Input name="denominationTraitement" value={form.denominationTraitement} onChange={handleChange} />
                    </Field>
                    <Field label="Finalité du traitement" required>
                      <Input name="finaliteTraitement" value={form.finaliteTraitement} onChange={handleChange} />
                    </Field>
                    <div className="col-span-2">
                      <Field label="Texte juridique">
                        <Textarea name="texteJuridique" value={form.texteJuridique} onChange={handleChange} />
                      </Field>
                    </div>
                    <Field label="Catégories de personnes concernées">
                      <Input name="categoriesPersonnesConcernees" value={form.categoriesPersonnesConcernees} onChange={handleChange} />
                    </Field>
                    <Field label="Type de traitement">
                      <Input name="typeTraitement" value={form.typeTraitement} onChange={handleChange} />
                    </Field>
                    <Field label="Caractéristiques techniques">
                      <Input name="caracteristiquesTechniques" value={form.caracteristiquesTechniques} onChange={handleChange} />
                    </Field>
                    <Field label="Caractéristiques principales de la structure">
                      <Input name="caracteristiquesMainStructure" value={form.caracteristiquesMainStructure} onChange={handleChange} />
                    </Field>
                    <Field label="Téléchargement / Traitement">
                      <Input name="telechargementTraitement" value={form.telechargementTraitement} onChange={handleChange} />
                    </Field>
                  </div>
                  <SectionTitle title="Données de Connexion & Cookies" />
                  <div className="space-y-3">
                    <div className="flex gap-6">
                      <CheckField label="Collecte de données de connexion" name="donneesConnexion" checked={form.donneesConnexion} onChange={handleChange} />
                      <CheckField label="Utilisation de cookies" name="cookies" checked={form.cookies} onChange={handleChange} />
                    </div>
                    {form.donneesConnexion && (
                      <Field label="Description des données de connexion">
                        <Textarea name="descriptionDonneesConnexion" value={form.descriptionDonneesConnexion} onChange={handleChange} placeholder="IP, logs, sessions..." />
                      </Field>
                    )}
                    {form.cookies && (
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Description des cookies">
                          <Input name="descriptionCookies" value={form.descriptionCookies} onChange={handleChange} placeholder="Analytiques, publicitaires..." />
                        </Field>
                        <Field label="Durée de conservation des cookies">
                          <Input name="dureeConservationCookies" value={form.dureeConservationCookies} onChange={handleChange} placeholder="Ex: 13 mois" />
                        </Field>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* ── VIDÉOSURVEILLANCE ── */}
              {typeDeclaration === "SYSTEME_VIDEO_SURVEILLANCE" && (
                <>
                  <SectionTitle title="Identification & Installation" />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <Field label="Finalités du système" required>
                        <Textarea name="finalites" value={form.finalites} onChange={handleChange} placeholder="Sécurité des locaux, contrôle d'accès..." />
                      </Field>
                    </div>
                    <Field label="Adresse exacte d'installation" required>
                      <Input name="adresseInstallation" value={form.adresseInstallation} onChange={handleChange} placeholder="Rue, ville..." />
                    </Field>
                    <Field label="Nature de l'environnement">
                      <Input name="natureEnvironnement" value={form.natureEnvironnement} onChange={handleChange} placeholder="Intérieur, extérieur, mixte..." />
                    </Field>
                    <Field label="Emplacement des caméras">
                      <Input name="emplacementCameras" value={form.emplacementCameras} onChange={handleChange} placeholder="Entrées, couloirs, bureaux..." />
                    </Field>
                    <Field label="Nombre total de caméras" required>
                      <Input type="number" name="nombreTotalCameras" value={form.nombreTotalCameras} onChange={handleChange} />
                    </Field>
                    <Field label="Modèle du dispositif">
                      <Input name="modeleDispositif" value={form.modeleDispositif} onChange={handleChange} placeholder="Marque, modèle..." />
                    </Field>
                    <Field label="Mode de transfert">
                      <Input name="modeTransfertVideo" value={form.modeTransfertVideo} onChange={handleChange} placeholder="IP, analogique..." />
                    </Field>
                    <Field label="Type d'enregistrement">
                      <Input name="typeEnregistrement" value={form.typeEnregistrement} onChange={handleChange} placeholder="Continu, détection mouvement..." />
                    </Field>
                    <Field label="Nature de l'enregistrement">
                      <Input name="natureEnregistrement" value={form.natureEnregistrement} onChange={handleChange} placeholder="Vidéo, audio+vidéo..." />
                    </Field>
                    <Field label="Liaison réseau">
                      <Input name="liaisonReseau" value={form.liaisonReseau} onChange={handleChange} placeholder="LAN, Internet, VPN..." />
                    </Field>
                    <Field label="Accès physique aux enregistrements">
                      <Input name="accesPhysique" value={form.accesPhysique} onChange={handleChange} placeholder="Salle sécurisée, badge..." />
                    </Field>
                    <Field label="Accès logique aux enregistrements">
                      <Input name="accesLogique" value={form.accesLogique} onChange={handleChange} placeholder="Mot de passe, rôles..." />
                    </Field>
                    <Field label="Localisation des pictogrammes">
                      <Input name="localisationPictogrammes" value={form.localisationPictogrammes} onChange={handleChange} placeholder="Entrées, couloirs..." />
                    </Field>
                    <div className="col-span-2">
                      <Field label="Fonctionnalités de traitement">
                        <Textarea name="fonctionnalitesTraitement" value={form.fonctionnalitesTraitement} onChange={handleChange} placeholder="Reconnaissance faciale, détection..." />
                      </Field>
                    </div>
                    {form.utilisationSystemesExperts && (
                      <div className="col-span-2">
                        <Field label="Description des systèmes experts">
                          <Textarea name="descriptionSystemesExperts" value={form.descriptionSystemesExperts} onChange={handleChange} />
                        </Field>
                      </div>
                    )}
                  </div>
                  <SectionTitle title="Options" />
                  <div className="flex flex-wrap gap-4">
                    <CheckField label="Visualisation en temps réel" name="visualisationTempsReel" checked={form.visualisationTempsReel} onChange={handleChange} />
                    <CheckField label="Enregistrement du son" name="sonDeSon" checked={form.sonDeSon} onChange={handleChange} />
                    <CheckField label="Utilisation de systèmes experts (IA)" name="utilisationSystemesExperts" checked={form.utilisationSystemesExperts} onChange={handleChange} />
                    <CheckField label="Accès aux images à distance" name="accesImagesDistance" checked={form.accesImagesDistance} onChange={handleChange} />
                    <CheckField label="Mesures de suppression des données" name="mesuresSuppression" checked={form.mesuresSuppression} onChange={handleChange} />
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer navigation */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-between items-center flex-shrink-0 rounded-b-2xl">
          <button
            onClick={() => step === 1 ? onClose() : setStep(s => s - 1)}
            className="px-5 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100">
            {step === 1 ? "Annuler" : "← Précédent"}
          </button>
          <span className="text-xs text-gray-400">{step} / {totalSteps}</span>
          {step < totalSteps ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={(step === 1 && !selectedTraitementId) || (step === 2 && !typeDeclaration)}
              className="px-6 py-2 bg-green-700 text-white rounded-lg text-sm font-bold hover:bg-green-800 disabled:opacity-40">
              Suivant →
            </button>
          ) : (
            <button onClick={handleSave} className="px-6 py-2 bg-green-800 text-white rounded-lg text-sm font-bold hover:bg-green-900 shadow-md">
              ✅ Valider la Déclaration
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MODULE 6 : Modal Détail Traitement
// ═══════════════════════════════════════════════════════════════════
function ModalDetailTraitement({ traitement, onClose }) {
  if (!traitement) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="bg-green-800 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center">
          <h3 className="font-bold text-lg">Détail du traitement #{traitement.idTraitement}</h3>
          <button onClick={onClose} className="text-green-200 hover:text-white text-2xl leading-none">✕</button>
        </div>
        <div className="p-6 space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 rounded-lg p-3"><p className="text-xs text-green-600 font-semibold">Département</p><p className="font-medium">{traitement.department || "—"}</p></div>
            <div className="bg-green-50 rounded-lg p-3"><p className="text-xs text-green-600 font-semibold">Statut</p><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${traitement.envoyeAuDpo ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{traitement.envoyeAuDpo ? "Envoyé DPO" : traitement.statut === "VALIDÉ" ? "Validé" : "En cours"}</span></div>
            <div className="bg-green-50 rounded-lg p-3 col-span-2"><p className="text-xs text-green-600 font-semibold">Description</p><p>{traitement.description || "—"}</p></div>
            <div className="bg-green-50 rounded-lg p-3 col-span-2"><p className="text-xs text-green-600 font-semibold">Texte / Finalité</p><p>{traitement.texte || "—"}</p></div>
            <div className="bg-green-50 rounded-lg p-3"><p className="text-xs text-green-600 font-semibold">Conservation</p><p>{traitement.dureeConservation ? `${traitement.dureeConservation} mois` : "—"}</p></div>
            <div className="bg-green-50 rounded-lg p-3"><p className="text-xs text-green-600 font-semibold">Date création</p><p>{formatDate(traitement.dateCreation)}</p></div>
            <div className="bg-green-50 rounded-lg p-3"><p className="text-xs text-green-600 font-semibold">Date fin</p><p>{formatDate(traitement.dateFin)}</p></div>
            <div className="bg-green-50 rounded-lg p-3"><p className="text-xs text-green-600 font-semibold">Nb données</p><p>{traitement.nombreDonnee ?? 0}</p></div>
            <div className="bg-green-50 rounded-lg p-3"><p className="text-xs text-green-600 font-semibold">Session</p><p>#{traitement.sessionCollecteId || "Sans session"}</p></div>
          </div>
          <button onClick={onClose} className="w-full mt-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50">Fermer</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MODULE 7 : Modal Détail Déclaration
// ═══════════════════════════════════════════════════════════════════
function ModalDetailDeclaration({ declaration, onClose }) {
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
            <Row label="Date de soumission" value={formatDateShort(declaration.dateSoumission)} />
            <Row label="Secteur" value={declaration.secteur} />
            <Row label="Responsable" value={declaration.responsableDeclaration} />
            <Row label="Contact confidentialité" value={declaration.contactConfidentialite} />
            <Row label="Conservation" value={declaration.dureeConservation} />
            <Row label="Lieu de stockage" value={declaration.lieuStockage} />
          </div>
          <button onClick={onClose} className="w-full mt-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50">Fermer</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MODULE 8 : Composant principal DpoDashboard
// États : sessions (API), traitements (API), déclarations (API),
// demandes (mock). Gère la création de sessions (POST /sessions) et
// le changement de statut (PATCH /sessions/{id}/statut).
// ═══════════════════════════════════════════════════════════════════
function DpoDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sessions, setSessions] = useState([]);
  useEffect(() => {
    api.get("/sessions")
      .then((res) => setSessions(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    api.get("/traitements")
      .then((res) => {
        if (res.data) setAllTraitements(res.data);
      })
      .catch(() => {});
  }, []);

  const [traitements, setTraitements] = useState([]);
  const [allTraitements, setAllTraitements] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nomSession: "", dateDebut: "", dateFin: "", typeCollecte: "EN_LIGNE", lieu: "", description: "" });
  const [toast, setToast] = useState(null);
  const [declarations, setDeclarations] = useState([]);
  const [demandes] = useState(mockDemandes);
  const [notificationsCount] = useState(mockDemandes.filter(d => d.statut === "EN_ATTENTE").length);
  const [showCreerDeclaration, setShowCreerDeclaration] = useState(false);
  const [detailTraitement, setDetailTraitement] = useState(null);
  const [detailDeclaration, setDetailDeclaration] = useState(null);
  const [declarationPreFill, setDeclarationPreFill] = useState(null);
  const [traitementFilterMode, setTraitementFilterMode] = useState("tous");

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreateSession = (e) => {
    e.preventDefault();
    const payload = {
      nomSession: form.nomSession,
      dateDebut: toLocalDateTime(form.dateDebut),
      dateFin: toLocalDateTime(form.dateFin),
      typeCollecte: form.typeCollecte,
      lieu: form.lieu,
      description: form.description,
    };
    api.post("/sessions", payload)
      .then((res) => {
        setSessions((prev) => [...prev, res.data]);
        setShowForm(false);
        setForm({ nomSession: "", dateDebut: "", dateFin: "", typeCollecte: "EN_LIGNE", lieu: "", description: "" });
        showToast("Session créée avec succès");
      })
      .catch(() => showToast("Erreur lors de la création", "error"));
  };

  const handleChangeStatut = (id, valeur) => {
    api.patch(`/sessions/${id}/statut`, null, { params: { valeur } })
      .then((res) => {
        setSessions((prev) => prev.map((s) => s.idSession === id ? { ...s, statutSession: valeur } : s));
        showToast("Statut mis à jour");
      })
      .catch((err) => {
        console.error("Erreur statut:", err.response?.data || err.message);
        setSessions((prev) => prev.map((s) => s.idSession === id ? { ...s, statutSession: valeur } : s));
        showToast("Statut mis à jour (hors ligne)");
      });
  };

  const INTEGER_FIELDS = [
    "nombrePersonnesConcernees", "nombrePersonnesTransfert", "nombreTotalCameras"
  ];

  const handleCreateDeclaration = (data) => {
    const { traitementId, typeDeclaration, ...formData } = data;
    const dateSoumission = new Date().toISOString().split("T")[0];

    const sanitized = { ...formData };
    for (const key of INTEGER_FIELDS) {
      if (sanitized[key] === "" || sanitized[key] === undefined || sanitized[key] === null) {
        sanitized[key] = null;
      } else {
        const n = parseInt(sanitized[key], 10);
        sanitized[key] = isNaN(n) ? null : n;
      }
    }

    const payload = {
      ...sanitized,
      dateSoumission,
      traitementId: parseInt(traitementId),
      responsableDeclaration: formData.nomPrenomResponsable || "",
    };

    const endpointMap = {
      NORMALE: "/declarations/normale",
      AUTORISATION: "/declarations/autorisation",
      COLLECTE_SITE_INTERNET: "/declarations/collecte-site",
      SYSTEME_VIDEO_SURVEILLANCE: "/declarations/video-surveillance",
    };

    const endpoint = endpointMap[typeDeclaration];

    const addLocal = () => {
      const newDecl = {
        idDeclaration: Date.now(),
        typeDeclaration,
        traitementDescription: formData.denominationTraitement || "Nouvelle déclaration",
        denominationTraitement: formData.denominationTraitement,
        dateSoumission,
        statut: "BROUILLON",
        secteur: formData.secteur,
        responsableDeclaration: formData.nomPrenomResponsable,
        dureeConservation: formData.dureeConservation,
        lieuStockage: formData.lieuStockage,
      };
      setDeclarations((prev) => [...prev, newDecl]);
      showToast("✅ Déclaration créée !");
    };

    if (endpoint) {
      api.post(endpoint, payload)
        .then((res) => {
          setDeclarations((prev) => [res.data, ...prev]);
          showToast("✅ Déclaration soumise avec succès !");
        })
        .catch((err) => {
          console.error("❌ POST déclaration échoué:", err.response?.status, err.response?.data || err.message);
          addLocal();
        });
    } else {
      addLocal();
    }
  };

  const handleSoumettreAuDG = async (declaration) => {
    try {
      await api.put(`/declarations/${declaration.idDeclaration}/soumettre`);
      setDeclarations((prev) =>
        prev.map((d) =>
          d.idDeclaration === declaration.idDeclaration ? { ...d, statut: "EN_ATTENTE" } : d
        )
      );
      showToast("Déclaration #" + declaration.idDeclaration + " envoyée au DG avec succès");
    } catch (err) {
      console.error("Erreur soumission DG:", err.response?.status, err.response?.data || err.message);
      showToast("Erreur lors de l'envoi au DG", "error");
    }
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
      setTraitements(allTraitements.filter(t => t.sessionCollecteId === Number(selectedSessionId)));
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
            <StatCard label="En cours" value={stats.enCours} color="bg-green-500" />
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
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la session <span className="text-red-500">*</span></label>
                  <input type="text" value={form.nomSession} onChange={(e) => setForm((p) => ({ ...p, nomSession: e.target.value }))} placeholder="Ex: Collecte des données RH 2026" required className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm" />
                </div>
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
                    <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Traitements</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Statut</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">DPO</th>
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
                      <td className="px-5 py-4 text-center">
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">{s.nombreTraitements ?? 0}</span>
                      </td>
                      <td className="px-5 py-4">{statutBadge(s.statutSession)}</td>
                      <td className="px-5 py-4 text-sm text-gray-600">{s.dpoNomComplet || "—"}</td>
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
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">{t.nombreDonnee || 0}</span>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-500">{formatDate(t.dateCreation)}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => setDetailTraitement(t)} className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200">Voir</button>
                          <button onClick={() => { setDeclarationPreFill(t); setActiveTab("declarations"); setShowCreerDeclaration(true); }} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium hover:bg-purple-200">Déclaration</button>
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
                    <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {declarations.map((d) => (
                    <tr key={d.idDeclaration} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-4 font-mono text-xs text-gray-400">#{d.idDeclaration}</td>
                      <td className="px-5 py-4">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{d.typeDeclaration || "N/A"}</span>
                      </td>
                      <td className="px-5 py-4 font-medium text-gray-800">{d.traitementDescription || d.denominationTraitement || "—"}</td>
                      <td className="px-5 py-4 text-xs text-gray-500">{formatDateShort(d.dateSoumission)}</td>
                      <td className="px-5 py-4">{declarationStatutBadge(d.statut)}</td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => setDetailDeclaration(d)} className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200">Voir</button>
                          {d.statut === "BROUILLON" && (
                            <button onClick={() => handleSoumettreAuDG(d)} className="px-3 py-1 bg-green-700 text-white rounded-lg text-xs font-medium hover:bg-green-800">
                              Envoyer au DG
                            </button>
                          )}
                        </div>
                      </td>
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

      {detailTraitement && (
        <ModalDetailTraitement traitement={detailTraitement} onClose={() => setDetailTraitement(null)} />
      )}
      {detailDeclaration && (
        <ModalDetailDeclaration declaration={detailDeclaration} onClose={() => setDetailDeclaration(null)} />
      )}
      {showCreerDeclaration && (
        <ModalCreerDeclaration
          traitements={allTraitements}
          onClose={() => { setDeclarationPreFill(null); setShowCreerDeclaration(false); }}
          onSave={handleCreateDeclaration}
          preFillTraitement={declarationPreFill}
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