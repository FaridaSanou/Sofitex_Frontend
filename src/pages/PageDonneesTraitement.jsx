import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Plus, Search, Upload, FileSpreadsheet, Database, Check, X, FileUp, Download } from "lucide-react";
import { formatDate } from "../utils/date";
import api from "../services/api";
import Toast from "../components/ui/Toast";

const inp = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500";

export default function PageDonneesTraitement() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const traitement = location.state?.traitement;

  const [donnees, setDonnees] = useState([]);
  const [recherche, setRecherche] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Modal d'ajout
  const [showAjout, setShowAjout] = useState(false);
  const [modeAjout, setModeAjout] = useState("menu");

  // Ajout manuel
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

  // Import fichier
  const [fichier, setFichier] = useState(null);
  const [nomFichier, setNomFichier] = useState("");
  const [importing, setImporting] = useState(false);

  // Import depuis entrepôt
  const [showImportEntrepot, setShowImportEntrepot] = useState(false);
  const [entrepotData, setEntrepotData] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [attaching, setAttaching] = useState(false);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchDonnees = () => {
    setLoading(true);
    api.get("/donnees/par-traitement", { params: { traitementId: id } })
      .then(res => setDonnees(res.data))
      .catch(() => setDonnees([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!traitement) {
      showToast("Traitement introuvable", "error");
      navigate("/metier");
      return;
    }
    fetchDonnees();
    api.get("/types-donnee").then(res => setTypesDonnee(res.data)).catch(() => setTypesDonnee([]));
  }, [id]);

  if (!traitement) return null;

  const filtered = donnees.filter(d => !recherche
    || d.personneNomComplet?.toLowerCase().includes(recherche.toLowerCase())
    || d.typeDonneeNom?.toLowerCase().includes(recherche.toLowerCase())
    || d.valeur?.toLowerCase().includes(recherche.toLowerCase()));

  // --- Ajout manuel ---
  const handleRechercherPersonne = () => {
    if (!rechercheNom.trim()) { setErreurRecherche("Veuillez saisir un terme de recherche."); return; }
    setErreurRecherche(""); setShowCreerPersonne(false); setRechercheEnCours(true);
    api.get(`/personnes?q=${encodeURIComponent(rechercheNom.trim())}`)
      .then(res => setResultatsRecherche(res.data))
      .catch(() => setErreurRecherche("Erreur lors de la recherche."))
      .finally(() => setRechercheEnCours(false));
  };

  const handleCreerPersonne = () => {
    if (!nouveauNom.trim() || !nouveauPrenom.trim()) { alert("Veuillez saisir le nom et le prénom."); return; }
    setCreationEnCours(true);
    api.post("/personnes", { nom: nouveauNom.trim(), prenom: nouveauPrenom.trim(), email: nouveauEmail.trim() || null, telephone: nouveauTelephone.trim() || null })
      .then(res => setPersonneSelectionnee(res.data))
      .catch(() => alert("Erreur lors de la création de la personne."))
      .finally(() => setCreationEnCours(false));
  };

  const handleSubmitManuel = () => {
    if (!typeDonneeId || !valeur.trim()) { alert("Veuillez remplir tous les champs obligatoires."); return; }
    if (!personneSelectionnee) { alert("Veuillez d'abord sélectionner une personne."); return; }
    api.post("/donnees", {
      valeur: valeur.trim(), typeDonneeId: Number(typeDonneeId),
      traitementId: Number(id), personneId: personneSelectionnee.id,
      dateCollecte: new Date().toISOString()
    }).then(() => {
      fetchDonnees();
      resetAjout();
      showToast("Donnée ajoutée avec succès !");
    }).catch(err => {
      const status = err.response?.status;
      showToast(status === 403 ? "Accès refusé (403)" : `Erreur ${status || ""} : ${err.response?.data?.message || ""}`, "error");
    });
  };

  // --- Import fichier ---
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.name.split('.').pop().toLowerCase() !== "xlsx") { alert("Veuillez sélectionner un fichier Excel (.xlsx)"); e.target.value = ""; return; }
    setFichier(file); setNomFichier(file.name);
  };

  const handleImportExcel = () => {
    if (!fichier) return;
    setImporting(true);
    const formData = new FormData();
    formData.append("fichier", fichier);
    api.post("/entrepot/import-excel", formData, { headers: { "Content-Type": "multipart/form-data" } })
      .then(importRes => {
        const r = importRes.data;
        if (r.lignesImportees === 0) {
          showToast(`Aucune ligne importée. ${r.erreurs?.join(", ") || "Vérifiez le format du fichier."}`, "error");
          return;
        }
        return api.get("/entrepot").then(listRes => {
          const donneeIds = listRes.data.map(d => d.idDonnee);
          if (donneeIds.length === 0) { showToast("Impossible de rattacher les données.", "error"); return; }
          return api.post(`/entrepot/attacher-lot?traitementId=${id}`, donneeIds).then(() => {
            fetchDonnees();
            resetAjout();
            showToast(`${r.lignesImportees} donnée(s) importée(s) et rattachée(s) sur ${r.totalLignes} ligne(s)`);
          });
        });
      })
      .catch(err => {
        const status = err.response?.status;
        showToast(status === 403 ? "Accès refusé (403)" : status === 400 ? "Fichier invalide (400)" : `Erreur ${status || ""}`, "error");
      })
      .finally(() => setImporting(false));
  };

  // --- Import depuis entrepôt ---
  const handleOpenImportEntrepot = () => {
    setShowImportEntrepot(true);
    setSelectedIds(new Set());
    api.get("/entrepot").then(res => setEntrepotData(res.data)).catch(() => setEntrepotData([]));
  };

  const handleToggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleAttacherEntrepot = () => {
    if (selectedIds.size === 0) { alert("Veuillez sélectionner au moins une donnée."); return; }
    setAttaching(true);
    api.post(`/entrepot/attacher-lot?traitementId=${id}`, [...selectedIds])
      .then(() => {
        fetchDonnees();
        setShowImportEntrepot(false);
        showToast(`${selectedIds.size} donnée(s) rattachée(s) depuis l'entrepôt !`);
      })
      .catch(err => showToast(`Erreur : ${err.response?.data?.message || "Échec du rattachement"}`, "error"))
      .finally(() => setAttaching(false));
  };

  const resetAjout = () => {
    setShowAjout(false); setModeAjout("menu");
    setPersonneSelectionnee(null); setRechercheNom(""); setResultatsRecherche([]);
    setShowCreerPersonne(false); setTypeDonneeId(""); setValeur("");
    setFichier(null); setNomFichier("");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/metier")} className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">{traitement.description}</h1>
            <p className="text-sm text-gray-500">{traitement.department} · {donnees.length} donnée(s)</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { resetAjout(); setShowAjout(true); setModeAjout("manuel"); }}
            className="flex items-center gap-2 px-4 py-2 bg-green-700 text-white rounded-xl text-sm font-semibold hover:bg-green-800">
            <Plus className="w-4 h-4" /> Ajouter
          </button>
          <button onClick={() => { resetAjout(); setShowAjout(true); setModeAjout("excel"); }}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700">
            <FileSpreadsheet className="w-4 h-4" /> Import Excel
          </button>
          <button onClick={handleOpenImportEntrepot}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700">
            <Database className="w-4 h-4" /> Depuis l'entrepôt
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        {donnees.length > 0 && (
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={recherche} onChange={e => setRecherche(e.target.value)}
              placeholder="Rechercher dans les données..."
              className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <p className="text-center text-gray-400 text-sm py-12">Chargement...</p>
          ) : donnees.length === 0 ? (
            <div className="text-center py-12">
              <Database className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm mb-1">Aucune donnée associée à ce traitement</p>
              <p className="text-gray-400 text-xs">Ajoutez des données manuellement, importez un fichier ou depuis l'entrepôt.</p>
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-12">Aucune donnée trouvée</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-green-50 text-green-800">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Personne</th>
                  <th className="px-4 py-3 text-left font-semibold">Type</th>
                  <th className="px-4 py-3 text-left font-semibold">Valeur</th>
                  <th className="px-4 py-3 text-left font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(d => (
                  <tr key={d.idDonnee} className="hover:bg-green-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{d.personneNomComplet || "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{d.typeDonneeNom}</td>
                    <td className="px-4 py-3 text-gray-600">{d.valeur}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{formatDate(d.dateCollecte)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Modal Ajout (manuel ou excel) */}
      {showAjout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-screen overflow-y-auto">

            {modeAjout === "menu" && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-800">Ajouter des données</h2>
                  <button onClick={resetAjout} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                </div>
                <div className="space-y-3">
                  <button onClick={() => setModeAjout("manuel")}
                    className="w-full flex items-center gap-3 p-4 bg-[#F0FDF4] border border-green-500 rounded-xl text-green-800 font-semibold text-sm hover:bg-green-100">
                    <Plus className="w-5 h-5 text-green-700" />
                    <div className="text-left"><p>Saisie manuelle</p><p className="text-xs text-gray-500 font-normal">Ajouter une donnée une par une</p></div>
                  </button>
                  <button onClick={() => setModeAjout("excel")}
                    className="w-full flex items-center gap-3 p-4 bg-[#F0FDF4] border border-green-500 rounded-xl text-green-800 font-semibold text-sm hover:bg-green-100">
                    <FileSpreadsheet className="w-5 h-5 text-green-700" />
                    <div className="text-left"><p>Import Excel</p><p className="text-xs text-gray-500 font-normal">Importer un fichier .xlsx</p></div>
                  </button>
                </div>
                <button onClick={resetAjout} className="w-full mt-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Fermer</button>
              </div>
            )}

            {modeAjout === "manuel" && (
              <div>
                <div className="flex items-center justify-between px-6 py-4 border-b border-green-100">
                  <button onClick={() => setModeAjout("menu")} className="text-green-700 hover:text-green-800 font-medium text-sm flex items-center gap-1">← Retour</button>
                  <button onClick={resetAjout} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                </div>
                <div className="bg-green-50 px-6 py-3 text-sm border-b border-green-100">
                  <p className="font-semibold text-green-800">{traitement.description}</p>
                </div>
                <div className="p-6 space-y-4">
                  {!personneSelectionnee ? (
                    <>
                      {!showCreerPersonne ? (
                        <>
                          <h4 className="font-bold text-gray-800 text-base">Qui est la personne concernée ?</h4>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Rechercher</label>
                            <input value={rechercheNom} onChange={e => { setRechercheNom(e.target.value); setErreurRecherche(""); }}
                              onKeyDown={e => e.key === "Enter" && handleRechercherPersonne()}
                              placeholder="Nom, prénom, email ou téléphone..." className={inp} />
                          </div>
                          {erreurRecherche && <p className="text-red-500 text-sm">{erreurRecherche}</p>}
                          <button onClick={handleRechercherPersonne} disabled={rechercheEnCours}
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
                              <button onClick={() => setShowCreerPersonne(true)}
                                className="text-sm text-green-700 font-semibold hover:text-green-800">+ Créer une nouvelle personne</button>
                            </div>
                          )}
                          {resultatsRecherche.length > 0 && (
                            <button onClick={() => setShowCreerPersonne(true)}
                              className="w-full text-center text-sm text-green-700 font-semibold hover:text-green-800 mt-2">+ Personne non trouvée ? Créer une nouvelle personne</button>
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
                            <button onClick={() => { setShowCreerPersonne(false); setResultatsRecherche([]); }}
                              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50">Retour</button>
                            <button onClick={handleCreerPersonne} disabled={!nouveauNom.trim() || !nouveauPrenom.trim()}
                              className="px-5 py-2 rounded-lg bg-green-700 text-white text-sm font-semibold hover:bg-green-800 disabled:opacity-40 flex items-center gap-2">
                              <><Check className="w-4 h-4" /> Créer</>
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
                          {typesDonnee.map(t => (<option key={t.idTypeDonnee} value={t.idTypeDonnee}>{t.nom}</option>))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Valeur <span className="text-red-500">*</span></label>
                        <input value={valeur} onChange={e => setValeur(e.target.value)} placeholder="Ex: jean@email.com, 01 23 45 67 89, ..." className={inp} />
                      </div>
                      <div className="flex justify-end gap-3 pt-2">
                        <button onClick={resetAjout} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50">Annuler</button>
                        <button onClick={handleSubmitManuel} disabled={!typeDonneeId || !valeur.trim()}
                          className="px-5 py-2 rounded-lg bg-green-700 text-white text-sm font-semibold hover:bg-green-800 disabled:opacity-40 flex items-center gap-2">
                          <Check className="w-4 h-4" /> Ajouter
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {modeAjout === "excel" && (
              <>
                <div className="flex items-center justify-between px-6 py-4 border-b border-green-100">
                  <button onClick={() => setModeAjout("menu")} className="text-green-700 hover:text-green-800 font-medium text-sm flex items-center gap-1">← Retour</button>
                  <button onClick={resetAjout} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Import Excel</h3>
                  <p className="text-sm text-gray-500 mb-2">Les données seront importées puis rattachées à ce traitement.</p>
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
                    {fichier ? (
                      <p className="text-sm font-medium text-green-700">{fichier.name}</p>
                    ) : (
                      <p className="text-sm text-gray-500">Cliquez pour sélectionner un fichier .xlsx</p>
                    )}
                    <input type="file" accept=".xlsx" className="hidden" onChange={handleFileSelect} />
                  </label>
                  <div className="flex gap-3">
                    <button onClick={resetAjout} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Annuler</button>
                    <button onClick={handleImportExcel} disabled={!fichier}
                      className="flex-1 py-2 bg-green-700 text-white rounded-lg text-sm font-semibold hover:bg-green-800 disabled:opacity-40">
                      Importer
                    </button>
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
      )}

      {/* Modal Import depuis l'entrepôt */}
      {showImportEntrepot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Importer depuis l'entrepôt</h2>
                <p className="text-xs text-gray-500">{entrepotData.length} donnée(s) disponible(s) · {selectedIds.size} sélectionnée(s)</p>
              </div>
              <button onClick={() => setShowImportEntrepot(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {entrepotData.length === 0 ? (
                <div className="text-center py-8">
                  <Database className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Aucune donnée dans l'entrepôt</p>
                  <p className="text-gray-400 text-xs">Importez d'abord des données dans l'entrepôt via un fichier Excel.</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-green-700 border-b border-green-200">
                      <th className="px-3 py-2 text-left w-8"></th>
                      <th className="px-3 py-2 text-left font-semibold">Personne</th>
                      <th className="px-3 py-2 text-left font-semibold">Type</th>
                      <th className="px-3 py-2 text-left font-semibold">Valeur</th>
                      <th className="px-3 py-2 text-left font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {entrepotData.map(d => (
                      <tr key={d.idDonnee} className={`hover:bg-green-50 cursor-pointer ${selectedIds.has(d.idDonnee) ? "bg-green-50" : ""}`}
                        onClick={() => handleToggleSelect(d.idDonnee)}>
                        <td className="px-3 py-2">
                          <input type="checkbox" checked={selectedIds.has(d.idDonnee)} onChange={() => handleToggleSelect(d.idDonnee)}
                            className="accent-green-700 rounded" />
                        </td>
                        <td className="px-3 py-2 font-medium text-gray-800">{d.personneNomComplet || "—"}</td>
                        <td className="px-3 py-2 text-gray-600">{d.typeDonneeNom}</td>
                        <td className="px-3 py-2 text-gray-600">{d.valeur}</td>
                        <td className="px-3 py-2 text-xs text-gray-500">{formatDate(d.dateCollecte)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="border-t border-gray-100 px-6 py-4 flex justify-between">
              <button onClick={() => setShowImportEntrepot(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Fermer</button>
              <button onClick={handleAttacherEntrepot} disabled={selectedIds.size === 0}
                className="px-5 py-2 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 disabled:opacity-40 flex items-center gap-2">
                <><Download className="w-4 h-4" /> Rattacher ({selectedIds.size})</>
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast toast={toast} />
    </div>
  );
}
