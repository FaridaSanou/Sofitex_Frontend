import { useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import CilStatCards from "../components/cil/CilStatCards";
import VerificationForm from "../components/cil/VerificationForm";

function CilDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-800">Tableau de bord CIL</h2>
          <CilStatCards />
        </div>
      )}

      {activeTab === "declarations" && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800">Déclarations</h2>
          <p className="text-sm text-gray-500">Gérez les déclarations de traitement des données.</p>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <p className="text-gray-400 text-sm">Module de déclarations à venir</p>
          </div>
        </div>
      )}

      {activeTab === "plaintes" && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800">Plaintes</h2>
          <p className="text-sm text-gray-500">Gérez les plaintes des usagers.</p>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <p className="text-gray-400 text-sm">Module de plaintes à venir</p>
          </div>
        </div>
      )}

      {activeTab === "verification" && (
        <VerificationForm showToast={showToast} />
      )}

      {toast && (
        <div className={`fixed bottom-6 right-6 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium z-50 ${toast.type === "error" ? "bg-red-500" : "bg-green-700"}`}>
          {toast.msg}
        </div>
      )}
    </DashboardLayout>
  );
}

export default CilDashboard;
