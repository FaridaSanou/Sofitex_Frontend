import { useState } from "react";
import nature from "../assets/nature.png"
import logo from "../assets/image.png"
import Chargement from "../components/chargement";


// ─── Icônes SVG ───────────────────────────────────────────────────────────────
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
  </svg>
);


// ─── Composant Login ──────────────────────────────────────────────────────────
export default function Login() {
  const [email, setEmail]           = useState("");
  const [motdepasse, setMotdepasse] = useState("");
  const [showPwd, setShowPwd]       = useState(false);
  const [erreurs, setErreurs]       = useState({});
  const [loading, setLoading]       = useState(false);

  const [isloading , setIsloading] = useState(false)

  // ── Validation ───────────────────────────────────────────────────────────────
  const valider = () => {
    const e = {};
    if (!email.trim()) e.email = "Champ requis";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Email invalide";
    if (!motdepasse) e.motdepasse = "Champ requis";
    return e;
  };

  // ── Soumission avec fetch ─────────────────────────────────────────────────────
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
      // const home = {
      //   ROLE_ADMINISTRATEUR: "/dashboard",
      //   ROLE_DPO: "/dpo",
      //   ROLE_CIL: "/cil",
      //   ROLE_DG: "/dg",
      //   ROLE_UTILISATEUR_METIER: "/metier",
      // };
      // window.location.href = home[data.role] || "/dashboard";
      // window.location.href = "/dashboard";
      setIsloading(true)
    } catch (err) {
      setErreurs({ global: "Impossible de contacter le serveur" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: `url(${nature})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "rgba(0, 0, 0, 0.55)",
        backgroundBlendMode: "overlay",
      }}
    >
      {/* ── Carte formulaire ── */}
      <div className="rounded-2xl w-full max-w-lg overflow-hidden"
        style={{
          background: "linear-gradient(160deg, rgba(255,255,255,0.97) 0%, rgba(220,252,231,0.97) 100%)",
          boxShadow: "0 0 0 3px #15803d, 0 0 0 6px rgba(21,128,61,0.15), 0 24px 60px rgba(0,0,0,0.35)",
          border: "1px solid rgba(21,128,61,0.3)",
        }}>

        {/* ── En-tête vert ── */}
        <div className="px-6 py-4 text-center"
          style={{ background: "linear-gradient(135deg, #15803d, #166534)" }}>
          <div className="w-16 h-16 rounded-full mx-auto mb-2 p-1"
            style={{ background: "rgba(255,255,255,1)", border: "2px solid rgba(255,255,255,0.6)" }}>
            <img
              src={logo}
              alt="Logo"
              className="w-full h-full object-contain rounded-full"
            />
          </div>
          <h1 className="text-xl font-semibold text-white">Connexion</h1>
          <p className="text-green-100 text-sm mt-1">Accédez à votre espace personnel de la plateforme</p>
        </div>

        {/* ── Contenu formulaire ── */}
        <div className="p-6">

          {/* Erreur globale */}
          {erreurs.global && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
              ⚠️ {erreurs.global}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>

            {/* Email */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse e-mail <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder="Ex : admin@cil.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErreurs(p => ({ ...p, email: "" }));
                }}
                className={`w-full h-10 px-3 rounded-lg border text-sm outline-none bg-white/70
                  ${erreurs.email ? "border-red-300 bg-red-50" : "border-gray-300 focus:border-green-500"}`}
              />
              {erreurs.email && <p className="text-red-500 text-xs mt-1">{erreurs.email}</p>}
            </div>

            {/* Mot de passe */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder="Votre mot de passe"
                  value={motdepasse}
                  onChange={(e) => {
                    setMotdepasse(e.target.value);
                    setErreurs(p => ({ ...p, motdepasse: "" }));
                  }}
                  className={`w-full h-10 px-3 pr-10 rounded-lg border text-sm outline-none bg-white/70
                    ${erreurs.motdepasse ? "border-red-300 bg-red-50" : "border-gray-300 focus:border-green-500"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Afficher/masquer le mot de passe"
                >
                  {showPwd ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {erreurs.motdepasse && <p className="text-red-500 text-xs mt-1">{erreurs.motdepasse}</p>}
            </div>

            {/* Bouton Se connecter */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", height: "40px",
                background: "linear-gradient(135deg, #15803d, #166534)",
                border: "none", borderRadius: "10px",
                color: "white", fontSize: "14px", fontWeight: 500,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "Connexion en cours..." : "Se connecter"}
            </button>

          </form>

          {/* Séparateur */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">ou</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Lien Créer un compte */}
          <p className="text-center text-sm text-gray-500">
            Pas encore de compte ?{" "}
            <a href="/register" className="text-green-700 font-medium hover:underline">
              Créer un compte
            </a>
          </p>

        </div>
      </div>
      { isloading && <Chargement texte="Bien venu ............." /> }
    </div>
  );
}
