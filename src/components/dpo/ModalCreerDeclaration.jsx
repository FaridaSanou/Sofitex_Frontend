import { useState, useEffect } from "react";
import api from "../../services/api";
import { Field, Input, Textarea, CheckField, SectionTitle } from "./DpoFormFields";

const TYPES_DECLARATION = [
  { id: "NORMALE", label: "Déclaration Normale", desc: "Traitement standard de données" },
  { id: "AUTORISATION", label: "Demande d'Autorisation", desc: "Traitement nécessitant une autorisation" },
  { id: "COLLECTE_SITE_INTERNET", label: "Collecte via Site Internet", desc: "Données collectées via formulaire web" },
  { id: "SYSTEME_VIDEO_SURVEILLANCE", label: "Système de Vidéosurveillance", desc: "Surveillance par caméras" },
];

const initForm = {
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
  denominationTraitement: "", finaliteTraitement: "", texteJuridique: "",
  categoriesPersonnesConcernees: "", nombrePersonnesConcernees: "",
  typeTraitement: "", descriptionProcedureManuelle: false,
  caracteristiquesTechniques: "", caracteristiquesSysteme: "",
  politiqueAccesSystemes: false, modalitesDiffusionResultats: false,
  protocoleRecherche: false, descriptionConnexionFichiers: false,
  motifsInterconnexion: "", identiteFichiersInterconnexion: "",
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
  caracteristiquesMainStructure: "", donneesConnexion: false,
  descriptionDonneesConnexion: "", cookies: false,
  descriptionCookies: "", dureeConservationCookies: "",
  telechargementTraitement: "",
  finalites: "", adresseInstallation: "", natureEnvironnement: "",
  emplacementCameras: "", nombreTotalCameras: "", modeleDispositif: "",
  visualisationTempsReel: false, modeTransfertVideo: "", sonDeSon: false,
  typeEnregistrement: "", natureEnregistrement: "", liaisonReseau: "",
  utilisationSystemesExperts: false, descriptionSystemesExperts: "",
  fonctionnalitesTraitement: "", accesImagesDistance: false,
  accesPhysique: "", accesLogique: "", mesuresSuppression: false,
  localisationPictogrammes: "",
};

