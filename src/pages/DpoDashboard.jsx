import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";

// ═══════════════════════════════════════════════════════════════════
// DONNÉES MOCK (déclarations et demandes — pas encore connectées)
// ═══════════════════════════════════════════════════════════════════
const mockDeclarations = [
  { idDeclaration: 1, typeDeclaration: "NORMALE", denominationTraitement: "Gestion des salaires", dateSoumission: "2026-05-25", statut: "APPROUVEE" },
  { idDeclaration: 2, typeDeclaration: "AUTORISATION", denominationTraitement: "Gestion des accès réseau", dateSoumission: "2026-06-01", statut: "EN_ATTENTE" },
];

const mockDemandes = [
  { id: 1, usagerNom: "Traoré Fatima", typeDemande: "MODIFICATION", descriptionDemande: "Correction de l'adresse mail.", dateDemande: "2026-05-20T10:00:00", statutDemande: "EN_ATTENTE", utilisateurMetierNom: "Ouedraogo Amadou" },
  { id: 2, usagerNom: "Kaboré Issouf", typeDemande: "SUPPRESSION", descriptionDemande: "Suppression suite à fin de contrat.", dateDemande: "2026-05-21T08:30:00", statutDemande: "EN_ATTENTE", utilisateurMetierNom: "Ouedraogo Amadou" },
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
// BADGES
// ═══════════════════════════════════════════════════════════════════
const statutBadge = (s) => {
  const map = { EN_COURS: "bg-blue-100 text-blue-800", TERMINEE: "bg-green-100 text-green-800", ANNULEE: "bg-red-100 text-red-800" };
  const labels = { EN_COURS: "En cours", TERMINEE: "Terminée", ANNULEE: "Annulée" };
  return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${map[s] || "bg-gray-100"}`}>{labels[s] || s}</span>;
};
const declarationStatutBadge = (s) => {
  const map = { EN_ATTENTE: "bg-yellow-100 text-yellow-800", APPROUVEE: "bg-green-100 text-green-800", REJETEE: "bg-red-100 text-red-800" };
  const labels = { EN_ATTENTE: "En attente", APPROUVEE: "Approuvée", REJETEE: "Rejetée" };
  return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${map[s] || "bg-gray-100"}`}>{labels[s] || s}</span>;
};
const demandeStatutBadge = (s) => {
  if (s === "EN_ATTENTE") return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">En attente</span>;
  if (s === "TRAITE") return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">Traitée</span>;
  return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">{s}</span>;
};

// ═══════════════════════════════════════════════════════════════════
// STAT CARD
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

