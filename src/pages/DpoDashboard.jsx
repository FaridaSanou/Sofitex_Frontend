import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";
import { toLocalDateTime, formatDate } from "../utils/date";
import { StatCard } from "../components/ui/StatCard";
import DpoSessionsSection from "../components/dpo/DpoSessionsSection";
import DpoTraitementsSection from "../components/dpo/DpoTraitementsSection";
import DpoDeclarationsSection from "../components/dpo/DpoDeclarationsSection";
import DpoDemandesSection from "../components/dpo/DpoDemandesSection";
import ModalDetailTraitement from "../components/dpo/ModalDetailTraitement";
import ModalDetailDeclaration from "../components/dpo/ModalDetailDeclaration";
import ModalCreerDeclaration from "../components/dpo/ModalCreerDeclaration";
import { CalendarDays, FolderKanban, FileText, HelpCircle } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

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
  const fetchDeclarations = useCallback((dpoId) => {
    if (dpoId) {
      api.get(`/declarations/mes-declarations?dpoId=${dpoId}`)
        .then(res => { if (res.data) setDeclarations(res.data); })
        .catch(() => setDeclarations([]));
    }
  }, []);

  useEffect(() => {
    const storedId = localStorage.getItem("dpoId");
    if (!storedId) return;
    const interval = setInterval(() => fetchDeclarations(storedId), 30000);
    return () => clearInterval(interval);
  }, [fetchDeclarations]);

  useEffect(() => {
    api.get("/sessions").then((res) => setSessions(res.data)).catch(() => {});
    const storedId = localStorage.getItem("dpoId");
    if (storedId) fetchDeclarations(storedId);
  }, [fetchDeclarations]);

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
  }, [fetchDeclarations]);

  useEffect(() => {
    const storedId = localStorage.getItem("dpoId");
    if (!storedId) return;
    const interval = setInterval(() => {
      api.get(`/traitements/dpo/${storedId}`)
        .then(res => { if (res.data) setAllTraitements(res.data); })
        .catch(() => {});
    }, 10000);
    return () => clearInterval(interval);
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
    const { declarationId, traitementId, typeDeclaration, originalTypeDeclaration, ...formData } = data;
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
      COLLECTE_SITE: "/declarations/collecte-site",
      VIDEO_SURVEILLANCE: "/declarations/video-surveillance",
    };
    const updateSuffixes = {
      NORMALE: "/normale",
      AUTORISATION: "/autorisation",
      COLLECTE_SITE: "/collecte-site",
      VIDEO_SURVEILLANCE: "/video-surveillance",
    };

    const refreshAfterSave = () => {
      const storedId = localStorage.getItem("dpoId");
      if (storedId) {
        fetchDeclarations(storedId);
        api.get(`/traitements/dpo/${storedId}`).then(r => { if (r.data) setAllTraitements(r.data); }).catch(() => {});
      }
    };

    const addLocal = (editingId) => {
      if (editingId) {
        setDeclarations((prev) => {
          const exists = prev.some(d => d.idDeclaration === editingId);
          return exists
            ? prev.map(d => d.idDeclaration === editingId ? { ...d, ...payload, statut: "EN_ATTENTE", denominationTraitement: payload.denominationTraitement || d.denominationTraitement } : d)
            : [{ idDeclaration: editingId, typeDeclaration, ...payload, statut: "EN_ATTENTE", denominationTraitement: payload.denominationTraitement, origineDeclaration: "MANUELLE", dateSoumission }, ...prev];
        });
        refreshAfterSave();
        showToast("Déclaration mise à jour (hors ligne)");
      } else {
        setDeclarations((prev) => [...prev, {
          idDeclaration: Date.now(), typeDeclaration, traitementId: parseInt(traitementId),
          traitementDescription: formData.denominationTraitement || "Nouvelle déclaration",
          denominationTraitement: formData.denominationTraitement, dateSoumission, statut: "EN_ATTENTE",
          secteur: formData.secteur, responsableDeclaration: formData.nomPrenomResponsable,
          dureeConservation: formData.dureeConservation, lieuStockage: formData.lieuStockage,
          origineDeclaration: "MANUELLE",
        }]);
        showToast("Déclaration créée (hors ligne)");
      }
    };

    if (declarationId && typeDeclaration && originalTypeDeclaration && typeDeclaration !== originalTypeDeclaration) {
      api.delete(`/declarations/${declarationId}`)
        .then(() => {
          const endpoint = endpointMap[typeDeclaration];
          return api.post(endpoint, payload);
        })
        .then((res) => {
          setDeclarations((prev) => [res.data, ...prev.filter(d => d.idDeclaration !== declarationId)]);
          refreshAfterSave();
          showToast("Déclaration recréée avec le type " + typeDeclaration + " !");
        })
        .catch((err) => { console.error("DELETE+POST error:", err.response?.status, err.response?.data); addLocal(null); });
    } else if (declarationId) {
      const suffix = updateSuffixes[typeDeclaration] || "";
      api.put(`/declarations/${declarationId}${suffix}`, payload)
        .then((res) => {
          setDeclarations((prev) => {
            const exists = prev.some(d => d.idDeclaration === declarationId);
            return exists ? prev.map(d => d.idDeclaration === declarationId ? res.data : d) : [res.data, ...prev];
          });
          refreshAfterSave();
          showToast("✅ Déclaration mise à jour !");
        })
        .catch((err) => { console.error("PUT declaration error:", err.response?.status, err.response?.data, "URL:", `/declarations/${declarationId}${suffix}`); addLocal(declarationId); });
    } else {
      const endpoint = endpointMap[typeDeclaration];
      if (endpoint) {
        api.post(endpoint, payload)
          .then((res) => { setDeclarations((prev) => [res.data, ...prev]); showToast("✅ Déclaration créée !"); refreshAfterSave(); })
          .catch(() => addLocal(null));
      } else {
        addLocal(null);
      }
    }
  };

  const handleSoumettreAuDG = async (declaration) => {
    try {
      await api.put(`/declarations/${declaration.idDeclaration}/soumettre`);
      setDeclarations((prev) => prev.map((d) => d.idDeclaration === declaration.idDeclaration ? { ...d, statut: "EN_ATTENTE" } : d));
      showToast("Déclaration #" + declaration.idDeclaration + " envoyée au DG avec succès");
      const storedId = localStorage.getItem("dpoId");
      if (storedId) fetchDeclarations(storedId);
    } catch {
      showToast("Erreur lors de l'envoi au DG", "error");
    }
  };

  const demandesEnAttente = demandes.filter(d => d.statut === "EN_COURS").length;
  const [declarationToEdit, setDeclarationToEdit] = useState(null);

  const handleModifierDeclaration = (declaration) => {
    setDeclarationToEdit(declaration);
    setShowCreerDeclaration(true);
  };

  const handleSupprimerDeclaration = async (declarationId) => {
    try {
      await api.delete(`/declarations/${declarationId}`);
      setDeclarations((prev) => prev.filter((d) => d.idDeclaration !== declarationId));
      showToast("Déclaration supprimée");
    } catch {
      showToast("Erreur lors de la suppression", "error");
    }
  };

  const declarationsVisible = declarations.filter(d => d.statut !== "BROUILLON");

  const allDeclarationIds = new Set(declarations.map(d => d.idDeclaration));
  const traitementsToShow = (traitementFilterMode === "tous" ? allTraitements : traitements)
    .filter(t => !t.declarationId || !allDeclarationIds.has(t.declarationId));

  const stats = {
    sessionsTotal: sessions.length,
    enCours: sessions.filter((s) => s.statutSession === "EN_COURS").length,
    terminees: sessions.filter((s) => s.statutSession === "TERMINEE").length,
    traitementsTotal: traitementsToShow.length,
    demandesEnAttente,
    declarationsTotal: declarationsVisible.length,
  };

  const dpoId = localStorage.getItem("dpoId");

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab} notificationsCount={demandesEnAttente} utilisateurId={dpoId} onBellClick={() => setActiveTab("demandes")}>

      {activeTab === "dashboard" && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-800">Vue d'ensemble</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Sessions" value={stats.sessionsTotal} icon={CalendarDays} color="bg-green-700" />
            <StatCard label="Traitements" value={stats.traitementsTotal} icon={FolderKanban} color="bg-purple-500" />
            <StatCard label="Déclarations" value={stats.declarationsTotal} icon={FileText} color="bg-blue-600" />
            <StatCard label="Demandes en attente" value={stats.demandesEnAttente} icon={HelpCircle} color="bg-orange-500" />
          </div>

          <h3 className="text-lg font-semibold text-gray-700">Reporting</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-sm font-semibold text-gray-600 mb-3">Sessions</p>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={[
                    { name: "En cours", value: stats.enCours, color: "#22c55e" },
                    { name: "Terminées", value: stats.terminees, color: "#10b981" },
                    { name: "Autres", value: stats.sessionsTotal - stats.enCours - stats.terminees, color: "#d1d5db" },
                  ]} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                    {[{ name: "En cours", color: "#22c55e" }, { name: "Terminées", color: "#10b981" }, { name: "Autres", color: "#d1d5db" }].map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-sm font-semibold text-gray-600 mb-3">Déclarations par mois</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={(() => {
                  const counts = {};
                  declarationsVisible.forEach(d => {
                    if (d.dateSoumission) {
                      const m = d.dateSoumission.slice(0, 7);
                      counts[m] = (counts[m] || 0) + 1;
                    }
                  });
                  return Object.entries(counts).sort().slice(-6).map(([m, c]) => ({
                    mois: m.slice(5),
                    count: c,
                  }));
                })()}>
                  <XAxis dataKey="mois" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#16a34a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-sm font-semibold text-gray-600 mb-3">Traitements par département</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={(() => {
                  const counts = {};
                  allTraitements.forEach(t => {
                    const dept = t.department || "Inconnu";
                    counts[dept] = (counts[dept] || 0) + 1;
                  });
                  return Object.entries(counts)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 6)
                    .map(([dept, c]) => ({ dept, count: c }));
                })()} layout="vertical">
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="dept" tick={{ fontSize: 10 }} width={90} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#7c3aed" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
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
          declarations={declarationsVisible}
          onNew={() => { setDeclarationToEdit(null); setShowCreerDeclaration(true); }}
          onDetail={setDetailDeclaration}
          onSoumettre={handleSoumettreAuDG}
          onModifier={handleModifierDeclaration}
        />
      )}

      {activeTab === "demandes" && (
        <DpoDemandesSection demandes={demandes} demandesEnAttente={stats.demandesEnAttente} />
      )}

      {activeTab === "historique" && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800">Historique des déclarations</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Approuvées par la DG
              </h3>
              <div className="space-y-2">
                {declarations.filter(d => d.statut === "APPROUVEE_DG").length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">Aucune</p>
                )}
                {declarations.filter(d => d.statut === "APPROUVEE_DG").map(d => (
                  <div key={d.idDeclaration} className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                    <div>
                      <p className="font-semibold text-sm text-gray-800">{d.traitementDescription || d.denominationTraitement || `Déclaration #${d.idDeclaration}`}</p>
                      <p className="text-xs text-gray-400">{d.secteur || "—"} · {formatDate(d.dateSoumission)}</p>
                    </div>
                    <span className="text-xs text-green-600 font-semibold">Approuvée DG</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Validées par la CIL
              </h3>
              <div className="space-y-2">
                {declarations.filter(d => ["VALIDEE_CIL", "APPROUVEE"].includes(d.statut)).length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">Aucune</p>
                )}
                {declarations.filter(d => ["VALIDEE_CIL", "APPROUVEE"].includes(d.statut)).map(d => (
                  <div key={d.idDeclaration} className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl">
                    <div>
                      <p className="font-semibold text-sm text-gray-800">{d.traitementDescription || d.denominationTraitement || `Déclaration #${d.idDeclaration}`}</p>
                      <p className="text-xs text-gray-400">{d.secteur || "—"} · {formatDate(d.dateSoumission)}</p>
                    </div>
                    <span className="text-xs text-emerald-600 font-semibold">Validée CIL</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                Rejetées par la DG
              </h3>
              <div className="space-y-2">
                {declarations.filter(d => d.statut === "REJETEE_DG").length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">Aucune</p>
                )}
                {declarations.filter(d => d.statut === "REJETEE_DG").map(d => (
                  <div key={d.idDeclaration} className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                    <div>
                      <p className="font-semibold text-sm text-gray-800">{d.traitementDescription || d.denominationTraitement || `Déclaration #${d.idDeclaration}`}</p>
                      <p className="text-xs text-gray-400">{d.secteur || "—"} · {formatDate(d.dateSoumission)}</p>
                    </div>
                    <span className="text-xs text-red-500 font-semibold">Rejetée DG</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                Rejetées par la CIL
              </h3>
              <div className="space-y-2">
                {declarations.filter(d => ["REJETEE_CIL", "REJETEE"].includes(d.statut)).length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">Aucune</p>
                )}
                {declarations.filter(d => ["REJETEE_CIL", "REJETEE"].includes(d.statut)).map(d => (
                  <div key={d.idDeclaration} className="flex items-center justify-between p-3 bg-orange-50 rounded-xl">
                    <div>
                      <p className="font-semibold text-sm text-gray-800">{d.traitementDescription || d.denominationTraitement || `Déclaration #${d.idDeclaration}`}</p>
                      <p className="text-xs text-gray-400">{d.secteur || "—"} · {formatDate(d.dateSoumission)}</p>
                    </div>
                    <span className="text-xs text-orange-500 font-semibold">Rejetée CIL</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {sessions.filter(s => s.statutSession === "TERMINEE").length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Sessions terminées
              </h3>
              <div className="space-y-2">
                {sessions.filter(s => s.statutSession === "TERMINEE").map(s => (
                  <div key={s.idSession} className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                    <div>
                      <p className="font-semibold text-sm text-gray-800">{s.nomSession || `Session #${s.idSession}`}</p>
                      <p className="text-xs text-gray-400">{s.typeCollecte || "—"} · {formatDate(s.dateDebut)} → {formatDate(s.dateFin)}</p>
                    </div>
                    <span className="text-xs text-blue-600 font-semibold">Terminée</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {declarations.filter(d => d.statut !== "BROUILLON").length === 0 && sessions.filter(s => s.statutSession === "TERMINEE").length === 0 && (
            <div className="py-8 text-center text-gray-400 text-sm">
              Aucune donnée pour le moment
            </div>
          )}
        </div>
      )}

      {detailTraitement && <ModalDetailTraitement traitement={detailTraitement} onClose={() => setDetailTraitement(null)} />}
      {detailDeclaration && (
        <ModalDetailDeclaration
          declaration={detailDeclaration}
          onClose={() => setDetailDeclaration(null)}
          onModifier={handleModifierDeclaration}
          onSupprimer={handleSupprimerDeclaration}
        />
      )}
      {showCreerDeclaration && (
        <ModalCreerDeclaration
          traitements={allTraitements}
          onClose={() => { setDeclarationPreFill(null); setDeclarationToEdit(null); setShowCreerDeclaration(false); }}
          onSave={handleCreateDeclaration}
          preFillTraitement={declarationPreFill}
          declarationToEdit={declarationToEdit}
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
