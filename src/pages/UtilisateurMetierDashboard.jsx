// ═══════════════════════════════════════════════════════════════════
// MODULE : Tableau de bord Utilisateur Métier (UtilisateurMetierDashboard)
// Point d'entrée : Gère son propre layout (sidebar + header + main)
// Contenu : Dashboard, Sessions de collecte, Traitements, Demandes usagers, Historique
// ═══════════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import api from "../services/api";
import sofitexLogo from "../assets/image.png";

// ═══════════════════════════════════════════════════════════════════
// MODULE ICON : Composant d'icônes SVG réutilisable
// ═══════════════════════════════════════════════════════════════════
function Icon({ name, className = "w-5 h-5" }) {
  const cls = `inline-block flex-shrink-0 ${className}`;
  switch (name) {
    case "close":
      return <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
    case "check":
      return <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
    case "send":
      return <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>;
    case "clipboard":
      return <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
    case "lock":
      return <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;
    case "globe":
      return <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>;
    case "user":
      return <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
    case "calendar":
      return <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
    case "home":
      return <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
    case "bell":
      return <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;
    case "history":
      return <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    case "edit":
      return <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
    case "trash":
      return <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
    case "clock":
      return <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    case "upload":
      return <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12" /></svg>;
    case "file":
      return <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
    default:
      return null;
  }
}

// ═══════════════════════════════════════════════════════════════════
// MODULE 1 : Données de référence
// ═══════════════════════════════════════════════════════════════════
const DIRECTIONS = ["DSI", "DRH", "Direction Commerciale", "Direction Financière", "Direction Générale", "Direction Technique", "Direction Qualité", "Direction Logistique", "Direction Juridique", "Autre"];
const ORIGINES = ["Directement auprès des personnes (formulaires en ligne, papier)", "Via des objets connectés ou capteurs", "Importation de fichiers externes ou bases de données existantes"];

// ═══════════════════════════════════════════════════════════════════
// MODULE 2 : Utilitaires de formatage des dates
// ═══════════════════════════════════════════════════════════════════
const toDate = (d) => {
  if (!d) return null;
  if (Array.isArray(d)) return new Date(d[0], d[1] - 1, d[2], d[3] || 0, d[4] || 0);
  return new Date(d);
};

const formatDate = (d) => {
  const date = toDate(d);
  return date instanceof Date && !isNaN(date)
    ? date.toLocaleDateString("fr-FR")
    : "—";
};

const formatDateTime = (d) => {
  const date = toDate(d);
  return date instanceof Date && !isNaN(date)
    ? date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "—";
};

// ═══════════════════════════════════════════════════════════════════
// MODULE 3 : Données mock (fallback)
// ═══════════════════════════════════════════════════════════════════
const mockDemandes = [
  { id: 1, usager: "Traoré Fatima", usagerNom: "Traoré Fatima", type: "MODIFICATION", typeDemande: "MODIFICATION", traitement: "Gestion des salaires", traitementNom: "Gestion des salaires", date: "2026-05-20T10:00:00", dateDemande: "2026-05-20T10:00:00", statut: "EN_ATTENTE", statutDemande: "EN_ATTENTE", detail: "Demande de correction de l'adresse mail enregistrée.", descriptionDemande: "Demande de correction de l'adresse mail enregistrée." },
  { id: 2, usager: "Kaboré Issouf", usagerNom: "Kaboré Issouf", type: "SUPPRESSION", typeDemande: "SUPPRESSION", traitement: "Gestion des accès réseau", traitementNom: "Gestion des accès réseau", date: "2026-05-21T08:30:00", dateDemande: "2026-05-21T08:30:00", statut: "EN_ATTENTE", statutDemande: "EN_ATTENTE", detail: "Demande de suppression des données suite à fin de contrat.", descriptionDemande: "Demande de suppression des données suite à fin de contrat." },
  { id: 3, usager: "Sawadogo Paul", usagerNom: "Sawadogo Paul", type: "MODIFICATION", typeDemande: "MODIFICATION", traitement: "Gestion des salaires", traitementNom: "Gestion des salaires", date: "2026-05-18T16:00:00", dateDemande: "2026-05-18T16:00:00", statut: "TRAITE", statutDemande: "TRAITE", detail: "Correction du numéro de téléphone.", descriptionDemande: "Correction du numéro de téléphone." },
];