// ═══════════════════════════════════════════════════════════════════
// MODAL : CRÉER TRAITEMENT
// Champs alignés avec TraitementRequest.java
// ═══════════════════════════════════════════════════════════════════
function ModalCreerTraitement({ sessions, onClose, onSave }) {
  const [form, setForm] = useState({
    department: "",
    description: "",
    texte: "",
    certificationSecurite: "",
    dureeConservation: "",
    dateFin: "",
    utilisateurMetierId: "",
    sessionCollecteId: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.sessionCollecteId) { setError("Veuillez sélectionner une session."); return; }
    setLoading(true);
    setError("");
    try {
      const payload = {
        department: form.department,
        description: form.description,
        texte: form.texte,
        certificationSecurite: form.certificationSecurite,
        dureeConservation: form.dureeConservation ? parseInt(form.dureeConservation) : null,
        dateFin: form.dateFin ? toLocalDateTime(form.dateFin) : null,
        utilisateurMetierId: form.utilisateurMetierId ? parseInt(form.utilisateurMetierId) : null,
        sessionCollecteId: parseInt(form.sessionCollecteId),
      };
      const res = await api.post("/traitements", payload);
      onSave(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la création du traitement.");
    } finally {
      setLoading(false);
    }
  };

  const inp = "w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-green-500";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="bg-green-800 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center sticky top-0">
          <div>
            <h3 className="font-bold text-lg">Nouveau Traitement</h3>
            <p className="text-green-200 text-xs">Rattaché à une session de collecte</p>
          </div>
          <button onClick={onClose} className="text-green-200 hover:text-white text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">⚠️ {error}</div>
          )}

          {/* Session (obligatoire) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Session de collecte <span className="text-red-500">*</span>
            </label>
            <select value={form.sessionCollecteId}
              onChange={e => setForm(p => ({ ...p, sessionCollecteId: e.target.value }))}
              className={inp} required>
              <option value="">-- Sélectionner une session --</option>
              {sessions.map(s => (
                <option key={s.idSession} value={s.idSession}>
                  {s.description || `Session #${s.idSession}`} — {s.typeCollecte}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Département */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Département</label>
              <input value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))}
                placeholder="Ex : DRH" className={inp} />
            </div>

            {/* Certification sécurité */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Certification sécurité</label>
              <input value={form.certificationSecurite}
                onChange={e => setForm(p => ({ ...p, certificationSecurite: e.target.value }))}
                placeholder="Ex : ISO 27001" className={inp} />
            </div>

            {/* Durée de conservation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Durée conservation (mois)</label>
              <input type="number" min="1" value={form.dureeConservation}
                onChange={e => setForm(p => ({ ...p, dureeConservation: e.target.value }))}
                placeholder="Ex : 36" className={inp} />
            </div>

            {/* Date de fin */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
              <input type="datetime-local" value={form.dateFin}
                onChange={e => setForm(p => ({ ...p, dateFin: e.target.value }))} className={inp} />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <input value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Ex : Gestion des salaires" className={inp} required />
          </div>

          {/* Texte juridique */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Texte juridique / Finalité</label>
            <textarea value={form.texte} rows={3}
              onChange={e => setForm(p => ({ ...p, texte: e.target.value }))}
              placeholder="Base juridique du traitement..."
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-green-500" />
          </div>

          {/* Boutons */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-600 text-sm hover:bg-gray-50 transition">
              Annuler
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-green-700 text-white text-sm font-semibold hover:bg-green-800 transition disabled:opacity-50">
              {loading ? "Création..." : "Créer le traitement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MODAL : DÉTAIL TRAITEMENT
// ═══════════════════════════════════════════════════════════════════
function ModalDetailTraitement({ traitement, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="bg-green-800 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center">
          <h3 className="font-bold text-lg">Détail du traitement #{traitement.idTraitement}</h3>
          <button onClick={onClose} className="text-green-200 hover:text-white text-xl">✕</button>
        </div>
        <div className="p-6 space-y-3">
          {[
            ["Description", traitement.description],
            ["Département", traitement.department],
            ["Texte juridique", traitement.texte],
            ["Certification sécurité", traitement.certificationSecurite],
            ["Durée conservation", traitement.dureeConservation ? `${traitement.dureeConservation} mois` : "—"],
            ["Date création", formatDate(traitement.dateCreation)],
            ["Date fin", formatDate(traitement.dateFin)],
            ["Responsable", traitement.utilisateurMetierNom],
            ["Session", traitement.sessionCollecteId ? `#${traitement.sessionCollecteId}` : "—"],
            ["Nombre de données", traitement.nombreDonnee ?? "0"],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">{label}</span>
              <span className="text-sm font-medium text-gray-800">{value ?? "—"}</span>
            </div>
          ))}
        </div>
        <div className="px-6 pb-6">
          <button onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-green-700 text-white text-sm font-semibold hover:bg-green-800 transition">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TYPES DE DÉCLARATION
// ═══════════════════════════════════════════════════════════════════
const TYPES_DECLARATION = [
  { id: "NORMALE", label: "Déclaration Normale", desc: "Traitement standard de données" },
  { id: "AUTORISATION", label: "Demande d'Autorisation", desc: "Traitement nécessitant une autorisation" },
  { id: "COLLECTE_SITE_INTERNET", label: "Collecte via Site Internet", desc: "Données collectées via formulaire web" },
  { id: "SYSTEME_VIDEO_SURVEILLANCE", label: "Système de Vidéosurveillance", desc: "Surveillance par caméras" },
];

// ═══════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════════
function DpoDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sessions, setSessions] = useState([]);
  const [traitements, setTraitements] = useState([]);   // tous les traitements chargés
  const [loadingTraitements, setLoadingTraitements] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [filterMode, setFilterMode] = useState("tous"); // "tous" | "parSession"
  const [declarations, setDeclarations] = useState(mockDeclarations);
  const [demandes, setDemandes] = useState(mockDemandes);
  const [showForm, setShowForm] = useState(false);

  const [showCreerDeclaration, setShowCreerDeclaration] = useState(false);
  const [detailTraitement, setDetailTraitement] = useState(null);
  const [toast, setToast] = useState(null);
  const [sessionForm, setSessionForm] = useState({
    dateDebut: "", dateFin: "", typeCollecte: "EN_LIGNE", lieu: "", description: "",
  });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Charger toutes les sessions ──────────────────────────────────
  const fetchSessions = useCallback(async () => {
    setLoadingSessions(true);
    try {
      const res = await api.get("/sessions");
      setSessions(res.data);
    } catch {
      showToast("Impossible de charger les sessions", "error");
    } finally {
      setLoadingSessions(false);
    }
  }, []);

  // ── Charger les traitements d'une session ────────────────────────
  const fetchTraitementsParSession = useCallback(async (sessionId) => {
    setLoadingTraitements(true);
    try {
      const res = await api.get(`/traitements/session/${sessionId}`);
      return res.data;
    } catch {
      showToast("Impossible de charger les traitements", "error");
      return [];
    } finally {
      setLoadingTraitements(false);
    }
  }, []);

  // ── Charger tous les traitements (toutes sessions) ───────────────
  const fetchTousTraitements = useCallback(async (sessionsList) => {
    if (!sessionsList.length) { setTraitements([]); return; }
    setLoadingTraitements(true);
    try {
      const results = await Promise.all(
        sessionsList.map(s => api.get(`/traitements/session/${s.idSession}`).then(r => r.data).catch(() => []))
      );
      setTraitements(results.flat());
    } catch {
      showToast("Impossible de charger les traitements", "error");
    } finally {
      setLoadingTraitements(false);
    }
  }, []);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  // Quand les sessions sont chargées, charger tous les traitements
  useEffect(() => {
    if (sessions.length > 0) fetchTousTraitements(sessions);
  }, [sessions, fetchTousTraitements]);

  // Quand une session est sélectionnée en mode "parSession"
  useEffect(() => {
    if (filterMode === "parSession" && selectedSessionId) {
      fetchTraitementsParSession(selectedSessionId).then(data => setTraitements(data));
    } else if (filterMode === "tous" && sessions.length > 0) {
      fetchTousTraitements(sessions);
    }
  }, [filterMode, selectedSessionId]);

  // ── Créer une session ────────────────────────────────────────────
  const handleCreateSession = (e) => {
    e.preventDefault();
    const payload = {
      dateDebut: toLocalDateTime(sessionForm.dateDebut),
      dateFin: toLocalDateTime(sessionForm.dateFin),
      typeCollecte: sessionForm.typeCollecte,
      lieu: sessionForm.lieu,
      description: sessionForm.description,
    };
    api.post("/sessions", payload)
      .then(res => {
        setSessions(prev => [...prev, res.data]);
        setShowForm(false);
        setSessionForm({ dateDebut: "", dateFin: "", typeCollecte: "EN_LIGNE", lieu: "", description: "" });
        showToast("Session créée avec succès");
      })
      .catch(() => showToast("Erreur lors de la création de la session", "error"));
  };

  // ── Changer statut session ───────────────────────────────────────
  const handleChangeStatut = (id, valeur) => {
    api.patch(`/sessions/${id}/statut`, null, { params: { valeur } })
      .then(() => {
        setSessions(prev => prev.map(s => s.idSession === id ? { ...s, statutSession: valeur } : s));
        showToast("Statut mis à jour");
      })
      .catch(() => showToast("Erreur lors du changement de statut", "error"));
  };

  // ── Nouveau traitement créé ──────────────────────────────────────
  const handleTraitementCreated = (newTraitement) => {
    setTraitements(prev => [newTraitement, ...prev]);
    showToast("Traitement créé avec succès ✓");
  };

  // ── Stats ────────────────────────────────────────────────────────
  const stats = {
    sessionsTotal: sessions.length,
    enCours: sessions.filter(s => s.statutSession === "EN_COURS").length,
    terminees: sessions.filter(s => s.statutSession === "TERMINEE").length,
    traitementsTotal: traitements.length,
    demandesEnAttente: demandes.filter(d => d.statutDemande === "EN_ATTENTE").length,
  };

  // Traitements affichés selon le filtre
  const traitementsAffiches = filterMode === "parSession" && selectedSessionId
    ? traitements.filter(t => t.sessionCollecteId === parseInt(selectedSessionId))
    : traitements;

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}
      notificationsCount={stats.demandesEnAttente} onBellClick={() => setActiveTab("demandes")}>

      {/* ── DASHBOARD ── */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-800">Vue d'ensemble</h2>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard label="Sessions" value={stats.sessionsTotal} color="bg-green-700" />
            <StatCard label="En cours" value={stats.enCours} color="bg-blue-500" />
            <StatCard label="Terminées" value={stats.terminees} color="bg-emerald-500" />
            <StatCard label="Traitements" value={stats.traitementsTotal} color="bg-purple-500" />
            <StatCard label="Demandes en attente" value={stats.demandesEnAttente} color="bg-orange-500" />
          </div>
        </div>
      )}

      {/* ── SESSIONS ── */}
      {activeTab === "sessions" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Sessions de collecte</h2>
            <button onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-green-700 text-white rounded-xl text-sm font-medium hover:bg-green-800 transition">
              + Nouvelle session
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleCreateSession}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
              <h3 className="font-bold text-gray-800">Créer une session</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date début</label>
                  <input type="datetime-local" value={sessionForm.dateDebut}
                    onChange={e => setSessionForm(p => ({ ...p, dateDebut: e.target.value }))}
                    required className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
                  <input type="datetime-local" value={sessionForm.dateFin}
                    onChange={e => setSessionForm(p => ({ ...p, dateFin: e.target.value }))}
                    required className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select value={sessionForm.typeCollecte}
                    onChange={e => setSessionForm(p => ({ ...p, typeCollecte: e.target.value }))}
                    className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm">
                    <option value="EN_LIGNE">En ligne</option>
                    <option value="TERRAIN">Terrain</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lieu</label>
                  <input value={sessionForm.lieu}
                    onChange={e => setSessionForm(p => ({ ...p, lieu: e.target.value }))}
                    className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={sessionForm.description} rows={2}
                  onChange={e => setSessionForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm" />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="px-6 py-2 bg-green-700 text-white rounded-xl text-sm font-medium hover:bg-green-800">Créer</button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-600 rounded-xl text-sm hover:bg-gray-50">Annuler</button>
              </div>
            </form>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {["Session", "Type", "Dates", "Traitements", "Statut", "DPO", "Actions"].map((h, i) => (
                      <th key={h} className={`px-5 py-3 text-xs font-semibold text-gray-500 uppercase ${i === 3 ? "text-center" : "text-left"}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {sessions.map(s => (
                    <tr key={s.idSession} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-800">{s.description || `Session #${s.idSession}`}</p>
                        <p className="text-xs text-gray-400">{s.lieu || "—"}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                          {s.typeCollecte === "EN_LIGNE" ? "En ligne" : "Terrain"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-500">
                        <p>Du {formatDate(s.dateDebut)}</p>
                        <p>Au {formatDate(s.dateFin)}</p>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {s.nombreTraitements ?? 0}
                        </span>
                      </td>
                      <td className="px-5 py-4">{statutBadge(s.statutSession)}</td>
                      <td className="px-5 py-4 text-sm text-gray-600">{s.dpoNomComplet || "—"}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {s.statutSession === "EN_COURS" && (
                            <>
                              <button onClick={() => handleChangeStatut(s.idSession, "TERMINEE")}
                                className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200">
                                Terminer
                              </button>
                              <button onClick={() => handleChangeStatut(s.idSession, "ANNULEE")}
                                className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-xs font-medium hover:bg-red-200">
                                Annuler
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!loadingSessions && sessions.length === 0 && (
                <div className="py-12 text-center text-gray-400 text-sm">Aucune session</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          ── TRAITEMENTS (connecté au backend) ──
      ══════════════════════════════════════════════════════════ */}
      {activeTab === "traitements" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Traitements</h2>
            <span className="text-xs text-gray-400 italic">Créés par les Utilisateurs Métier</span>
          </div>

          {/* Filtres */}
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex gap-2">
              <button onClick={() => { setFilterMode("tous"); setSelectedSessionId(""); }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${filterMode === "tous" ? "bg-green-700 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-green-400"}`}>
                Tous ({traitements.length})
              </button>
              <button onClick={() => setFilterMode("parSession")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${filterMode === "parSession" ? "bg-green-700 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-green-400"}`}>
                Par session
              </button>
            </div>
            {filterMode === "parSession" && (
              <select value={selectedSessionId}
                onChange={e => setSelectedSessionId(e.target.value)}
                className="h-10 px-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-green-500">
                <option value="">-- Toutes les sessions --</option>
                {sessions.map(s => (
                  <option key={s.idSession} value={s.idSession}>
                    {s.description || `Session #${s.idSession}`}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Tableau */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {loadingTraitements ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-green-200 border-t-green-700 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {["Description", "Département", "Session", "Données", "Date création", "Actions"].map((h, i) => (
                        <th key={h} className={`px-5 py-3 text-xs font-semibold text-gray-500 uppercase ${i === 2 || i === 3 ? "text-center" : "text-left"}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {traitementsAffiches.map(t => (
                      <tr key={t.idTraitement} className="hover:bg-gray-50 transition">
                        <td className="px-5 py-4">
                          <p className="font-semibold text-gray-800">{t.description || `#${t.idTraitement}`}</p>
                          <p className="text-xs text-gray-400 mt-0.5 max-w-xs truncate">{t.texte || "—"}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                            {t.department || "—"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center text-xs text-gray-500">
                          {t.sessionCollecteId ? `#${t.sessionCollecteId}` : "—"}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            {t.nombreDonnee ?? 0}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs text-gray-500">{formatDateShort(t.dateCreation)}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button onClick={() => setDetailTraitement(t)}
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-200">
                              Voir
                            </button>
                            <button onClick={() => { setShowCreerDeclaration(true); setActiveTab("declarations"); }}
                              className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium hover:bg-purple-200">
                              Déclaration
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {traitementsAffiches.length === 0 && (
                  <div className="py-12 text-center text-gray-400 text-sm">
                    {filterMode === "parSession" && !selectedSessionId
                      ? "Sélectionnez une session pour voir ses traitements"
                      : "Aucun traitement trouvé"}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── DÉCLARATIONS ── */}
      {activeTab === "declarations" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Déclarations</h2>
            <button onClick={() => setShowCreerDeclaration(true)}
              className="px-4 py-2 bg-green-700 text-white rounded-xl text-sm font-medium hover:bg-green-800 transition">
              + Nouvelle déclaration
            </button>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {["ID", "Type", "Dénomination", "Date", "Statut"].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {declarations.map(d => (
                    <tr key={d.idDeclaration} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-4 font-mono text-xs text-gray-400">#{d.idDeclaration}</td>
                      <td className="px-5 py-4"><span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">{d.typeDeclaration}</span></td>
                      <td className="px-5 py-4 font-medium text-gray-800">{d.denominationTraitement}</td>
                      <td className="px-5 py-4 text-xs text-gray-500">{formatDateShort(d.dateSoumission)}</td>
                      <td className="px-5 py-4">{declarationStatutBadge(d.statut)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── DEMANDES ── */}
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
                    {["Usager", "Type", "Description", "Date", "Statut", "Traité par"].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {demandes.map(d => (
                    <tr key={d.id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-4 font-medium text-gray-800">{d.usagerNom}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${d.typeDemande === "MODIFICATION" ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"}`}>
                          {d.typeDemande}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-600 text-sm max-w-xs truncate">{d.descriptionDemande}</td>
                      <td className="px-5 py-4 text-xs text-gray-500">{formatDateShort(d.dateDemande)}</td>
                      <td className="px-5 py-4">{demandeStatutBadge(d.statutDemande)}</td>
                      <td className="px-5 py-4 text-sm text-gray-600">{d.utilisateurMetierNom}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── MODALS ── */}


      {detailTraitement && (
        <ModalDetailTraitement
          traitement={detailTraitement}
          onClose={() => setDetailTraitement(null)}
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
