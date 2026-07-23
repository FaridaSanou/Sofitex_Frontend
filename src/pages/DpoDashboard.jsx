import { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { Icon } from "../components/ui/Icon";
import { SimpleStatCard } from "../components/ui/StatCard";
import Toast from "../components/ui/Toast";
import NotificationBell from "../components/ui/NotificationBell";
import DpoSessionsSection from "../components/dpo/DpoSessionsSection";
import DpoTraitementsSection from "../components/dpo/DpoTraitementsSection";
import DpoDeclarationsSection from "../components/dpo/DpoDeclarationsSection";
import DpoDemandesSection from "../components/dpo/DpoDemandesSection";
import ModalCreerDeclaration from "../components/dpo/ModalCreerDeclaration";
import ModalDetailDeclaration from "../components/dpo/ModalDetailDeclaration";
import ModalDetailTraitement from "../components/dpo/ModalDetailTraitement";

function DpoSidebar({ sidebarOpen, activeSection, setActiveSection, badges }) {
  const navItems = [
    { id: "dashboard", label: "Tableau de bord", icon: "home" },
    { id: "sessions", label: "Sessions de collecte", icon: "calendar" },
    { id: "traitements", label: "Traitements", icon: "clipboard" },
    { id: "declarations", label: "Déclarations", icon: "file-text", badge: badges.declarations },
    { id: "demandes", label: "Demandes usagers", icon: "bell", badge: badges.demandes },
  ];

  return (
    <aside className={`${sidebarOpen ? "w-64" : "w-16"} bg-green-900 text-white flex flex-col transition-all duration-300 shadow-xl`}>
      <div className="flex items-center gap-3 px-4 py-5 border-b border-green-800">
        <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-green-900 font-black text-sm">DPO</span>
        </div>
        {sidebarOpen && (
          <div>
            <p className="font-bold text-sm leading-tight">Délégué Protection</p>
            <p className="text-green-400 text-xs">SOFITEX · Plateforme CIL</p>
          </div>
        )}
      </div>

      <nav className="flex-1 py-4 space-y-1 px-2">
        {navItems.map(item => (
          <button key={item.id} onClick={() => setActiveSection(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeSection === item.id ? "bg-white text-green-900 shadow" : "text-green-200 hover:bg-green-800"}`}>
            <Icon name={item.icon} className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="flex-1 text-left">{item.label}</span>}
            {sidebarOpen && item.badge > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">{item.badge}</span>
            )}
          </button>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-green-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-700 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">DPO</span>
          </div>
          {sidebarOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">DPO</p>
              <p className="text-green-400 text-xs truncate">{localStorage.getItem("email") || ""}</p>
            </div>
          )}
          {sidebarOpen && (
            <button onClick={() => { localStorage.clear(); window.location.href = "/"; }} className="text-green-400 hover:text-white">
              <Icon name="logout" className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

function DpoDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [sessions, setSessions] = useState([]);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [sessionForm, setSessionForm] = useState({ nomSession: "", dateDebut: "", dateFin: "", typeCollecte: "EN_LIGNE", lieu: "", description: "" });

  const [traitements, setTraitements] = useState([]);
  const [traitementFilterMode, setTraitementFilterMode] = useState("tous");
  const [selectedSessionId, setSelectedSessionId] = useState("");

  const [declarations, setDeclarations] = useState([]);
  const [showCreerDeclaration, setShowCreerDeclaration] = useState(false);
  const [declarationToEdit, setDeclarationToEdit] = useState(null);
  const [preFillTraitement, setPreFillTraitement] = useState(null);
  const [detailDeclaration, setDetailDeclaration] = useState(null);

  const [demandes, setDemandes] = useState([]);
  const [detailTraitement, setDetailTraitement] = useState(null);

  const [toast, setToast] = useState(null);
  const [dpoUserId, setDpoUserId] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchSessions = useCallback(() => {
    api.get("/sessions").then(res => { const sorted = [...res.data].sort((a, b) => (a.nomSession || a.description || "").localeCompare(b.nomSession || b.description || "")); setSessions(sorted); }).catch(() => {});
  }, []);

  const fetchTraitements = useCallback(() => {
    api.get("/traitements").then(res => { const sorted = [...res.data].sort((a, b) => (a.nom || a.description || "").localeCompare(b.nom || b.description || "")); setTraitements(sorted); }).catch(() => {});
  }, []);

  const fetchDeclarations = useCallback(() => {
    const dpoId = localStorage.getItem("dpoId");
    if (!dpoId) return;
    api.get("/declarations/mes-declarations", { params: { dpoId } }).then(res => setDeclarations(res.data)).catch(() => {});
  }, []);

  const fetchDemandes = useCallback(() => {
    api.get("/demandes/pour-dpo").then(res => setDemandes(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    fetchSessions();
    fetchTraitements();
    fetchDeclarations();
    fetchDemandes();

    const email = localStorage.getItem("email");
    if (email) {
      api.get("/verification/fonction", { params: { email } })
        .then(res => {
          if (res.data?.userId) setDpoUserId(Number(res.data.userId));
        })
        .catch(() => {});
    }
  }, [fetchSessions, fetchTraitements, fetchDeclarations, fetchDemandes]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchSessions();
      fetchTraitements();
      fetchDeclarations();
      fetchDemandes();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchSessions, fetchTraitements, fetchDeclarations, fetchDemandes]);

  const handleCreateSession = (e) => {
    e.preventDefault();
    api.post("/sessions", sessionForm)
      .then(() => {
        fetchSessions();
        setShowSessionForm(false);
        setSessionForm({ nomSession: "", dateDebut: "", dateFin: "", typeCollecte: "EN_LIGNE", lieu: "", description: "" });
        showToast("Session créée avec succès !");
      })
      .catch(err => showToast(err.response?.data?.message || "Erreur lors de la création", "error"));
  };

  const handleChangeStatutSession = (id, statut) => {
    api.patch(`/sessions/${id}/statut`, null, { params: { valeur: statut } })
      .then(() => { fetchSessions(); showToast("Statut mis à jour !"); })
      .catch(err => showToast(err.response?.data?.message || "Erreur", "error"));
  };

  const TYPE_ROUTES = {
    NORMALE: "normale",
    COLLECTE_SITE: "collecte-site",
    VIDEO_SURVEILLANCE: "video-surveillance",
    AUTORISATION: "autorisation",
  };

  const handleCreateDeclaration = (payload) => {
    const { declarationId, typeDeclaration, ...data } = payload;
    const route = TYPE_ROUTES[typeDeclaration] || "normale";
    const request = declarationId
      ? api.put(`/declarations/${declarationId}/${route}`, { typeDeclaration, ...data })
      : api.post(`/declarations/${route}`, { typeDeclaration, ...data });

    request
      .then(() => { fetchDeclarations(); fetchTraitements(); showToast("Déclaration enregistrée !"); })
      .catch(err => showToast(err.response?.data?.message || "Erreur lors de la sauvegarde", "error"));
  };

  const handleSoumettreDeclaration = (declaration) => {
    api.put(`/declarations/${declaration.idDeclaration}/soumettre`)
      .then(() => { fetchDeclarations(); showToast("Déclaration soumise au DG !"); })
      .catch(err => showToast(err.response?.data?.message || "Erreur lors de la soumission", "error"));
  };

  const handleSupprimerDeclaration = (id) => {
    api.delete(`/declarations/${id}`)
      .then(() => { fetchDeclarations(); showToast("Déclaration supprimée."); })
      .catch(err => showToast(err.response?.data?.message || "Erreur lors de la suppression", "error"));
  };

  const traitementsToShow = traitements.filter(t => {
    if (traitementFilterMode === "parSession" && selectedSessionId) return t.sessionCollecteId === Number(selectedSessionId);
    return true;
  }).sort((a, b) => (a.nom || a.description || "").localeCompare(b.nom || b.description || ""));

  const demandesEnAttente = demandes.filter(d => d.statutDemande === "EN_COURS" || d.statutDemande === "EN_ATTENTE").length;

  const broUillonCount = declarations.filter(d => d.statut === "BROUILLON").length;

  const stats = [
    { label: "Sessions actives", value: sessions.filter(s => s.statutSession === "EN_COURS").length, icon: "calendar", color: "bg-blue-50 border-blue-200" },
    { label: "Traitements", value: traitements.length, icon: "clipboard", color: "bg-green-50 border-green-200" },
    { label: "Déclarations brouillon", value: broUillonCount, icon: "file-text", color: "bg-yellow-50 border-yellow-200" },
    { label: "Demandes en attente", value: demandesEnAttente, icon: "bell", color: "bg-red-50 border-red-200" },
  ];

  const headerTitles = {
    dashboard: "Tableau de bord DPO",
    sessions: "Sessions de collecte",
    traitements: "Traitements",
    declarations: "Déclarations CIL",
    demandes: "Demandes des usagers",
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <DpoSidebar sidebarOpen={sidebarOpen} activeSection={activeSection} setActiveSection={setActiveSection}
        badges={{ declarations: broUillonCount, demandes: demandesEnAttente }} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(o => !o)} className="text-gray-500 hover:text-gray-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-800">{headerTitles[activeSection]}</h1>
              <p className="text-xs text-gray-400">
                {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          </div>
          {dpoUserId ? (
            <NotificationBell utilisateurId={dpoUserId} onNavigate={() => setActiveSection("demandes")} />
          ) : demandesEnAttente > 0 && (
            <button onClick={() => setActiveSection("demandes")} className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
              <Icon name="bell" className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">{demandesEnAttente > 9 ? "9+" : demandesEnAttente}</span>
            </button>
          )}
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {activeSection === "dashboard" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {stats.map((s, i) => (
                  <SimpleStatCard key={i} label={s.label} value={s.value} color={s.color.split(" ")[0]} borderColor={s.color.split(" ")[1]} textColor="text-gray-700" />
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="font-bold text-gray-800">Déclarations récentes</h2>
                  </div>
                  <div className="space-y-3">
                    {declarations.slice(0, 5).map(d => (
                      <div key={d.idDeclaration} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition cursor-pointer"
                        onClick={() => setDetailDeclaration(d)}>
                        <div>
                          <p className="font-semibold text-sm text-gray-800">{d.traitementDescription || d.denominationTraitement || `Déclaration #${d.idDeclaration}`}</p>
                          <p className="text-xs text-gray-400">{d.secteur || "—"}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          d.statut === "BROUILLON" ? "bg-gray-200 text-gray-700" :
                          d.statut === "EN_ATTENTE" ? "bg-yellow-100 text-yellow-800" :
                          d.statut === "VALIDEE_CIL" ? "bg-green-100 text-green-800" :
                          "bg-gray-100 text-gray-600"
                        }`}>{d.statut}</span>
                      </div>
                    ))}
                    {declarations.length === 0 && (
                      <div className="py-8 text-center text-gray-400 text-sm">
                        <Icon name="check" className="w-8 h-8 mx-auto mb-2 text-green-400" />
                        Aucune déclaration.
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="font-bold text-gray-800">Demandes usagers récentes</h2>
                    {demandesEnAttente > 0 && (
                      <button onClick={() => setActiveSection("demandes")} className="text-xs text-green-700 hover:text-green-900 font-semibold">
                        Voir tout →
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    {demandes.slice(0, 5).map(d => (
                      <div key={d.idDemande || d.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition cursor-pointer"
                        onClick={() => setActiveSection("demandes")}>
                        <div>
                          <p className="font-semibold text-sm text-gray-800">{d.usagerNomComplet || d.usagerNom || d.usager || "—"}</p>
                          <p className="text-xs text-gray-400">{d.typeDemande || d.type || "—"} · {d.traitementNom || d.descriptionDemande || d.detail || "—"}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          (d.statutDemande || d.statut) === "EN_COURS" ? "bg-yellow-100 text-yellow-800" :
                          (d.statutDemande || d.statut) === "ACCEPTEE" ? "bg-green-100 text-green-800" :
                          (d.statutDemande || d.statut) === "REJETEE" ? "bg-red-100 text-red-800" :
                          "bg-gray-100 text-gray-600"
                        }`}>{(d.statutDemande || d.statut) === "EN_COURS" ? "En attente" : (d.statutDemande || d.statut)}</span>
                      </div>
                    ))}
                    {demandes.length === 0 && (
                      <div className="py-8 text-center text-gray-400 text-sm">
                        <Icon name="check" className="w-8 h-8 mx-auto mb-2 text-green-400" />
                        Aucune demande usager.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === "sessions" && (
            <DpoSessionsSection sessions={sessions} showForm={showSessionForm} setShowForm={setShowSessionForm}
              form={sessionForm} setForm={setSessionForm} handleCreateSession={handleCreateSession}
              handleChangeStatut={handleChangeStatutSession} />
          )}

          {activeSection === "traitements" && (
            <DpoTraitementsSection traitementsToShow={traitementsToShow} traitementFilterMode={traitementFilterMode}
              setTraitementFilterMode={setTraitementFilterMode} selectedSessionId={selectedSessionId}
              setSelectedSessionId={setSelectedSessionId} sessions={sessions}
              onDetail={setDetailTraitement} onCreateDeclaration={(t) => { setPreFillTraitement(t); setShowCreerDeclaration(true); }} />
          )}

          {activeSection === "declarations" && (
            <DpoDeclarationsSection declarations={declarations}
              onNew={() => { setPreFillTraitement(null); setDeclarationToEdit(null); setShowCreerDeclaration(true); }}
              onDetail={setDetailDeclaration} onSoumettre={handleSoumettreDeclaration}
              onModifier={(d) => { setDeclarationToEdit(d); setPreFillTraitement(null); setShowCreerDeclaration(true); }} />
          )}

          {activeSection === "demandes" && (
            <DpoDemandesSection demandes={demandes} demandesEnAttente={demandesEnAttente} />
          )}
        </main>
      </div>

      {showCreerDeclaration && (
        <ModalCreerDeclaration traitements={traitements} onClose={() => { setShowCreerDeclaration(false); setDeclarationToEdit(null); setPreFillTraitement(null); }}
          onSave={handleCreateDeclaration} preFillTraitement={preFillTraitement} declarationToEdit={declarationToEdit} />
      )}
      {detailDeclaration && (
        <ModalDetailDeclaration declaration={detailDeclaration} onClose={() => setDetailDeclaration(null)}
          onModifier={(d) => { setDetailDeclaration(null); setDeclarationToEdit(d); setPreFillTraitement(null); setShowCreerDeclaration(true); }}
          onSupprimer={handleSupprimerDeclaration} />
      )}
      {detailTraitement && (
        <ModalDetailTraitement traitement={detailTraitement} onClose={() => setDetailTraitement(null)} />
      )}
      <Toast toast={toast} />
    </div>
  );
}

export default DpoDashboard;