// ═══════════════════════════════════════════════════════════════════
// MODULE 4 : BadgeStatut
// ═══════════════════════════════════════════════════════════════════
function BadgeStatut({ statut, envoyeAuDpo }) {
  if (envoyeAuDpo) {
    return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">Envoyé DPO</span>;
  }
  const map = {
    VALIDE: { label: "Validé", cls: "bg-green-100 text-green-700" },
    REJETE: { label: "Rejeté", cls: "bg-red-100 text-red-700" },
    EN_COURS: { label: "En cours", cls: "bg-yellow-100 text-yellow-700" },
  };
  const s = map[statut] || { label: statut, cls: "bg-gray-100 text-gray-600" };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s.cls}`}>{s.label}</span>;
}

// ═══════════════════════════════════════════════════════════════════
// MODULE 5 : Toast
// ═══════════════════════════════════════════════════════════════════
function Toast({ toast }) {
  if (!toast) return null;
  const isSuccess = toast.type !== "error";
  return (
    <div className={`fixed bottom-6 right-6 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium z-50 transition-all flex items-center gap-2 ${isSuccess ? "bg-green-700" : "bg-red-500"}`}>
      <Icon name={isSuccess ? "check" : "close"} className="w-4 h-4" />
      {toast.msg}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MODULE 6 : Modal Demande Usager
// ═══════════════════════════════════════════════════════════════════
function ModalDemandeUsager({ demande, onClose, onTraiter }) {
  const [reponse, setReponse] = useState("");
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="bg-green-800 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center">
          <h3 className="font-bold text-lg">Demande de {demande.type === "MODIFICATION" ? "Modification" : "Suppression"}</h3>
          <button onClick={onClose} className="text-green-200 hover:text-white"><Icon name="close" className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-green-50 rounded-xl p-4 space-y-2 text-sm">
            <p><span className="font-semibold text-green-800">Usager :</span> {demande.usager || demande.usagerNom}</p>
            <p><span className="font-semibold text-green-800">Traitement concerné :</span> {demande.traitement || demande.traitementNom}</p>
            <p><span className="font-semibold text-green-800">Date :</span> {formatDate(demande.date || demande.dateDemande)}</p>
            <p><span className="font-semibold text-green-800">Détail :</span> {demande.detail || demande.descriptionDemande}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Votre réponse / action</label>
            <textarea
              rows={3}
              value={reponse}
              onChange={e => setReponse(e.target.value)}
              placeholder="Décrivez l'action effectuée ou votre réponse à l'usager..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50">Annuler</button>
            <button
              onClick={() => { if (reponse.trim()) { onTraiter(demande.id, reponse); onClose(); } }}
              disabled={!reponse.trim()}
              className="px-4 py-2 rounded-lg bg-green-700 text-white text-sm font-semibold hover:bg-green-800 disabled:opacity-40"
            >
              <Icon name="check" className="w-4 h-4 mr-1.5" /> Marquer comme traité
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MODULE 7 : Modal Détail Traitement
// ═══════════════════════════════════════════════════════════════════
function ModalDetailTraitement({ traitement, onClose, onEnvoyer, dpos, onAjouterDonnees }) {
  const [dpoSelection, setDpoSelection] = useState("");
  const aUneSession = !!traitement.sessionCollecteId;
  const dpoRequis = !aUneSession && dpos && dpos.length > 0;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="bg-green-800 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center">
          <h3 className="font-bold text-lg">Détail du traitement #{traitement.idTraitement}</h3>
          <button onClick={onClose} className="text-green-200 hover:text-white"><Icon name="close" className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 rounded-lg p-3"><p className="text-xs text-green-600 font-semibold">Département</p><p className="font-medium">{traitement.department}</p></div>
            <div className="bg-green-50 rounded-lg p-3"><p className="text-xs text-green-600 font-semibold">Statut</p><BadgeStatut statut={traitement.statut} envoyeAuDpo={traitement.envoyeAuDpo} /></div>
            <div className="bg-green-50 rounded-lg p-3 col-span-2"><p className="text-xs text-green-600 font-semibold">Description</p><p>{traitement.description}</p></div>
            <div className="bg-green-50 rounded-lg p-3 col-span-2"><p className="text-xs text-green-600 font-semibold">Texte / Finalité</p><p>{traitement.texte}</p></div>
            <div className="bg-green-50 rounded-lg p-3"><p className="text-xs text-green-600 font-semibold">Certification sécurité</p><p>{traitement.certificationSecurite}</p></div>
            <div className="bg-green-50 rounded-lg p-3"><p className="text-xs text-green-600 font-semibold">Conservation</p><p>{traitement.dureeConservation} mois</p></div>
            <div className="bg-green-50 rounded-lg p-3"><p className="text-xs text-green-600 font-semibold">Date création</p><p>{formatDate(traitement.dateCreation)}</p></div>
            <div className="bg-green-50 rounded-lg p-3"><p className="text-xs text-green-600 font-semibold">Date fin</p><p>{formatDate(traitement.dateFin)}</p></div>
            <div className="bg-green-50 rounded-lg p-3"><p className="text-xs text-green-600 font-semibold">Nb données</p><p>{traitement.nombreDonnee}</p></div>
            <div className="bg-green-50 rounded-lg p-3"><p className="text-xs text-green-600 font-semibold">Session</p><p>#{traitement.sessionCollecteId || "Aucune"}</p></div>
          </div>
          {dpoRequis && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
              <label className="block text-sm font-semibold text-yellow-800 mb-1">
                Sélectionnez un DPO <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-yellow-600 mb-2">
                Ce traitement n'est lié à aucune session. Veuillez choisir un DPO destinataire.
              </p>
              <select value={dpoSelection} onChange={e => setDpoSelection(e.target.value)} className="w-full border border-yellow-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="">-- Sélectionner un DPO --</option>
                {dpos.map(d => (
                  <option key={d.dpoId} value={d.dpoId}>{d.dpoNomComplet}</option>
                ))}
              </select>
            </div>
          )}
          {!aUneSession && (!dpos || dpos.length === 0) && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-sm text-red-700">
                Aucun DPO disponible. Ce traitement n'a pas de session, créez d'abord une session de collecte.
              </p>
            </div>
          )}
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50">Fermer</button>
            <button onClick={() => { onAjouterDonnees(traitement); onClose(); }} className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700">
              <Icon name="upload" className="w-4 h-4 mr-1.5" /> Ajouter des données
            </button>
            {!traitement.envoyeAuDpo && (
              <button
                onClick={() => {
                  const dpoId = dpoRequis ? Number(dpoSelection) : undefined;
                  if (dpoRequis && !dpoSelection) return;
                  onEnvoyer(traitement.idTraitement, dpoId);
                  onClose();
                }}
                disabled={dpoRequis && !dpoSelection}
                className="px-4 py-2 rounded-lg bg-green-700 text-white text-sm font-semibold hover:bg-green-800 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Icon name="send" className="w-4 h-4 mr-1.5" /> Envoyer au DPO
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MODULE 8 : Modal Ajouter Données
// Saisie manuelle → POST /api/donnees
// Import Excel    → POST /api/entrepot/import-excel
//                   puis GET /api/entrepot (récupérer IDs)
//                   puis POST /api/entrepot/attacher-lot
//
// Format Excel attendu (ligne 1 = en-tête ignorée) :
//   Colonne A : nom          (String, obligatoire)
//   Colonne B : prenom       (String, obligatoire)
//   Colonne C : email        (String, optionnel)
//   Colonne D : telephone    (String, optionnel)
//   Colonne E : type_donnee  (nom du type, obligatoire)
//   Colonne F : valeur       (String, obligatoire)
// ═══════════════════════════════════════════════════════════════════
const TYPES_PAR_DEFAUT = [
  { idTypeDonnee: 1, nom: "Nom", sensible: false },
  { idTypeDonnee: 2, nom: "Prénom", sensible: false },
  { idTypeDonnee: 3, nom: "Email", sensible: false },
  { idTypeDonnee: 4, nom: "Téléphone", sensible: false },
  { idTypeDonnee: 5, nom: "Adresse", sensible: false },
  { idTypeDonnee: 6, nom: "Date de naissance", sensible: false },
  { idTypeDonnee: 7, nom: "Numéro CNIB", sensible: true },
  { idTypeDonnee: 8, nom: "Genre", sensible: false },
  { idTypeDonnee: 9, nom: "Situation matrimoniale", sensible: false },
  { idTypeDonnee: 10, nom: "Numéro de contrat", sensible: false },
];

function ModalAjouterDonnees({ traitement, onClose, onSaveManuel, onSaveExcel, showToast }) {
  const [onglet, setOnglet] = useState("manuel");
  const [typesDonnee, setTypesDonnee] = useState([]);
  const [typeDonneeId, setTypeDonneeId] = useState("");
  const [valeur, setValeur] = useState("");

  const [fichier, setFichier] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/types-donnee")
      .then(res => setTypesDonnee(res.data.length ? res.data : TYPES_PAR_DEFAUT))
      .catch(() => setTypesDonnee(TYPES_PAR_DEFAUT));
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext !== "xlsx") {
      alert("Veuillez sélectionner un fichier Excel (.xlsx)");
      e.target.value = "";
      return;
    }
    setFichier(file);
  };

  const handleSubmitManuel = () => {
    if (!typeDonneeId || !valeur.trim()) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    setLoading(true);
    const payload = {
      valeur: valeur.trim(),
      typeDonneeId: Number(typeDonneeId),
      traitementId: traitement.idTraitement,
      dateCollecte: new Date().toISOString(),
    };
    onSaveManuel(payload, () => setLoading(false));
  };

  const handleSubmitExcel = () => {
    if (!fichier) {
      alert("Veuillez sélectionner un fichier Excel.");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append("fichier", fichier);
    onSaveExcel(formData, traitement.idTraitement, () => setLoading(false));
  };

  const inp = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-screen overflow-y-auto">
        <div className="bg-green-800 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center">
          <h3 className="font-bold text-lg">Ajouter des données</h3>
          <button onClick={onClose} className="text-green-200 hover:text-white"><Icon name="close" className="w-5 h-5" /></button>
        </div>

        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setOnglet("manuel")}
            className={`flex-1 py-3 text-sm font-semibold transition-all ${onglet === "manuel" ? "text-green-700 border-b-2 border-green-700 bg-green-50" : "text-gray-500 hover:text-green-600"}`}
          >
            <Icon name="edit" className="w-4 h-4 mr-1.5 inline" /> Saisie manuelle
          </button>
          <button
            onClick={() => setOnglet("excel")}
            className={`flex-1 py-3 text-sm font-semibold transition-all ${onglet === "excel" ? "text-green-700 border-b-2 border-green-700 bg-green-50" : "text-gray-500 hover:text-green-600"}`}
          >
            <Icon name="file" className="w-4 h-4 mr-1.5 inline" /> Import Excel
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-green-50 rounded-xl p-3 text-sm">
            <p className="font-semibold text-green-800">Traitement : {traitement.description}</p>
            <p className="text-xs text-green-600">{traitement.department} · {traitement.nombreDonnee || 0} donnée(s) existante(s)</p>
          </div>

          {/* ── SAISIE MANUELLE ── */}
          {onglet === "manuel" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Type de donnée <span className="text-red-500">*</span>
                </label>
                <select value={typeDonneeId} onChange={e => setTypeDonneeId(e.target.value)} className={inp}>
                  <option value="">-- Sélectionner un type --</option>
                  {typesDonnee.map(t => (
                    <option key={t.idTypeDonnee} value={t.idTypeDonnee}>
                      {t.nom} {t.sensible ? "🔒" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Valeur <span className="text-red-500">*</span>
                </label>
                <input
                  value={valeur}
                  onChange={e => setValeur(e.target.value)}
                  placeholder="Ex: Jean Dupont, 01 23 45 67 89, jean@email.com"
                  className={inp}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50">Annuler</button>
                <button
                  onClick={handleSubmitManuel}
                  disabled={loading || !typeDonneeId || !valeur.trim()}
                  className="px-5 py-2 rounded-lg bg-green-700 text-white text-sm font-semibold hover:bg-green-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? "En cours..." : <><Icon name="check" className="w-4 h-4" /> Ajouter</>}
                </button>
              </div>
            </div>
          )}

          {/* ── IMPORT EXCEL ── */}
          {onglet === "excel" && (
            <div className="space-y-4">
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${fichier ? "border-green-500 bg-green-50" : "border-gray-300 hover:border-green-400"}`}
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file) {
                    const ext = file.name.split('.').pop().toLowerCase();
                    if (ext === "xlsx") setFichier(file);
                    else alert("Veuillez sélectionner un fichier Excel (.xlsx)");
                  }
                }}
              >
                {fichier ? (
                  <div className="flex flex-col items-center gap-2">
                    <Icon name="file" className="w-10 h-10 text-green-600" />
                    <p className="font-medium text-gray-800">{fichier.name}</p>
                    <p className="text-xs text-gray-400">{(fichier.size / 1024).toFixed(1)} Ko</p>
                    <button onClick={() => setFichier(null)} className="text-xs text-red-500 hover:text-red-700 mt-1">Supprimer</button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Icon name="upload" className="w-10 h-10 text-gray-400" />
                    <p className="font-medium text-gray-600">Glissez-déposez votre fichier Excel ici</p>
                    <p className="text-xs text-gray-400 mb-2">ou cliquez pour parcourir</p>
                    <label className="px-4 py-2 bg-green-700 text-white rounded-lg text-sm font-semibold cursor-pointer hover:bg-green-800">
                      Parcourir
                      <input type="file" accept=".xlsx" onChange={handleFileChange} className="hidden" />
                    </label>
                    <p className="text-xs text-gray-400 mt-2">Format : .xlsx uniquement</p>
                  </div>
                )}
              </div>

              {/* ✅ CORRIGÉ : format correspondant au backend EntrepotController */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-xs text-green-700">
                <p className="font-semibold mb-1">Format attendu du fichier Excel :</p>
                <p className="mb-2 text-green-600">La ligne 1 est l'en-tête (ignorée). Les données commencent à la ligne 2.</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li><strong>Colonne A — nom</strong> : Nom de la personne (obligatoire)</li>
                  <li><strong>Colonne B — prenom</strong> : Prénom (obligatoire)</li>
                  <li><strong>Colonne C — email</strong> : Adresse email (optionnel)</li>
                  <li><strong>Colonne D — telephone</strong> : Numéro de téléphone (optionnel)</li>
                  <li><strong>Colonne E — type_donnee</strong> : Nom du type ex: "Email", "Téléphone", "Numéro CNIB" (obligatoire)</li>
                  <li><strong>Colonne F — valeur</strong> : La valeur de la donnée (obligatoire)</li>
                </ol>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50">Annuler</button>
                <button
                  onClick={handleSubmitExcel}
                  disabled={loading || !fichier}
                  className="px-5 py-2 rounded-lg bg-green-700 text-white text-sm font-semibold hover:bg-green-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? "Import en cours..." : <><Icon name="upload" className="w-4 h-4" /> Importer</>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════
// MODULE 9 : Modal Créer Traitement (4 étapes) — Design System Bleu
// ═══════════════════════════════════════════════════════════════════
function ModalCreerTraitement({ onClose, onSave, sessions, onSaveManuel, onSaveExcel }) {
  const [etape, setEtape] = useState(1);
  const creePar = localStorage.getItem("nom") || localStorage.getItem("email") || "Utilisateur inconnu";
  const userEmail = localStorage.getItem("email") || "";

  const [fichierExcel, setFichierExcel] = useState(null);
  const importLoading = false;
  const [etape4Tab, setEtape4Tab] = useState("excel");

  const [form, setForm] = useState({
    nom: "", finalite: "", denomination: "", date_mise_en_oeuvre: "",
    type_traitement: "", duree_conservation: "", nombre_personnes: "",
    categorie_personnes: "", origine_donnees: "", lieu_stockage: "",
    sessionCollecteId: "", responsable_nom: "", responsable_departement: "",
    responsable_fonction: "", responsable_email: "",
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const etape1Ok = form.nom && form.finalite && form.type_traitement;
  const etape2Ok = form.duree_conservation && form.categorie_personnes;
  const etape3Ok = form.responsable_nom && form.responsable_email;
  const canNext = etape === 1 ? etape1Ok : etape === 2 ? etape2Ok : etape === 3 ? etape3Ok : false;

  const buildPayload = () => ({
    nom: form.nom, finalite: form.finalite, denomination: form.denomination,
    date_mise_en_oeuvre: form.date_mise_en_oeuvre || null,
    type_traitement: form.type_traitement,
    duree_conservation: parseInt(form.duree_conservation) || 0,
    nombre_personnes: form.nombre_personnes ? parseInt(form.nombre_personnes) : 0,
    categorie_personnes: form.categorie_personnes, origine_donnees: form.origine_donnees,
    lieu_stockage: form.lieu_stockage,
    sessionCollecteId: form.sessionCollecteId ? parseInt(form.sessionCollecteId) : null,
    responsable_nom: form.responsable_nom, responsable_departement: form.responsable_departement,
    responsable_fonction: form.responsable_fonction, responsable_email: form.responsable_email,
    creePar: creePar,
  });

  const handleFichierChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext !== "xlsx") { alert("Veuillez sélectionner un fichier Excel (.xlsx)"); e.target.value = ""; return; }
    setFichierExcel(file);
  };

  const steps = ["Traitement", "Détails & Conformité", "Responsable", "Données"];
  const inp = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-screen overflow-y-auto">

        {/* ── Stepper ── */}
        <div className="px-8 pt-8 pb-0">
          <div className="flex items-center justify-between relative mb-2">
            {steps.map((s, i) => {
              const stepNum = i + 1;
              const isCompleted = stepNum < etape;
              const isActive = stepNum === etape;
              return (
                <div key={i} className="flex flex-col items-center relative z-10">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                      isCompleted
                        ? "bg-green-600 text-white shadow-md"
                        : isActive
                          ? "bg-green-600 text-white shadow-lg animate-pulse"
                          : "bg-white border-2 border-gray-300 text-gray-400"
                    }`}
                  >
                    {isCompleted ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      stepNum
                    )}
                  </div>
                  <span className={`text-xs mt-2 font-medium ${isActive ? "text-[#1e293b]" : "text-gray-400"}`}>
                    {s}
                  </span>
                </div>
              );
            })}
            {/* Ligne de connexion */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-0" style={{ transform: 'translateY(-50%)' }}>
              <div
                className="h-full bg-green-600 transition-all duration-500"
                style={{ width: `${((etape - 1) / (steps.length - 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── Séparateur ── */}
        <hr className="border-t border-gray-200 my-6 mx-8" />

        {/* ── Contenu ── */}
        <div className="px-8 space-y-5">

          {/* ── ÉTAPE 1 ── */}
          {etape === 1 && (
            <div className="space-y-4">
              <h4 className="font-bold text-[#0f172a] text-lg mb-4">Informations du Traitement</h4>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nom du traitement <span className="text-red-500">*</span></label>
                <input value={form.nom} onChange={e => set("nom", e.target.value)} placeholder="Ex: Gestion de la paie des employés" className={inp} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Finalité du traitement <span className="text-red-500">*</span></label>
                <input value={form.finalite} onChange={e => set("finalite", e.target.value)} placeholder="Ex: Permettre le paiement des producteurs de coton" className={inp} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Dénomination du traitement</label>
                <input value={form.denomination} onChange={e => set("denomination", e.target.value)} placeholder="Ex: Traitement des données salariales" className={inp} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Date de mise en œuvre</label>
                  <input type="date" value={form.date_mise_en_oeuvre} onChange={e => set("date_mise_en_oeuvre", e.target.value)} className={inp} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Type de traitement <span className="text-red-500">*</span></label>
                  <select value={form.type_traitement} onChange={e => set("type_traitement", e.target.value)} className={inp}>
                    <option value="">-- Sélectionner --</option>
                    {["Collecte", "Enregistrement", "Organisation", "Conservation", "Consultation", "Utilisation", "Communication", "Diffusion", "Effacement"].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ── ÉTAPE 2 ── */}
          {etape === 2 && (
            <div className="space-y-4">
              <h4 className="font-bold text-[#0f172a] text-lg mb-4">Détails & Conformité</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Durée de conservation (mois) <span className="text-red-500">*</span></label>
                  <input type="number" min="1" value={form.duree_conservation} onChange={e => set("duree_conservation", e.target.value)} placeholder="Ex: 60" className={inp} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre de personnes concernées</label>
                  <input type="number" min="0" value={form.nombre_personnes} onChange={e => set("nombre_personnes", e.target.value)} placeholder="Ex: 500" className={inp} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Catégorie de personnes concernées <span className="text-red-500">*</span></label>
                <select value={form.categorie_personnes} onChange={e => set("categorie_personnes", e.target.value)} className={inp}>
                  <option value="">-- Sélectionner --</option>
                  {["Employés SOFITEX", "Producteurs de coton", "Clients", "Fournisseurs / Sous-traitants", "Visiteurs", "Candidats à l'embauche", "Usagers externes"].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Origine des données</label>
                <select value={form.origine_donnees} onChange={e => set("origine_donnees", e.target.value)} className={inp}>
                  <option value="">-- Sélectionner --</option>
                  {ORIGINES.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Lieu de stockage</label>
                <input value={form.lieu_stockage} onChange={e => set("lieu_stockage", e.target.value)} placeholder="Ex: Serveur interne DSI, Cloud AWS..." className={inp} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Session de collecte</label>
                <select value={form.sessionCollecteId} onChange={e => set("sessionCollecteId", e.target.value)} className={inp}>
                  <option value="">-- Aucune session --</option>
                  {sessions.map(s => <option key={s.idSession} value={s.idSession}>{s.description || `Session #${s.idSession}`}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* ── ÉTAPE 3 ── */}
          {etape === 3 && (
            <div className="space-y-4">
              <h4 className="font-bold text-[#0f172a] text-lg mb-4">Responsable du Traitement</h4>
              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm">
                <span className="font-semibold text-green-800">Créé par :</span> <span className="text-green-700">{creePar}</span>
                <p className="text-xs text-gray-400 mt-0.5">Récupéré automatiquement depuis votre session</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nom et prénom du responsable <span className="text-red-500">*</span></label>
                <input value={form.responsable_nom} onChange={e => set("responsable_nom", e.target.value)} placeholder="Ex: Ouedraogo Amadou" className={inp} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Département</label>
                  <select value={form.responsable_departement} onChange={e => set("responsable_departement", e.target.value)} className={inp}>
                    <option value="">-- Sélectionner --</option>
                    {DIRECTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Fonction</label>
                  <input value={form.responsable_fonction} onChange={e => set("responsable_fonction", e.target.value)} placeholder="Ex: Responsable RH" className={inp} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Adresse email <span className="text-red-500">*</span></label>
                <input type="email" value={form.responsable_email} onChange={e => set("responsable_email", e.target.value)} placeholder="contact@sofitex.bf" className={inp} />
              </div>
            </div>
          )}

          {/* ── ÉTAPE 4 : Ajout de Données ── */}
          {etape === 4 && (
            <div className="space-y-4">
              <h4 className="font-bold text-[#0f172a] text-lg mt-6 mb-4">Ajout de Données</h4>

              {/* Onglets */}
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setEtape4Tab("manuel")}
                  className={`px-6 py-3 text-sm font-semibold transition-colors border-b-2 ${
                    etape4Tab === "manuel"
                      ? "text-green-600 border-green-600"
                      : "text-[#64748b] border-transparent hover:text-gray-600"
                  }`}
                >
                  Saisie manuelle
                </button>
                <button
                  onClick={() => setEtape4Tab("excel")}
                  className={`px-6 py-3 text-sm font-semibold transition-colors ${
                    etape4Tab === "excel"
                      ? "text-green-600 border-b-[3px] border-green-600"
                      : "text-[#64748b] border-b-2 border-transparent hover:text-gray-600"
                  }`}
                >
                  Import depuis Excel
                </button>
              </div>

              {etape4Tab === "manuel" ? (
                <div className="flex flex-col items-center gap-4 py-8">
                  <svg className="w-12 h-12 text-[#94a3b8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <button
                    onClick={() => onSave(buildPayload(), () => {}, "manuel")}
                    className="px-5 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-all"
                  >
                    Ajouter une donnée
                  </button>
                  <p className="text-sm text-[#94a3b8] italic">Le traitement sera créé avant d'ouvrir le formulaire de saisie.</p>
                </div>
              ) : (
                <div
                  className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center gap-4 transition-all ${
                    fichierExcel ? "border-green-500 bg-green-50" : "border-[#cbd5e1] hover:border-green-400 bg-white"
                  }`}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];
                    if (file) {
                      const ext = file.name.split('.').pop().toLowerCase();
                      if (ext === "xlsx") setFichierExcel(file);
                      else alert("Veuillez sélectionner un fichier Excel (.xlsx)");
                    }
                  }}
                >
                  <svg className="w-12 h-12 text-[#94a3b8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>

                  {fichierExcel ? (
                    <div className="flex flex-col items-center gap-2">
                      <p className="font-medium text-gray-800 text-sm">{fichierExcel.name}</p>
                      <p className="text-xs text-gray-400">{(fichierExcel.size / 1024).toFixed(1)} Ko</p>
                      <button onClick={() => setFichierExcel(null)} className="text-xs text-red-500 hover:text-red-700">Supprimer</button>
                    </div>
                  ) : (
                    <>
                      <label className="px-5 py-2 bg-white border border-[#cbd5e1] text-[#1e293b] rounded-lg text-sm font-medium cursor-pointer hover:bg-green-50 hover:border-green-300 transition-all">
                        Choisir un fichier
                        <input type="file" accept=".xlsx" onChange={handleFichierChange} className="hidden" />
                      </label>
                      <p className="text-sm text-[#94a3b8] italic">Aucun fichier choisi</p>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-8 pb-6 flex justify-between items-center border-t border-[#e2e8f0] pt-6 mt-8">
          <button
            onClick={() => etape > 1 ? setEtape(e => e - 1) : onClose()}
            className="px-5 py-2.5 rounded-lg border border-[#cbd5e1] bg-white text-[#475569] text-sm font-medium hover:bg-green-50 hover:border-green-300 transition-all"
          >
            ← Précédent
          </button>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="bg-[#f1f5f9] px-3 py-1 rounded-full text-xs text-[#475569] font-medium">Utilisateur Métier</span>
              <span className="text-sm text-[#1e293b]">{userEmail}</span>
            </div>

            {etape < 4 ? (
              <button
                onClick={() => setEtape(e => e + 1)}
                disabled={!canNext}
                className="px-6 py-2.5 rounded-lg bg-green-600 text-white text-sm font-bold hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                Suivant →
              </button>
            ) : (
              <div className="flex gap-3">
                {fichierExcel ? (
                  <button
                    onClick={() => {
                      onSave(buildPayload(), (traitementRetour) => {
                        if (traitementRetour && onSaveExcel) {
                          const fd = new FormData();
                          fd.append("fichier", fichierExcel);
                          onSaveExcel(fd, traitementRetour.idTraitement, () => { });
                        }
                      }, "excel");
                    }}
                    disabled={importLoading}
                    className="px-6 py-2.5 rounded-lg bg-green-600 text-white text-sm font-bold hover:bg-green-700 disabled:opacity-40 transition-all shadow-sm flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    {importLoading ? "Import..." : "Créer le traitement"}
                  </button>
                ) : (
                  <button
                    onClick={() => onSave(buildPayload(), () => { }, "direct")}
                    className="px-6 py-2.5 rounded-lg bg-green-600 text-white text-sm font-bold hover:bg-green-700 transition-all shadow-sm flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                    Créer le traitement
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// MODULE 10 : Composant principal UtilisateurMetierDashboard
// ═══════════════════════════════════════════════════════════════════
function UtilisateurMetierDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [traitements, setTraitements] = useState([]);
  const [demandes, setDemandes] = useState(mockDemandes);
  const [sessions, setSessions] = useState([]);
  const [showCreer, setShowCreer] = useState(false);
  const [showAjouterDonnees, setShowAjouterDonnees] = useState(false);
  const [traitementPourDonnees, setTraitementPourDonnees] = useState(null);
  const [detailTraitement, setDetailTraitement] = useState(null);
  const [detailDemande, setDetailDemande] = useState(null);
  const [toast, setToast] = useState(null);
  const [recherche, setRecherche] = useState("");
  const [traitementFilterMode, setTraitementFilterMode] = useState("tous");
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [selectedSessionDetail, setSelectedSessionDetail] = useState(null);
  const [newSessionCount, setNewSessionCount] = useState(0);
  const [previousSessionCount, setPreviousSessionCount] = useState(0);
  const [utilisateurMetierId, setUtilisateurMetierId] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const email = localStorage.getItem("email");
    api.get("/sessions")
      .then((res) => {
        setSessions(res.data);
        setPreviousSessionCount(res.data.length);
      })
      .catch(() => { });

    if (email) {
      api.get("/verification/fonction", { params: { email } })
        .then(res => {
          const id = res.data.utilisateurMetierId;
          if (id) {
            setUtilisateurMetierId(Number(id));
            return api.get(`/traitements/utilisateur-metier/${id}`);
          }
          throw new Error("no id");
        })
        .then(res => setTraitements(res.data))
        .catch(() => { });
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      api.get("/sessions")
        .then((res) => {
          setSessions(res.data);
          if (res.data.length > previousSessionCount) {
            setNewSessionCount(prev => prev + (res.data.length - previousSessionCount));
          }
          setPreviousSessionCount(res.data.length);
        })
        .catch(() => { });
    }, 30000);
    return () => clearInterval(interval);
  }, [previousSessionCount]);

  // ─── Créer traitement ─────────────────────────────────────────────
  // callback(traitementRetour) est appelé avec le traitement créé
  // mode : "direct" | "manuel" | "excel"
  const handleCreer = (payload, callback, mode = "direct") => {
    const traitementData = {
      nom: payload.nom || payload.denomination || "",
      department: payload.responsable_departement || "",
      description: payload.denomination || payload.nom || "",
      texte: payload.finalite || "",
      certificationSecurite: "",
      dureeConservation: payload.duree_conservation || 0,
      dateFin: null,
      utilisateurMetierId: utilisateurMetierId,
      sessionCollecteId: payload.sessionCollecteId || null,
      secteur: payload.responsable_departement || "",
      lieuStockage: payload.lieu_stockage || "",
      dureeConservationDeclaration: payload.duree_conservation ? String(payload.duree_conservation) : "",
      dateMiseEnOeuvre: payload.date_mise_en_oeuvre || null,
      transfertEtranger: false, sousTraitance: false, communicationTiers: false,
      nomPrenomResponsable: payload.responsable_nom || "",
      fonctionResponsable: payload.responsable_fonction || "",
      contactConfidentialite: payload.responsable_email || "",
      origineDonnees: payload.origine_donnees || "",
      categoriesDonnees: payload.categorie_personnes || "",
      nombrePersonnesConcernees: payload.nombre_personnes || 0,
    };
    const declarationData = {
      denominationTraitement: payload.nom || payload.denomination || "",
      finaliteTraitement: payload.finalite || "",
      typeTraitement: payload.type_traitement || "",
      categoriesPersonnesConcernees: payload.categorie_personnes || "",
    };
    const fd = new FormData();
    fd.append("traitement", new Blob([JSON.stringify(traitementData)], { type: "application/json" }));
    fd.append("declaration", new Blob([JSON.stringify(declarationData)], { type: "application/json" }));

    api.post("/traitements/normale", fd)
      .then((res) => {
        const t = res.data;
        setTraitements(prev => [t, ...prev]);
        setShowCreer(false);
        if (mode === "manuel") {
          setTraitementPourDonnees(t);
          setShowAjouterDonnees(true);
        }
        showToast("Traitement créé avec succès !");
        callback?.(t);
      })
      .catch((err) => {
        const nouveau = {
          idTraitement: Date.now(),
          department: payload.responsable_departement || "",
          description: payload.denomination || payload.nom || "",
          texte: payload.finalite || "",
          certificationSecurite: "",
          dureeConservation: payload.duree_conservation || 0,
          dateCreation: new Date().toISOString(),
          dateFin: null,
          nombreDonnee: 0,
          sessionCollecteId: payload.sessionCollecteId || null,
          utilisateurMetierId: utilisateurMetierId || 1,
          utilisateurMetierNom: localStorage.getItem("email") || "Utilisateur Métier",
          statut: "EN_COURS",
          envoyeAuDpo: false,
        };
        setTraitements(prev => [nouveau, ...prev]);
        setShowCreer(false);
        if (mode === "manuel") {
          setTraitementPourDonnees(nouveau);
          setShowAjouterDonnees(true);
        }
        showToast("Traitement créé en mode hors-ligne", "error");
        callback?.(nouveau);
      });
  };

  // ─── Envoyer au DPO ───────────────────────────────────────────────
  const dposDisponibles = sessions.reduce((acc, s) => {
    if (s.dpoId && !acc.find(d => d.dpoId === s.dpoId)) {
      acc.push({ dpoId: s.dpoId, dpoNomComplet: s.dpoNomComplet || `DPO #${s.dpoId}` });
    }
    return acc;
  }, []);

  const handleEnvoyer = (id, dpoIdOverride) => {
    const t = traitements.find(t => t.idTraitement === id);
    const dpoId = dpoIdOverride
      ?? (t?.sessionCollecteId
        ? sessions.find(s => s.idSession === t.sessionCollecteId)?.dpoId
        : null);
    if (!dpoId) {
      showToast("Aucun DPO trouvé. Ouvrez le détail pour en sélectionner un.", "error");
      return;
    }
    api.patch(`/traitements/${id}/envoyer-dpo`, null, { params: { dpoId } })
      .then((res) => {
        setTraitements(prev => prev.map(t => t.idTraitement === id ? res.data : t));
        showToast("Traitement envoyé au DPO !");
      })
      .catch((err) => {
        showToast(err.response?.data?.message || "Erreur lors de l'envoi au DPO", "error");
      });
  };

  // ─── ✅ CORRIGÉ : Ajouter données (saisie manuelle) ───────────────
  // POST /api/donnees
  const handleSaveManuel = (payload, onComplete) => {
    api.post("/donnees", payload)
      .then(() => {
        setTraitements(prev => prev.map(t =>
          t.idTraitement === payload.traitementId
            ? { ...t, nombreDonnee: (t.nombreDonnee || 0) + 1 }
            : t
        ));
        setShowAjouterDonnees(false);
        setTraitementPourDonnees(null);
        showToast("Donnée ajoutée avec succès !");
      })
      .catch((err) => {
        const status = err.response?.status;
        const msg = err.response?.data?.message || "Erreur lors de l'ajout de la donnée";
        if (status === 403) {
          showToast("Accès refusé (403) — vérifiez que vous êtes bien connecté.", "error");
        } else {
          showToast(`Erreur ${status || ""} : ${msg}`, "error");
        }
      })
      .finally(() => onComplete?.());
  };

  // ─── ✅ CORRIGÉ : Ajouter données (import Excel) ──────────────────
  // Flux : POST /api/entrepot/import-excel → GET /api/entrepot → POST /api/entrepot/attacher-lot
  const handleSaveExcel = (formData, traitementId, onComplete) => {
    api.post("/entrepot/import-excel", formData, {
      headers: { "Content-Type": undefined }, // laisser Axios gérer le boundary multipart
    })
      .then((importRes) => {
        const r = importRes.data;
        if (r.lignesImportees === 0) {
          showToast(`Aucune ligne importée. ${r.erreurs?.join(", ") || "Vérifiez le format du fichier."}`, "error");
          return;
        }
        // Récupérer les données importées (sans traitement) et les rattacher
        return api.get("/entrepot").then((listRes) => {
          const donneeIds = listRes.data.map((d) => d.idDonnee);
          if (donneeIds.length === 0) {
            showToast(`${r.lignesImportees} ligne(s) importée(s) mais rattachement impossible.`, "error");
            return;
          }
          return api.post(`/entrepot/attacher-lot?traitementId=${traitementId}`, donneeIds)
            .then(() => {
              setTraitements(prev => prev.map(t =>
                t.idTraitement === traitementId
                  ? { ...t, nombreDonnee: (t.nombreDonnee || 0) + r.lignesImportees }
                  : t
              ));
              setShowAjouterDonnees(false);
              setTraitementPourDonnees(null);
              showToast(
                `${r.lignesImportees} donnée(s) importée(s) et rattachée(s) sur ${r.totalLignes} ligne(s)${r.lignesEchouees > 0 ? ` (${r.lignesEchouees} échec(s))` : ""}`
              );
            });
        });
      })
      .catch((err) => {
        const status = err.response?.status;
        const msg = err.response?.data?.message || "Erreur lors de l'import";
        if (status === 403) {
          showToast("Accès refusé (403) — vérifiez que vous êtes bien connecté.", "error");
        } else if (status === 400) {
          showToast("Fichier invalide ou format incorrect (400).", "error");
        } else {
          showToast(`Erreur ${status || ""} : ${msg}`, "error");
        }
      })
      .finally(() => onComplete?.());
  };

  // ─── Demandes usagers ─────────────────────────────────────────────
  const handleTraiterDemande = (id, reponse) => {
    setDemandes(prev => prev.map(d => d.id === id ? { ...d, statut: "TRAITE" } : d));
    showToast("Demande traitée !");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    localStorage.removeItem("dpoId");
    window.location.href = "/";
  };

  // ─── Filtres ──────────────────────────────────────────────────────
  const demandesEnAttente = demandes.filter(d => d.statut === "EN_ATTENTE" || d.statutDemande === "EN_ATTENTE").length;

  const traitementsFiltres = traitements.filter(t => {
    const matchRecherche = !recherche ||
      t.description?.toLowerCase().includes(recherche.toLowerCase()) ||
      t.department?.toLowerCase().includes(recherche.toLowerCase());
    if (!matchRecherche) return false;
    if (traitementFilterMode === "parSession" && selectedSessionId) {
      return t.sessionCollecteId === Number(selectedSessionId);
    }
    return true;
  });

  const traitementsParSession = (sessionId) =>
    traitements.filter(t => t.sessionCollecteId === Number(sessionId));

  // ─── Stats dashboard ──────────────────────────────────────────────
  const stats = [
    { label: "Sessions en cours", value: sessions.filter(s => s.statutSession === "EN_COURS").length, icon: "calendar", color: "bg-green-50 border-green-200" },
    { label: "Total traitements", value: traitements.length, icon: "clipboard", color: "bg-green-50 border-green-200" },
    { label: "Envoyés au DPO", value: traitements.filter(t => t.envoyeAuDpo === true).length, icon: "send", color: "bg-purple-50 border-purple-200" },
    { label: "Demandes usagers", value: demandesEnAttente, icon: "bell", color: "bg-red-50 border-red-200" },
  ];

  const navItems = [
    { id: "dashboard", label: "Tableau de bord", icon: "home" },
    { id: "sessions", label: "Sessions de collecte", icon: "calendar", badge: newSessionCount },
    { id: "traitements", label: "Mes traitements", icon: "clipboard" },
    { id: "demandes", label: "Demandes usagers", icon: "bell", badge: demandesEnAttente },
    { id: "historique", label: "Historique", icon: "history" },
  ];

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* ── Sidebar ── */}
      <aside className={`${sidebarOpen ? "w-64" : "w-16"} bg-green-800 text-white flex flex-col transition-all duration-300 shadow-xl`}>
        <div className="flex items-center gap-3 px-4 py-5 border-b border-green-700">
          <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
            <img src={sofitexLogo} alt="Sofitex" className="w-full h-full object-contain" />
          </div>
          {sidebarOpen && (
            <div>
              <p className="font-bold text-sm leading-tight">SOFITEX</p>
              <p className="text-green-300 text-xs">Plateforme CIL</p>
            </div>
          )}
        </div>

        <nav className="flex-1 py-4 space-y-1 px-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveSection(item.id); if (item.id === "sessions") setNewSessionCount(0); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeSection === item.id ? "bg-white text-green-800 shadow" : "text-green-100 hover:bg-green-700"}`}
            >
              <Icon name={item.icon} className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="flex-1 text-left">{item.label}</span>}
              {sidebarOpen && item.badge > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">{item.badge}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-green-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">U</span>
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">Utilisateur Métier</p>
                <p className="text-green-300 text-xs truncate">{localStorage.getItem("email") || ""}</p>
              </div>
            )}
            {sidebarOpen && (
              <button onClick={handleLogout} className="text-green-300 hover:text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            )}
          </div>
          <button onClick={() => setSidebarOpen(o => !o)} className="w-full flex items-center justify-center py-2 mt-2 rounded-lg text-green-300 hover:bg-green-700 text-sm">
            {sidebarOpen ? "◀ Réduire" : "▶"}
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500 hover:text-gray-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-800">
                {activeSection === "dashboard" && "Tableau de bord"}
                {activeSection === "sessions" && "Sessions de collecte"}
                {activeSection === "traitements" && "Mes Traitements"}
                {activeSection === "demandes" && "Demandes des Usagers"}
                {activeSection === "historique" && "Historique"}
              </h1>
              <p className="text-xs text-gray-400">
                {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {newSessionCount > 0 && (
              <button onClick={() => { setNewSessionCount(0); setActiveSection("sessions"); }} className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                <Icon name="calendar" className="w-5 h-5" />
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">{newSessionCount > 9 ? '9+' : newSessionCount}</span>
              </button>
            )}
            {demandesEnAttente > 0 && (
              <button onClick={() => setActiveSection("demandes")} className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                <Icon name="bell" className="w-5 h-5" />
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">{demandesEnAttente > 9 ? '9+' : demandesEnAttente}</span>
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">

          {/* ── Dashboard ── */}
          {activeSection === "dashboard" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {stats.map((s, i) => (
                  <div key={i} className={`bg-white rounded-2xl border p-4 shadow-sm ${s.color}`}>
                    <div className="mb-1"><Icon name={s.icon} className="w-6 h-6 text-gray-600" /></div>
                    <p className="text-2xl font-bold text-gray-800">{s.value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-bold text-gray-800">Traitements récents</h2>
                  <button onClick={() => setShowCreer(true)} className="bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-800">+ Nouveau traitement</button>
                </div>
                <div className="space-y-3">
                  {traitements.slice(0, 3).map(t => (
                    <div key={t.idTraitement} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-green-50 transition-all cursor-pointer" onClick={() => setDetailTraitement(t)}>
                      <div>
                        <p className="font-semibold text-sm text-gray-800">{t.description}</p>
                        <p className="text-xs text-gray-400">{t.department} · {formatDate(t.dateCreation)}</p>
                      </div>
                      <BadgeStatut statut={t.statut} envoyeAuDpo={t.envoyeAuDpo} />
                    </div>
                  ))}
                  {traitements.length === 0 && (
                    <p className="text-center text-gray-400 text-sm py-4">Aucun traitement. Créez votre premier traitement !</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Sessions de collecte ── */}
          {activeSection === "sessions" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Sessions de collecte ({sessions.length})</h2>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-green-50 text-green-800">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold">Description</th>
                        <th className="px-4 py-3 text-left font-semibold">Type</th>
                        <th className="px-4 py-3 text-left font-semibold">Dates</th>
                        <th className="px-4 py-3 text-left font-semibold">Statut</th>
                        <th className="px-4 py-3 text-left font-semibold">DPO</th>
                        <th className="px-4 py-3 text-center font-semibold">Traitements</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {sessions.map(s => {
                        const nbTraitements = s.nombreTraitements ?? traitementsParSession(s.idSession).length;
                        return (
                          <tr key={s.idSession} className="hover:bg-green-50 transition-colors">
                            <td className="px-4 py-3 font-medium text-gray-800">{s.description || `Session #${s.idSession}`}</td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                {s.typeCollecte === "EN_LIGNE" ? "En ligne" : "Terrain"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-500">
                              <p>Du {formatDateTime(s.dateDebut)}</p>
                              <p>Au {formatDateTime(s.dateFin)}</p>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s.statutSession === "EN_COURS" ? "bg-green-100 text-green-700" : s.statutSession === "TERMINEE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                {s.statutSession === "EN_COURS" ? "En cours" : s.statutSession === "TERMINEE" ? "Terminée" : "Annulée"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{s.dpoNomComplet || "—"}</td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => setSelectedSessionDetail(selectedSessionDetail?.idSession === s.idSession ? null : s)}
                                className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200"
                              >
                                {nbTraitements} traitement{nbTraitements !== 1 ? "s" : ""} {selectedSessionDetail?.idSession === s.idSession ? "▲" : "▼"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {sessions.length === 0 && (
                        <tr><td colSpan={6} className="py-12 text-center text-gray-400 text-sm">Aucune session de collecte</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {selectedSessionDetail && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 bg-green-50">
                    <h3 className="font-bold text-green-800">
                      Traitements liés à la session : {selectedSessionDetail.description || `#${selectedSessionDetail.idSession}`}
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-gray-500">Description</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-500">Département</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-500">Statut</th>
                          <th className="px-4 py-3 text-center font-semibold text-gray-500">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {traitementsParSession(selectedSessionDetail.idSession).map(t => (
                          <tr key={t.idTraitement} className="hover:bg-green-50 transition-colors">
                            <td className="px-4 py-3 font-medium text-gray-800">{t.description}</td>
                            <td className="px-4 py-3 text-gray-600">{t.department}</td>
                            <td className="px-4 py-3"><BadgeStatut statut={t.statut} envoyeAuDpo={t.envoyeAuDpo} /></td>
                            <td className="px-4 py-3 text-center">
                              <button onClick={() => setDetailTraitement(t)} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-lg hover:bg-green-200">Voir</button>
                            </td>
                          </tr>
                        ))}
                        {traitementsParSession(selectedSessionDetail.idSession).length === 0 && (
                          <tr><td colSpan={4} className="py-8 text-center text-gray-400 text-sm">Aucun traitement lié à cette session</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Traitements ── */}
          {activeSection === "traitements" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="p-5 border-b border-gray-100 space-y-3">
                <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                  <h2 className="font-bold text-gray-800">Mes Traitements ({traitements.length})</h2>
                  <div className="flex gap-3 w-full sm:w-auto">
                    <input value={recherche} onChange={e => setRecherche(e.target.value)} placeholder="Rechercher..." className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 flex-1 sm:w-48" />
                    <button onClick={() => setShowCreer(true)} className="bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-800 whitespace-nowrap">+ Nouveau</button>
                  </div>
                </div>
                <div className="flex gap-4 items-end">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Filtrer</label>
                    <div className="flex gap-2">
                      <button onClick={() => { setTraitementFilterMode("tous"); setSelectedSessionId(""); }} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${traitementFilterMode === "tous" ? "bg-green-700 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>Tous</button>
                      <button onClick={() => setTraitementFilterMode("parSession")} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${traitementFilterMode === "parSession" ? "bg-green-700 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>Par session</button>
                    </div>
                  </div>
                  {traitementFilterMode === "parSession" && (
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Session</label>
                      <select value={selectedSessionId} onChange={e => setSelectedSessionId(e.target.value)} className="h-8 px-2 rounded-lg border border-gray-300 text-xs">
                        <option value="">Sélectionner...</option>
                        {sessions.map(s => (
                          <option key={s.idSession} value={s.idSession}>{s.description || `Session #${s.idSession}`}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-green-50 text-green-800">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">#</th>
                      <th className="px-4 py-3 text-left font-semibold">Description</th>
                      <th className="px-4 py-3 text-left font-semibold">Département</th>
                      <th className="px-4 py-3 text-left font-semibold">Conservation</th>
                      <th className="px-4 py-3 text-left font-semibold">Date fin</th>
                      <th className="px-4 py-3 text-left font-semibold">Statut</th>
                      <th className="px-4 py-3 text-left font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {traitementsFiltres.map(t => (
                      <tr key={t.idTraitement} className="hover:bg-green-50 transition-colors">
                        <td className="px-4 py-3 text-gray-400 text-xs">#{t.idTraitement}</td>
                        <td className="px-4 py-3 font-medium text-gray-800">{t.description}</td>
                        <td className="px-4 py-3 text-gray-600">{t.department}</td>
                        <td className="px-4 py-3 text-gray-600">{t.dureeConservation} mois</td>
                        <td className="px-4 py-3 text-gray-600">{formatDate(t.dateFin)}</td>
                        <td className="px-4 py-3"><BadgeStatut statut={t.statut} envoyeAuDpo={t.envoyeAuDpo} /></td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => setDetailTraitement(t)} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-lg hover:bg-green-200">Voir</button>
                            <button onClick={() => { setTraitementPourDonnees(t); setShowAjouterDonnees(true); }} className="text-xs bg-green-600 text-white px-2 py-1 rounded-lg hover:bg-green-700 flex items-center gap-1">
                              <Icon name="upload" className="w-3.5 h-3.5" />Données
                            </button>
                            {!t.envoyeAuDpo && t.sessionCollecteId && (
                              <button onClick={() => handleEnvoyer(t.idTraitement)} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-lg hover:bg-green-200 flex items-center gap-1">
                                <Icon name="send" className="w-3.5 h-3.5" />DPO
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {traitementsFiltres.length === 0 && (
                  <div className="py-12 text-center text-gray-400 text-sm">
                    <Icon name="clipboard" className="w-10 h-10 mb-2 mx-auto text-gray-300" />
                    Aucun traitement trouvé
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Demandes usagers ── */}
          {activeSection === "demandes" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                <h2 className="font-bold text-gray-800">Demandes des Usagers ({demandes.length})</h2>
                {demandesEnAttente > 0 && (
                  <span className="bg-red-100 text-red-700 text-xs font-semibold px-3 py-1 rounded-full">{demandesEnAttente} en attente</span>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-green-50 text-green-800">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Usager</th>
                      <th className="px-4 py-3 text-left font-semibold">Type</th>
                      <th className="px-4 py-3 text-left font-semibold">Traitement concerné</th>
                      <th className="px-4 py-3 text-left font-semibold">Date</th>
                      <th className="px-4 py-3 text-left font-semibold">Statut</th>
                      <th className="px-4 py-3 text-left font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {demandes.map(d => (
                      <tr key={d.id} className="hover:bg-green-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-800">{d.usager || d.usagerNom}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${(d.type === "MODIFICATION" || d.typeDemande === "MODIFICATION") ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"}`}>
                            {(d.type === "MODIFICATION" || d.typeDemande === "MODIFICATION")
                              ? <><Icon name="edit" className="w-3.5 h-3.5" />Modification</>
                              : <><Icon name="trash" className="w-3.5 h-3.5" />Suppression</>}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{d.traitement || d.traitementNom}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(d.date || d.dateDemande)}</td>
                        <td className="px-4 py-3">
                          {(d.statut === "EN_ATTENTE" || d.statutDemande === "EN_ATTENTE")
                            ? <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit"><Icon name="clock" className="w-3 h-3" />En attente</span>
                            : <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit"><Icon name="check" className="w-3 h-3" />Traité</span>
                          }
                        </td>
                        <td className="px-4 py-3">
                          {(d.statut === "EN_ATTENTE" || d.statutDemande === "EN_ATTENTE") ? (
                            <button onClick={() => setDetailDemande(d)} className="text-xs bg-green-700 text-white px-3 py-1 rounded-lg hover:bg-green-800">Traiter</button>
                          ) : (
                            <span className="text-gray-400 text-xs flex items-center gap-1"><Icon name="check" className="w-3 h-3" />Traité</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {demandes.length === 0 && (
                  <div className="py-12 text-center text-gray-400 text-sm">Aucune demande</div>
                )}
              </div>
            </div>
          )}

          {/* ── Historique ── */}
          {activeSection === "historique" && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800">Historique</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-1.5"><Icon name="send" className="w-4 h-4" /> Traitements envoyés au DPO</h3>
                  <div className="space-y-2">
                    {traitements.filter(t => t.envoyeAuDpo === true).length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-4">Aucun traitement envoyé</p>
                    )}
                    {traitements.filter(t => t.envoyeAuDpo === true).slice(0, 10).map(t => (
                      <div key={t.idTraitement} className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                        <div>
                          <p className="font-semibold text-sm text-gray-800">{t.description}</p>
                          <p className="text-xs text-gray-400">{t.department} · {formatDate(t.dateCreation)}</p>
                        </div>
                        <span className="text-xs text-green-600 font-medium flex items-center gap-1"><Icon name="send" className="w-3 h-3" />Envoyé</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-1.5"><Icon name="check" className="w-4 h-4" /> Demandes usagers traitées</h3>
                  <div className="space-y-2">
                    {demandes.filter(d => d.statut === "TRAITE" || d.statutDemande === "TRAITE").length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-4">Aucune demande traitée</p>
                    )}
                    {demandes.filter(d => d.statut === "TRAITE" || d.statutDemande === "TRAITE").slice(0, 10).map(d => (
                      <div key={d.id} className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                        <div>
                          <p className="font-semibold text-sm text-gray-800">{d.usager || d.usagerNom}</p>
                          <p className="text-xs text-gray-400">{d.traitement || d.traitementNom} · {formatDate(d.date || d.dateDemande)}</p>
                        </div>
                        <span className="text-xs text-green-600 font-medium flex items-center gap-1"><Icon name="check" className="w-3 h-3" />Traité</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-1.5"><Icon name="calendar" className="w-4 h-4" /> Sessions de collecte terminées</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left font-semibold text-gray-500 text-xs">Description</th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-500 text-xs">Type</th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-500 text-xs">Date fin</th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-500 text-xs">DPO</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {sessions.filter(s => s.statutSession === "TERMINEE").map(s => (
                        <tr key={s.idSession} className="hover:bg-green-50">
                          <td className="px-4 py-2 font-medium text-gray-800">{s.description || `Session #${s.idSession}`}</td>
                          <td className="px-4 py-2 text-gray-600">{s.typeCollecte === "EN_LIGNE" ? "En ligne" : "Terrain"}</td>
                          <td className="px-4 py-2 text-xs text-gray-500">{formatDate(s.dateFin)}</td>
                          <td className="px-4 py-2 text-sm text-gray-600">{s.dpoNomComplet || "—"}</td>
                        </tr>
                      ))}
                      {sessions.filter(s => s.statutSession === "TERMINEE").length === 0 && (
                        <tr><td colSpan={4} className="py-8 text-center text-gray-400 text-sm">Aucune session terminée</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── Modals ── */}
      {showCreer && (
        <ModalCreerTraitement
          onClose={() => setShowCreer(false)}
          onSave={handleCreer}
          sessions={sessions}
          onSaveManuel={handleSaveManuel}
          onSaveExcel={handleSaveExcel}
        />
      )}
      {detailTraitement && (
        <ModalDetailTraitement
          traitement={detailTraitement}
          onClose={() => setDetailTraitement(null)}
          onEnvoyer={handleEnvoyer}
          dpos={dposDisponibles}
          onAjouterDonnees={(t) => { setTraitementPourDonnees(t); setShowAjouterDonnees(true); }}
        />
      )}
      {detailDemande && (
        <ModalDemandeUsager
          demande={detailDemande}
          onClose={() => setDetailDemande(null)}
          onTraiter={handleTraiterDemande}
        />
      )}
      {showAjouterDonnees && traitementPourDonnees && (
        <ModalAjouterDonnees
          traitement={traitementPourDonnees}
          onClose={() => { setShowAjouterDonnees(false); setTraitementPourDonnees(null); }}
          onSaveManuel={handleSaveManuel}
          onSaveExcel={handleSaveExcel}
          showToast={showToast}
        />
      )}

      <Toast toast={toast} />
    </div>
  );
}

export default UtilisateurMetierDashboard;