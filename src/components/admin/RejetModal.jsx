import { useState } from "react";

export default function RejetModal({ demande, onConfirm, onClose }) {
  const [motif, setMotif] = useState("");
  const nomComplet = `${demande.prenom ?? ""} ${demande.nom ?? ""}`.trim();
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2">Rejeter la demande</h3>
        <p className="text-sm text-gray-500 mb-4">Demande de <strong>{nomComplet}</strong></p>
        <label className="block text-sm font-medium text-gray-700 mb-1">Motif du rejet *</label>
        <textarea className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          rows={4} placeholder="Expliquez la raison du rejet..." value={motif} onChange={(e) => setMotif(e.target.value)} />
        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50 transition">Annuler</button>
          <button onClick={() => motif.trim() && onConfirm(motif)} disabled={!motif.trim()}
            className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition disabled:opacity-40 disabled:cursor-not-allowed">
            Confirmer le rejet
          </button>
        </div>
      </div>
    </div>
  );
}
