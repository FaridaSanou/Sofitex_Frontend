import { useState, useMemo } from "react";
import { formatDate } from "../../utils/date";
import { declarationStatutBadge } from "../ui/BadgeStatut";
import { Icon } from "../ui/Icon";

export default function DpoDeclarationsSection({
  declarations, onNew, onDetail, onSoumettre, onModifier,
}) {
  const [sortField, setSortField] = useState("dateSoumission");
  const [sortDir, setSortDir] = useState("desc");

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDir(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const sortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDir === "asc"
      ? <Icon name="arrow-up" className="w-3 h-3 ml-1 inline" />
      : <Icon name="arrow-down" className="w-3 h-3 ml-1 inline" />;
  };

  const sorted = useMemo(() => {
    const list = [...declarations];
    list.sort((a, b) => {
      let va, vb;
      if (sortField === "denomination") {
        va = (a.traitementDescription || a.denominationTraitement || "").toLowerCase();
        vb = (b.traitementDescription || b.denominationTraitement || "").toLowerCase();
      } else if (sortField === "dateSoumission") {
        va = a.dateSoumission || "";
        vb = b.dateSoumission || "";
      } else if (sortField === "idDeclaration") {
        va = a.idDeclaration || 0;
        vb = b.idDeclaration || 0;
      } else if (sortField === "typeDeclaration") {
        va = (a.typeDeclaration || "").toLowerCase();
        vb = (b.typeDeclaration || "").toLowerCase();
      } else if (sortField === "statut") {
        va = (a.statut || "").toLowerCase();
        vb = (b.statut || "").toLowerCase();
      } else {
        return 0;
      }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [declarations, sortField, sortDir]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Déclarations</h2>
        <button onClick={onNew} className="px-4 py-2 bg-green-700 text-white rounded-xl text-sm font-medium hover:bg-green-800 transition">
          + Nouvelle déclaration
        </button>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th onClick={() => toggleSort("idDeclaration")} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase cursor-pointer hover:text-gray-700 select-none">
                  ID{sortIcon("idDeclaration")}
                </th>
                <th onClick={() => toggleSort("typeDeclaration")} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase cursor-pointer hover:text-gray-700 select-none">
                  Type{sortIcon("typeDeclaration")}
                </th>
                <th onClick={() => toggleSort("denomination")} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase cursor-pointer hover:text-gray-700 select-none">
                  Traitement associé{sortIcon("denomination")}
                </th>
                <th onClick={() => toggleSort("dateSoumission")} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase cursor-pointer hover:text-gray-700 select-none">
                  Date{sortIcon("dateSoumission")}
                </th>
                <th onClick={() => toggleSort("statut")} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase cursor-pointer hover:text-gray-700 select-none">
                  Statut{sortIcon("statut")}
                </th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sorted.map((d) => (
                <tr key={d.idDeclaration} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-4 font-mono text-xs text-gray-400">#{d.idDeclaration}</td>
                  <td className="px-5 py-4">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{d.typeDeclaration || "N/A"}</span>
                  </td>
                  <td className="px-5 py-4 font-medium text-gray-800">{d.traitementDescription || d.denominationTraitement || "—"}</td>
                  <td className="px-5 py-4 text-xs text-gray-500">{formatDate(d.dateSoumission)}</td>
                  <td className="px-5 py-4">{declarationStatutBadge(d.statut)}</td>
                  <td className="px-5 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => onDetail(d)} className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200">Voir</button>
                      {(d.statut === "BROUILLON" || d.statut === "REJETEE_DG" || d.statut === "REJETEE_CIL" || d.statut === "EN_ATTENTE") && (
                        <>
                          <button onClick={() => onModifier?.(d)} className="px-3 py-1 rounded-lg text-xs font-medium border border-green-600 text-green-700 hover:bg-green-50">Modifier</button>
                        </>
                      )}
                      {(d.statut === "REJETEE_DG" || d.statut === "REJETEE_CIL" || d.statut === "EN_ATTENTE") && (
                          <button onClick={() => onSoumettre(d)} className="p-1 text-green-700 rounded-lg text-xs hover:bg-green-100 flex items-center" title="Soumettre">
                            <Icon name="send" className="w-3.5 h-3.5 rotate-45" />
                          </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {declarations.length === 0 && <div className="py-12 text-center text-gray-400 text-sm">Aucune déclaration</div>}
        </div>
      </div>
    </div>
  );
}
