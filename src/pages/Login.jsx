import { useState } from "react";
import AuthCard from "../components/auth/AuthCard";
import { EyeIcon, EyeOffIcon } from "../components/auth/EyeIcon";
import logo from "../assets/image.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [motdepasse, setMotdepasse] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [erreurs, setErreurs] = useState({});
  const [loading, setLoading] = useState(false);

  const valider = () => {
    const e = {};
    if (!email.trim()) e.email = "Champ requis";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Email invalide";
    if (!motdepasse) e.motdepasse = "Champ requis";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e2 = valider();
    if (Object.keys(e2).length) { setErreurs(e2); return; }
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, motDePasse: motdepasse }),
      });
      if (!response.ok) {
        setErreurs({ global: "Email ou mot de passe incorrect" });
        return;
      }
      const data = await response.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("email", data.email);
      if (data.id) localStorage.setItem("userId", String(data.id));
      if (data.role === "ROLE_DPO" && data.id) {
        localStorage.setItem("dpoId", String(data.id));
      }
      if (data.role === "ROLE_UTILISATEUR_METIER" && data.id) {
        localStorage.setItem("utilisateurMetierId", String(data.id));
      }
      const home = {
        ROLE_ADMINISTRATEUR: "/dashboard",
        ROLE_DPO: "/dpo",
        ROLE_DG: "/dg",
        ROLE_UTILISATEUR_METIER: "/metier",
      };
      window.location.href = home[data.role] || "/dashboard";
    } catch (err) {
      setErreurs({ global: "Impossible de contacter le serveur" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Connexion" subtitle="Accédez à votre espace personnel de la plateforme" logo={logo}>
      <div className="p-6">
        {erreurs.global && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
            ⚠️ {erreurs.global}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adresse e-mail <span className="text-red-500">*</span>
            </label>
            <input
              type="email" placeholder="Ex : admin@cil.com" value={email}
              onChange={(e) => { setEmail(e.target.value); setErreurs(p => ({ ...p, email: "" })); }}
              className={`w-full h-10 px-3 rounded-lg border text-sm outline-none bg-white/70 ${erreurs.email ? "border-red-300 bg-red-50" : "border-gray-300 focus:border-green-500"}`}
            />
            {erreurs.email && <p className="text-red-500 text-xs mt-1">{erreurs.email}</p>}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"} placeholder="Votre mot de passe" value={motdepasse}
                onChange={(e) => { setMotdepasse(e.target.value); setErreurs(p => ({ ...p, motdepasse: "" })); }}
                className={`w-full h-10 px-3 pr-10 rounded-lg border text-sm outline-none bg-white/70 ${erreurs.motdepasse ? "border-red-300 bg-red-50" : "border-gray-300 focus:border-green-500"}`}
              />
              <button type="button" onClick={() => setShowPwd(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label="Afficher/masquer le mot de passe">
                {showPwd ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {erreurs.motdepasse && <p className="text-red-500 text-xs mt-1">{erreurs.motdepasse}</p>}
          </div>

          <div className="text-right mb-4">
            <a href="/mot-de-passe-oublie" className="text-sm text-green-700 hover:underline font-medium">Mot de passe oublié ?</a>
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
            {loading ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">ou</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <p className="text-center text-sm text-gray-500">
          Pas encore de compte ?{" "}
          <a href="/register" className="text-green-700 font-medium hover:underline">Créer un compte</a>
        </p>
      </div>
    </AuthCard>
  );
}
