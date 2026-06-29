import { useState } from "react";
import api from "../../services/api";

export default function VerificationForm({ showToast }) {
  const [verifyEmail, setVerifyEmail] = useState("");
  const [verifyResult, setVerifyResult] = useState(null);

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
    <div className="space-y-4 max-w-lg">
      <h2 className="text-xl font-bold text-gray-800">Vérification d'utilisateur</h2>
      <p className="text-sm text-gray-500">Recherchez un utilisateur par email pour connaître sa fonction et son type.</p>
      <form onSubmit={handleVerification} className="flex gap-3">
        <input type="email" placeholder="email@exemple.com" value={verifyEmail} onChange={(e) => setVerifyEmail(e.target.value)} required
          className="flex-1 h-10 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
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
  );
}
