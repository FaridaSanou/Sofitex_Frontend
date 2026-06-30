import { useState, useEffect } from "react";
import api from "../../services/api";
import { SkeletonRow } from "../ui/SkeletonRow";
import { formatDateTime } from "../../utils/date";

const typeActionBadge = (type) => {
  const cls = "px-2 py-0.5 rounded-full text-xs font-medium";
  const map = {
    CREATION: "bg-green-100 text-green-700",
    MODIFICATION: "bg-blue-100 text-blue-700",
    SUPPRESSION: "bg-red-100 text-red-700",
    CONSULTATION: "bg-gray-100 text-gray-700",
    CONNEXION: "bg-purple-100 text-purple-700",
  };
  return <span className={`${cls} ${map[type] || "bg-gray-100 text-gray-600"}`}>{type}</span>;
};

const moduleBadge = (module) => {
  const cls = "px-2 py-0.5 rounded-full text-xs font-medium";
  const map = {
    DECLARATION: "bg-indigo-100 text-indigo-700",
    DEMANDE: "bg-amber-100 text-amber-700",
    PLAINTE: "bg-pink-100 text-pink-700",
    UTILISATEUR: "bg-cyan-100 text-cyan-700",
    DONNEE: "bg-teal-100 text-teal-700",
    TRAITEMENT: "bg-orange-100 text-orange-700",
    SESSION: "bg-lime-100 text-lime-700",
  };
  return <span className={`${cls} ${map[module] || "bg-gray-100 text-gray-600"}`}>{module}</span>;
};

const resultatBadge = (resultat) => {
  const cls = "px-2 py-0.5 rounded-full text-xs font-medium";
  const map = {
    SUCCES: "bg-green-100 text-green-700",
    ECHEC: "bg-red-100 text-red-700",
  };
  return <span className={`${cls} ${map[resultat] || "bg-gray-100 text-gray-600"}`}>{resultat}</span>;
};

export default function HistoriqueSection() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get("/admin/journal-audit");
        setLogs(res.data);
      } catch (err) {
        console.error("Erreur chargement historique", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-800">Journal d'audit</h2>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["Date", "Action", "Module", "Résultat", "Utilisateur"].map((h) => (
                  <th key={h} className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading
                ? [1, 2, 3].map((i) => <SkeletonRow key={i} cols={5} />)
                : logs.map((log) => (
                    <tr key={log.idJournal} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-4 text-gray-500 text-xs">{formatDateTime(log.dateAction)}</td>
                      <td className="px-5 py-4">{typeActionBadge(log.typeAction)}</td>
                      <td className="px-5 py-4">{moduleBadge(log.moduleConserne)}</td>
                      <td className="px-5 py-4">{resultatBadge(log.resultatAction)}</td>
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-medium text-gray-800 text-xs">{log.utilisateurNomPrenom || "—"}</p>
                          <p className="text-gray-400 text-xs">{log.utilisateurRole || ""}</p>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
          {!loading && logs.length === 0 && (
            <div className="py-12 text-center text-gray-400 text-sm">Aucun historique disponible</div>
          )}
        </div>
      </div>
    </div>
  );
}
