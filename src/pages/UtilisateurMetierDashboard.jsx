// ═══════════════════════════════════════════════════════════════════
// MODULE : Tableau de bord Utilisateur Métier
// Fonctionnalités selon rapport de stage ESI/SOFITEX :
//   CU05 - Gérer traitements (créer, modifier, supprimer, envoyer DPO)
//   CU06 - Associer données à un traitement (saisie manuelle + import CSV/Excel)
//   CU16 - Gérer demandes usagers (traiter avec réponse / rejeter avec motif)
//   Sessions de collecte (lecture seule, créées par DPO)
//   Historique et tableau de bord
// ═══════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef } from "react";
import api from "../services/api";
import sofitexLogo from "../assets/image.png";

// ═══════════════════════════════════════════════════════════════════
// DONNÉES DE RÉFÉRENCE
// ═══════════════════════════════════════════════════════════════════
const DIRECTIONS = ["DSI", "DRH", "Direction Commerciale", "Direction Financière", "Direction Générale", "Direction Technique", "Direction Qualité", "Direction Logistique", "Direction Juridique", "Autre"];
const ORIGINES = [
  "Directement auprès des personnes (formulaires en ligne, papier)",
  "Via des objets connectés ou capteurs",
  "Importation de fichiers externes ou bases de données existantes",
];
const CATEGORIES_PERSONNES = ["Employés SOFITEX", "Producteurs de coton", "Clients", "Fournisseurs / Sous-traitants", "Visiteurs", "Candidats à l'embauche", "Usagers externes"];
const GROUPES_DONNEES = [
  { groupe: "État Civil", items: ["Nom", "Prénom", "Genre", "CNIB / Passeport"] },
  { groupe: "Coordonnées", items: ["Téléphone", "Adresse mail", "Adresse postale"] },
  { groupe: "Professionnel", items: ["Diplômes", "Poste occupé", "Historique de carrière"] },
  { groupe: "Financier", items: ["Numéro de compte bancaire", "Salaire"] },
  { groupe: "Données technologiques / visuelles", items: ["Adresse IP", "Images de caméras", "Empreintes (biométrie)"] },
];
const UNITES = ["Mois", "Années", "Durée indéterminée"];

// ═══════════════════════════════════════════════════════════════════
// MOCK DATA (fallback si API indisponible)
// ═══════════════════════════════════════════════════════════════════
const mockTraitements = [
  { idTraitement: 1, department: "DRH", description: "Gestion des salaires", texte: "Permettre le paiement des employés", certificationSecurite: "ISO 27001", dureeConservation: 60, dateCreation: "2026-05-10T09:00:00", dateFin: "2031-05-10T00:00:00", nombreDonnee: 3, sessionCollecteId: 1, statut: "ENVOYE_DPO" },
  { idTraitement: 2, department: "DSI", description: "Gestion des accès réseau", texte: "Contrôler les accès aux systèmes", certificationSecurite: "En cours", dureeConservation: 12, dateCreation: "2026-05-15T14:00:00", dateFin: "2027-05-15T00:00:00", nombreDonnee: 1, sessionCollecteId: 2, statut: "EN_COURS" },
  { idTraitement: 3, department: "Direction Commerciale", description: "Gestion des commandes clients", texte: "Suivi des ventes et facturation", certificationSecurite: "ISO 27001", dureeConservation: 36, dateCreation: "2026-05-20T10:00:00", dateFin: "2029-05-20T00:00:00", nombreDonnee: 12, sessionCollecteId: 1, statut: "EN_COURS" },
  { idTraitement: 4, department: "DRH", description: "Suivi des formations", texte: "Gérer les inscriptions aux formations", certificationSecurite: "Non renseigné", dureeConservation: 24, dateCreation: "2026-06-01T08:00:00", dateFin: "2028-06-01T00:00:00", nombreDonnee: 0, sessionCollecteId: null, statut: "EN_COURS" },
];
const mockDemandes = [
  { id: 1, usagerNom: "Traoré Fatima", typeDemande: "MODIFICATION", traitementNom: "Gestion des salaires", dateDemande: "2026-05-20T10:00:00", statutDemande: "EN_ATTENTE", descriptionDemande: "Demande de correction de l'adresse mail enregistrée." },
  { id: 2, usagerNom: "Kaboré Issouf", typeDemande: "SUPPRESSION", traitementNom: "Gestion des accès réseau", dateDemande: "2026-05-21T08:30:00", statutDemande: "EN_ATTENTE", descriptionDemande: "Demande de suppression des données suite à fin de contrat." },
  { id: 3, usagerNom: "Sawadogo Paul", typeDemande: "MODIFICATION", traitementNom: "Gestion des salaires", dateDemande: "2026-05-18T16:00:00", statutDemande: "TRAITE", descriptionDemande: "Correction du numéro de téléphone.", reponse: "Numéro corrigé avec succès." },
];

