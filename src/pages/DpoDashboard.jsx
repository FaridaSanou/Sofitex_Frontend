import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";
import { toLocalDateTime } from "../utils/date";
import { StatCard } from "../components/ui/StatCard";
import DpoSessionsSection from "../components/dpo/DpoSessionsSection";
import DpoTraitementsSection from "../components/dpo/DpoTraitementsSection";
import DpoDeclarationsSection from "../components/dpo/DpoDeclarationsSection";
import DpoDemandesSection from "../components/dpo/DpoDemandesSection";
import ModalDetailTraitement from "../components/dpo/ModalDetailTraitement";
import ModalDetailDeclaration from "../components/dpo/ModalDetailDeclaration";
import ModalCreerDeclaration from "../components/dpo/ModalCreerDeclaration";

// Traduit une DemandeResponse (backend) vers le format attendu par l'UI.
// AUCUNE DONNEE MOCKEE ICI : tout vient de GET /api/demandes (vision globale DPO).
const mapDemande = (d) => ({
  id: d.idDemande,
  idDemande: d.idDemande,
  usagerNom: d.usagerNomComplet || "—",
  type: d.typeDemande,
  typeDemande: d.typeDemande,
  descriptionDemande: d.descriptionDemande,
  detail: d.descriptionDemande,
  dateDemande: d.dateDemande,
  date: d.dateDemande,
  statut: d.statutDemande,
  statutDemande: d.statutDemande,
  utilisateurMetierNom: d.utilisateurMetierNomComplet || "—",
  utilisateurMetierNomComplet: d.utilisateurMetierNomComplet,
  donneeValeur: d.donneeValeur,
  motifRejet: d.motifRejet,
  reponse: d.reponse,
  dateTraitement: d.dateTraitement,
});

