import { useState } from "react";
import logoImage from "../assets/image.png";
import backgroundImage from "../assets/nature.png";

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

    // Validation
    const e2 = valider();
    if (Object.keys(e2).length) { setErreurs(e2); return; }

    setLoading(true);

    try {
      alert("Tentative de connexion avec ");
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, motDePasse: motdepasse }),
      });

      if (!response.ok) {
        // Le serveur a répondu avec une erreur (401, 403, etc.)
        setErreurs({ global: "Email ou mot de passe incorrect" });
        return;
      }
     alert("Connexion réussie, traitement de la réponse...");
      const data = await response.json();
      console.log("Connecté :", data);

      // Sauvegarde le token si ton backend en renvoie un
      // localStorage.setItem("token", data.token);

      // Redirige vers le dashboard
      window.location.href = "/dashboard";

    } catch (err) {
      // Erreur réseau (backend éteint, CORS, etc.)
      setErreurs({ global: "Impossible de contacter le serveur" });
      alert("Erreur lors de la connexion : " );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Fond */}
      <div className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: `url(${backgroundImage})` }}>
      </div>
      
      {/* Formulaire centré */}
      <div className="fixed inset-0 flex items-center justify-center p-4 z-10">
        <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md">

        {/* Logo centré */}
        <div className="flex justify-center mb-2">
          <img
            src={logoImage}
            alt="Logo"
            className="w-20 h-20 object-contain"
          />
        </div>

        {/* Titre */}
        <h1 className="text-2xl text-center font-semibold text-gray-900 mb-1">
          Connexion
        </h1>
        <p className="text-sm text-center text-gray-500 mb-6">
          Accédez à votre espace personnel de la plateforme
        </p>

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
              placeholder="Ex : a.traore@institution.bf"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErreurs(p => ({ ...p, email: "" }));
              }}
              className={`w-full h-10 px-3 rounded-lg border text-sm outline-none bg-gray-50
                ${erreurs.email
                  ? "border-red-300 bg-red-50"
                  : "border-gray-300 focus:border-green-500"
                }`}
            />
            {erreurs.email && (
              <p className="text-red-500 text-xs mt-1">{erreurs.email}</p>
            )}
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
                className={`w-full h-10 px-3 pr-10 rounded-lg border text-sm outline-none bg-gray-50
                  ${erreurs.motdepasse
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300 focus:border-green-500"
                  }`}
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
            {erreurs.motdepasse && (
              <p className="text-red-500 text-xs mt-1">{erreurs.motdepasse}</p>
            )}
          </div>

          {/* Bouton Se connecter */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white font-medium rounded-lg text-sm transition-colors"
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
    </>
  );
}
