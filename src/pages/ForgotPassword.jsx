import { useState } from "react";
import AuthCard from "../components/auth/AuthCard";
import logo from "../assets/image.png";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [erreur, setErreur] = useState("");

  const valider = () => {
    if (!email.trim()) return "Veuillez saisir votre adresse e-mail";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return "Adresse e-mail invalide";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = valider();
    if (err) { setErreur(err); return; }
    setLoading(true);
    setMessage(null);
    setErreur("");
    try {
      const response = await fetch("http://localhost:8080/api/auth/mot-de-passe-oublie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        setErreur("Aucun compte trouvé avec cette adresse e-mail");
        return;
      }
      setMessage("Un lien de réinitialisation vous a été envoyé par e-mail.");
    } catch (err) {
      setErreur("Impossible de contacter le serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Mot de passe oublié" subtitle="Saisissez votre e-mail pour recevoir un lien de réinitialisation" logo={logo}>
      <div className="p-6">
        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 mb-4">{message}</div>
        )}
        {erreur && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">{erreur}</div>
        )}

        {!message && (
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse e-mail <span className="text-red-500">*</span>
              </label>
              <input type="email" placeholder="Ex : admin@cil.com" value={email}
                onChange={(e) => { setEmail(e.target.value); setErreur(""); }}
                className={`w-full h-10 px-3 rounded-lg border text-sm outline-none bg-white/70 ${erreur ? "border-red-300 bg-red-50" : "border-gray-300 focus:border-green-500"}`}
              />
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
              {loading ? "Envoi en cours..." : "Envoyer le lien"}
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
