// ═══════════════════════════════════════════════════════════════════
// MODULE : Tableau de bord Utilisateur Métier (UtilisateurMetierDashboard)
// Point d'entrée : Gère son propre layout (sidebar + header + main)
// Contenu : Dashboard, Sessions de collecte, Traitements, Demandes usagers, Historique
// ═══════════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import api from "../services/api";
import sofitexLogo from "../assets/image.png";

// ═══════════════════════════════════════════════════════════════════
// MODULE 1 : Données de référence
// Listes utilisées dans le formulaire de création de traitement
// ═══════════════════════════════════════════════════════════════════
const DIRECTIONS = ["DSI","DRH","Direction Commerciale","Direction Financière","Direction Générale","Direction Technique","Direction Qualité","Direction Logistique","Direction Juridique","Autre"];
const ORIGINES = ["Directement auprès des personnes (formulaires en ligne, papier)","Via des objets connectés ou capteurs","Importation de fichiers externes ou bases de données existantes"];
const CATEGORIES_PERSONNES = ["Employés SOFITEX","Producteurs de coton","Clients","Fournisseurs / Sous-traitants","Visiteurs","Candidats à l'embauche","Usagers externes"];
const GROUPES_DONNEES = [
  { groupe: "État Civil", items: ["Nom","Prénom","Genre","CNIB / Passeport"] },
  { groupe: "Coordonnées", items: ["Téléphone","Adresse mail","Adresse postale"] },
  { groupe: "Professionnel", items: ["Diplômes","Poste occupé","Historique de carrière"] },
  { groupe: "Financier", items: ["Numéro de compte bancaire","Salaire"] },
  { groupe: "Données technologiques / visuelles", items: ["Adresse IP","Images de caméras","Empreintes (biométrie)"] },
];
const UNITES = ["Mois","Années","Durée indéterminée"];

// ═══════════════════════════════════════════════════════════════════
// MODULE 2 : Utilitaires de formatage des dates
// toDate() gère les chaînes ISO et le format tableau Jackson
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
// MODULE 3 : Données factices (Mock Data)
// Utilisées en fallback lorsque l'API n'est pas disponible
// ═══════════════════════════════════════════════════════════════════
const mockTraitements = [
  { idTraitement: 1, department: "DRH", description: "Gestion des salaires", texte: "Permettre le paiement des employés", certificationSecurite: "ISO 27001", dureeConservation: 60, dateCreation: "2026-05-10T09:00:00", dateFin: "2031-05-10T00:00:00", nombreDonnee: 3, sessionCollecteId: 1, utilisateurMetierId: 1, utilisateurMetierNom: "Ouedraogo Amadou", statut: "ENVOYE_DPO" },
  { idTraitement: 2, department: "DSI", description: "Gestion des accès réseau", texte: "Contrôler les accès aux systèmes", certificationSecurite: "En cours", dureeConservation: 12, dateCreation: "2026-05-15T14:00:00", dateFin: "2027-05-15T00:00:00", nombreDonnee: 1, sessionCollecteId: 2, utilisateurMetierId: 1, utilisateurMetierNom: "Ouedraogo Amadou", statut: "EN_COURS" },
  { idTraitement: 3, department: "Direction Commerciale", description: "Gestion des commandes clients", texte: "Suivi des ventes et facturation", certificationSecurite: "ISO 27001", dureeConservation: 36, dateCreation: "2026-05-20T10:00:00", dateFin: "2029-05-20T00:00:00", nombreDonnee: 12, sessionCollecteId: 1, utilisateurMetierId: 2, utilisateurMetierNom: "Traoré Fatimata", statut: "EN_COURS" },
  { idTraitement: 4, department: "DRH", description: "Suivi des formations", texte: "Gérer les inscriptions aux formations", certificationSecurite: "Non renseigné", dureeConservation: 24, dateCreation: "2026-06-01T08:00:00", dateFin: "2028-06-01T00:00:00", nombreDonnee: 0, sessionCollecteId: null, utilisateurMetierId: 1, utilisateurMetierNom: "Ouedraogo Amadou", statut: "EN_COURS" },
];