export default function DpoDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sessions, setSessions] = useState([]);
  const [allTraitements, setAllTraitements] = useState([]);
  const [traitements, setTraitements] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nomSession: "", dateDebut: "", dateFin: "", typeCollecte: "EN_LIGNE", lieu: "", description: "" });
  const [toast, setToast] = useState(null);
  const [declarations, setDeclarations] = useState([]);
  const [demandes, setDemandes] = useState([]);
  const [showCreerDeclaration, setShowCreerDeclaration] = useState(false);
  const [detailTraitement, setDetailTraitement] = useState(null);
  const [detailDeclaration, setDetailDeclaration] = useState(null);
  const [declarationPreFill, setDeclarationPreFill] = useState(null);
  const [traitementFilterMode, setTraitementFilterMode] = useState("tous");

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchDeclarations = (dpoId) => {
    if (dpoId) {
      api.get(`/declarations/mes-declarations?dpoId=${dpoId}`)
        .then(res => { if (res.data) setDeclarations(res.data); })
        .catch(() => setDeclarations([]));
    }
  };

  // --- Demandes : vision globale DPO, source unique de vérité = l'API ---
  const fetchDemandes = useCallback(() => {
    api.get("/demandes")
      .then(res => setDemandes(res.data.map(mapDemande)))
      .catch(err => console.error("Erreur chargement demandes:", err));
  }, []);

  useEffect(() => { fetchDemandes(); }, [fetchDemandes]);

  useEffect(() => {
    const interval = setInterval(fetchDemandes, 30000);
    return () => clearInterval(interval);
  }, [fetchDemandes]);

  useEffect(() => {
    api.get("/sessions").then((res) => setSessions(res.data)).catch(() => {});
    const storedId = localStorage.getItem("dpoId");
    if (storedId) fetchDeclarations(storedId);
  }, []);

  useEffect(() => {
    const storedId = localStorage.getItem("dpoId");
    if (storedId) {
      api.get(`/traitements/dpo/${storedId}`)
        .then(res => { if (res.data) setAllTraitements(res.data); })
        .catch(() => {});
    } else {
      const email = localStorage.getItem("email");
      if (email) {
        api.get("/verification/fonction", { params: { email } })
          .then(res => {
            const id = res.data.dpoId;
            if (id) {
              localStorage.setItem("dpoId", String(id));
              fetchDeclarations(id);
              return api.get(`/traitements/dpo/${id}`);
            }
            return api.get("/traitements");
          })
          .then(res => { if (res?.data) setAllTraitements(res.data); })
          .catch(() => {
            api.get("/traitements")
              .then(res => { if (res.data) setAllTraitements(res.data); })
              .catch(() => {});
          });
      } else {
        api.get("/traitements").then((res) => { if (res.data) setAllTraitements(res.data); }).catch(() => {});
      }
    }
  }, []);

  useEffect(() => {
    if (selectedSessionId) {
      setTraitements(allTraitements.filter(t => t.sessionCollecteId === Number(selectedSessionId)));
    } else {
      setTraitements([]);
    }
  }, [selectedSessionId, allTraitements]);

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
      .catch(() => {
        setSessions((prev) => prev.map((s) => s.idSession === id ? { ...s, statutSession: valeur } : s));
        showToast("Statut mis à jour (hors ligne)");
      });
  };

  const INTEGER_FIELDS = ["nombrePersonnesConcernees", "nombrePersonnesTransfert", "nombreTotalCameras"];

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
    const payload = { ...sanitized, dateSoumission, traitementId: parseInt(traitementId), responsableDeclaration: formData.nomPrenomResponsable || "" };

    const endpointMap = {
      NORMALE: "/declarations/normale",
      AUTORISATION: "/declarations/autorisation",
      COLLECTE_SITE_INTERNET: "/declarations/collecte-site",
      SYSTEME_VIDEO_SURVEILLANCE: "/declarations/video-surveillance",
    };

    const endpoint = endpointMap[typeDeclaration];
    if (endpoint) {
      api.post(endpoint, payload)
        .then((res) => { setDeclarations((prev) => [res.data, ...prev]); showToast("✅ Déclaration soumise avec succès !"); })
        .catch(err => showToast(`Erreur lors de la création : ${err.response?.data?.message || "réessayez."}`, "error"));
    }
  };

  const handleSoumettreAuDG = async (declaration) => {
    try {
      await api.put(`/declarations/${declaration.idDeclaration}/soumettre`);
      setDeclarations((prev) => prev.map((d) => d.idDeclaration === declaration.idDeclaration ? { ...d, statut: "EN_ATTENTE" } : d));
      showToast("Déclaration #" + declaration.idDeclaration + " envoyée au DG avec succès");
    } catch {
      showToast("Erreur lors de l'envoi au DG", "error");
    }
  };

  const demandesEnAttente = demandes.filter(d => d.statut === "EN_COURS").length;

  const stats = {
    sessionsTotal: sessions.length,
    enCours: sessions.filter((s) => s.statutSession === "EN_COURS").length,
    terminees: sessions.filter((s) => s.statutSession === "TERMINEE").length,
    traitementsTotal: allTraitements.length,
    demandesEnAttente,
  };

  const traitementsToShow = traitementFilterMode === "tous" ? allTraitements : traitements;

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab} notificationsCount={demandesEnAttente} onBellClick={() => setActiveTab("demandes")}>

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
        <DpoSessionsSection
          sessions={sessions} showForm={showForm} setShowForm={setShowForm}
          form={form} setForm={setForm}
          handleCreateSession={handleCreateSession}
          handleChangeStatut={handleChangeStatut}
        />
      )}

      {activeTab === "traitements" && (
        <DpoTraitementsSection
          traitementsToShow={traitementsToShow}
          traitementFilterMode={traitementFilterMode} setTraitementFilterMode={setTraitementFilterMode}
          selectedSessionId={selectedSessionId} setSelectedSessionId={setSelectedSessionId}
          sessions={sessions}
          onDetail={setDetailTraitement}
          onCreateDeclaration={(t) => { setDeclarationPreFill(t); setActiveTab("declarations"); setShowCreerDeclaration(true); }}
        />
      )}

      {activeTab === "declarations" && (
        <DpoDeclarationsSection
          declarations={declarations}
          onNew={() => setShowCreerDeclaration(true)}
          onDetail={setDetailDeclaration}
          onSoumettre={handleSoumettreAuDG}
        />
      )}

      {activeTab === "demandes" && (
        <DpoDemandesSection demandes={demandes} demandesEnAttente={stats.demandesEnAttente} />
      )}

      {detailTraitement && <ModalDetailTraitement traitement={detailTraitement} onClose={() => setDetailTraitement(null)} />}
      {detailDeclaration && <ModalDetailDeclaration declaration={detailDeclaration} onClose={() => setDetailDeclaration(null)} />}
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