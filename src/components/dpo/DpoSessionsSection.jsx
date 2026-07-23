import { formatDateTime } from "../../utils/date";
import { statutBadge } from "../ui/BadgeStatut";

export default function DpoSessionsSection({
  sessions, showForm, setShowForm, form, setForm,
  handleCreateSession, handleChangeStatut,
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Sessions de collecte</h2>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-green-700 text-white rounded-xl text-sm font-medium hover:bg-green-800 transition">
          + Nouvelle session
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreateSession} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
          <h3 className="font-bold text-gray-800">Créer une session</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la session <span className="text-red-500">*</span></label>
              <input type="text" value={form.nomSession} onChange={(e) => setForm((p) => ({ ...p, nomSession: e.target.value }))} placeholder="Ex: Collecte des données RH 2026" required className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date début</label>
              <input type="datetime-local" value={form.dateDebut} onChange={(e) => setForm((p) => ({ ...p, dateDebut: e.target.value }))} required className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
              <input type="datetime-local" value={form.dateFin} onChange={(e) => setForm((p) => ({ ...p, dateFin: e.target.value }))} required className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select value={form.typeCollecte} onChange={(e) => setForm((p) => ({ ...p, typeCollecte: e.target.value }))} className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm">
                <option value="EN_LIGNE">En ligne</option>
                <option value="TERRAIN">Terrain</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lieu</label>
              <input type="text" value={form.lieu} onChange={(e) => setForm((p) => ({ ...p, lieu: e.target.value }))} className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm" />
          </div>
          <div className="flex gap-3">
            <button type="submit" className="px-6 py-2 bg-green-700 text-white rounded-xl text-sm font-medium hover:bg-green-800 transition">Créer</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 border border-gray-300 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition">Annuler</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Nom</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Dates</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Traitements</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Statut</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">DPO</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sessions.map((s) => (
                <tr key={s.idSession} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-gray-800">{s.nomSession || s.description || `Session #${s.idSession}`}</p>
                    <p className="text-xs text-gray-400">{s.lieu || "—"}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{s.typeCollecte === "EN_LIGNE" ? "En ligne" : "Terrain"}</span>
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-500">
                    <p>Du {formatDateTime(s.dateDebut)}</p>
                    <p>Au {formatDateTime(s.dateFin)}</p>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">{s.nombreTraitements ?? 0}</span>
                  </td>
                  <td className="px-5 py-4">{statutBadge(s.statutSession)}</td>
                  <td className="px-5 py-4 text-sm text-gray-600">{s.dpoNomComplet || "—"}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-center gap-2">
                      {s.statutSession === "EN_COURS" && (
                        <>
                          <button onClick={() => handleChangeStatut(s.idSession, "TERMINEE")} className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200">Terminer</button>
                          <button onClick={() => handleChangeStatut(s.idSession, "ANNULEE")} className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-xs font-medium hover:bg-red-200">Annuler</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sessions.length === 0 && <div className="py-12 text-center text-gray-400 text-sm">Aucune session</div>}
        </div>
      </div>
    </div>
  );
}
