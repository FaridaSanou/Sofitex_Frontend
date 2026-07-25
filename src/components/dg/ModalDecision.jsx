import { useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "../ui/Icon";
import { formatDate } from "../../utils/date";

const TYPE_LABELS = {
  NORMALE: "Déclaration Normale",
  AUTORISATION: "Demande d'Autorisation",
  COLLECTE_SITE: "Collecte via Site Internet",
  VIDEO_SURVEILLANCE: "Système de Vidéosurveillance",
};

const STATUT_LABELS = {
  BROUILLON: "Brouillon",
  EN_ATTENTE: "En attente",
  APPROUVEE_DG: "Approuvée DG",
  REJETEE_DG: "Rejetée DG",
  EN_VERIFICATION_CIL: "En vérification CIL",
  VALIDEE_CIL: "Validée CIL",
  REJETEE_CIL: "Rejetée CIL",
};

const STATUT_COLORS = {
  BROUILLON: "bg-gray-100 text-gray-600",
  EN_ATTENTE: "bg-yellow-100 text-yellow-700",
  APPROUVEE_DG: "bg-blue-100 text-blue-700",
  REJETEE_DG: "bg-red-100 text-red-700",
  EN_VERIFICATION_CIL: "bg-orange-100 text-orange-700",
  VALIDEE_CIL: "bg-green-100 text-green-700",
  REJETEE_CIL: "bg-red-100 text-red-700",
};

function BoolTag({ value }) {
  return value ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Oui</span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">Non</span>
  );
}

function Row({ label, value, className = "" }) {
  return (
    <div className={`bg-gray-50 rounded-lg p-3 ${className}`}>
      <p className="text-xs text-gray-400 font-semibold mb-0.5">{label}</p>
      <p className="text-sm text-gray-800 font-medium break-words">{value || "—"}</p>
    </div>
  );
}

function BoolRow({ label, value, className = "" }) {
  return (
    <div className={`bg-gray-50 rounded-lg p-3 ${className}`}>
      <p className="text-xs text-gray-400 font-semibold mb-0.5">{label}</p>
      <BoolTag value={value} />
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-bold text-green-800 uppercase tracking-wide border-b border-green-100 pb-1">{title}</h4>
      <div className="grid grid-cols-2 gap-2">{children}</div>
    </div>
  );
}

