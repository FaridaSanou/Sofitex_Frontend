import { useState } from "react";
import api from "../../services/api";

export default function ParametreSection() {
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [ancienMotDePasse, setAncienMotDePasse] = useState("");
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState("");
  const [loadingProfil, setLoadingProfil] = useState(false);
  const [loadingMdp, setLoadingMdp] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpdateProfil = async (e) => {
    e.preventDefault();
    if (!nom.trim() || !prenom.trim()) {
      showToast("Veuillez remplir tous les champs", "error");
      return;
    }
    setLoadingProfil(true);
    try {
      await api.put("/admin/profil", { nom, prenom });
      showToast("Profil mis à jour ✓");
    } catch (err) {
      showToast(err.response?.data?.message || "Erreur lors de la mise à jour", "error");
    } finally {
      setLoadingProfil(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!ancienMotDePasse.trim() || !nouveauMotDePasse.trim()) {
      showToast("Veuillez remplir tous les champs", "error");
      return;
    }
    if (nouveauMotDePasse.length < 6) {
      showToast("Le nouveau mot de passe doit contenir au moins 6 caractères", "error");
      return;
    }
    setLoadingMdp(true);
    try {
      await api.put("/admin/mot-de-passe", { ancienMotDePasse, nouveauMotDePasse });
      setAncienMotDePasse("");
      setNouveauMotDePasse("");
      showToast("Mot de passe modifié ✓");
    } catch (err) {
      showToast(err.response?.data?.message || "Erreur lors du changement", "error");
    } finally {
      setLoadingMdp(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form onSubmit={handleUpdateProfil} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h3 className="font-semibold text-gray-800">Modifier le profil</h3>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Nom</label>
            <input value={nom} onChange={(e) => setNom(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" placeholder="Votre nom" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Prénom</label>
            <input value={prenom} onChange={(e) => setPrenom(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" placeholder="Votre prénom" />
          </div>
          <button type="submit" disabled={loadingProfil} className="px-4 py-2 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800 disabled:opacity-50 transition">
            {loadingProfil ? "Enregistrement..." : "Enregistrer"}
          </button>
        </form>
        <form onSubmit={handleChangePassword} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h3 className="font-semibold text-gray-800">Changer le mot de passe</h3>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Ancien mot de passe</label>
            <input type="password" value={ancienMotDePasse} onChange={(e) => setAncienMotDePasse(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" placeholder="••••••" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Nouveau mot de passe</label>
            <input type="password" value={nouveauMotDePasse} onChange={(e) => setNouveauMotDePasse(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" placeholder="Au moins 6 caractères" />
          </div>
          <button type="submit" disabled={loadingMdp} className="px-4 py-2 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800 disabled:opacity-50 transition">
            {loadingMdp ? "Modification..." : "Modifier le mot de passe"}
          </button>
        </form>
      </div>
    </div>
  );
}