// ═══════════════════════════════════════════════════════════════════
// UTILITAIRES
// ═══════════════════════════════════════════════════════════════════
const toDate = (d) => {
  if (!d) return null;
  if (Array.isArray(d)) return new Date(d[0], d[1] - 1, d[2], d[3] || 0, d[4] || 0);
  return new Date(d);
};
const formatDate = (d) => {
  const date = toDate(d);
  return date instanceof Date && !isNaN(date) ? date.toLocaleDateString("fr-FR") : "—";
};
const formatDateTime = (d) => {
  const date = toDate(d);
  return date instanceof Date && !isNaN(date)
    ? date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "—";
};

// ═══════════════════════════════════════════════════════════════════
// COMPOSANTS UTILITAIRES
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

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`fixed bottom-6 right-6 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium z-50 transition-all ${toast.type === "error" ? "bg-red-500" : "bg-green-700"}`}>
      {toast.msg}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MODAL : Associer / Ajouter des données à un traitement (CU06)
// Saisie manuelle OU import CSV/Excel
// ═══════════════════════════════════════════════════════════════════
function ModalAjouterDonnees({ traitement, onClose, onSave }) {
  const [mode, setMode] = useState("manuel"); // "manuel" | "import"
  const [form, setForm] = useState({ nom: "", prenom: "", email: "", telephone: "", genre: "", cnib: "", adresse: "", poste: "", departement: "", notes: "" });
  const [fichier, setFichier] = useState(null);
  const [apercu, setApercu] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  const handleChange = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleFichier = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFichier(f);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      const lines = text.split("\n").filter(Boolean);
      const headers = lines[0].split(/[,;]/).map(h => h.trim());
      const rows = lines.slice(1, 6).map(line => {
        const vals = line.split(/[,;]/);
        return headers.reduce((obj, h, i) => ({ ...obj, [h]: vals[i]?.trim() || "" }), {});
      });
      setApercu(rows);
    };
    reader.readAsText(f);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (mode === "manuel") {
        await api.post(`/traitements/${traitement.idTraitement}/donnees`, form);
      } else if (fichier) {
        const fd = new FormData();
        fd.append("file", fichier);
        await api.post(`/traitements/${traitement.idTraitement}/donnees/import`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      onSave("Données ajoutées avec succès !");
    } catch {
      onSave("Données associées (hors ligne)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-screen overflow-y-auto">
        <div className="bg-green-800 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center sticky top-0 z-10">
          <div>
            <h3 className="font-bold text-lg">Associer des données</h3>
            <p className="text-green-200 text-xs">Traitement : {traitement.description}</p>
          </div>
          <button onClick={onClose} className="text-green-200 hover:text-white text-xl">✕</button>
        </div>

        {/* Onglets mode */}
        <div className="flex border-b border-gray-200">
          <button onClick={() => setMode("manuel")} className={`flex-1 py-3 text-sm font-semibold transition-colors ${mode === "manuel" ? "border-b-2 border-green-700 text-green-700 bg-white" : "text-gray-400 bg-gray-50"}`}>
            ✏️ Saisie manuelle
          </button>
          <button onClick={() => setMode("import")} className={`flex-1 py-3 text-sm font-semibold transition-colors ${mode === "import" ? "border-b-2 border-green-700 text-green-700 bg-white" : "text-gray-400 bg-gray-50"}`}>
            📂 Import CSV / Excel
          </button>
        </div>

        <div className="p-6">
          {mode === "manuel" && (
            <div className="space-y-4">
              <p className="text-xs text-gray-400 mb-2">Remplissez les informations de la personne concernée par ce traitement.</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: "nom", label: "Nom", placeholder: "Ex : Traoré" },
                  { key: "prenom", label: "Prénom", placeholder: "Ex : Aminata" },
                  { key: "email", label: "Adresse e-mail", placeholder: "aminata@sofitex.bf" },
                  { key: "telephone", label: "Téléphone", placeholder: "+226 70 00 00 00" },
                  { key: "genre", label: "Genre", placeholder: "M / F" },
                  { key: "cnib", label: "CNIB / Passeport", placeholder: "B12345678" },
                  { key: "adresse", label: "Adresse postale", placeholder: "Rue 12, Bobo-Dioulasso" },
                  { key: "poste", label: "Poste occupé", placeholder: "Ex : Technicien" },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
                    <input value={form[key]} onChange={e => handleChange(key, e.target.value)} placeholder={placeholder}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Notes / Informations complémentaires</label>
                <textarea rows={2} value={form.notes} onChange={e => handleChange("notes", e.target.value)} placeholder="Informations supplémentaires..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
            </div>
          )}

          {mode === "import" && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-green-300 rounded-xl p-8 text-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all"
                onClick={() => fileRef.current?.click()}>
                <div className="text-4xl mb-2">📂</div>
                <p className="text-sm font-semibold text-gray-700">{fichier ? fichier.name : "Cliquez pour sélectionner un fichier"}</p>
                <p className="text-xs text-gray-400 mt-1">Formats acceptés : CSV, Excel (.xlsx, .xls)</p>
                <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFichier} className="hidden" />
              </div>

              {apercu.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-green-700 mb-2">📋 Aperçu des 5 premières lignes :</p>
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full text-xs">
                      <thead className="bg-green-50">
                        <tr>{Object.keys(apercu[0]).map(h => <th key={h} className="px-3 py-2 text-left font-semibold text-green-700">{h}</th>)}</tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {apercu.map((row, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            {Object.values(row).map((v, j) => <td key={j} className="px-3 py-2 text-gray-600">{v}</td>)}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">✅ {apercu.length} lignes en aperçu — toutes les données seront importées</p>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
                <strong>ℹ️ Format attendu :</strong> Le fichier doit contenir des colonnes comme <code>nom, prenom, email, telephone</code> etc. Les données seront parsées automatiquement et associées à ce traitement.
              </div>
            </div>
          )}
        </div>

        <div className="px-6 pb-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50">Annuler</button>
          <button onClick={handleSave} disabled={loading || (mode === "import" && !fichier)}
            className="px-5 py-2 rounded-lg bg-green-700 text-white text-sm font-semibold hover:bg-green-800 disabled:opacity-40 disabled:cursor-not-allowed">
            {loading ? "Enregistrement..." : "✅ Enregistrer les données"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MODAL : Modifier un traitement existant
// ═══════════════════════════════════════════════════════════════════
function ModalModifierTraitement({ traitement, onClose, onSave }) {
  const [form, setForm] = useState({
    description: traitement.description || "",
    department: traitement.department || "",
    texte: traitement.texte || "",
    certificationSecurite: traitement.certificationSecurite || "",
    dureeConservation: traitement.dureeConservation || "",
    dateFin: traitement.dateFin ? traitement.dateFin.toString().split("T")[0] : "",
  });
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put(`/traitements/${traitement.idTraitement}`, {
        ...form,
        dureeConservation: parseInt(form.dureeConservation) || 0,
        dateFin: form.dateFin || null,
      });
      onSave({ ...traitement, ...form, dureeConservation: parseInt(form.dureeConservation) || 0 }, "✅ Traitement modifié avec succès !");
    } catch {
      onSave({ ...traitement, ...form, dureeConservation: parseInt(form.dureeConservation) || 0 }, "✅ Traitement modifié (hors ligne)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-screen overflow-y-auto">
        <div className="bg-green-800 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center sticky top-0 z-10">
          <h3 className="font-bold text-lg">Modifier le traitement #{traitement.idTraitement}</h3>
          <button onClick={onClose} className="text-green-200 hover:text-white text-xl">✕</button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description / Nom <span className="text-red-500">*</span></label>
            <input value={form.description} onChange={e => set("description", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Direction / Département <span className="text-red-500">*</span></label>
            <select value={form.department} onChange={e => set("department", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="">-- Sélectionner --</option>
              {DIRECTIONS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Finalité principale</label>
            <textarea rows={3} value={form.texte} onChange={e => set("texte", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Certification sécurité</label>
              <input value={form.certificationSecurite} onChange={e => set("certificationSecurite", e.target.value)} placeholder="ISO 27001..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Durée conservation (mois)</label>
              <input type="number" min="1" value={form.dureeConservation} onChange={e => set("dureeConservation", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Date de fin</label>
            <input type="date" value={form.dateFin} onChange={e => set("dateFin", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
        </div>
        <div className="px-6 pb-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50">Annuler</button>
          <button onClick={handleSave} disabled={loading || !form.description || !form.department}
            className="px-5 py-2 rounded-lg bg-green-700 text-white text-sm font-semibold hover:bg-green-800 disabled:opacity-40">
            {loading ? "Enregistrement..." : "💾 Sauvegarder"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MODAL : Créer traitement (4 étapes)
// ═══════════════════════════════════════════════════════════════════
function ModalCreerTraitement({ onClose, onSave, sessions }) {
  const [etape, setEtape] = useState(1);
  const [form, setForm] = useState({
    nomTraitement: "", department: "", responsable: "", email: "", telephone: "",
    finalitePrincipale: "", finalitesSecondaires: "", origines: [],
    categoriesPersonnes: [], donneesSelectionnees: {},
    destinatairesInternes: "", destinatairesExternes: "", dureeConservation: "", uniteConservation: "Mois", motifIndetermine: "",
    certificationSecurite: "", dateFin: "", sessionCollecteId: "",
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
                <input value={form.nomTraitement} onChange={e => set("nomTraitement", e.target.value)} placeholder='Ex: "Gestion de la messagerie interne"'
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Direction / Département <span className="text-red-500">*</span></label>
                <select value={form.department} onChange={e => set("department", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="">-- Sélectionner --</option>
                  {DIRECTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Responsable de l'application <span className="text-red-500">*</span></label>
                <input value={form.responsable} onChange={e => set("responsable", e.target.value)} placeholder="Nom du chef de service ou directeur"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email professionnel <span className="text-red-500">*</span></label>
                  <input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="contact@sofitex.bf"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Téléphone</label>
                  <input value={form.telephone} onChange={e => set("telephone", e.target.value)} placeholder="+226 XX XX XX XX"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              </div>
            </div>
          )}
          {etape === 2 && (
            <div className="space-y-4">
              <h4 className="font-bold text-green-800 text-base border-b border-green-100 pb-2">🎯 Finalités & Origine des Données</h4>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Finalité Principale <span className="text-red-500">*</span></label>
                <textarea rows={3} value={form.finalitePrincipale} onChange={e => set("finalitePrincipale", e.target.value)} placeholder="Ex: Permettre le paiement des producteurs de coton"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Finalités Secondaires <span className="text-gray-400 font-normal">(optionnel)</span></label>
                <textarea rows={2} value={form.finalitesSecondaires} onChange={e => set("finalitesSecondaires", e.target.value)} placeholder="Ex: Établir des statistiques de rendement annuel"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
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
                <textarea rows={2} value={form.destinatairesInternes} onChange={e => set("destinatairesInternes", e.target.value)} placeholder="Ex: Service comptable, Direction RH..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Destinataires Externes <span className="text-gray-400 font-normal">(optionnel)</span></label>
                <textarea rows={2} value={form.destinatairesExternes} onChange={e => set("destinatairesExternes", e.target.value)} placeholder="Ex: Banque partenaire, Prestataire RH..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Durée de conservation opérationnelle <span className="text-red-500">*</span></label>
                <div className="flex gap-3 items-center">
                  {form.uniteConservation !== "Durée indéterminée" && (
                    <input type="number" min="1" value={form.dureeConservation} onChange={e => set("dureeConservation", e.target.value)} placeholder="Ex: 5"
                      className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                  )}
                  <select value={form.uniteConservation} onChange={e => set("uniteConservation", e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                    {UNITES.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                {form.uniteConservation === "Durée indéterminée" && (
                  <input value={form.motifIndetermine} onChange={e => set("motifIndetermine", e.target.value)} placeholder="Motif de la durée indéterminée..."
                    className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Certification sécurité</label>
                  <input value={form.certificationSecurite} onChange={e => set("certificationSecurite", e.target.value)} placeholder="Ex: ISO 27001, En cours..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Date de fin</label>
                  <input type="date" value={form.dateFin} onChange={e => set("dateFin", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Session de collecte</label>
                <select value={form.sessionCollecteId} onChange={e => set("sessionCollecteId", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="">-- Aucune session --</option>
                  {sessions.map(s => <option key={s.idSession} value={s.idSession}>{s.description || `Session #${s.idSession}`}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>
        <div className="px-6 pb-6 flex justify-between items-center border-t border-gray-100 pt-4">
          <button onClick={() => etape > 1 ? setEtape(e => e - 1) : onClose()} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50">
            {etape === 1 ? "Annuler" : "← Précédent"}
          </button>
          {etape < 4 ? (
            <button onClick={() => setEtape(e => e + 1)} disabled={!canNext}
              className="px-5 py-2 rounded-lg bg-green-700 text-white text-sm font-semibold hover:bg-green-800 disabled:opacity-40 disabled:cursor-not-allowed">
              Suivant →
            </button>
          ) : (
            <button onClick={handleSave} disabled={!etape4Ok}
              className="px-5 py-2 rounded-lg bg-green-700 text-white text-sm font-semibold hover:bg-green-800 disabled:opacity-40 disabled:cursor-not-allowed">
              ✅ Créer le traitement
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MODAL : Détail traitement
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
            <div className="bg-green-50 rounded-lg p-3 col-span-2"><p className="text-xs text-green-600 font-semibold">Finalité</p><p>{traitement.texte}</p></div>
            <div className="bg-green-50 rounded-lg p-3"><p className="text-xs text-green-600 font-semibold">Certification</p><p>{traitement.certificationSecurite}</p></div>
            <div className="bg-green-50 rounded-lg p-3"><p className="text-xs text-green-600 font-semibold">Conservation</p><p>{traitement.dureeConservation} mois</p></div>
            <div className="bg-green-50 rounded-lg p-3"><p className="text-xs text-green-600 font-semibold">Date création</p><p>{formatDate(traitement.dateCreation)}</p></div>
            <div className="bg-green-50 rounded-lg p-3"><p className="text-xs text-green-600 font-semibold">Date fin</p><p>{formatDate(traitement.dateFin)}</p></div>
            <div className="bg-green-50 rounded-lg p-3"><p className="text-xs text-green-600 font-semibold">Nb données</p><p>{traitement.nombreDonnee}</p></div>
            <div className="bg-green-50 rounded-lg p-3"><p className="text-xs text-green-600 font-semibold">Session ID</p><p>#{traitement.sessionCollecteId || "—"}</p></div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50">Fermer</button>
            {traitement.statut !== "ENVOYE_DPO" && (
              <button onClick={() => { onEnvoyer(traitement.idTraitement); onClose(); }}
                className="px-4 py-2 rounded-lg bg-green-700 text-white text-sm font-semibold hover:bg-green-800">
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
// MODAL : Gérer une demande usager (CU16)
// Traiter (avec réponse) ou Rejeter (avec motif)
// ═══════════════════════════════════════════════════════════════════
function ModalGererDemande({ demande, onClose, onTraiter }) {
  const [action, setAction] = useState("traiter"); // "traiter" | "rejeter"
  const [reponse, setReponse] = useState("");
  const [motifRejet, setMotifRejet] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = action === "traiter" ? reponse.trim().length > 0 : motifRejet.trim().length > 0;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (action === "traiter") {
        await api.patch(`/demandes/${demande.id}/traiter`, { reponse });
      } else {
        await api.patch(`/demandes/${demande.id}/rejeter`, { motif: motifRejet });
      }
      onTraiter(demande.id, action, action === "traiter" ? reponse : motifRejet);
      onClose();
    } catch {
      onTraiter(demande.id, action, action === "traiter" ? reponse : motifRejet);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="bg-green-800 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center">
          <h3 className="font-bold text-lg">
            Demande de {demande.typeDemande === "MODIFICATION" ? "Modification" : "Suppression"}
          </h3>
          <button onClick={onClose} className="text-green-200 hover:text-white text-xl">✕</button>
        </div>
        <div className="p-6 space-y-4">
          {/* Infos demande */}
          <div className="bg-green-50 rounded-xl p-4 space-y-2 text-sm border border-green-100">
            <p><span className="font-semibold text-green-800">Usager :</span> {demande.usagerNom}</p>
            <p><span className="font-semibold text-green-800">Traitement concerné :</span> {demande.traitementNom}</p>
            <p><span className="font-semibold text-green-800">Date :</span> {formatDate(demande.dateDemande)}</p>
            <p><span className="font-semibold text-green-800">Description :</span> {demande.descriptionDemande}</p>
          </div>

          {/* Choix action */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Action à effectuer :</p>
            <div className="flex gap-3">
              <button onClick={() => setAction("traiter")}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-all ${action === "traiter" ? "bg-green-700 text-white border-green-700" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
                ✅ Accepter & Traiter
              </button>
              <button onClick={() => setAction("rejeter")}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-all ${action === "rejeter" ? "bg-red-600 text-white border-red-600" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
                ❌ Rejeter
              </button>
            </div>
          </div>

          {action === "traiter" && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Réponse / Action effectuée <span className="text-red-500">*</span></label>
              <textarea rows={3} value={reponse} onChange={e => setReponse(e.target.value)}
                placeholder={demande.typeDemande === "MODIFICATION" ? "Décrivez la modification effectuée sur les données..." : "Confirmez la suppression des données effectuée..."}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              <p className="text-xs text-gray-400 mt-1">ℹ️ Cette réponse sera enregistrée et le DPO sera notifié automatiquement.</p>
            </div>
          )}

          {action === "rejeter" && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Motif du rejet <span className="text-red-500">*</span></label>
              <textarea rows={3} value={motifRejet} onChange={e => setMotifRejet(e.target.value)}
                placeholder="Expliquez pourquoi cette demande est rejetée..."
                className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
              <p className="text-xs text-gray-400 mt-1">ℹ️ L'usager et le DPO seront notifiés du rejet avec ce motif.</p>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-1">
            <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50">Annuler</button>
            <button onClick={handleSubmit} disabled={!canSubmit || loading}
              className={`px-5 py-2 rounded-lg text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed ${action === "traiter" ? "bg-green-700 hover:bg-green-800" : "bg-red-600 hover:bg-red-700"}`}>
              {loading ? "Traitement..." : action === "traiter" ? "✅ Confirmer le traitement" : "❌ Confirmer le rejet"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════════
function UtilisateurMetierDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Données
  const [traitements, setTraitements] = useState(mockTraitements);
  const [demandes, setDemandes] = useState(mockDemandes);
  const [sessions, setSessions] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Modals
  const [showCreer, setShowCreer] = useState(false);
  const [traitementModifier, setTraitementModifier] = useState(null);
  const [traitementDonnees, setTraitementDonnees] = useState(null);
  const [detailTraitement, setDetailTraitement] = useState(null);
  const [detailDemande, setDetailDemande] = useState(null);

  // UI
  const [toast, setToast] = useState(null);
  const [recherche, setRecherche] = useState("");
  const [filterStatut, setFilterStatut] = useState("tous");
  const [selectedSessionDetail, setSelectedSessionDetail] = useState(null);
  const [newSessionCount, setNewSessionCount] = useState(0);
  const [previousSessionCount, setPreviousSessionCount] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Chargement initial ──────────────────────────────────────────
  useEffect(() => {
    const loadAll = async () => {
      setLoadingData(true);
      try {
        const [trRes, demRes, sessRes] = await Promise.allSettled([
          api.get("/traitements"),
          api.get("/demandes"),
          api.get("/sessions"),
        ]);
        if (trRes.status === "fulfilled") setTraitements(trRes.value.data);
        if (demRes.status === "fulfilled") setDemandes(demRes.value.data);
        if (sessRes.status === "fulfilled") {
          setSessions(sessRes.value.data);
          setPreviousSessionCount(sessRes.value.data.length);
        }
      } catch {
        // fallback mock déjà chargé
      } finally {
        setLoadingData(false);
      }
    };
    loadAll();
  }, []);

  // ── Polling sessions (nouvelles créées par DPO) ──────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      api.get("/sessions").then(res => {
        setSessions(res.data);
        if (res.data.length > previousSessionCount) {
          setNewSessionCount(prev => prev + (res.data.length - previousSessionCount));
        }
        setPreviousSessionCount(res.data.length);
      }).catch(() => { });
    }, 30000);
    return () => clearInterval(interval);
  }, [previousSessionCount]);

  // ── Actions traitements ─────────────────────────────────────────
  const handleCreer = (payload) => {
    api.post("/traitements", payload)
      .then(res => {
        setTraitements(prev => [res.data, ...prev]);
        setShowCreer(false);
        showToast("✅ Traitement créé avec succès !");
      })
      .catch(() => {
        const nouveau = { ...payload, idTraitement: Date.now(), dateCreation: new Date().toISOString(), nombreDonnee: 0, statut: "EN_COURS" };
        setTraitements(prev => [nouveau, ...prev]);
        setShowCreer(false);
        showToast("✅ Traitement créé (hors ligne)");
      });
  };

  const handleModifier = (traitementMaj, msg) => {
    setTraitements(prev => prev.map(t => t.idTraitement === traitementMaj.idTraitement ? traitementMaj : t));
    setTraitementModifier(null);
    showToast(msg);
  };

  const handleSupprimer = async (id) => {
    try {
      await api.delete(`/traitements/${id}`);
    } catch { /* hors ligne */ }
    setTraitements(prev => prev.filter(t => t.idTraitement !== id));
    setConfirmDelete(null);
    showToast("🗑️ Traitement supprimé.");
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

  // ── Actions demandes ────────────────────────────────────────────
  const handleGererDemande = (id, action, contenu) => {
    setDemandes(prev => prev.map(d => d.id === id ? {
      ...d,
      statutDemande: action === "traiter" ? "TRAITE" : "REJETE",
      reponse: action === "traiter" ? contenu : undefined,
      motifRejet: action === "rejeter" ? contenu : undefined,
    } : d));
    showToast(action === "traiter" ? "✅ Demande traitée et usager notifié !" : "❌ Demande rejetée.");
  };

  // ── Logout ──────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    window.location.href = "/";
  };

  // ── Données calculées ───────────────────────────────────────────
  const demandesEnAttente = demandes.filter(d => d.statutDemande === "EN_ATTENTE").length;

  const traitementsFiltres = traitements.filter(t => {
    const matchRecherche = !recherche || t.description?.toLowerCase().includes(recherche.toLowerCase()) || t.department?.toLowerCase().includes(recherche.toLowerCase());
    const matchStatut = filterStatut === "tous" || t.statut === filterStatut;
    return matchRecherche && matchStatut;
  });

  const traitementsParSession = (sessionId) => traitements.filter(t => t.sessionCollecteId === Number(sessionId));

  const stats = [
    { label: "Sessions actives", value: sessions.filter(s => s.statutSession === "EN_COURS").length, icon: "📅", color: "bg-blue-50 border-blue-200", onClick: () => setActiveSection("sessions") },
    { label: "Total traitements", value: traitements.length, icon: "📋", color: "bg-green-50 border-green-200", onClick: () => setActiveSection("traitements") },
    { label: "Envoyés au DPO", value: traitements.filter(t => t.statut === "ENVOYE_DPO").length, icon: "📤", color: "bg-purple-50 border-purple-200", onClick: () => { setActiveSection("traitements"); setFilterStatut("ENVOYE_DPO"); } },
    { label: "Demandes en attente", value: demandesEnAttente, icon: "🔔", color: "bg-red-50 border-red-200", onClick: () => setActiveSection("demandes") },
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
            <button key={item.id} onClick={() => { setActiveSection(item.id); if (item.id === "sessions") setNewSessionCount(0); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeSection === item.id ? "bg-white text-green-800 shadow" : "text-green-100 hover:bg-green-700"}`}>
              <span className="text-lg flex-shrink-0">{item.icon}</span>
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
                📅 <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">{newSessionCount > 9 ? "9+" : newSessionCount}</span>
              </button>
            )}
            {demandesEnAttente > 0 && (
              <button onClick={() => setActiveSection("demandes")} className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                🔔 <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">{demandesEnAttente > 9 ? "9+" : demandesEnAttente}</span>
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">

          {/* ════ DASHBOARD ════ */}
          {activeSection === "dashboard" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((s, i) => (
                  <div key={i} onClick={s.onClick} className={`bg-white rounded-2xl border p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow ${s.color}`}>
                    <div className="text-2xl mb-1">{s.icon}</div>
                    <p className="text-2xl font-bold text-gray-800">{s.value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Traitements récents */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-bold text-gray-800">Traitements récents</h2>
                  <button onClick={() => setShowCreer(true)} className="bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-800">
                    + Nouveau traitement
                  </button>
                </div>
                <div className="space-y-3">
                  {traitements.slice(0, 4).map(t => (
                    <div key={t.idTraitement} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-green-50 transition-all cursor-pointer" onClick={() => setDetailTraitement(t)}>
                      <div>
                        <p className="font-semibold text-sm text-gray-800">{t.description}</p>
                        <p className="text-xs text-gray-400">{t.department} · {formatDate(t.dateCreation)}</p>
                      </div>
                      <BadgeStatut statut={t.statut} />
                    </div>
                  ))}
                  {traitements.length === 0 && <p className="text-center text-gray-400 text-sm py-4">Aucun traitement. Créez votre premier traitement !</p>}
                </div>
              </div>

              {/* Demandes récentes */}
              {demandesEnAttente > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-5">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="font-bold text-gray-800">🔔 Demandes usagers en attente</h2>
                    <span className="bg-red-100 text-red-700 text-xs font-semibold px-3 py-1 rounded-full">{demandesEnAttente} en attente</span>
                  </div>
                  <div className="space-y-2">
                    {demandes.filter(d => d.statutDemande === "EN_ATTENTE").slice(0, 3).map(d => (
                      <div key={d.id} className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                        <div>
                          <p className="font-semibold text-sm text-gray-800">{d.usagerNom}</p>
                          <p className="text-xs text-gray-500">{d.typeDemande === "MODIFICATION" ? "✏️ Modification" : "🗑️ Suppression"} · {d.traitementNom}</p>
                        </div>
                        <button onClick={() => { setActiveSection("demandes"); setDetailDemande(d); }}
                          className="text-xs bg-green-700 text-white px-3 py-1.5 rounded-lg hover:bg-green-800">
                          Traiter →
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ════ SESSIONS ════ */}
          {activeSection === "sessions" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Sessions de collecte ({sessions.length})</h2>
                <p className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg">📌 Les sessions sont créées par le DPO</p>
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
                        <th className="px-4 py-3 text-center font-semibold">Traitements liés</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {sessions.map(s => {
                        const nbT = s.nombreTraitements ?? traitementsParSession(s.idSession).length;
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
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s.statutSession === "EN_COURS" ? "bg-blue-100 text-blue-700" : s.statutSession === "TERMINEE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                {s.statutSession === "EN_COURS" ? "En cours" : s.statutSession === "TERMINEE" ? "Terminée" : "Annulée"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{s.dpoNomComplet || "—"}</td>
                            <td className="px-4 py-3 text-center">
                              <button onClick={() => setSelectedSessionDetail(selectedSessionDetail?.idSession === s.idSession ? null : s)}
                                className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200">
                                {nbT} traitement{nbT !== 1 ? "s" : ""} {selectedSessionDetail?.idSession === s.idSession ? "▲" : "▼"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {sessions.length === 0 && (
                        <tr><td colSpan={6} className="py-12 text-center text-gray-400 text-sm">Aucune session de collecte disponible</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              {selectedSessionDetail && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 bg-green-50 flex justify-between items-center">
                    <h3 className="font-bold text-green-800">Traitements liés à : {selectedSessionDetail.description || `#${selectedSessionDetail.idSession}`}</h3>
                    <button onClick={() => setSelectedSessionDetail(null)} className="text-green-600 hover:text-green-800 text-sm">✕ Fermer</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-gray-500">Description</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-500">Département</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-500">Statut</th>
                          <th className="px-4 py-3 text-center font-semibold text-gray-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {traitementsParSession(selectedSessionDetail.idSession).map(t => (
                          <tr key={t.idTraitement} className="hover:bg-green-50">
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

          {/* ════ TRAITEMENTS (CU05 + CU06) ════ */}
          {activeSection === "traitements" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="p-5 border-b border-gray-100 space-y-3">
                <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                  <h2 className="font-bold text-gray-800">Mes Traitements ({traitements.length})</h2>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <input value={recherche} onChange={e => setRecherche(e.target.value)} placeholder="Rechercher..."
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 flex-1 sm:w-48" />
                    <button onClick={() => setShowCreer(true)} className="bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-800 whitespace-nowrap">
                      + Nouveau
                    </button>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { val: "tous", label: "Tous" },
                    { val: "EN_COURS", label: "En cours" },
                    { val: "ENVOYE_DPO", label: "Envoyé DPO" },
                    { val: "VALIDE", label: "Validé" },
                    { val: "REJETE", label: "Rejeté" },
                  ].map(f => (
                    <button key={f.val} onClick={() => setFilterStatut(f.val)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${filterStatut === f.val ? "bg-green-700 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                      {f.label}
                    </button>
                  ))}
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
                          <div className="flex gap-1 flex-wrap">
                            <button onClick={() => setDetailTraitement(t)} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-lg hover:bg-green-200" title="Voir détail">👁 Voir</button>
                            {t.statut !== "ENVOYE_DPO" && t.statut !== "VALIDE" && (
                              <>
                                <button onClick={() => setTraitementModifier(t)} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-200" title="Modifier">✏️</button>
                                <button onClick={() => setTraitementDonnees(t)} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-lg hover:bg-purple-200" title="Ajouter données">➕ Données</button>
                                <button onClick={() => handleEnvoyer(t.idTraitement)} className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-lg hover:bg-indigo-200" title="Envoyer au DPO">📤 DPO</button>
                                <button onClick={() => setConfirmDelete(t.idTraitement)} className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-lg hover:bg-red-200" title="Supprimer">🗑️</button>
                              </>
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

          {/* ════ DEMANDES USAGERS (CU16) ════ */}
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
                        <td className="px-4 py-3 font-medium text-gray-800">{d.usagerNom}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${d.typeDemande === "MODIFICATION" ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"}`}>
                            {d.typeDemande === "MODIFICATION" ? "✏️ Modification" : "🗑️ Suppression"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{d.traitementNom}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(d.dateDemande)}</td>
                        <td className="px-4 py-3">
                          {d.statutDemande === "EN_ATTENTE" && <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-0.5 rounded-full">⏳ En attente</span>}
                          {d.statutDemande === "TRAITE" && <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">✅ Traité</span>}
                          {d.statutDemande === "REJETE" && <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-0.5 rounded-full">❌ Rejeté</span>}
                        </td>
                        <td className="px-4 py-3">
                          {d.statutDemande === "EN_ATTENTE" ? (
                            <button onClick={() => setDetailDemande(d)} className="text-xs bg-green-700 text-white px-3 py-1.5 rounded-lg hover:bg-green-800 font-semibold">
                              Gérer →
                            </button>
                          ) : (
                            <button onClick={() => setDetailDemande(d)} className="text-xs text-gray-400 hover:text-gray-600 underline">
                              Voir détail
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {demandes.length === 0 && <div className="py-12 text-center text-gray-400 text-sm">Aucune demande</div>}
              </div>
            </div>
          )}

          {/* ════ HISTORIQUE ════ */}
          {activeSection === "historique" && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800">Historique des activités</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <h3 className="font-bold text-gray-800 mb-3">📤 Traitements envoyés au DPO</h3>
                  <div className="space-y-2">
                    {traitements.filter(t => t.statut === "ENVOYE_DPO").map(t => (
                      <div key={t.idTraitement} className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                        <div>
                          <p className="font-semibold text-sm text-gray-800">{t.description}</p>
                          <p className="text-xs text-gray-400">{t.department} · {formatDate(t.dateCreation)}</p>
                        </div>
                        <span className="text-xs text-blue-600 font-medium">📤 Envoyé</span>
                      </div>
                    ))}
                    {traitements.filter(t => t.statut === "ENVOYE_DPO").length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-4">Aucun traitement envoyé</p>
                    )}
                  </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <h3 className="font-bold text-gray-800 mb-3">📋 Demandes usagers traitées</h3>
                  <div className="space-y-2">
                    {demandes.filter(d => d.statutDemande === "TRAITE" || d.statutDemande === "REJETE").map(d => (
                      <div key={d.id} className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                        <div>
                          <p className="font-semibold text-sm text-gray-800">{d.usagerNom}</p>
                          <p className="text-xs text-gray-400">{d.typeDemande} · {d.traitementNom}</p>
                          {d.reponse && <p className="text-xs text-green-600 mt-0.5">↳ {d.reponse}</p>}
                          {d.motifRejet && <p className="text-xs text-red-500 mt-0.5">↳ Rejet : {d.motifRejet}</p>}
                        </div>
                        {d.statutDemande === "TRAITE"
                          ? <span className="text-xs text-green-600 font-medium">✅ Traité</span>
                          : <span className="text-xs text-red-500 font-medium">❌ Rejeté</span>}
                      </div>
                    ))}
                    {demandes.filter(d => d.statutDemande !== "EN_ATTENTE").length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-4">Aucune demande traitée</p>
                    )}
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

      {/* ════ MODALS ════ */}
      {showCreer && <ModalCreerTraitement onClose={() => setShowCreer(false)} onSave={handleCreer} sessions={sessions} />}

      {traitementModifier && (
        <ModalModifierTraitement
          traitement={traitementModifier}
          onClose={() => setTraitementModifier(null)}
          onSave={handleModifier}
        />
      )}

      {traitementDonnees && (
        <ModalAjouterDonnees
          traitement={traitementDonnees}
          onClose={() => setTraitementDonnees(null)}
          onSave={(msg) => { setTraitementDonnees(null); showToast(msg); }}
        />
      )}

      {detailTraitement && (
        <ModalDetailTraitement
          traitement={detailTraitement}
          onClose={() => setDetailTraitement(null)}
          onEnvoyer={handleEnvoyer}
        />
      )}

      {detailDemande && (
        <ModalGererDemande
          demande={detailDemande}
          onClose={() => setDetailDemande(null)}
          onTraiter={handleGererDemande}
        />
      )}

      {/* Confirmation suppression */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <h3 className="font-bold text-gray-800 mb-2">Confirmer la suppression</h3>
            <p className="text-sm text-gray-500 mb-5">Cette action est irréversible. Le traitement et ses données associées seront supprimés définitivement.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-600 text-sm hover:bg-gray-50">Annuler</button>
              <button onClick={() => handleSupprimer(confirmDelete)} className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700">🗑️ Supprimer</button>
            </div>
          </div>
        </div>
      )}

      <Toast toast={toast} />
    </div>
  );
}

export default UtilisateurMetierDashboard;