export default function ModalDecision({ declaration, onClose, onValider, onRejeter }) {
  const [section, setSection] = useState("generales");
  const [commentaire, setCommentaire] = useState("");
  const [action, setAction] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!declaration) return null;

  const d = declaration;

  const handleConfirm = async () => {
    if (!action) return;
    setLoading(true);
    try {
      if (action === "VALIDE") {
        await onValider(d.idDeclaration);
      } else {
        await onRejeter(d.idDeclaration, commentaire);
      }
      onClose();
    } catch { setLoading(false); }
  };

  const sections = [
    { id: "generales", label: "Générales" },
    { id: "donnees", label: "Données" },
    { id: "securite", label: "Sécurité" },
    { id: "specifique", label: "Spécifique" },
  ];

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col">
        <div className="bg-green-900 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center flex-shrink-0 sticky top-0 z-10">
          <div>
            <h3 className="font-bold text-lg">Déclaration #{d.idDeclaration}</h3>
            <p className="text-green-300 text-xs">
              {TYPE_LABELS[d.typeDeclaration] || d.typeDeclaration} —{" "}
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${STATUT_COLORS[d.statut] || "bg-gray-100 text-gray-600"}`}>
                {STATUT_LABELS[d.statut] || d.statut}
              </span>
            </p>
          </div>
           <button onClick={onClose} className="text-green-300 hover:text-white">
            <Icon name="close" className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-1 px-4 pt-3 flex-shrink-0 border-b border-gray-100">
          {sections.map(s => (
            <button key={s.id} onClick={() => setSection(s.id)}
              className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition ${section === s.id ? "bg-green-50 text-green-800 border-b-2 border-green-600" : "text-gray-500 hover:text-gray-700"}`}>
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-sm">
          {section === "generales" && (
            <>
              <Section title="Informations générales">
                <Row label="Traitement associé" value={d.traitementDescription || d.denominationTraitement} className="col-span-2" />
                <Row label="Date de soumission" value={formatDate(d.dateSoumission)} />
                <Row label="Secteur / Département" value={d.secteur} />
                <Row label="Nature de la demande" value={d.natureDemande} />
                <Row label="Origine" value={d.origineDeclaration} />
                <Row label="Date de mise en œuvre" value={formatDate(d.dateMiseEnOeuvre)} />
              </Section>

              <Section title="Responsable">
                <Row label="Nom & Prénom" value={d.nomPrenomResponsable || d.responsableDeclaration} />
                <Row label="Fonction" value={d.fonctionResponsable} />
                <Row label="Service" value={d.serviceResponsable} />
                <Row label="Contact confidentialité" value={d.contactConfidentialite} />
                <Row label="DPO" value={d.dpoNomPrenom} className="col-span-2" />
              </Section>

              <Section title="Entreprise">
                <Row label="Nom / Raison sociale" value={d.nomRaisonSociale} />
                <Row label="RCCM" value={d.rccm} />
                <Row label="Secteur d'activité" value={d.secteurActivite} />
                <Row label="Adresse" value={d.adresse} />
                <Row label="Boîte postale" value={d.boitePostale} />
                <Row label="Ville" value={d.ville} />
                <Row label="Téléphone" value={d.telephoneResponsable} />
                <Row label="Email" value={d.adresseEmailResponsable} />
                <Row label="Activité principale" value={d.activitePrincipale} className="col-span-2" />
              </Section>
            </>
          )}

          {section === "donnees" && (
            <>
              <Section title="Données traitées">
                <Row label="Catégories de données" value={d.categoriesDonnees} className="col-span-2" />
                <Row label="Origine des données" value={d.origineDonnees} />
                <Row label="Durée de conservation" value={d.dureeConservation} />
                <Row label="Lieu de stockage" value={d.lieuStockage} />
                <Row label="Données sensibles" value={d.donneesSensibles ? d.natureDonneesSensibles : "Non"} className="col-span-2" />
              </Section>

              <Section title="Communication & Destinataires">
                <BoolRow label="Communication à d'autres organismes" value={d.communicationAutresOrganismes} />
                <BoolRow label="Destinataire conforme CIL" value={d.destinataireConformeCil} />
                <Row label="Nom du destinataire" value={d.destinataireNom} />
                <Row label="Adresse du destinataire" value={d.destinataireAdresse} />
                <Row label="Texte juridique communication" value={d.texteJuridiqueCommunication} className="col-span-2" />
                <Row label="Finalité communication" value={d.finaliteCommunication} className="col-span-2" />
              </Section>

              <Section title="Transfert international">
                <BoolRow label="Transfert vers pays étranger" value={d.transfertPaysEtranger} />
                <Row label="Pays destination" value={d.paysDestination} />
                <Row label="Garanties protection" value={d.garantiesProtectionEtranger} className="col-span-2" />
              </Section>
            </>
          )}

          {section === "securite" && (
            <>
              <Section title="Sécurité & Accès">
                <Row label="Mesures de sécurité" value={d.mesuresSecurite} className="col-span-2" />
                <BoolRow label="Mesures de sensibilisation" value={d.mesuresSensibilisation} />
                <BoolRow label="Politique accès bâtiments" value={d.politiqueAccesBatiments} />
                <Row label="Catégories personnes ayant accès" value={d.categoriesPersonnesAcces} className="col-span-2" />
              </Section>

              <Section title="Sous-traitance">
                <BoolRow label="Recours à un sous-traitant" value={d.recoursSousTraitant} />
                <BoolRow label="Contrat de confidentialité" value={d.contratConfidentialiteSousTraitant} />
                <Row label="Rôles des sous-traitants" value={d.rolesSousTraitants} className="col-span-2" />
              </Section>

              <Section title="Droits des personnes">
                <Row label="Moyens d'information" value={d.moyensInformationDroits} className="col-span-2" />
                <Row label="Moyens d'exercice" value={d.moyensExerciceDroits} className="col-span-2" />
                <Row label="Coordonnées exercice droits" value={d.coordonneesExerciceDroits} />
                <Row label="Délai communication" value={d.delaiCommunicationDroits} />
              </Section>
            </>
          )}

          {section === "specifique" && (
            <>
              {d.typeDeclaration === "NORMALE" && (
                <>
                  <Section title="Identification du traitement">
                    <Row label="Dénomination" value={d.denominationTraitement} className="col-span-2" />
                    <Row label="Finalité" value={d.finaliteTraitement} className="col-span-2" />
                    <Row label="Texte juridique" value={d.texteJuridique} className="col-span-2" />
                    <Row label="Catégories personnes concernées" value={d.categoriesPersonnesConcernees} />
                    <Row label="Nombre de personnes" value={d.nombrePersonnesConcernees} />
                    <Row label="Type de traitement" value={d.typeTraitement} />
                    <Row label="Caractéristiques techniques" value={d.caracteristiquesTechniques} />
                  </Section>
                  <Section title="Caractéristiques système">
                    <Row label="Description" value={d.caracteristiquesSysteme} className="col-span-2" />
                    <Row label="Intitulé traitement" value={d.intituleTraitement} />
                    <Row label="Support traitement" value={d.supportTraitement} />
                    <Row label="Catégories données collectées" value={d.categoriesDonneesCollectees} className="col-span-2" />
                  </Section>
                  <Section title="Options">
                    <BoolRow label="Procédure manuelle" value={d.descriptionProcedureManuelle} />
                    <BoolRow label="Politique accès systèmes" value={d.politiqueAccesSystemes} />
                    <BoolRow label="Diffusion résultats" value={d.modalitesDiffusionResultatsBool} />
                    <BoolRow label="Protocole recherche" value={d.protocoleRecherche} />
                    <BoolRow label="Connexion fichiers" value={d.descriptionConnexionFichiers} />
                    <Row label="Motifs interconnexion" value={d.motifsInterconnexion} />
                    <Row label="Fichiers interconnectés" value={d.identiteFichiersInterconnexion} />
                  </Section>
                </>
              )}

              {d.typeDeclaration === "AUTORISATION" && (
                <>
                  <Section title="Identification du traitement">
                    <Row label="Dénomination" value={d.denominationTraitement} className="col-span-2" />
                    <Row label="Finalité" value={d.finaliteTraitement} className="col-span-2" />
                    <Row label="Texte juridique" value={d.texteJuridique} className="col-span-2" />
                    <Row label="Catégories personnes concernées" value={d.categoriesPersonnesConcernees} />
                    <Row label="Nombre de personnes" value={d.nombrePersonnesConcernees} />
                    <Row label="Type de traitement" value={d.typeTraitement} />
                    <Row label="Caractéristiques techniques" value={d.caracteristiquesTechniques} />
                  </Section>
                  <Section title="Système & Sécurité">
                    <Row label="Fonctionnalités système" value={d.fonctionnalitesSysteme} className="col-span-2" />
                    <Row label="Certification sécurité" value={d.certificationSecurite} />
                    <Row label="Politique accès systèmes" value={d.politiqueAccesSystemes} />
                    <Row label="Description fichier" value={d.descriptionFichier} />
                    <Row label="Mode de transfert" value={d.modeTransfert} />
                    <Row label="Destinataire (Nom)" value={d.destinataireNomPrenom} />
                    <Row label="Destinataire (Entreprise)" value={d.destinataireCie} />
                  </Section>
                  <Section title="Données santé">
                    <BoolRow label="Traitement données santé" value={d.traitementDonneesSante} />
                    <BoolRow label="Professionnel de santé" value={d.professionalSante} />
                    <Row label="Durée conservation santé" value={d.dureeConservationSante} />
                    <Row label="Finalité santé" value={d.finaliteSante} />
                  </Section>
                  <Section title="Interconnexion & Transfert">
                    <BoolRow label="Connexion fichiers" value={d.connexionFichiers} />
                    <Row label="Catégories données interconnexion" value={d.categoriesDonneesInterconnexion} />
                    <Row label="Durée interconnexion" value={d.dureeInterconnexion} />
                    <Row label="Fichiers interconnectés" value={d.identiteFichiersInterconnexion} />
                    <Row label="Fondement juridique" value={d.fondementJuridique} className="col-span-2" />
                    <Row label="Description fichier transfert" value={d.descriptionFichierTransfert} className="col-span-2" />
                    <Row label="Nombre personnes transfert" value={d.nombrePersonnesTransfert} />
                    <Row label="Catégories données transfert" value={d.categoriesDonneesTransfert} />
                    <Row label="Pays destination transfert" value={d.paysDestinationTransfert} />
                    <Row label="Mesures sécurité transfert" value={d.mesuresSecuriteTransfert} className="col-span-2" />
                  </Section>
                  <Section title="Consentement">
                    <BoolRow label="Consentement personnes" value={d.consentementPersonnesConcernees} />
                    <Row label="Méthode recueil consentement" value={d.methodeRecueilConsentement} className="col-span-2" />
                    <Row label="Description sensibilisation" value={d.descriptionSensibilisation} className="col-span-2" />
                    <BoolRow label="Pays destination protège données" value={d.paysDestinationProtectionDonnees} />
                  </Section>
                </>
              )}

              {d.typeDeclaration === "COLLECTE_SITE" && (
                <>
                  <Section title="Identification du traitement">
                    <Row label="Dénomination" value={d.denominationTraitement} className="col-span-2" />
                    <Row label="Finalité" value={d.finaliteTraitement} className="col-span-2" />
                    <Row label="Texte juridique" value={d.texteJuridique} className="col-span-2" />
                    <Row label="Catégories personnes concernées" value={d.categoriesPersonnesConcernees} />
                    <Row label="Type de traitement" value={d.typeTraitement} />
                    <Row label="Caractéristiques techniques" value={d.caracteristiquesTechniques} />
                    <Row label="Caractéristiques structure" value={d.caracteristiquesMainStructure} className="col-span-2" />
                    <Row label="Téléchargement / Traitement" value={d.telechargementTraitement} />
                  </Section>
                  <Section title="Données de connexion & Cookies">
                    <BoolRow label="Données de connexion" value={d.donneesConnexion} />
                    <Row label="Description données connexion" value={d.descriptionDonneesConnexion} className="col-span-2" />
                    <BoolRow label="Cookies" value={d.cookies} />
                    <Row label="Description cookies" value={d.descriptionCookies} />
                    <Row label="Durée conservation cookies" value={d.dureeConservationCookies} />
                    <Row label="Type cookies" value={d.typeCookies} />
                    <BoolRow label="Consentement cookies" value={d.consentementCookies} />
                    <Row label="URL site" value={d.urlSite} className="col-span-2" />
                  </Section>
                  <Section title="Formulaires">
                    <BoolRow label="Formulaires en ligne" value={d.formulairesEnLigne} />
                    <Row label="Données formulaires" value={d.donneesFormulaires} className="col-span-2" />
                  </Section>
                </>
              )}

              {d.typeDeclaration === "VIDEO_SURVEILLANCE" && (
                <>
                  <Section title="Installation">
                    <Row label="Finalités" value={d.finalites} className="col-span-2" />
                    <Row label="Adresse installation" value={d.adresseInstallation} className="col-span-2" />
                    <Row label="Nature environnement" value={d.natureEnvironnement} />
                    <Row label="Emplacement caméras" value={d.emplacementCameras} />
                    <Row label="Nombre total caméras" value={d.nombreTotalCameras} />
                    <Row label="Modèle dispositif" value={d.modeleDispositif} />
                  </Section>
                  <Section title="Enregistrement & Transfert">
                    <Row label="Mode transfert" value={d.modeTransfert} />
                    <Row label="Type enregistrement" value={d.typeEnregistrement} />
                    <Row label="Nature enregistrement" value={d.natureEnregistrement} />
                    <Row label="Liaison réseau" value={d.liaisonReseau} />
                    <Row label="Durée conservation vidéo" value={d.dureeConservationVideo} />
                    <Row label="Modalités accès distance" value={d.modalitesAccesDistance} className="col-span-2" />
                  </Section>
                  <Section title="Options">
                    <BoolRow label="Visualisation temps réel" value={d.visualisationTempsReel} />
                    <BoolRow label="Enregistrement son" value={d.sonDeSon} />
                    <BoolRow label="Systèmes experts (IA)" value={d.utilisationSystemesExperts} />
                    <Row label="Description systèmes experts" value={d.descriptionSystemesExperts} className="col-span-2" />
                    <Row label="Fonctionnalités traitement" value={d.fonctionnalitesTraitement} className="col-span-2" />
                    <BoolRow label="Accès images à distance" value={d.accesImagesDistance} />
                    <Row label="Accès physique" value={d.accesPhysique} />
                    <Row label="Accès logique" value={d.accesLogique} />
                    <BoolRow label="Mesures suppression" value={d.mesuresSuppression} />
                    <Row label="Localisation pictogrammes" value={d.localisationPictogrammes} />
                    <Row label="Personnes habilitées" value={d.personnesHabilitees} className="col-span-2" />
                  </Section>
                </>
              )}
            </>
          )}
        </div>

        {d.statut === "EN_ATTENTE" && (
          <div className="px-5 py-4 border-t bg-gray-50 flex-shrink-0 space-y-3 rounded-b-2xl">
            <div className="flex gap-3">
              <button onClick={() => setAction("VALIDE")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all shadow-sm ${action === "VALIDE" ? "bg-green-700 text-white shadow-md ring-2 ring-green-300" : "bg-green-50 text-green-700 hover:bg-green-100"}`}>
                <Icon name="check" className="w-5 h-5" /> Valider
              </button>
              <button onClick={() => setAction("REJETE")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all shadow-sm ${action === "REJETE" ? "bg-red-600 text-white shadow-md ring-2 ring-red-300" : "bg-red-50 text-red-600 hover:bg-red-100"}`}>
                <Icon name="close" className="w-5 h-5" /> Rejeter
              </button>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Commentaire {action === "REJETE" && <span className="text-red-500">*</span>}
              </label>
              <textarea rows={3} value={commentaire} onChange={e => setCommentaire(e.target.value)}
                placeholder={action === "REJETE" ? "Motif du rejet obligatoire..." : "Commentaire optionnel..."}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>

            <div className="flex gap-3 justify-end">
              <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50" disabled={loading}>Annuler</button>
              <button onClick={handleConfirm} disabled={!action || loading || (action === "REJETE" && !commentaire.trim())}
                className={`px-5 py-2 rounded-lg text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all ${loading ? "bg-gray-400" : action === "REJETE" ? "bg-red-500 hover:bg-red-600" : "bg-green-700 hover:bg-green-800"}`}>
                {loading ? "Traitement..." : action === "VALIDE" ? <><Icon name="check" className="w-4 h-4 mr-1.5" />Confirmer la validation</> : action === "REJETE" ? <><Icon name="close" className="w-4 h-4 mr-1.5" />Confirmer le rejet</> : "Choisir une décision"}
              </button>
            </div>
          </div>
        )}

        {d.statut !== "EN_ATTENTE" && (
          <div className="px-5 py-4 border-t bg-gray-50 flex-shrink-0 rounded-b-2xl">
            <div className={`rounded-xl p-4 text-sm font-medium flex items-center gap-2 ${d.statut === "APPROUVEE_DG" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
              <Icon name={d.statut === "APPROUVEE_DG" ? "check" : "close"} className="w-4 h-4" />
              Cette déclaration a déjà été {d.statut === "APPROUVEE_DG" ? "validée" : "rejetée"}.
              <button onClick={onClose} className="ml-auto underline text-xs">Fermer</button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
