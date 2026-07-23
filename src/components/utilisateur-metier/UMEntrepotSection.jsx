import { useState } from "react";
import { Plus, Search, Upload, FileSpreadsheet } from "lucide-react";
import { formatDate } from "../../utils/date";
import api from "../../services/api";
import ModalAjouterDonnees from "./ModalAjouterDonnees";

export default function UMEntrepotSection({ entrepotData, entrepotRecherche, onRechercheChange, traitements, onAjouterDonnees, onRefresh }) {
  const [showModal, setShowModal] = useState(false);
  const [etape, setEtape] = useState("menu"); // "menu" | "manuel" | "excel"
  const [selectedTraitement, setSelectedTraitement] = useState("");
  const [excelFile, setExcelFile] = useState(null);
  const [importing, setImporting] = useState(false);

  const defaultId = traitements.length === 1 ? String(traitements[0].idTraitement) : "";
  const resolvedId = selectedTraitement || defaultId;

  const filtered = entrepotData.filter(d => !entrepotRecherche
    || d.personneNomComplet?.toLowerCase().includes(entrepotRecherche.toLowerCase())
    || d.typeDonneeNom?.toLowerCase().includes(entrepotRecherche.toLowerCase())
    || d.valeur?.toLowerCase().includes(entrepotRecherche.toLowerCase()));

  const handleImportExcel = async () => {
    if (!excelFile) return;
    setImporting(true);
    try {
      const formData = new FormData();
      formData.append("fichier", excelFile);
      await api.post("/entrepot/import-excel", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setShowModal(false);
      setExcelFile(null);
      setEtape("menu");
      onRefresh?.();
    } catch {
      alert("Erreur lors de l'import Excel.");
    } finally {
      setImporting(false);
    }
  };

  const openManuel = () => {
    if (traitements.length === 0) return;
    if (resolvedId) {
      const t = traitements.find(t => t.idTraitement === Number(resolvedId));
      if (t) {
        setShowModal(false);
        setEtape("menu");
        setSelectedTraitement("");
        onAjouterDonnees(t);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Entrepôt de données</h2>
        <button onClick={() => { setShowModal(true); setEtape("menu"); }} className="flex items-center gap-2 px-4 py-2 bg-green-700 text-white rounded-xl text-sm font-semibold hover:bg-green-800 transition">
          <Plus className="w-4 h-4" /> Ajouter des données
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={entrepotRecherche} onChange={e => onRechercheChange(e.target.value)}
          placeholder="Rechercher une donnée (nom, type, valeur...)"
          className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-green-50 text-green-800">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Personne</th>
                <th className="px-4 py-2 text-left font-semibold">Type</th>
                <th className="px-4 py-2 text-left font-semibold">Valeur</th>
                <th className="px-4 py-2 text-left font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.slice(0, 50).map(d => (
                <tr key={d.idDonnee} className="hover:bg-green-50">
                  <td className="px-4 py-2 font-medium text-gray-800">{d.personneNomComplet || "—"}</td>
                  <td className="px-4 py-2 text-gray-600">{d.typeDonneeNom}</td>
                  <td className="px-4 py-2 text-gray-600">{d.valeur}</td>
                  <td className="px-4 py-2 text-xs text-gray-500">{formatDate(d.dateCollecte)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={4} className="py-12 text-center text-gray-400 text-sm">Aucune donnée trouvée</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => { setShowModal(false); setEtape("menu"); setExcelFile(null); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>

            {etape === "menu" && (
              <>
                <h3 className="text-lg font-bold text-gray-800 mb-4">Ajouter des données</h3>
                <p className="text-sm text-gray-500 mb-6">Choisissez une méthode d'ajout :</p>
                <div className="space-y-3">
                  <button onClick={() => {
                    if (traitements.length === 0) return;
                    if (traitements.length === 1) {
                      const t = traitements[0];
                      setShowModal(false);
                      setEtape("menu");
                      onAjouterDonnees(t);
                    } else {
                      setEtape("manuel");
                    }
                  }} disabled={traitements.length === 0} className="w-full flex items-center gap-3 p-4 bg-[#F0FDF4] border border-green-500 rounded-xl text-green-800 font-semibold text-sm hover:bg-green-100 disabled:opacity-40 disabled:cursor-not-allowed">
                    <Upload className="w-5 h-5 text-green-700" />
                    <div className="text-left">
                      <p>Saisie manuelle</p>
                      <p className="text-xs text-gray-500 font-normal">Ajouter des données une par une</p>
                    </div>
                  </button>
                  <button onClick={() => setEtape("excel")} className="w-full flex items-center gap-3 p-4 bg-[#F0FDF4] border border-green-500 rounded-xl text-green-800 font-semibold text-sm hover:bg-green-100">
                    <FileSpreadsheet className="w-5 h-5 text-green-700" />
                    <div className="text-left">
                      <p>Import Excel</p>
                      <p className="text-xs text-gray-500 font-normal">Importer un fichier .xlsx</p>
                    </div>
                  </button>
                </div>
                <button onClick={() => { setShowModal(false); setEtape("menu"); }} className="w-full mt-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Fermer</button>
              </>
            )}

            {etape === "manuel" && (
              <>
                <h3 className="text-lg font-bold text-gray-800 mb-4">Saisie manuelle</h3>
                <p className="text-sm text-gray-500 mb-4">Sélectionnez le traitement destinataire :</p>
                <select value={resolvedId} onChange={e => setSelectedTraitement(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-4">
                  <option value="">-- Sélectionner un traitement --</option>
                  {traitements.sort((a, b) => (a.nom || a.description || "").localeCompare(b.nom || b.description || "")).map(t => (<option key={t.idTraitement} value={t.idTraitement}>{t.nom || t.description || `#${t.idTraitement}`}</option>))}
                </select>
                <div className="flex gap-3">
                  <button onClick={() => setEtape("menu")} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Retour</button>
                  <button onClick={openManuel} disabled={!resolvedId} className="flex-1 py-2 bg-green-700 text-white rounded-lg text-sm font-semibold hover:bg-green-800 disabled:opacity-40">Confirmer</button>
                </div>
              </>
            )}

            {etape === "excel" && (
              <>
                <h3 className="text-lg font-bold text-gray-800 mb-4">Import Excel</h3>
                <p className="text-sm text-gray-500 mb-2">Les données seront importées directement dans l'entrepôt.</p>
                <details className="mb-4 text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
                  <summary className="cursor-pointer font-medium text-gray-600">Format attendu (.xlsx)</summary>
                  <div className="mt-2 space-y-2">
                    <p><strong>Format A — Colonnes prédéfinies :</strong><br />
                    <code>nom</code>* · <code>prenom</code>* · <code>email</code> · <code>telephone</code> · <code>date_naissance</code> · <code>numero_cnib</code> · <code>profession</code></p>
                    <p><strong>Format B — Type/Valeur personnalisés :</strong><br />
                    <code>nom</code>* · <code>prenom</code>* · <code>email</code> · <code>telephone</code> · <code>type_donnee</code>* · <code>valeur</code>*</p>
                    <p className="text-gray-400">* : obligatoire · La 1ʳᵉ ligne doit contenir les en-têtes</p>
                  </div>
                </details>
                <label className="block border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-green-500 mb-4">
                  <FileSpreadsheet className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  {excelFile ? (
                    <p className="text-sm font-medium text-green-700">{excelFile.name}</p>
                  ) : (
                    <p className="text-sm text-gray-500">Cliquez pour sélectionner un fichier .xlsx</p>
                  )}
                  <input type="file" accept=".xlsx" className="hidden" onChange={e => setExcelFile(e.target.files[0])} />
                </label>
                <div className="flex gap-3">
                  <button onClick={() => { setEtape("menu"); setExcelFile(null); }} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Retour</button>
                  <button onClick={handleImportExcel} disabled={!excelFile || importing} className="flex-1 py-2 bg-green-700 text-white rounded-lg text-sm font-semibold hover:bg-green-800 disabled:opacity-40">
                    {importing ? "Importation..." : "Importer"}
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