const mockDemandes = [
  { id: 1, usager: "Traoré Fatima", usagerNom: "Traoré Fatima", type: "MODIFICATION", typeDemande: "MODIFICATION", traitement: "Gestion des salaires", traitementNom: "Gestion des salaires", date: "2026-05-20T10:00:00", dateDemande: "2026-05-20T10:00:00", statut: "EN_ATTENTE", statutDemande: "EN_ATTENTE", detail: "Demande de correction de l'adresse mail enregistrée.", descriptionDemande: "Demande de correction de l'adresse mail enregistrée." },
  { id: 2, usager: "Kaboré Issouf", usagerNom: "Kaboré Issouf", type: "SUPPRESSION", typeDemande: "SUPPRESSION", traitement: "Gestion des accès réseau", traitementNom: "Gestion des accès réseau", date: "2026-05-21T08:30:00", dateDemande: "2026-05-21T08:30:00", statut: "EN_ATTENTE", statutDemande: "EN_ATTENTE", detail: "Demande de suppression des données suite à fin de contrat.", descriptionDemande: "Demande de suppression des données suite à fin de contrat." },
  { id: 3, usager: "Sawadogo Paul", usagerNom: "Sawadogo Paul", type: "MODIFICATION", typeDemande: "MODIFICATION", traitement: "Gestion des salaires", traitementNom: "Gestion des salaires", date: "2026-05-18T16:00:00", dateDemande: "2026-05-18T16:00:00", statut: "TRAITE", statutDemande: "TRAITE", detail: "Correction du numéro de téléphone.", descriptionDemande: "Correction du numéro de téléphone." },
];

