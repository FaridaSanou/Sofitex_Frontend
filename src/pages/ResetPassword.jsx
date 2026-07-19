import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import AuthCard from "../components/auth/AuthCard";
import { EyeIcon, EyeOffIcon } from "../components/auth/EyeIcon";
import { PasswordStrength } from "../components/auth/PasswordStrength";
import logo from "../assets/image.png";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [motDePasse, setMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [erreur, setErreur] = useState("");

  if (!token) {
    return (
      <AuthCard title="Lien invalide" subtitle="Ce lien de réinitialisation est invalide ou a expiré" logo={logo}>
        <div className="p-6 text-center">
          <p className="text-sm text-gray-500 mb-4">Veuillez demander un nouveau lien de réinitialisation.</p>
          <a href="/mot-de-passe-oublie" className="text-sm text-green-700 font-medium hover:underline">Demander un nouveau lien</a>
          <div className="mt-4">
            <a href="/" className="text-sm text-gray-400 hover:underline">Retour à la connexion</a>
          </div>
        </div>
      </AuthCard>
    );
  }

  const valider = () => {
    if (!motDePasse) return "Veuillez saisir un nouveau mot de passe";
    if (motDePasse.length < 8) return "Le mot de passe doit contenir au moins 8 caractères";
    if (motDePasse !== confirmation) return "Les mots de passe ne correspondent pas";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = valider();
    if (err) { setErreur(err); return; }
    setLoading(true);
    setErreur("");
    setMessage(null);
    try {
      const response = await fetch("http://localhost:8080/api/auth/reinitialiser-mot-de-passe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, nouveauMotDePasse: motDePasse }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setErreur(data?.message || "Lien expiré ou invalide. Veuillez en demander un nouveau.");
        return;
      }
      setMessage("Votre mot de passe a été réinitialisé avec succès !");
    } catch {
      setErreur("Impossible de contacter le serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Nouveau mot de passe" subtitle="Choisissez un nouveau mot de passe sécurisé" logo={logo}>
      <div className="p-6">
        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 mb-4">{message}</div>
        )}
        {erreur && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">{erreur}</div>
        )}

        {message ? (
          <div className="text-center">
            <a href="/" className="text-sm text-green-700 font-medium hover:underline">Se connecter</a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nouveau mot de passe <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"} placeholder="Minimum 8 caractères" value={motDePasse}
                  onChange={(e) => { setMotDePasse(e.target.value); setErreur(""); }}
                  className="w-full h-10 px-3 pr-10 rounded-lg border border-gray-300 text-sm outline-none bg-white/70 focus:border-green-500"
                />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPwd ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              <PasswordStrength password={motDePasse} />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmer le mot de passe <span className="text-red-500">*</span>
              </label>
              <input
                type={showPwd ? "text" : "password"} placeholder="Retapez le mot de passe" value={confirmation}
                onChange={(e) => { setConfirmation(e.target.value); setErreur(""); }}
                className={`w-full h-10 px-3 rounded-lg border text-sm outline-none bg-white/70 ${confirmation && motDePasse !== confirmation ? "border-red-300 bg-red-50" : "border-gray-300 focus:border-green-500"}`}
              />
              {confirmation && motDePasse !== confirmation && (
                <p className="text-red-500 text-xs mt-1">Les mots de passe ne correspondent pas</p>
              )}
            </div>

            <button type="submit" disabled={loading}
              style={{
                width: "100%", height: "40px",
                background: "linear-gradient(135deg, #15803d, #166534)",
                border: "none", borderRadius: "10px",
                color: "white", fontSize: "14px", fontWeight: 500,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
              }}>
              {loading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
            </button>
          </form>
        )}

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">ou</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        <p className="text-center text-sm text-gray-500">
          <a href="/" className="text-green-700 font-medium hover:underline">Retour à la connexion</a>
        </p>
      </div>
    </AuthCard>
  );
}
