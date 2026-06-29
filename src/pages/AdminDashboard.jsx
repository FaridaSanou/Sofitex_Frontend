import { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminHeader from "../components/admin/AdminHeader";
import AdminStatCards from "../components/admin/AdminStatCards";
import RecentDemandes from "../components/admin/RecentDemandes";
import TypeRepartition from "../components/admin/TypeRepartition";
import DemandesFilters from "../components/admin/DemandesFilters";
import DemandesTable from "../components/admin/DemandesTable";
import UtilisateursSearch from "../components/admin/UtilisateursSearch";
import UtilisateursTable from "../components/admin/UtilisateursTable";
import RejetModal from "../components/admin/RejetModal";
import DetailModal from "../components/admin/DetailModal";
import Toast from "../components/ui/Toast";

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [demandes, setDemandes] = useState([]);
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [loadingDemandes, setLoadingDemandes] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [filterStatut, setFilterStatut] = useState("TOUS");
  const [searchUser, setSearchUser] = useState("");
  const [rejetModal, setRejetModal] = useState(null);
  const [detailModal, setDetailModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchDemandes = useCallback(async () => {
    setLoadingDemandes(true);
    try {
      const res = await api.get("/admin/demandes");
      setDemandes(res.data);
    } catch (err) {
      showToast("Impossible de charger les demandes", "error");
    } finally {
      setLoadingDemandes(false);
    }
  }, []);

  const fetchUtilisateurs = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const res = await api.get("/admin/utilisateurs");
      setUtilisateurs(res.data);
    } catch (err) {
      showToast("Impossible de charger les utilisateurs", "error");
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    fetchDemandes();
    fetchUtilisateurs();
  }, [fetchDemandes, fetchUtilisateurs]);

  const handleValider = async (idDemande) => {
    try {
      await api.put(`/admin/demandes/${idDemande}/valider`);
      setDemandes((prev) => prev.map((d) => d.idDemande === idDemande ? { ...d, statutDemandeAcces: "APPROUVEE", dateValidation: new Date().toISOString() } : d));
      showToast("Demande approuvée avec succès ✓");
    } catch (err) {
      showToast(err.response?.data?.message || "Erreur lors de l'approbation", "error");
    }
  };

  const handleRejeter = async (idDemande, motif) => {
    try {
      await api.put(`/admin/demandes/${idDemande}/rejeter`, { motif });
      setDemandes((prev) => prev.map((d) => d.idDemande === idDemande ? { ...d, statutDemandeAcces: "REJETEE", motif, dateValidation: new Date().toISOString() } : d));
      setRejetModal(null);
      showToast("Demande rejetée", "error");
    } catch (err) {
      showToast(err.response?.data?.message || "Erreur lors du rejet", "error");
    }
  };

  const handleSuspendre = async (id) => {
    try {
      await api.put(`/admin/utilisateurs/${id}/statut`, { statut: "SUSPENDU" });
      setUtilisateurs((prev) => prev.map((u) => u.id === id ? { ...u, statutUtilisateur: "SUSPENDU" } : u));
      showToast("Compte suspendu", "error");
    } catch (err) {
      showToast(err.response?.data?.message || "Erreur lors de la suspension", "error");
    }
  };

  const handleReactiver = async (id) => {
    try {
      await api.put(`/admin/utilisateurs/${id}/statut`, { statut: "ACTIF" });
      setUtilisateurs((prev) => prev.map((u) => u.id === id ? { ...u, statutUtilisateur: "ACTIF" } : u));
      showToast("Compte réactivé ✓");
    } catch (err) {
      showToast(err.response?.data?.message || "Erreur lors de la réactivation", "error");
    }
  };

  const handleDesactiver = async (id) => {
    try {
      await api.put(`/admin/utilisateurs/${id}/statut`, { statut: "INACTIF" });
      setUtilisateurs((prev) => prev.map((u) => u.id === id ? { ...u, statutUtilisateur: "INACTIF" } : u));
      showToast("Compte désactivé", "error");
    } catch (err) {
      showToast(err.response?.data?.message || "Erreur lors de la désactivation", "error");
    }
  };

  const handleRefresh = () => { fetchDemandes(); fetchUtilisateurs(); };

  const demandesFiltered = demandes.filter((d) => filterStatut === "TOUS" ? true : d.statutDemandeAcces === filterStatut);
  const utilisateursFiltres = utilisateurs.filter((u) => `${u.nom ?? ""} ${u.prenom ?? ""} ${u.email ?? ""}`.toLowerCase().includes(searchUser.toLowerCase()));

  const stats = {
    total: demandes.length,
    enAttente: demandes.filter((d) => d.statutDemandeAcces === "EN_ATTENTE").length,
    approuvees: demandes.filter((d) => d.statutDemandeAcces === "APPROUVEE").length,
    rejetees: demandes.filter((d) => d.statutDemandeAcces === "REJETEE").length,
    utilisateurs: utilisateurs.filter((u) => u.statutUtilisateur === "ACTIF").length,
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      <AdminSidebar sidebarOpen={sidebarOpen} activeTab={activeTab} setActiveTab={setActiveTab} stats={stats} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader activeTab={activeTab} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} stats={stats} onRefresh={handleRefresh} />
        <main className="flex-1 overflow-y-auto p-6">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <AdminStatCards stats={stats} />
              <RecentDemandes demandes={demandes} setActiveTab={setActiveTab} handleValider={handleValider} setRejetModal={setRejetModal} />
              <TypeRepartition demandes={demandes} />
            </div>
          )}
          {activeTab === "demandes" && (
            <div className="space-y-4">
              <DemandesFilters filterStatut={filterStatut} setFilterStatut={setFilterStatut} demandes={demandes} />
              <DemandesTable demandesFiltered={demandesFiltered} loading={loadingDemandes} setDetailModal={setDetailModal} handleValider={handleValider} setRejetModal={setRejetModal} />
            </div>
          )}
          {activeTab === "utilisateurs" && (
            <div className="space-y-4">
              <UtilisateursSearch searchUser={searchUser} setSearchUser={setSearchUser} />
              <UtilisateursTable utilisateursFiltres={utilisateursFiltres} loading={loadingUsers} handleSuspendre={handleSuspendre} handleReactiver={handleReactiver} handleDesactiver={handleDesactiver} />
            </div>
          )}
        </main>
      </div>
      {rejetModal && <RejetModal demande={rejetModal} onConfirm={(motif) => handleRejeter(rejetModal.idDemande, motif)} onClose={() => setRejetModal(null)} />}
      {detailModal && <DetailModal demande={detailModal} onClose={() => setDetailModal(null)} />}
      <Toast toast={toast} />
    </div>
  );
}

export default AdminDashboard;
