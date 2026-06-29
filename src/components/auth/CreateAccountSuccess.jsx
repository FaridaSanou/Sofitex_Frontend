export default function CreateAccountSuccess({ onReset }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: "linear-gradient(160deg, rgba(255,255,255,0.97) 0%, rgba(220,252,231,0.97) 100%)",
        boxShadow: "0 0 0 3px #15803d, 0 0 0 6px rgba(21,128,61,0.15), 0 24px 60px rgba(0,0,0,0.35)",
        border: "1px solid rgba(21,128,61,0.3)",
        maxWidth: "32rem", margin: "auto", borderRadius: "1rem",
      }}>
      <div className="rounded-2xl shadow-2xl p-10 w-full max-w-lg text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✓</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Compte créé avec succès !</h2>
        <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full mb-4">EN_ATTENTE</span>
        <p className="text-sm text-gray-500 mb-6">
          Votre demande a bien été enregistrée.<br />Un administrateur validera votre compte sous peu.
        </p>
        <div className="flex gap-3">
          <button onClick={onReset}
            className="flex-1 border border-gray-300 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            ← Créer un autre compte
          </button>
          <a href="/"
            className="flex-1 bg-green-700 text-white text-sm px-4 py-2 rounded-lg hover:bg-green-800 transition-colors text-center no-underline">
            Se connecter →
          </a>
        </div>
      </div>
    </div>
  );
}