export default function ModalCreerDeclaration({ traitements, onClose, onSave, preFillTraitement }) {
  const [step, setStep] = useState(1);
  const [selectedTraitementId, setSelectedTraitementId] = useState("");
  const [typeDeclaration, setTypeDeclaration] = useState("");
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
          setForm(prev => ({ ...baseFill(prev), dateMiseEnOeuvre: d.dateMiseEnOeuvre || prev.dateMiseEnOeuvre, responsableDeclaration: d.responsableDeclaration || prev.responsableDeclaration, contactConfidentialite: d.contactConfidentialite || prev.contactConfidentialite, secteur: d.secteur || prev.secteur }));
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
  const handleSave = () => { onSave({ traitementId: parseInt(selectedTraitementId), typeDeclaration, ...form }); onClose(); };

  const stepTitles = ["Traitement", "Type", "Identification", "Données & Sécurité", "Droits & Sous-traitance", "Spécifique"];
  const totalSteps = 6;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 font-sans text-left">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col">
        <div className="bg-green-800 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center flex-shrink-0">
          <div>
            <h3 className="font-bold text-lg">Nouvelle Déclaration CIL</h3>
            <p className="text-xs opacity-80">Étape {step}/{totalSteps} — {stepTitles[step - 1]}</p>
          </div>
          <button onClick={onClose} className="text-2xl leading-none">✕</button>
        </div>

        <div className="flex gap-1 px-6 pt-3 flex-shrink-0">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i < step ? "bg-green-600" : "bg-gray-200"}`} />
          ))}
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-3">
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

          {step === 3 && (
            <div className="space-y-3">
              <SectionTitle title="Identification & Responsable" />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Nom & Prénom Responsable" required><Input name="nomPrenomResponsable" value={form.nomPrenomResponsable} onChange={handleChange} placeholder="Ex: Koné Mamadou" /></Field>
                <Field label="Fonction du Responsable" required><Input name="fonctionResponsable" value={form.fonctionResponsable} onChange={handleChange} placeholder="Ex: Directeur DSI" /></Field>
                <Field label="Secteur / Département" required><Input name="secteur" value={form.secteur} onChange={handleChange} placeholder="Ex: DRH" /></Field>
                <Field label="Contact Confidentialité"><Input name="contactConfidentialite" value={form.contactConfidentialite} onChange={handleChange} placeholder="email ou téléphone" /></Field>
                <Field label="Nature de la Demande" required>
                  <select name="natureDemande" value={form.natureDemande} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
                    <option value="PREMIERE">Première déclaration</option>
                    <option value="MODIFICATION">Modification</option>
                    <option value="RENOUVELLEMENT">Renouvellement</option>
                  </select>
                </Field>
                <Field label="Date de mise en œuvre"><Input name="dateMiseEnOeuvre" value={form.dateMiseEnOeuvre} onChange={handleChange} type="date" /></Field>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3">
              <SectionTitle title="Données Traitées" />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Catégories de données"><Input name="categoriesDonnees" value={form.categoriesDonnees} onChange={handleChange} placeholder="Ex: Identité, Santé..." /></Field>
                <Field label="Origine des données"><Input name="origineDonnees" value={form.origineDonnees} onChange={handleChange} placeholder="Ex: Formulaire, Tiers..." /></Field>
                <Field label="Durée de conservation"><Input name="dureeConservation" value={form.dureeConservation} onChange={handleChange} placeholder="Ex: 5 ans" /></Field>
                <Field label="Lieu de stockage"><Input name="lieuStockage" value={form.lieuStockage} onChange={handleChange} placeholder="Ex: Serveur local, Cloud..." /></Field>
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
                    <Field label="Nom du destinataire"><Input name="destinataireNom" value={form.destinataireNom} onChange={handleChange} /></Field>
                    <Field label="Adresse du destinataire"><Input name="destinataireAdresse" value={form.destinataireAdresse} onChange={handleChange} /></Field>
                    <Field label="Texte juridique communication"><Textarea name="texteJuridiqueCommunication" value={form.texteJuridiqueCommunication} onChange={handleChange} /></Field>
                    <Field label="Finalité de la communication"><Input name="finaliteCommunication" value={form.finaliteCommunication} onChange={handleChange} /></Field>
                  </>
                )}
              </div>
              <SectionTitle title="Mesures de Sécurité" />
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><Field label="Mesures de sécurité mises en place"><Textarea name="mesuresSecurite" value={form.mesuresSecurite} onChange={handleChange} placeholder="Chiffrement, contrôle d'accès..." rows={2} /></Field></div>
                <CheckField label="Mesures de sensibilisation du personnel" name="mesuresSensibilisation" checked={form.mesuresSensibilisation} onChange={handleChange} />
                <CheckField label="Politique d'accès aux bâtiments" name="politiqueAccesBatiments" checked={form.politiqueAccesBatiments} onChange={handleChange} />
                <Field label="Catégories de personnes ayant accès"><Input name="categoriesPersonnesAcces" value={form.categoriesPersonnesAcces} onChange={handleChange} placeholder="Ex: Admins, RH..." /></Field>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-3">
              <SectionTitle title="Droits des Personnes Concernées" />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Moyens d'information sur les droits"><Textarea name="moyensInformationDroits" value={form.moyensInformationDroits} onChange={handleChange} placeholder="Affichage, email, site web..." /></Field>
                <Field label="Moyens d'exercice des droits"><Textarea name="moyensExerciceDroits" value={form.moyensExerciceDroits} onChange={handleChange} placeholder="Formulaire, courrier..." /></Field>
                <Field label="Coordonnées pour exercer les droits"><Input name="coordonneesExerciceDroits" value={form.coordonneesExerciceDroits} onChange={handleChange} placeholder="Email, adresse postale..." /></Field>
                <Field label="Délai de communication des droits"><Input name="delaiCommunicationDroits" value={form.delaiCommunicationDroits} onChange={handleChange} placeholder="Ex: 30 jours" /></Field>
              </div>
              <SectionTitle title="Sous-traitance" />
              <div className="space-y-3">
                <div className="flex flex-wrap gap-4">
                  <CheckField label="Recours à un sous-traitant" name="recoursSousTraitant" checked={form.recoursSousTraitant} onChange={handleChange} />
                  {form.recoursSousTraitant && <CheckField label="Contrat de confidentialité signé" name="contratConfidentialiteSousTraitant" checked={form.contratConfidentialiteSousTraitant} onChange={handleChange} />}
                </div>
                {form.recoursSousTraitant && <Field label="Rôles des sous-traitants"><Textarea name="rolesSousTraitants" value={form.rolesSousTraitants} onChange={handleChange} placeholder="Hébergement, maintenance..." /></Field>}
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-3">
              {typeDeclaration === "NORMALE" && (
                <>
                  <SectionTitle title="Identification du Traitement" />
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Dénomination du traitement" required><Input name="denominationTraitement" value={form.denominationTraitement} onChange={handleChange} /></Field>
                    <Field label="Finalité du traitement" required><Input name="finaliteTraitement" value={form.finaliteTraitement} onChange={handleChange} /></Field>
                    <div className="col-span-2"><Field label="Texte juridique"><Textarea name="texteJuridique" value={form.texteJuridique} onChange={handleChange} placeholder="Base légale..." /></Field></div>
                    <Field label="Catégories de personnes concernées"><Input name="categoriesPersonnesConcernees" value={form.categoriesPersonnesConcernees} onChange={handleChange} placeholder="Employés, clients..." /></Field>
                    <Field label="Nombre de personnes concernées"><Input type="number" name="nombrePersonnesConcernees" value={form.nombrePersonnesConcernees} onChange={handleChange} /></Field>
                    <Field label="Type de traitement"><Input name="typeTraitement" value={form.typeTraitement} onChange={handleChange} placeholder="Automatisé, Manuel..." /></Field>
                    <Field label="Caractéristiques techniques"><Input name="caracteristiquesTechniques" value={form.caracteristiquesTechniques} onChange={handleChange} /></Field>
                    <div className="col-span-2"><Field label="Caractéristiques du système"><Textarea name="caracteristiquesSysteme" value={form.caracteristiquesSysteme} onChange={handleChange} /></Field></div>
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
                      <Field label="Motifs d'interconnexion"><Input name="motifsInterconnexion" value={form.motifsInterconnexion} onChange={handleChange} /></Field>
                      <Field label="Identité des fichiers interconnectés"><Input name="identiteFichiersInterconnexion" value={form.identiteFichiersInterconnexion} onChange={handleChange} /></Field>
                    </div>
                  )}
                </>
              )}

              {typeDeclaration === "AUTORISATION" && (
                <>
                  <SectionTitle title="Identification du Traitement" />
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Dénomination du traitement" required><Input name="denominationTraitement" value={form.denominationTraitement} onChange={handleChange} /></Field>
                    <Field label="Finalité du traitement" required><Input name="finaliteTraitement" value={form.finaliteTraitement} onChange={handleChange} /></Field>
                    <div className="col-span-2"><Field label="Texte juridique"><Textarea name="texteJuridique" value={form.texteJuridique} onChange={handleChange} /></Field></div>
                    <Field label="Catégories de personnes concernées"><Input name="categoriesPersonnesConcernees" value={form.categoriesPersonnesConcernees} onChange={handleChange} /></Field>
                    <Field label="Nombre de personnes concernées"><Input type="number" name="nombrePersonnesConcernees" value={form.nombrePersonnesConcernees} onChange={handleChange} /></Field>
                    <Field label="Type de traitement"><Input name="typeTraitement" value={form.typeTraitement} onChange={handleChange} /></Field>
                    <Field label="Caractéristiques techniques"><Input name="caracteristiquesTechniques" value={form.caracteristiquesTechniques} onChange={handleChange} /></Field>
                    <div className="col-span-2"><Field label="Fonctionnalités du système"><Textarea name="fonctionnalitesSysteme" value={form.fonctionnalitesSysteme} onChange={handleChange} /></Field></div>
                    <Field label="Certification sécurité"><Input name="certificationSecurite" value={form.certificationSecurite} onChange={handleChange} placeholder="ISO 27001..." /></Field>
                    <Field label="Description du fichier"><Input name="descriptionFichier" value={form.descriptionFichier} onChange={handleChange} /></Field>
                    <Field label="Mode de transfert"><Input name="modeTransfert" value={form.modeTransfert} onChange={handleChange} placeholder="FTP, API, Email..." /></Field>
                    <Field label="Destinataire (Nom/Prénom)"><Input name="destinataireNomPrenom" value={form.destinataireNomPrenom} onChange={handleChange} /></Field>
                    <Field label="Destinataire (Entreprise)"><Input name="destinataireCie" value={form.destinataireCie} onChange={handleChange} /></Field>
                    <Field label="Origine des données"><Input name="origineDonnees" value={form.origineDonnees} onChange={handleChange} /></Field>
                    <Field label="Durée conservation données santé"><Input name="dureeConservationSante" value={form.dureeConservationSante} onChange={handleChange} /></Field>
                    <Field label="Fondement juridique"><Input name="fondementJuridique" value={form.fondementJuridique} onChange={handleChange} /></Field>
                    <Field label="Méthode de recueil du consentement"><Input name="methodeRecueilConsentement" value={form.methodeRecueilConsentement} onChange={handleChange} /></Field>
                    <Field label="Mesures sécurité transfert"><Input name="mesuresSecuriteTransfert" value={form.mesuresSecuriteTransfert} onChange={handleChange} /></Field>
                    <Field label="Catégories données interconnexion"><Input name="categoriesDonneesInterconnexion" value={form.categoriesDonneesInterconnexion} onChange={handleChange} /></Field>
                    <Field label="Durée interconnexion"><Input name="dureeInterconnexion" value={form.dureeInterconnexion} onChange={handleChange} /></Field>
                    <Field label="Identité fichiers interconnectés"><Input name="identiteFichiersInterconnexion" value={form.identiteFichiersInterconnexion} onChange={handleChange} /></Field>
                    <Field label="Catégories données transférées"><Input name="categoriesDonneesTransfert" value={form.categoriesDonneesTransfert} onChange={handleChange} /></Field>
                    <Field label="Nombre personnes transférées"><Input type="number" name="nombrePersonnesTransfert" value={form.nombrePersonnesTransfert} onChange={handleChange} /></Field>
                    <Field label="Description fichier transfert"><Input name="descriptionFichierTransfert" value={form.descriptionFichierTransfert} onChange={handleChange} /></Field>
                    <div className="col-span-2"><Field label="Description sensibilisation"><Textarea name="descriptionSensibilisation" value={form.descriptionSensibilisation} onChange={handleChange} /></Field></div>
                    <Field label="Modalités diffusion résultats"><Input name="modalitesDiffusionResultatsAuto" value={form.modalitesDiffusionResultatsAuto} onChange={handleChange} /></Field>
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

              {typeDeclaration === "COLLECTE_SITE_INTERNET" && (
                <>
                  <SectionTitle title="Identification du Traitement" />
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Dénomination du traitement" required><Input name="denominationTraitement" value={form.denominationTraitement} onChange={handleChange} /></Field>
                    <Field label="Finalité du traitement" required><Input name="finaliteTraitement" value={form.finaliteTraitement} onChange={handleChange} /></Field>
                    <div className="col-span-2"><Field label="Texte juridique"><Textarea name="texteJuridique" value={form.texteJuridique} onChange={handleChange} /></Field></div>
                    <Field label="Catégories de personnes concernées"><Input name="categoriesPersonnesConcernees" value={form.categoriesPersonnesConcernees} onChange={handleChange} /></Field>
                    <Field label="Type de traitement"><Input name="typeTraitement" value={form.typeTraitement} onChange={handleChange} /></Field>
                    <Field label="Caractéristiques techniques"><Input name="caracteristiquesTechniques" value={form.caracteristiquesTechniques} onChange={handleChange} /></Field>
                    <Field label="Caractéristiques principales de la structure"><Input name="caracteristiquesMainStructure" value={form.caracteristiquesMainStructure} onChange={handleChange} /></Field>
                    <Field label="Téléchargement / Traitement"><Input name="telechargementTraitement" value={form.telechargementTraitement} onChange={handleChange} /></Field>
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
                        <Field label="Description des cookies"><Input name="descriptionCookies" value={form.descriptionCookies} onChange={handleChange} placeholder="Analytiques, publicitaires..." /></Field>
                        <Field label="Durée de conservation des cookies"><Input name="dureeConservationCookies" value={form.dureeConservationCookies} onChange={handleChange} placeholder="Ex: 13 mois" /></Field>
                      </div>
                    )}
                  </div>
                </>
              )}

              {typeDeclaration === "SYSTEME_VIDEO_SURVEILLANCE" && (
                <>
                  <SectionTitle title="Identification & Installation" />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2"><Field label="Finalités du système" required><Textarea name="finalites" value={form.finalites} onChange={handleChange} placeholder="Sécurité des locaux, contrôle d'accès..." /></Field></div>
                    <Field label="Adresse exacte d'installation" required><Input name="adresseInstallation" value={form.adresseInstallation} onChange={handleChange} placeholder="Rue, ville..." /></Field>
                    <Field label="Nature de l'environnement"><Input name="natureEnvironnement" value={form.natureEnvironnement} onChange={handleChange} placeholder="Intérieur, extérieur, mixte..." /></Field>
                    <Field label="Emplacement des caméras"><Input name="emplacementCameras" value={form.emplacementCameras} onChange={handleChange} placeholder="Entrées, couloirs, bureaux..." /></Field>
                    <Field label="Nombre total de caméras" required><Input type="number" name="nombreTotalCameras" value={form.nombreTotalCameras} onChange={handleChange} /></Field>
                    <Field label="Modèle du dispositif"><Input name="modeleDispositif" value={form.modeleDispositif} onChange={handleChange} placeholder="Marque, modèle..." /></Field>
                    <Field label="Mode de transfert"><Input name="modeTransfertVideo" value={form.modeTransfertVideo} onChange={handleChange} placeholder="IP, analogique..." /></Field>
                    <Field label="Type d'enregistrement"><Input name="typeEnregistrement" value={form.typeEnregistrement} onChange={handleChange} placeholder="Continu, détection mouvement..." /></Field>
                    <Field label="Nature de l'enregistrement"><Input name="natureEnregistrement" value={form.natureEnregistrement} onChange={handleChange} placeholder="Vidéo, audio+vidéo..." /></Field>
                    <Field label="Liaison réseau"><Input name="liaisonReseau" value={form.liaisonReseau} onChange={handleChange} placeholder="LAN, Internet, VPN..." /></Field>
                    <Field label="Accès physique aux enregistrements"><Input name="accesPhysique" value={form.accesPhysique} onChange={handleChange} placeholder="Salle sécurisée, badge..." /></Field>
                    <Field label="Accès logique aux enregistrements"><Input name="accesLogique" value={form.accesLogique} onChange={handleChange} placeholder="Mot de passe, rôles..." /></Field>
                    <Field label="Localisation des pictogrammes"><Input name="localisationPictogrammes" value={form.localisationPictogrammes} onChange={handleChange} placeholder="Entrées, couloirs..." /></Field>
                    <div className="col-span-2"><Field label="Fonctionnalités de traitement"><Textarea name="fonctionnalitesTraitement" value={form.fonctionnalitesTraitement} onChange={handleChange} placeholder="Reconnaissance faciale, détection..." /></Field></div>
                    {form.utilisationSystemesExperts && (
                      <div className="col-span-2"><Field label="Description des systèmes experts"><Textarea name="descriptionSystemesExperts" value={form.descriptionSystemesExperts} onChange={handleChange} /></Field></div>
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

        <div className="px-6 py-4 border-t bg-gray-50 flex justify-between items-center flex-shrink-0 rounded-b-2xl">
          <button onClick={() => step === 1 ? onClose() : setStep(s => s - 1)}
            className="px-5 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100">
            {step === 1 ? "Annuler" : "← Précédent"}
          </button>
          <span className="text-xs text-gray-400">{step} / {totalSteps}</span>
          {step < totalSteps ? (
            <button onClick={() => setStep(s => s + 1)}
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
