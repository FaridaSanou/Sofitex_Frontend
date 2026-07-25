import { useState, useEffect } from "react";
import { Plus, Search, Upload, FileSpreadsheet, User, Check, X, Link2 } from "lucide-react";
import { formatDate } from "../../utils/date";
import api from "../../services/api";

const inp = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500";

export default function UMEntrepotSection({ entrepotData, entrepotRecherche, onRechercheChange, traitements }) {
  const [showModal, setShowModal] = useState(false);
  const [etape, setEtape] = useState("menu");
  const [excelFile, setExcelFile] = useState(null);
  const [importing, setImporting] = useState(false);

  const [personneSelectionnee, setPersonneSelectionnee] = useState(null);
  const [rechercheNom, setRechercheNom] = useState("");
  const [resultatsRecherche, setResultatsRecherche] = useState([]);
  const [rechercheEnCours, setRechercheEnCours] = useState(false);
  const [erreurRecherche, setErreurRecherche] = useState("");
  const [showCreerPersonne, setShowCreerPersonne] = useState(false);
  const [nouveauNom, setNouveauNom] = useState("");
  const [nouveauPrenom, setNouveauPrenom] = useState("");
  const [nouveauEmail, setNouveauEmail] = useState("");
  const [nouveauTelephone, setNouveauTelephone] = useState("");
  const [creationEnCours, setCreationEnCours] = useState(false);
  const [typesDonnee, setTypesDonnee] = useState([]);
  const [typeDonneeId, setTypeDonneeId] = useState("");
  const [valeur, setValeur] = useState("");
  const [loadingSaisie, setLoadingSaisie] = useState(false);

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showRattachModal, setShowRattachModal] = useState(false);
  const [selectedTraitementId, setSelectedTraitementId] = useState("");
  const [rattachLoading, setRattachLoading] = useState(false);
  const [rechercheTraitement, setRechercheTraitement] = useState("");

  const filtered = entrepotData.filter(d => !entrepotRecherche
    || d.personneNomComplet?.toLowerCase().includes(entrepotRecherche.toLowerCase())
    || d.typeDonneeNom?.toLowerCase().includes(entrepotRecherche.toLowerCase())
    || d.valeur?.toLowerCase().includes(entrepotRecherche.toLowerCase()));

  const donneesParPersonne = filtered.reduce((acc, d) => {
    const cle = d.personneNomComplet || "Personne inconnue";
    if (!acc[cle]) acc[cle] = [];
    acc[cle].push(d);
    return acc;
  }, {});

  useEffect(() => {
    if (etape === "saisie") {
      api.get("/types-donnee").then(res => setTypesDonnee(res.data)).catch(() => setTypesDonnee([]));
    }
  }, [etape]);

  const resetSaisie = () => {
    setPersonneSelectionnee(null); setRechercheNom(""); setResultatsRecherche([]);
    setShowCreerPersonne(false); setNouveauNom(""); setNouveauPrenom("");
    setNouveauEmail(""); setNouveauTelephone(""); setTypeDonneeId(""); setValeur("");
  };

  const handleRechercher = () => {
    if (!rechercheNom.trim()) { setErreurRecherche("Veuillez saisir un terme de recherche."); return; }
    setErreurRecherche(""); setShowCreerPersonne(false); setRechercheEnCours(true);
    api.get(`/personnes?q=${encodeURIComponent(rechercheNom.trim())}`)
      .then(res => setResultatsRecherche(res.data))
      .catch(() => setErreurRecherche("Erreur lors de la recherche."))
      .finally(() => setRechercheEnCours(false));
  };

  const handleCreerPersonne = () => {
    if (!nouveauNom.trim() || !nouveauPrenom.trim()) return;
    setCreationEnCours(true);
    api.post("/personnes", { nom: nouveauNom.trim(), prenom: nouveauPrenom.trim(), email: nouveauEmail.trim() || null, telephone: nouveauTelephone.trim() || null })
      .then(res => setPersonneSelectionnee(res.data))
      .catch(() => alert("Erreur lors de la création de la personne."))
      .finally(() => setCreationEnCours(false));
  };

  const handleSubmitSaisie = () => {
    if (!typeDonneeId || !valeur.trim() || !personneSelectionnee) return;
    setLoadingSaisie(true);
    api.post("/entrepot/saisie-manuelle", {
      nom: personneSelectionnee.nom || personneSelectionnee.nomComplet?.split(" ").pop() || "",
      prenom: personneSelectionnee.prenom || personneSelectionnee.nomComplet?.split(" ")[0] || "",
      email: personneSelectionnee.email || null,
      telephone: personneSelectionnee.telephone || null,
      typeDonneeId: Number(typeDonneeId),
      valeur: valeur.trim()
    }).then(() => {
      window.location.reload();
    }).catch(err => {
      const msg = err.response?.data?.message || "Erreur lors de l'ajout.";
      alert(msg);
    }).finally(() => setLoadingSaisie(false));
  };

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

  const ouvrirSaisie = () => {
    resetSaisie();
    setEtape("saisie");
  };

  const handleToggleSelect = (idDonnee) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(idDonnee)) next.delete(idDonnee);
      else next.add(idDonnee);
      return next;
    });
  };

  const handleToggleAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(d => d.idDonnee)));
    }
  };

  const handleRattacher = () => {
    if (!selectedTraitementId || selectedIds.size === 0) return;
    setRattachLoading(true);
    api.post(`/entrepot/attacher-lot?traitementId=${selectedTraitementId}`, [...selectedIds])
      .then(() => {
        window.location.reload();
      })
      .catch(err => {
        const msg = err.response?.data?.message || "Erreur lors du rattachement.";
        alert(msg);
      })
      .finally(() => setRattachLoading(false));
  };

  const traitementsFiltres = (traitements || []).filter(t => {
    if (!rechercheTraitement) return true;
    const q = rechercheTraitement.toLowerCase();
    return (t.description || t.nom || "").toLowerCase().includes(q) || (t.department || "").toLowerCase().includes(q);
  });

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
          {filtered.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-12">Aucune donnée trouvée</p>
          ) : (
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <input type="checkbox" checked={selectedIds.size === filtered.length && filtered.length > 0} onChange={handleToggleAll}
                  className="w-4 h-4 text-green-600 rounded focus:ring-green-500" />
                <span className="text-xs text-gray-500">Tout sélectionner ({filtered.length})</span>
              </div>
              {Object.entries(donneesParPersonne).map(([nomPersonne, dados]) => (
                <div key={nomPersonne} className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-green-50 px-4 py-3 flex items-center gap-2 border-b border-green-100">
                    <User className="w-4 h-4 text-green-600" />
                    <span className="font-semibold text-green-800 text-sm">{nomPersonne}</span>
                    <span className="text-xs text-green-600 ml-auto">{dados.length} donnée(s)</span>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-500 border-b border-gray-100">
                        <th className="px-4 py-2 w-10"></th>
                        <th className="px-4 py-2 text-left font-medium text-xs">Type</th>
                        <th className="px-4 py-2 text-left font-medium text-xs">Valeur</th>
                        <th className="px-4 py-2 text-left font-medium text-xs">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {dados.map(d => (
                        <tr key={d.idDonnee} className={`hover:bg-gray-50 ${selectedIds.has(d.idDonnee) ? "bg-green-50" : ""}`}>
                          <td className="px-4 py-2">
                            <input type="checkbox" checked={selectedIds.has(d.idDonnee)} onChange={() => handleToggleSelect(d.idDonnee)}
                              className="w-4 h-4 text-green-600 rounded focus:ring-green-500" />
                          </td>
                          <td className="px-4 py-2 text-gray-600">{d.typeDonneeNom}</td>
                          <td className="px-4 py-2 text-gray-800 font-medium">{d.valeur}</td>
                          <td className="px-4 py-2 text-xs text-gray-500">{formatDate(d.dateCollecte)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white border border-green-200 shadow-xl rounded-2xl px-6 py-3 flex items-center gap-4 z-50">
          <span className="text-sm font-semibold text-green-800">{selectedIds.size} sélectionnée(s)</span>
          <button onClick={() => setShowRattachModal(true)}
            className="flex items-center gap-2 px-5 py-2 bg-green-700 text-white rounded-xl text-sm font-semibold hover:bg-green-800 transition">
            <Link2 className="w-4 h-4" /> Rattacher à un traitement
          </button>
          <button onClick={() => setSelectedIds(new Set())}
            className="text-gray-400 hover:text-gray-600 text-sm">Annuler</button>
        </div>
      )}

      {/* Modal Rattachement */}
      {showRattachModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => { setShowRattachModal(false); setSelectedTraitementId(""); setRechercheTraitement(""); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
              <h3 className="text-lg font-bold text-gray-800">Rattacher à un traitement</h3>
              <button onClick={() => { setShowRattachModal(false); setSelectedTraitementId(""); setRechercheTraitement(""); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 pt-4 shrink-0">
              <p className="text-sm text-gray-500 mb-3">{selectedIds.size} donnée(s) sélectionnée(s)</p>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={rechercheTraitement} onChange={e => setRechercheTraitement(e.target.value)}
                  placeholder="Rechercher un traitement..."
                  className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
            </div>
            <div className="px-6 pb-4 overflow-y-auto flex-1">
              <div className="space-y-2">
                {traitementsFiltres.map(t => (
                  <button key={t.idTraitement} onClick={() => setSelectedTraitementId(String(t.idTraitement))}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${selectedTraitementId === String(t.idTraitement) ? "border-green-500 bg-green-50 ring-2 ring-green-200" : "border-gray-200 hover:border-green-300 hover:bg-gray-50"}`}>
                    <p className="font-semibold text-sm text-gray-800">{t.description || t.nom || `Traitement #${t.idTraitement}`}</p>
                    {t.department && <p className="text-xs text-gray-500 mt-0.5">{t.department}</p>}
                  </button>
                ))}
                {traitementsFiltres.length === 0 && (
                  <p className="text-center text-gray-400 text-sm py-6">Aucun traitement trouvé</p>
                )}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 shrink-0">
              <button onClick={() => { setShowRattachModal(false); setSelectedTraitementId(""); setRechercheTraitement(""); }}
                className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50">Annuler</button>
              <button onClick={handleRattacher} disabled={!selectedTraitementId || rattachLoading}
                className="px-5 py-2.5 rounded-lg bg-green-700 text-white text-sm font-semibold hover:bg-green-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2">
                {rattachLoading ? "Rattachement..." : <><Link2 className="w-4 h-4" /> Rattacher</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ajout */}
      {showModal && etape === "menu" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => { setShowModal(false); setEtape("menu"); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Ajouter des données</h3>
            <p className="text-sm text-gray-500 mb-6">Choisissez une méthode d'ajout :</p>
            <div className="space-y-3">
              <button onClick={() => { setShowModal(false); ouvrirSaisie(); }}
                className="w-full flex items-center gap-3 p-4 bg-[#F0FDF4] border border-green-500 rounded-xl text-green-800 font-semibold text-sm hover:bg-green-100">
                <Upload className="w-5 h-5 text-green-700" />
                <div className="text-left">
                  <p>Saisie manuelle</p>
                  <p className="text-xs text-gray-500 font-normal">Ajouter des données directement dans l'entrepôt</p>
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
          </div>
        </div>
      )}

      {/* Modal Import Excel */}
      {showModal && etape === "excel" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => { setShowModal(false); setEtape("menu"); setExcelFile(null); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
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
          </div>
        </div>
      )}

      {/* Modal Saisie manuelle directe */}
      {etape === "saisie" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-green-100 shrink-0">
              <button onClick={() => { setEtape("menu"); resetSaisie(); }} className="text-green-700 hover:text-green-800 font-medium text-sm flex items-center gap-1">← Retour</button>
              <button onClick={() => { setEtape("menu"); resetSaisie(); }} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="bg-green-50 px-6 py-3 text-sm border-b border-green-100 shrink-0">
              <p className="font-semibold text-green-800">Saisie manuelle dans l'entrepôt</p>
              <p className="text-xs text-green-600">La donnée sera ajoutée sans traitement associé</p>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {!personneSelectionnee ? (
                <>
                  {!showCreerPersonne ? (
                    <>
                      <h4 className="font-bold text-gray-800 text-base">Qui est la personne concernée ?</h4>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Rechercher</label>
                        <input value={rechercheNom} onChange={e => { setRechercheNom(e.target.value); setErreurRecherche(""); }}
                          onKeyDown={e => e.key === "Enter" && handleRechercher()}
                          placeholder="Nom, prénom, email ou téléphone..." className={inp} />
                      </div>
                      {erreurRecherche && <p className="text-red-500 text-sm">{erreurRecherche}</p>}
                      <button onClick={handleRechercher} disabled={rechercheEnCours}
                        className="w-full px-4 py-2 rounded-lg bg-green-700 text-white text-sm font-semibold hover:bg-green-800 disabled:opacity-40">
                        {rechercheEnCours ? "Recherche..." : "Rechercher"}
                      </button>
                      {resultatsRecherche.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-gray-600">{resultatsRecherche.length} personne(s) trouvée(s) :</p>
                          {resultatsRecherche.map(p => (
                            <button key={p.id} onClick={() => setPersonneSelectionnee(p)}
                              className="w-full text-left p-3 rounded-xl border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all">
                              <p className="font-semibold text-gray-800">{p.nomComplet}</p>
                              {p.email && <p className="text-xs text-gray-500">{p.email}</p>}
                              {p.telephone && <p className="text-xs text-gray-500">{p.telephone}</p>}
                            </button>
                          ))}
                        </div>
                      )}
                      {!rechercheEnCours && resultatsRecherche.length === 0 && (
                        <div className="text-center py-4 space-y-2">
                          <p className="text-gray-500 text-sm">Aucune personne trouvée</p>
                          <button onClick={() => setShowCreerPersonne(true)} className="text-sm text-green-700 font-semibold hover:text-green-800">+ Créer une nouvelle personne</button>
                        </div>
                      )}
                      {resultatsRecherche.length > 0 && (
                        <button onClick={() => setShowCreerPersonne(true)} className="w-full text-center text-sm text-green-700 font-semibold hover:text-green-800 mt-2">+ Personne non trouvée ? Créer une nouvelle personne</button>
                      )}
                    </>
                ) : (
                    <>
                      <h4 className="font-bold text-gray-800 text-base">Créer une nouvelle personne</h4>
                      <p className="text-sm text-gray-500">Renseignez les informations ci-dessous :</p>
                      <div><label className="block text-sm font-semibold text-gray-700 mb-1">Nom <span className="text-red-500">*</span></label>
                        <input value={nouveauNom} onChange={e => setNouveauNom(e.target.value)} placeholder="Dupont" className={inp} /></div>
                      <div><label className="block text-sm font-semibold text-gray-700 mb-1">Prénom <span className="text-red-500">*</span></label>
                        <input value={nouveauPrenom} onChange={e => setNouveauPrenom(e.target.value)} placeholder="Jean" className={inp} /></div>
                      <div><label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                        <input type="email" value={nouveauEmail} onChange={e => setNouveauEmail(e.target.value)} placeholder="jean.dupont@email.com" className={inp} /></div>
                      <div><label className="block text-sm font-semibold text-gray-700 mb-1">Téléphone</label>
                        <input value={nouveauTelephone} onChange={e => setNouveauTelephone(e.target.value)} placeholder="01 23 45 67 89" className={inp} /></div>
                      <div className="flex gap-3 justify-end pt-2">
                        <button onClick={() => { setShowCreerPersonne(false); setResultatsRecherche([]); }} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50">Retour</button>
                        <button onClick={handleCreerPersonne} disabled={creationEnCours || !nouveauNom.trim() || !nouveauPrenom.trim()}
                          className="px-5 py-2 rounded-lg bg-green-700 text-white text-sm font-semibold hover:bg-green-800 disabled:opacity-40 flex items-center gap-2">
                          {creationEnCours ? "Création..." : <><Check className="w-4 h-4" /> Créer la personne</>}
                        </button>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-green-800">{personneSelectionnee.nomComplet}</p>
                      {personneSelectionnee.email && <p className="text-xs text-green-600">{personneSelectionnee.email}</p>}
                    </div>
                    <button onClick={() => { setPersonneSelectionnee(null); setShowCreerPersonne(false); setResultatsRecherche([]); }}
                      className="text-xs text-red-600 hover:text-red-800 font-medium">Changer</button>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Type de donnée <span className="text-red-500">*</span></label>
                    <select value={typeDonneeId} onChange={e => setTypeDonneeId(e.target.value)} className={inp}>
                      <option value="">-- Sélectionner un type --</option>
                      {typesDonnee.map(t => (<option key={t.idTypeDonnee} value={t.idTypeDonnee}>{t.nom} {t.sensible ? "🔒" : ""}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Valeur <span className="text-red-500">*</span></label>
                    <input value={valeur} onChange={e => setValeur(e.target.value)} placeholder="Ex: jean@email.com, 01 23 45 67 89, ..." className={inp} />
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button onClick={() => { setEtape("menu"); resetSaisie(); }} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50">Annuler</button>
                    <button onClick={handleSubmitSaisie} disabled={loadingSaisie || !typeDonneeId || !valeur.trim()}
                      className="px-5 py-2 rounded-lg bg-green-700 text-white text-sm font-semibold hover:bg-green-800 disabled:opacity-40 flex items-center gap-2">
                      {loadingSaisie ? "En cours..." : <><Check className="w-4 h-4" /> Ajouter</>}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}