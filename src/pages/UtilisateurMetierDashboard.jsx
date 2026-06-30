import { useState, useEffect } from "react";
import Toast from "../components/ui/Toast";
import api from "../services/api";
import UMSidebar from "../components/utilisateur-metier/UMSidebar";
import UMHeader from "../components/utilisateur-metier/UMHeader";
import UMDashboard from "../components/utilisateur-metier/UMDashboard";
import UMSessionsSection from "../components/utilisateur-metier/UMSessionsSection";
import UMTraitementsSection from "../components/utilisateur-metier/UMTraitementsSection";
import UMDemandesSection from "../components/utilisateur-metier/UMDemandesSection";
import UMEntrepotSection from "../components/utilisateur-metier/UMEntrepotSection";
import UMHistoriqueSection from "../components/utilisateur-metier/UMHistoriqueSection";
import ModalCreerTraitement from "../components/utilisateur-metier/ModalCreerTraitement";
import ModalDetailTraitement from "../components/utilisateur-metier/ModalDetailTraitement";
import ModalAjouterDonnees from "../components/utilisateur-metier/ModalAjouterDonnees";
import ModalDonneesTraitement from "../components/utilisateur-metier/ModalDonneesTraitement";
import ModalDemandeUsager from "../components/utilisateur-metier/ModalDemandeUsager";

const mockDemandes = [
  { id: 1, usager: "Traoré Fatima", usagerNom: "Traoré Fatima", type: "MODIFICATION", typeDemande: "MODIFICATION", traitement: "Gestion des salaires", traitementNom: "Gestion des salaires", date: "2026-05-20T10:00:00", dateDemande: "2026-05-20T10:00:00", statut: "EN_ATTENTE", statutDemande: "EN_ATTENTE", detail: "Demande de correction de l'adresse mail enregistrée.", descriptionDemande: "Demande de correction de l'adresse mail enregistrée." },
  { id: 2, usager: "Kaboré Issouf", usagerNom: "Kaboré Issouf", type: "SUPPRESSION", typeDemande: "SUPPRESSION", traitement: "Gestion des accès réseau", traitementNom: "Gestion des accès réseau", date: "2026-05-21T08:30:00", dateDemande: "2026-05-21T08:30:00", statut: "EN_ATTENTE", statutDemande: "EN_ATTENTE", detail: "Demande de suppression des données suite à fin de contrat.", descriptionDemande: "Demande de suppression des données suite à fin de contrat." },
  { id: 3, usager: "Sawadogo Paul", usagerNom: "Sawadogo Paul", type: "MODIFICATION", typeDemande: "MODIFICATION", traitement: "Gestion des salaires", traitementNom: "Gestion des salaires", date: "2026-05-18T16:00:00", dateDemande: "2026-05-18T16:00:00", statut: "TRAITE", statutDemande: "TRAITE", detail: "Correction du numéro de téléphone.", descriptionDemande: "Correction du numéro de téléphone." },
];

function UtilisateurMetierDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [traitements, setTraitements] = useState([]);
  const [demandes, setDemandes] = useState(mockDemandes);
  const [sessions, setSessions] = useState([]);
  const [showCreer, setShowCreer] = useState(false);
  const [showAjouterDonnees, setShowAjouterDonnees] = useState(false);
  const [showDonneesModal, setShowDonneesModal] = useState(false);
  const [traitementPourDonnees, setTraitementPourDonnees] = useState(null);
  const [detailTraitement, setDetailTraitement] = useState(null);
  const [detailDemande, setDetailDemande] = useState(null);
  const [toast, setToast] = useState(null);
  const [recherche, setRecherche] = useState("");
  const [traitementFilterMode, setTraitementFilterMode] = useState("tous");
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [newSessionCount, setNewSessionCount] = useState(0);
  const [previousSessionCount, setPreviousSessionCount] = useState(0);
  const [utilisateurMetierId, setUtilisateurMetierId] = useState(null);
  const [entrepotData, setEntrepotData] = useState([]);
  const [entrepotRecherche, setEntrepotRecherche] = useState("");
  const [expandedTraitementId, setExpandedTraitementId] = useState(null);
  const [traitementDonneesMap, setTraitementDonneesMap] = useState({});
  const [traitementDonneesLoading, setTraitementDonneesLoading] = useState({});

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    api.get("/sessions").then(res => { setSessions(res.data); setPreviousSessionCount(res.data.length); }).catch(() => {});
    const storedId = localStorage.getItem("utilisateurMetierId");
    if (storedId) {
      setUtilisateurMetierId(Number(storedId));
      api.get(`/traitements/utilisateur-metier/${storedId}`).then(res => setTraitements(res.data)).catch(err => console.error(err));
    } else {
      const email = localStorage.getItem("email");
      if (email) {
        api.get("/verification/fonction", { params: { email } }).then(res => {
          const id = res.data.utilisateurMetierId;
          if (id) { localStorage.setItem("utilisateurMetierId", String(id)); setUtilisateurMetierId(Number(id)); return api.get(`/traitements/utilisateur-metier/${id}`); }
          throw new Error("no id");
        }).then(res => { if (res) setTraitements(res.data); }).catch(err => console.error(err));
      }
    }
    api.get("/donnees").then(res => setEntrepotData(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      api.get("/sessions").then(res => {
        setSessions(res.data);
        if (res.data.length > previousSessionCount) setNewSessionCount(prev => prev + (res.data.length - previousSessionCount));
        setPreviousSessionCount(res.data.length);
      }).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [previousSessionCount]);

  const handleCreer = (payload, callback, mode = "direct") => {
    const traitementData = {
      nom: payload.nom || payload.denomination || "",
      department: payload.responsable_departement || "",
      description: payload.denomination || payload.nom || "",
      texte: payload.finalite || "",
      certificationSecurite: "", dureeConservation: payload.duree_conservation || 0, dateFin: null,
      utilisateurMetierId: utilisateurMetierId || Number(localStorage.getItem("utilisateurMetierId")),
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
    api.post("/traitements/normale", fd).then(res => {
      const t = res.data;
      setTraitements(prev => [t, ...prev]); setShowCreer(false);
      if (mode === "manuel") { setTraitementPourDonnees(t); setShowAjouterDonnees(true); }
      showToast("Traitement créé avec succès !"); callback?.(t);
    }).catch(err => {
      const nouveau = {
        idTraitement: Date.now(), department: payload.responsable_departement || "",
        description: payload.denomination || payload.nom || "", texte: payload.finalite || "",
        certificationSecurite: "", dureeConservation: payload.duree_conservation || 0,
        dateCreation: new Date().toISOString(), dateFin: null, nombreDonnee: 0,
        sessionCollecteId: payload.sessionCollecteId || null,
        utilisateurMetierId: utilisateurMetierId || 1,
        utilisateurMetierNom: localStorage.getItem("email") || "Utilisateur Métier",
        statut: "EN_COURS", envoyeAuDpo: false,
      };
      setTraitements(prev => [nouveau, ...prev]); setShowCreer(false);
      if (mode === "manuel") { setTraitementPourDonnees(nouveau); setShowAjouterDonnees(true); }
      showToast("Traitement créé en mode hors-ligne", "error"); callback?.(nouveau);
    });
  };

  const dposDisponibles = sessions.reduce((acc, s) => {
    if (s.dpoId && !acc.find(d => d.dpoId === s.dpoId)) acc.push({ dpoId: s.dpoId, dpoNomComplet: s.dpoNomComplet || `DPO #${s.dpoId}` });
    return acc;
  }, []);

  const handleEnvoyer = (id, dpoIdOverride) => {
    const t = traitements.find(t => t.idTraitement === id);
    const dpoId = dpoIdOverride ?? (t?.sessionCollecteId ? sessions.find(s => s.idSession === t.sessionCollecteId)?.dpoId : null);
    if (!dpoId) { showToast("Aucun DPO trouvé. Ouvrez le détail pour en sélectionner un.", "error"); return; }
    api.patch(`/traitements/${id}/envoyer-dpo`, null, { params: { dpoId } }).then(res => {
      setTraitements(prev => prev.map(t => t.idTraitement === id ? res.data : t));
      showToast("Traitement envoyé au DPO !");
    }).catch(err => showToast(err.response?.data?.message || "Erreur lors de l'envoi au DPO", "error"));
  };

  const handleSaveManuel = (payload, onComplete) => {
    api.post("/donnees", payload).then(() => {
      setTraitements(prev => prev.map(t => t.idTraitement === payload.traitementId ? { ...t, nombreDonnee: (t.nombreDonnee || 0) + 1 } : t));
      setShowAjouterDonnees(false); setTraitementPourDonnees(null);
      showToast("Donnée ajoutée avec succès !");
    }).catch(err => {
      const status = err.response?.status; const msg = err.response?.data?.message || "Erreur lors de l'ajout de la donnée";
      showToast(status === 403 ? "Accès refusé (403) — vérifiez que vous êtes bien connecté." : `Erreur ${status || ""} : ${msg}`, "error");
    }).finally(() => onComplete?.());
  };

  const handleSaveExcel = (formData, traitementId, onComplete) => {
    api.post("/entrepot/import-excel", formData, { headers: { "Content-Type": undefined } }).then(importRes => {
      const r = importRes.data;
      if (r.lignesImportees === 0) { showToast(`Aucune ligne importée. ${r.erreurs?.join(", ") || "Vérifiez le format du fichier."}`, "error"); return; }
      return api.get("/entrepot").then(listRes => {
        const donneeIds = listRes.data.map(d => d.idDonnee);
        if (donneeIds.length === 0) { showToast(`${r.lignesImportees} ligne(s) importée(s) mais rattachement impossible.`, "error"); return; }
        return api.post(`/entrepot/attacher-lot?traitementId=${traitementId}`, donneeIds).then(() => {
          setTraitements(prev => prev.map(t => t.idTraitement === traitementId ? { ...t, nombreDonnee: (t.nombreDonnee || 0) + r.lignesImportees } : t));
          setShowAjouterDonnees(false); setTraitementPourDonnees(null);
          showToast(`${r.lignesImportees} donnée(s) importée(s) et rattachée(s) sur ${r.totalLignes} ligne(s)${r.lignesEchouees > 0 ? ` (${r.lignesEchouees} échec(s))` : ""}`);
        });
      });
    }).catch(err => {
      const status = err.response?.status; const msg = err.response?.data?.message || "Erreur lors de l'import";
      showToast(status === 403 ? "Accès refusé (403) — vérifiez que vous êtes bien connecté." : status === 400 ? "Fichier invalide ou format incorrect (400)." : `Erreur ${status || ""} : ${msg}`, "error");
    }).finally(() => onComplete?.());
  };

  const handleTraiterDemande = (id, reponse) => {
    setDemandes(prev => prev.map(d => d.id === id ? { ...d, statut: "TRAITE" } : d));
    showToast("Demande traitée !");
  };

  const handleLogout = () => {
    localStorage.removeItem("token"); localStorage.removeItem("role"); localStorage.removeItem("email"); localStorage.removeItem("dpoId");
    window.location.href = "/";
  };

  const chargerDonneesTraitement = (traitementId) => {
    if (expandedTraitementId === traitementId) { setExpandedTraitementId(null); return; }
    setExpandedTraitementId(traitementId);
    if (!traitementDonneesMap[traitementId]) {
      setTraitementDonneesLoading(prev => ({ ...prev, [traitementId]: true }));
      api.get("/donnees/par-traitement", { params: { traitementId } }).then(res => {
        setTraitementDonneesMap(prev => ({ ...prev, [traitementId]: res.data }));
        setTraitementDonneesLoading(prev => ({ ...prev, [traitementId]: false }));
      }).catch(() => setTraitementDonneesLoading(prev => ({ ...prev, [traitementId]: false })));
    }
  };

  const demandesEnAttente = demandes.filter(d => d.statut === "EN_ATTENTE" || d.statutDemande === "EN_ATTENTE").length;
  const traitementsFiltres = traitements.filter(t => {
    if (recherche && !t.description?.toLowerCase().includes(recherche.toLowerCase()) && !t.department?.toLowerCase().includes(recherche.toLowerCase())) return false;
    if (traitementFilterMode === "parSession" && selectedSessionId) return t.sessionCollecteId === Number(selectedSessionId);
    return true;
  });

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
    { id: "entrepot", label: "Entrepôt", icon: "database" },
    { id: "historique", label: "Historique", icon: "history" },
  ];

  const handleNavigate = (id) => { setActiveSection(id); if (id === "sessions") setNewSessionCount(0); };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <UMSidebar activeSection={activeSection} onNavigate={handleNavigate} sidebarOpen={sidebarOpen} onLogout={handleLogout} navItems={navItems} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <UMHeader activeSection={activeSection} sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(o => !o)} newSessionCount={newSessionCount} onNewSessionClick={() => { setNewSessionCount(0); setActiveSection("sessions"); }} demandesEnAttente={demandesEnAttente} onDemandesClick={() => setActiveSection("demandes")} />
        <main className="flex-1 overflow-y-auto p-6">
          {activeSection === "dashboard" && <UMDashboard stats={stats} traitements={traitements} onNewTraitement={() => setShowCreer(true)} onDetailTraitement={setDetailTraitement} />}
          {activeSection === "sessions" && <UMSessionsSection sessions={sessions} traitements={traitements} onDetailTraitement={setDetailTraitement} />}
          {activeSection === "traitements" && (
            <UMTraitementsSection traitementsFiltres={traitementsFiltres} recherche={recherche} onRechercheChange={setRecherche} traitementFilterMode={traitementFilterMode} setTraitementFilterMode={setTraitementFilterMode} selectedSessionId={selectedSessionId} setSelectedSessionId={setSelectedSessionId} sessions={sessions} onNew={() => setShowCreer(true)} expandedTraitementId={expandedTraitementId} onToggleExpand={chargerDonneesTraitement} traitementDonneesMap={traitementDonneesMap} traitementDonneesLoading={traitementDonneesLoading} onDetail={setDetailTraitement} onDonnees={(t) => { setTraitementPourDonnees(t); setShowDonneesModal(true); }} onEnvoyer={handleEnvoyer} />
          )}
          {activeSection === "demandes" && <UMDemandesSection demandes={demandes} demandesEnAttente={demandesEnAttente} onTraiter={setDetailDemande} />}
          {activeSection === "entrepot" && <UMEntrepotSection entrepotData={entrepotData} entrepotRecherche={entrepotRecherche} onRechercheChange={setEntrepotRecherche} traitements={traitements} onAjouterDonnees={(t) => { setTraitementPourDonnees(t); setShowAjouterDonnees(true); }} />}
          {activeSection === "historique" && <UMHistoriqueSection traitementsEnvoyesDpo={traitements.filter(t => t.envoyeAuDpo === true)} demandesTraitees={demandes.filter(d => d.statut === "TRAITE" || d.statutDemande === "TRAITE")} sessionsTerminees={sessions.filter(s => s.statutSession === "TERMINEE")} />}
        </main>
      </div>
      {showCreer && <ModalCreerTraitement onClose={() => setShowCreer(false)} onSave={handleCreer} sessions={sessions} onSaveManuel={handleSaveManuel} onSaveExcel={handleSaveExcel} />}
      {detailTraitement && <ModalDetailTraitement traitement={detailTraitement} onClose={() => setDetailTraitement(null)} onEnvoyer={handleEnvoyer} dpos={dposDisponibles} onAjouterDonnees={(t) => { setTraitementPourDonnees(t); setShowAjouterDonnees(true); }} />}
      {detailDemande && <ModalDemandeUsager demande={detailDemande} onClose={() => setDetailDemande(null)} onTraiter={handleTraiterDemande} />}
      {showDonneesModal && traitementPourDonnees && <ModalDonneesTraitement traitement={traitementPourDonnees} onClose={() => { setShowDonneesModal(false); setTraitementPourDonnees(null); }} onAjouterDonnees={(t) => { setShowDonneesModal(false); setTraitementPourDonnees(t); setShowAjouterDonnees(true); }} />}
      {showAjouterDonnees && traitementPourDonnees && <ModalAjouterDonnees traitement={traitementPourDonnees} onClose={() => { setShowAjouterDonnees(false); setTraitementPourDonnees(null); }} onSaveManuel={handleSaveManuel} onSaveExcel={handleSaveExcel} />}
      <Toast toast={toast} />
    </div>
  );
}

export default UtilisateurMetierDashboard;