// ═══════════════════════════════════════════════════════════════════
// MODULE 4 : BadgeStatut
// Affiche le statut du traitement avec un code couleur
// (ENVOYE_DPO / EN_COURS / VALIDE / REJETE)
// ═══════════════════════════════════════════════════════════════════
function BadgeStatut({ statut }) {
  const map = {
    ENVOYE_DPO: { label: "Envoyé DPO", cls: "bg-blue-100 text-blue-700" },
    EN_COURS: { label: "En cours", cls: "bg-yellow-100 text-yellow-700" },
    VALIDE: { label: "Validé", cls: "bg-green-100 text-green-700" },
    REJETE: { label: "Rejeté", cls: "bg-red-100 text-red-700" },
  };
  const s = map[statut] || { label: statut, cls: "bg-gray-100 text-gray-600" };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s.cls}`}>{s.label}</span>;
}

// ═══════════════════════════════════════════════════════════════════
// MODULE 5 : Toast de notification
// Affiché en bas à droite (succès vert / erreur rouge)
// ═══════════════════════════════════════════════════════════════════
function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`fixed bottom-6 right-6 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium z-50 transition-all ${toast.type === "error" ? "bg-red-500" : "bg-green-700"}`}>
      {toast.msg}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MODULE 6 : Modal Demande Usager
// Affiche le détail d'une demande (modification/suppression)
// et permet au métier d'y répondre (marquer comme traité)
// ═══════════════════════════════════════════════════════════════════
function ModalDemandeUsager({ demande, onClose, onTraiter }) {
  const [reponse, setReponse] = useState("");
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="bg-green-800 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center">
          <h3 className="font-bold text-lg">Demande de {demande.type === "MODIFICATION" ? "Modification" : "Suppression"}</h3>
          <button onClick={onClose} className="text-green-200 hover:text-white text-xl">✕</button>
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
              ✅ Marquer comme traité
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MODULE 7 : Modal Détail Traitement
// Affiche toutes les infos d'un traitement et permet de l'envoyer au DPO
// ═══════════════════════════════════════════════════════════════════
function ModalDetailTraitement({ traitement, onClose, onEnvoyer }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="bg-green-800 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center">
          <h3 className="font-bold text-lg">Détail du traitement #{traitement.idTraitement}</h3>
          <button onClick={onClose} className="text-green-200 hover:text-white text-xl">✕</button>
        </div>
        <div className="p-6 space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 rounded-lg p-3"><p className="text-xs text-green-600 font-semibold">Département</p><p className="font-medium">{traitement.department}</p></div>
            <div className="bg-green-50 rounded-lg p-3"><p className="text-xs text-green-600 font-semibold">Statut</p><BadgeStatut statut={traitement.statut} /></div>
            <div className="bg-green-50 rounded-lg p-3 col-span-2"><p className="text-xs text-green-600 font-semibold">Description</p><p>{traitement.description}</p></div>
            <div className="bg-green-50 rounded-lg p-3 col-span-2"><p className="text-xs text-green-600 font-semibold">Texte / Finalité</p><p>{traitement.texte}</p></div>
            <div className="bg-green-50 rounded-lg p-3"><p className="text-xs text-green-600 font-semibold">Certification sécurité</p><p>{traitement.certificationSecurite}</p></div>
            <div className="bg-green-50 rounded-lg p-3"><p className="text-xs text-green-600 font-semibold">Conservation</p><p>{traitement.dureeConservation} mois</p></div>
            <div className="bg-green-50 rounded-lg p-3"><p className="text-xs text-green-600 font-semibold">Date création</p><p>{formatDate(traitement.dateCreation)}</p></div>
            <div className="bg-green-50 rounded-lg p-3"><p className="text-xs text-green-600 font-semibold">Date fin</p><p>{formatDate(traitement.dateFin)}</p></div>
            <div className="bg-green-50 rounded-lg p-3"><p className="text-xs text-green-600 font-semibold">Nb données</p><p>{traitement.nombreDonnee}</p></div>
            <div className="bg-green-50 rounded-lg p-3"><p className="text-xs text-green-600 font-semibold">Session ID</p><p>#{traitement.sessionCollecteId || "—"}</p></div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50">Fermer</button>
            {traitement.statut !== "ENVOYE_DPO" && (
              <button onClick={() => { onEnvoyer(traitement.idTraitement); onClose(); }} className="px-4 py-2 rounded-lg bg-green-700 text-white text-sm font-semibold hover:bg-green-800">
                📤 Envoyer au DPO
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MODULE 8 : Modal Créer Traitement (4 étapes)
// Étape 1 : Informations générales (nom, département, responsable)
// Étape 2 : Finalités et origine des données
// Étape 3 : Personnes visées et catégories de données
// Étape 4 : Conservation, destinataires et session de collecte
// ═══════════════════════════════════════════════════════════════════
function ModalCreerTraitement({ onClose, onSave, sessions }) {
  const [etape, setEtape] = useState(1);
  const [form, setForm] = useState({
    nomTraitement: "", department: "", responsable: "", email: "", telephone: "",
    finalitePrincipale: "", finalitesSecondaires: "", origines: [],
    categoriesPersonnes: [], donneesSelectionnees: {},
    destinatairesInternes: "", destinatairesExternes: "", dureeConservation: "", uniteConservation: "Mois", motifIndetermine: "",
    texte: "", certificationSecurite: "", dateFin: "", sessionCollecteId: "",
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleArr = (k, v) => setForm(f => ({ ...f, [k]: f[k].includes(v) ? f[k].filter(x => x !== v) : [...f[k], v] }));
  const toggleDonnee = (groupe, item) => setForm(f => {
    const prev = f.donneesSelectionnees[groupe] || [];
    return { ...f, donneesSelectionnees: { ...f.donneesSelectionnees, [groupe]: prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item] } };
  });

  const etape1Ok = form.nomTraitement && form.department && form.responsable && form.email;
  const etape2Ok = form.finalitePrincipale && form.origines.length > 0;
  const etape3Ok = form.categoriesPersonnes.length > 0;
  const etape4Ok = form.destinatairesInternes && (form.uniteConservation === "Durée indéterminée" ? form.motifIndetermine : form.dureeConservation);
  const canNext = etape === 1 ? etape1Ok : etape === 2 ? etape2Ok : etape === 3 ? etape3Ok : false;

  const handleSave = () => {
    const payload = {
      department: form.department,
      description: form.nomTraitement,
      texte: form.finalitePrincipale,
      certificationSecurite: form.certificationSecurite || "Non renseigné",
      dureeConservation: form.uniteConservation === "Années" ? parseInt(form.dureeConservation) * 12 : parseInt(form.dureeConservation) || 0,
      dateFin: form.dateFin || null,
      sessionCollecteId: form.sessionCollecteId ? parseInt(form.sessionCollecteId) : null,
    };
    onSave(payload);
  };

  const steps = ["Qui & Quoi", "Pourquoi", "Données", "Conservation"];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-screen overflow-y-auto">
        <div className="bg-green-800 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center sticky top-0 z-10">
          <div>
            <h3 className="font-bold text-lg">Nouveau Traitement</h3>
            <p className="text-green-200 text-xs">Étape {etape} / 4 — {steps[etape - 1]}</p>
          </div>
          <button onClick={onClose} className="text-green-200 hover:text-white text-xl">✕</button>
        </div>

        <div className="flex bg-green-900">
          {steps.map((s, i) => (
            <div key={i} className={`flex-1 py-2 text-center text-xs font-semibold transition-all ${i + 1 === etape ? "bg-green-600 text-white" : i + 1 < etape ? "bg-green-700 text-green-200" : "text-green-400"}`}>
              {i + 1 < etape ? "✓ " : `${i + 1}. `}{s}
            </div>
          ))}
        </div>

        <div className="p-6 space-y-5">
          {etape === 1 && (
            <div className="space-y-4">
              <h4 className="font-bold text-green-800 text-base border-b border-green-100 pb-2">📋 Informations Générales & Responsable</h4>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nom du traitement <span className="text-red-500">*</span></label>
                <input value={form.nomTraitement} onChange={e => set("nomTraitement", e.target.value)} placeholder='Ex: "Gestion de la messagerie interne"' className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Direction / Département <span className="text-red-500">*</span></label>
                <select value={form.department} onChange={e => set("department", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="">-- Sélectionner --</option>
                  {DIRECTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Responsable de l'application <span className="text-red-500">*</span></label>
                <input value={form.responsable} onChange={e => set("responsable", e.target.value)} placeholder="Nom du chef de service ou directeur" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email professionnel <span className="text-red-500">*</span></label>
                  <input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="contact@sofitex.bf" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Téléphone</label>
                  <input value={form.telephone} onChange={e => set("telephone", e.target.value)} placeholder="+226 XX XX XX XX" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              </div>
            </div>
          )}

          {etape === 2 && (
            <div className="space-y-4">
              <h4 className="font-bold text-green-800 text-base border-b border-green-100 pb-2">🎯 Finalités & Origine des Données</h4>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Finalité Principale <span className="text-red-500">*</span></label>
                <textarea rows={3} value={form.finalitePrincipale} onChange={e => set("finalitePrincipale", e.target.value)} placeholder="Ex: Permettre le paiement des producteurs de coton" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Finalités Secondaires <span className="text-gray-400 font-normal">(optionnel)</span></label>
                <textarea rows={2} value={form.finalitesSecondaires} onChange={e => set("finalitesSecondaires", e.target.value)} placeholder="Ex: Établir des statistiques de rendement annuel" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Origine des données <span className="text-red-500">*</span></label>
                <div className="space-y-2">
                  {ORIGINES.map(o => (
                    <label key={o} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${form.origines.includes(o) ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-green-300"}`}>
                      <input type="checkbox" checked={form.origines.includes(o)} onChange={() => toggleArr("origines", o)} className="mt-0.5 accent-green-600" />
                      <span className="text-sm">{o}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {etape === 3 && (
            <div className="space-y-4">
              <h4 className="font-bold text-green-800 text-base border-b border-green-100 pb-2">👥 Personnes & Catégories de Données</h4>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Catégories de personnes visées <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES_PERSONNES.map(c => (
                    <label key={c} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-sm transition-all ${form.categoriesPersonnes.includes(c) ? "border-green-500 bg-green-50 text-green-800 font-medium" : "border-gray-200 hover:border-green-300"}`}>
                      <input type="checkbox" checked={form.categoriesPersonnes.includes(c)} onChange={() => toggleArr("categoriesPersonnes", c)} className="accent-green-600" />
                      {c}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Types de données collectées</label>
                <div className="space-y-3">
                  {GROUPES_DONNEES.map(g => (
                    <div key={g.groupe} className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="bg-green-700 text-white px-4 py-2 text-sm font-semibold">🗂 {g.groupe}</div>
                      <div className="p-3 grid grid-cols-2 gap-2">
                        {g.items.map(item => {
                          const sel = (form.donneesSelectionnees[g.groupe] || []).includes(item);
                          return (
                            <label key={item} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-sm transition-all ${sel ? "border-green-500 bg-green-50 text-green-800 font-medium" : "border-gray-100 hover:border-green-300"}`}>
                              <input type="checkbox" checked={sel} onChange={() => toggleDonnee(g.groupe, item)} className="accent-green-600" />
                              {item}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {etape === 4 && (
            <div className="space-y-4">
              <h4 className="font-bold text-green-800 text-base border-b border-green-100 pb-2">🔒 Conservation & Destinataires</h4>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Destinataires Internes <span className="text-red-500">*</span></label>
                <textarea rows={2} value={form.destinatairesInternes} onChange={e => set("destinatairesInternes", e.target.value)} placeholder="Ex: Service comptable, Direction RH..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Destinataires Externes / Sous-traitants <span className="text-gray-400 font-normal">(optionnel)</span></label>
                <textarea rows={2} value={form.destinatairesExternes} onChange={e => set("destinatairesExternes", e.target.value)} placeholder="Ex: Banque partenaire, Prestataire RH..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Durée de conservation opérationnelle <span className="text-red-500">*</span></label>
                <div className="flex gap-3 items-center">
                  {form.uniteConservation !== "Durée indéterminée" && (
                    <input type="number" min="1" value={form.dureeConservation} onChange={e => set("dureeConservation", e.target.value)} placeholder="Ex: 5" className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                  )}
                  <select value={form.uniteConservation} onChange={e => set("uniteConservation", e.target.value)} className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                    {UNITES.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                {form.uniteConservation === "Durée indéterminée" && (
                  <input value={form.motifIndetermine} onChange={e => set("motifIndetermine", e.target.value)} placeholder="Motif de la durée indéterminée..." className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                )}
                <p className="text-xs text-gray-400 mt-1">Ex: 5 Ans après la rupture du contrat de travail</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Certification sécurité</label>
                  <input value={form.certificationSecurite} onChange={e => set("certificationSecurite", e.target.value)} placeholder="Ex: ISO 27001, En cours..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Date de fin</label>
                  <input type="date" value={form.dateFin} onChange={e => set("dateFin", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Session de collecte</label>
                <select value={form.sessionCollecteId} onChange={e => set("sessionCollecteId", e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="">-- Aucune session --</option>
                  {sessions.map(s => (
                    <option key={s.idSession} value={s.idSession}>
                      {s.description || `Session #${s.idSession}`}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">Optionnel : associer ce traitement à une session de collecte existante</p>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 pb-6 flex justify-between items-center border-t border-gray-100 pt-4">
          <button onClick={() => etape > 1 ? setEtape(e => e - 1) : onClose()} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50">
            {etape === 1 ? "Annuler" : "← Précédent"}
          </button>
          {etape < 4 ? (
            <button onClick={() => setEtape(e => e + 1)} disabled={!canNext} className="px-5 py-2 rounded-lg bg-green-700 text-white text-sm font-semibold hover:bg-green-800 disabled:opacity-40 disabled:cursor-not-allowed">
              Suivant →
            </button>
          ) : (
            <button onClick={handleSave} disabled={!etape4Ok} className="px-5 py-2 rounded-lg bg-green-700 text-white text-sm font-semibold hover:bg-green-800 disabled:opacity-40 disabled:cursor-not-allowed">
              ✅ Créer le traitement
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MODULE 9 : Composant principal UtilisateurMetierDashboard
// Gère l'ensemble de l'interface métier : sidebar personnalisée,
// header avec notifications, et 5 sections (dashboard, sessions,
// traitements, demandes, historique). Les sessions sont pollées
// toutes les 30s pour détecter les nouvelles créations du DPO.
// ═══════════════════════════════════════════════════════════════════
function UtilisateurMetierDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [traitements, setTraitements] = useState(mockTraitements);
  const [demandes, setDemandes] = useState(mockDemandes);
  const [sessions, setSessions] = useState([]);
  const [showCreer, setShowCreer] = useState(false);
  const [detailTraitement, setDetailTraitement] = useState(null);
  const [detailDemande, setDetailDemande] = useState(null);
  const [toast, setToast] = useState(null);
  const [recherche, setRecherche] = useState("");
  const [traitementFilterMode, setTraitementFilterMode] = useState("tous");
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [selectedSessionDetail, setSelectedSessionDetail] = useState(null);
  const [newSessionCount, setNewSessionCount] = useState(0);
  const [previousSessionCount, setPreviousSessionCount] = useState(0);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    api.get("/sessions")
      .then((res) => {
        setSessions(res.data);
        setPreviousSessionCount(res.data.length);
      })
      .catch(() => {});
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
        .catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [previousSessionCount]);

  const handleCreer = (payload) => {
    api.post("/traitements", payload)
      .then((res) => {
        setTraitements(prev => [res.data, ...prev]);
        setShowCreer(false);
        showToast("✅ Traitement créé avec succès !");
      })
      .catch(() => {
        const nouveau = {
          ...payload,
          idTraitement: traitements.length + 1,
          dateCreation: new Date().toISOString(),
          nombreDonnee: 0,
          utilisateurMetierId: 1,
          utilisateurMetierNom: "Ouedraogo Amadou",
          statut: "EN_COURS",
        };
        setTraitements(prev => [nouveau, ...prev]);
        setShowCreer(false);
        showToast("✅ Traitement créé (hors ligne)");
      });
  };

  const handleEnvoyer = (id) => {
    api.patch(`/traitements/${id}/statut?valeur=ENVOYE_DPO`)
      .then(() => {
        setTraitements(prev => prev.map(t => t.idTraitement === id ? { ...t, statut: "ENVOYE_DPO" } : t));
        showToast("📤 Traitement envoyé au DPO !");
      })
      .catch(() => {
        setTraitements(prev => prev.map(t => t.idTraitement === id ? { ...t, statut: "ENVOYE_DPO" } : t));
        showToast("📤 Traitement envoyé au DPO (hors ligne)");
      });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    window.location.href = "/";
  };

  const handleTraiterDemande = (id, reponse) => {
    setDemandes(prev => prev.map(d => d.id === id ? { ...d, statut: "TRAITE" } : d));
    showToast("✅ Demande traitée !");
  };

  const demandesEnAttente = demandes.filter(d => (d.statut === "EN_ATTENTE" || d.statutDemande === "EN_ATTENTE")).length;

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

  const stats = [
    { label: "Sessions en cours", value: sessions.filter(s => s.statutSession === "EN_COURS").length, icon: "📅", color: "bg-blue-50 border-blue-200" },
    { label: "Total traitements", value: traitements.length, icon: "📋", color: "bg-green-50 border-green-200" },
    { label: "Envoyés au DPO", value: traitements.filter(t => t.statut === "ENVOYE_DPO").length, icon: "📤", color: "bg-purple-50 border-purple-200" },
    { label: "Demandes usagers", value: demandesEnAttente, icon: "🔔", color: "bg-red-50 border-red-200" },
  ];

  const navItems = [
    { id: "dashboard", label: "Tableau de bord", icon: "🏠" },
    { id: "sessions", label: "Sessions de collecte", icon: "📅", badge: newSessionCount },
    { id: "traitements", label: "Mes traitements", icon: "📋" },
    { id: "demandes", label: "Demandes usagers", icon: "🔔", badge: demandesEnAttente },
    { id: "historique", label: "Historique", icon: "📜" },
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
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              {sidebarOpen && (
                <span className="flex-1 text-left">{item.label}</span>
              )}
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
                📅 <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">{newSessionCount > 9 ? '9+' : newSessionCount}</span>
              </button>
            )}
            {demandesEnAttente > 0 && (
              <button onClick={() => setActiveSection("demandes")} className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                🔔 <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">{demandesEnAttente > 9 ? '9+' : demandesEnAttente}</span>
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
                    <div className="text-2xl mb-1">{s.icon}</div>
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
                      <BadgeStatut statut={t.statut} />
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
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                s.statutSession === "EN_COURS" ? "bg-blue-100 text-blue-700" :
                                s.statutSession === "TERMINEE" ? "bg-green-100 text-green-700" :
                                "bg-red-100 text-red-700"
                              }`}>
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
                            <td className="px-4 py-3"><BadgeStatut statut={t.statut} /></td>
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
                          <option key={s.idSession} value={s.idSession}>
                            {s.description || `Session #${s.idSession}`}
                          </option>
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
                        <td className="px-4 py-3"><BadgeStatut statut={t.statut} /></td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => setDetailTraitement(t)} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-lg hover:bg-green-200">Voir</button>
                            {t.statut !== "ENVOYE_DPO" && (
                              <button onClick={() => handleEnvoyer(t.idTraitement)} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-200">📤 DPO</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {traitementsFiltres.length === 0 && (
                  <div className="py-12 text-center text-gray-400 text-sm">
                    <p className="text-3xl mb-2">📋</p>
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
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${(d.type === "MODIFICATION" || d.typeDemande === "MODIFICATION") ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"}`}>
                            {(d.type === "MODIFICATION" || d.typeDemande === "MODIFICATION") ? "✏️ Modification" : "🗑 Suppression"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{d.traitement || d.traitementNom}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(d.date || d.dateDemande)}</td>
                        <td className="px-4 py-3">
                          {(d.statut === "EN_ATTENTE" || d.statutDemande === "EN_ATTENTE")
                            ? <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-0.5 rounded-full">⏳ En attente</span>
                            : <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">✅ Traité</span>
                          }
                        </td>
                        <td className="px-4 py-3">
                          {(d.statut === "EN_ATTENTE" || d.statutDemande === "EN_ATTENTE") ? (
                            <button onClick={() => setDetailDemande(d)} className="text-xs bg-green-700 text-white px-3 py-1 rounded-lg hover:bg-green-800">Traiter</button>
                          ) : (
                            <span className="text-gray-400 text-xs">✅ Traité</span>
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
                  <h3 className="font-bold text-gray-800 mb-3">📤 Traitements envoyés au DPO</h3>
                  <div className="space-y-2">
                    {traitements.filter(t => t.statut === "ENVOYE_DPO").length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-4">Aucun traitement envoyé</p>
                    )}
                    {traitements.filter(t => t.statut === "ENVOYE_DPO").slice(0, 10).map(t => (
                      <div key={t.idTraitement} className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                        <div>
                          <p className="font-semibold text-sm text-gray-800">{t.description}</p>
                          <p className="text-xs text-gray-400">{t.department} · {formatDate(t.dateCreation)}</p>
                        </div>
                        <span className="text-xs text-blue-600 font-medium">📤 Envoyé</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <h3 className="font-bold text-gray-800 mb-3">✅ Demandes usagers traitées</h3>
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
                        <span className="text-xs text-green-600 font-medium">✅ Traité</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-bold text-gray-800 mb-3">📅 Sessions de collecte terminées</h3>
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
      {showCreer && <ModalCreerTraitement onClose={() => setShowCreer(false)} onSave={handleCreer} sessions={sessions} />}
      {detailTraitement && <ModalDetailTraitement traitement={detailTraitement} onClose={() => setDetailTraitement(null)} onEnvoyer={handleEnvoyer} />}
      {detailDemande && <ModalDemandeUsager demande={detailDemande} onClose={() => setDetailDemande(null)} onTraiter={handleTraiterDemande} />}

      <Toast toast={toast} />
    </div>
  );
}

export default UtilisateurMetierDashboard;