import { useState, useEffect } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";

const formatDate = (d) => d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const statutBadge = (s) => {
  const map = {
    EN_COURS: "bg-blue-100 text-blue-800",
    TERMINEE: "bg-green-100 text-green-800",
    ANNULEE: "bg-red-100 text-red-800",
  };
  const labels = { EN_COURS: "En cours", TERMINEE: "Terminée", ANNULEE: "Annulée" };
  return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${map[s] || "bg-gray-100"}`}>{labels[s] || s}</span>;
};

function DgDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    api.get("/sessions").then((res) => setSessions(res.data)).catch(() => {});
  }, []);

  const stats = {
    total: sessions.length,
    enCours: sessions.filter((s) => s.statutSession === "EN_COURS").length,
    terminees: sessions.filter((s) => s.statutSession === "TERMINEE").length,
  };

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-800">Vue d'ensemble</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="w-10 h-10 bg-green-700 rounded-xl flex items-center justify-center mb-3">
                <span className="text-white font-bold text-lg">{stats.total}</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              <p className="text-sm font-medium text-gray-700">Sessions totales</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center mb-3">
                <span className="text-white font-bold text-lg">{stats.enCours}</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">{stats.enCours}</p>
              <p className="text-sm font-medium text-gray-700">En cours</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center mb-3">
                <span className="text-white font-bold text-lg">{stats.terminees}</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">{stats.terminees}</p>
              <p className="text-sm font-medium text-gray-700">Terminées</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "sessions" && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800">Sessions de collecte</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Description</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Date début</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Statut</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">DPO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {sessions.map((s) => (
                    <tr key={s.idSession} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-4 font-semibold text-gray-800">{s.description || `Session #${s.idSession}`}</td>
                      <td className="px-5 py-4">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {s.typeCollecte === "EN_LIGNE" ? "En ligne" : "Terrain"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-500">{formatDate(s.dateDebut)}</td>
                      <td className="px-5 py-4">{statutBadge(s.statutSession)}</td>
                      <td className="px-5 py-4 text-sm text-gray-600">{s.dpoNomComplet || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {sessions.length === 0 && <div className="py-12 text-center text-gray-400 text-sm">Aucune session</div>}
            </div>
          </div>
        </div>
      )}

      {activeTab === "utilisateurs" && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800">Utilisateurs</h2>
          <p className="text-sm text-gray-500">Consultez la liste des utilisateurs de la plateforme.</p>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <p className="text-gray-400 text-sm">Module de gestion des utilisateurs à venir</p>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default DgDashboard;
