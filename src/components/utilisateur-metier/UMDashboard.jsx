import { Icon } from "../ui/Icon";
import { BadgeStatut } from "../ui/BadgeStatut";
import { formatDate } from "../../utils/date";

export default function UMDashboard({ stats, traitements, onNewTraitement, onDetailTraitement }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s, i) => (
          <div key={i} className={`bg-white rounded-2xl border p-4 shadow-sm ${s.color}`}>
            <div className="mb-1"><Icon name={s.icon} className="w-6 h-6 text-gray-600" /></div>
            <p className="text-2xl font-bold text-gray-800">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-gray-800">Traitements récents</h2>
          <button onClick={onNewTraitement} className="bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-800">+ Nouveau traitement</button>
        </div>
        <div className="space-y-3">
          {traitements.slice(0, 3).map(t => (
            <div key={t.idTraitement} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-green-50 transition-all cursor-pointer" onClick={() => onDetailTraitement(t)}>
              <div>
                <p className="font-semibold text-sm text-gray-800">{t.description}</p>
                <p className="text-xs text-gray-400">{t.department} · {formatDate(t.dateCreation)}</p>
              </div>
              <BadgeStatut statut={t.statut} envoyeAuDpo={t.envoyeAuDpo} />
            </div>
          ))}
          {traitements.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-4">Aucun traitement. Créez votre premier traitement !</p>
          )}
        </div>
      </div>
    </div>
  );
}
