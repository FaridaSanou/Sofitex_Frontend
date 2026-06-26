import { useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";

function CilDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [verifyEmail, setVerifyEmail] = useState("");
  const [verifyResult, setVerifyResult] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleVerification = async (e) => {
    e.preventDefault();
    try {
      const res = await api.get("/verification/fonction", { params: { email: verifyEmail } });
      setVerifyResult(res.data);
    } catch {
      setVerifyResult(null);
      showToast("Aucun utilisateur trouvé avec cet email", "error");
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-800">Tableau de bord CIL</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center mb-3">
                <span className="text-white font-bold text-lg">0</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">0</p>
              <p className="text-sm font-medium text-gray-700">Déclarations</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center mb-3">
                <span className="text-white font-bold text-lg">0</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">0</p>
              <p className="text-sm font-medium text-gray-700">Plaintes</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center mb-3">
                <span className="text-white font-bold text-lg">0</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">0</p>
              <p className="text-sm font-medium text-gray-700">Notifications</p>
            </div>
          </div>
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
        <div className="space-y-4 max-w-lg">
          <h2 className="text-xl font-bold text-gray-800">Vérification d'utilisateur</h2>
          <p className="text-sm text-gray-500">Recherchez un utilisateur par email pour connaître sa fonction et son type.</p>
          <form onSubmit={handleVerification} className="flex gap-3">
            <input type="email" placeholder="email@exemple.com" value={verifyEmail} onChange={(e) => setVerifyEmail(e.target.value)} required className="flex-1 h-10 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            <button type="submit" className="px-5 py-2 bg-green-700 text-white rounded-xl text-sm font-medium hover:bg-green-800 transition">Rechercher</button>
          </form>

          {verifyResult && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-3">Résultat</h3>
              <div className="space-y-2">
                {Object.entries(verifyResult).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500 capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                    <span className="text-sm font-medium text-gray-800">{value || "—"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
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
