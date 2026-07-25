import { useEffect, useState } from "react";
import AuthCard from "../components/auth/AuthCard";
import logo from "../assets/image.png";

export default function EnAttente() {
  const [email, setEmail] = useState("");
  const [statut, setStatut] = useState("en_attente");
  const [motif, setMotif] = useState("");

  useEffect(() => {
    setEmail(localStorage.getItem("email") || "");
    const params = new URLSearchParams(window.location.search);
    setStatut(params.get("statut") || "en_attente");
    setMotif(params.get("motif") || "");
  }, []);

  if (statut === "rejetee") {
    return (
      <AuthCard title="SOFITEX" subtitle="Gestion des données à caractère personnel" logo={logo}>
        <div className="p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          <span className="inline-block bg-red-100 text-red-800 text-xs font-bold px-4 py-1.5 rounded-full mb-4">
            DEMANDE REJETÉE
          </span>

          <h2 className="text-xl font-bold text-gray-800 mb-3">Votre demande d'accès a été rejetée</h2>

          {email && (
            <p className="text-sm text-gray-500 mb-2">
              Compte associé à <strong className="text-gray-700">{email}</strong>
            </p>
          )}

          {motif && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-xs font-semibold text-red-700 mb-1">Motif du rejet :</p>
              <p className="text-sm text-red-600">{motif}</p>
            </div>
          )}

          <button onClick={() => window.location.href = "/"}
            className="w-full py-2.5 rounded-xl border-2 border-green-700 text-green-700 text-sm font-semibold hover:bg-green-50 transition">
            ← Retour à la connexion
          </button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="SOFITEX" subtitle="Gestion des données à caractère personnel" logo={logo}>
      <div className="p-8 text-center">
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-bold px-4 py-1.5 rounded-full mb-4">
          ⏳ EN ATTENTE DE VALIDATION
        </span>

        <h2 className="text-xl font-bold text-gray-800 mb-3">Votre compte est en cours de validation</h2>

        {email && (
          <p className="text-sm text-gray-500 mb-2">
            Compte associé à <strong className="text-gray-700">{email}</strong>
          </p>
        )}

        <p className="text-sm text-gray-500 mb-8">
          Votre demande d'accès a bien été enregistrée.<br />
          Un administrateur doit valider votre compte avant que vous puissiez vous connecter et acceder à votre tableau de bord
        </p>

        <div className="flex gap-3">
          <button onClick={() => window.location.href = "/"}
            className="flex-1 py-2.5 rounded-xl border-2 border-green-700 text-green-700 text-sm font-semibold hover:bg-green-50 transition">
            ← Retour à la connexion
          </button>
          <button onClick={() => window.location.reload()}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition"
            style={{ background: "linear-gradient(135deg, #15803d, #166534)" }}>
            🔄 Vérifier à nouveau
          </button>
        </div>
      </div>
    </AuthCard>
  );
}
