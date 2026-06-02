import { useEffect, useState } from "react";
import nature from "../assets/nature.png";
import logo from "../assets/image.png";

export default function EnAttente() {
  const [email, setEmail] = useState("");

  useEffect(() => {
    // Récupère l'email sauvegardé au moment de la tentative de connexion
    setEmail(localStorage.getItem("email") || "");
  }, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: `url(${nature})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "rgba(0,0,0,0.55)",
        backgroundBlendMode: "overlay",
      }}
    >
      <div className="rounded-2xl w-full max-w-lg overflow-hidden"
        style={{
          background: "linear-gradient(160deg, rgba(255,255,255,0.97) 0%, rgba(220,252,231,0.97) 100%)",
          boxShadow: "0 0 0 3px #15803d, 0 0 0 6px rgba(21,128,61,0.15), 0 24px 60px rgba(0,0,0,0.35)",
          border: "1px solid rgba(21,128,61,0.3)",
        }}>

        {/* ── En-tête ── */}
        <div className="px-6 py-5 text-center"
          style={{ background: "linear-gradient(135deg, #15803d, #166534)" }}>
          <div className="w-16 h-16 rounded-full mx-auto mb-2 p-1"
            style={{ background: "rgba(255,255,255,1)", border: "2px solid rgba(255,255,255,0.6)" }}>
            <img src={logo} alt="Logo" className="w-full h-full object-contain rounded-full" />
          </div>
          <h1 className="text-xl font-semibold text-white">Plateforme CIL</h1>
          <p className="text-green-100 text-sm mt-1">Sofitex — Gestion des données personnelles</p>
        </div>

        {/* ── Contenu ── */}
        <div className="p-8 text-center">

          {/* Icône horloge animée */}
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          {/* Badge statut */}
          <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-bold px-4 py-1.5 rounded-full mb-4">
            ⏳ EN ATTENTE DE VALIDATION
          </span>

          <h2 className="text-xl font-bold text-gray-800 mb-3">
            Votre compte est en cours de validation
          </h2>

          {email && (
            <p className="text-sm text-gray-500 mb-2">
              Compte associé à <strong className="text-gray-700">{email}</strong>
            </p>
          )}

          <p className="text-sm text-gray-500 mb-8">
            Votre demande d'accès a bien été enregistrée.<br />
            Un administrateur doit valider votre compte avant que vous puissiez vous connecter.
          </p>

          {/* Étapes de progression */}
          <div className="flex items-center justify-center gap-3 mb-8">

            {/* Étape 1 : Inscription ✓ */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center shadow">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-green-600">Inscription</span>
            </div>

            <div className="flex-1 h-1 bg-yellow-300 rounded-full mb-5" />

            {/* Étape 2 : Validation (en cours) */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center shadow animate-pulse">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-yellow-600">Validation</span>
            </div>

            <div className="flex-1 h-1 bg-gray-200 rounded-full mb-5" />

            {/* Étape 3 : Accès (verrouillé) */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center shadow">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-xs text-gray-400">Accès</span>
            </div>

          </div>

          {/* Info box */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-6 text-left">
            <p className="text-xs text-blue-700 font-semibold mb-1">ℹ️ Que se passe-t-il ensuite ?</p>
            <p className="text-xs text-blue-600">
              Une fois votre compte validé par l'administrateur, vous pourrez vous connecter normalement et accéder à votre tableau de bord.
            </p>
          </div>

          {/* Boutons */}
          <div className="flex gap-3">
            <button
              onClick={() => window.location.href = "/"}
              className="flex-1 py-2.5 rounded-xl border-2 border-green-700 text-green-700 text-sm font-semibold hover:bg-green-50 transition">
              ← Retour à la connexion
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition"
              style={{ background: "linear-gradient(135deg, #15803d, #166534)" }}>
              🔄 Vérifier à nouveau
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
