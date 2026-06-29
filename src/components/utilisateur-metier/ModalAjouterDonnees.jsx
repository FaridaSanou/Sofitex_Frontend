import { useState, useEffect } from "react";
import { Database, Plus, Upload, X, Check, FileUp } from "lucide-react";
import api from "../../services/api";

const inp = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500";

export default function ModalAjouterDonnees({ traitement, onClose, onSaveManuel, onSaveExcel }) {
  const [vue, setVue] = useState("accueil");
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
  const [fichier, setFichier] = useState(null);
  const [nomFichier, setNomFichier] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/types-donnee").then(res => setTypesDonnee(res.data)).catch(() => setTypesDonnee([]));
  }, []);

  const handleRechercher = () => {
    if (!rechercheNom.trim()) { setErreurRecherche("Veuillez saisir un terme de recherche."); return; }
    setErreurRecherche(""); setShowCreerPersonne(false); setRechercheEnCours(true);
    api.get(`/personnes?q=${encodeURIComponent(rechercheNom.trim())}`)
      .then(res => setResultatsRecherche(res.data))
      .catch(() => setErreurRecherche("Erreur lors de la recherche."))
      .finally(() => setRechercheEnCours(false));
  };

  const handleSelectionnerPersonne = (p) => { setPersonneSelectionnee(p); setResultatsRecherche([]); };

  const handleCreerPersonne = () => {
    if (!nouveauNom.trim() || !nouveauPrenom.trim()) { alert("Veuillez saisir le nom et le prénom."); return; }
    setCreationEnCours(true);
    api.post("/personnes", { nom: nouveauNom.trim(), prenom: nouveauPrenom.trim(), email: nouveauEmail.trim() || null, telephone: nouveauTelephone.trim() || null })
      .then(res => setPersonneSelectionnee(res.data))
      .catch(() => alert("Erreur lors de la création de la personne."))
      .finally(() => setCreationEnCours(false));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.name.split('.').pop().toLowerCase() !== "xlsx") { alert("Veuillez sélectionner un fichier Excel (.xlsx)"); e.target.value = ""; return; }
    setFichier(file); setNomFichier(file.name);
  };

  const handleSubmitManuel = () => {
    if (!typeDonneeId || !valeur.trim()) { alert("Veuillez remplir tous les champs obligatoires."); return; }
    if (!personneSelectionnee) { alert("Veuillez d'abord sélectionner une personne."); return; }
    setLoading(true);
    onSaveManuel({ valeur: valeur.trim(), typeDonneeId: Number(typeDonneeId), traitementId: traitement.idTraitement, personneId: personneSelectionnee.id, dateCollecte: new Date().toISOString() }, () => setLoading(false));
  };

  const handleSubmitExcel = () => {
    if (!fichier) { alert("Veuillez sélectionner un fichier Excel."); return; }
    setLoading(true);
    const formData = new FormData();
    formData.append("fichier", fichier);
    onSaveExcel(formData, traitement.idTraitement, () => setLoading(false));
  };

  if (vue === "manuel") {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-screen overflow-y-auto">
          <div className="flex items-center justify-between px-6 py-4 border-b border-green-100">
            <button onClick={() => { setVue("accueil"); setPersonneSelectionnee(null); setShowCreerPersonne(false); setResultatsRecherche([]); }} className="text-green-700 hover:text-green-800 font-medium text-sm flex items-center gap-1">← Retour</button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
          </div>
          <div className="bg-green-50 px-6 py-3 text-sm border-b border-green-100">
            <p className="font-semibold text-green-800">{traitement.description}</p>
            <p className="text-xs text-green-600">{traitement.department} · {traitement.nombreDonnee || 0} donnée(s)</p>
          </div>
          <div className="p-6 space-y-4">
            {!personneSelectionnee ? (
              <>
                {!showCreerPersonne ? (
                  <>
                    <h4 className="font-bold text-gray-800 text-base">Qui est la personne concernée ?</h4>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Rechercher</label>
                      <input value={rechercheNom} onChange={e => { setRechercheNom(e.target.value); setErreurRecherche(""); }} onKeyDown={e => e.key === "Enter" && handleRechercher()} placeholder="Nom, prénom, email ou téléphone..." className={inp} />
                    </div>
                    {erreurRecherche && <p className="text-red-500 text-sm">{erreurRecherche}</p>}
                    <button onClick={handleRechercher} disabled={rechercheEnCours} className="w-full px-4 py-2 rounded-lg bg-green-700 text-white text-sm font-semibold hover:bg-green-800 disabled:opacity-40">{rechercheEnCours ? "Recherche..." : "Rechercher"}</button>
                    {resultatsRecherche.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-gray-600">{resultatsRecherche.length} personne(s) trouvée(s) :</p>
                        {resultatsRecherche.map(p => (
                          <button key={p.id} onClick={() => handleSelectionnerPersonne(p)} className="w-full text-left p-3 rounded-xl border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all">
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
                    <div><label className="block text-sm font-semibold text-gray-700 mb-1">Nom <span className="text-red-500">*</span></label><input value={nouveauNom} onChange={e => setNouveauNom(e.target.value)} placeholder="Dupont" className={inp} /></div>
                    <div><label className="block text-sm font-semibold text-gray-700 mb-1">Prénom <span className="text-red-500">*</span></label><input value={nouveauPrenom} onChange={e => setNouveauPrenom(e.target.value)} placeholder="Jean" className={inp} /></div>
                    <div><label className="block text-sm font-semibold text-gray-700 mb-1">Email</label><input type="email" value={nouveauEmail} onChange={e => setNouveauEmail(e.target.value)} placeholder="jean.dupont@email.com" className={inp} /></div>
                    <div><label className="block text-sm font-semibold text-gray-700 mb-1">Téléphone</label><input value={nouveauTelephone} onChange={e => setNouveauTelephone(e.target.value)} placeholder="01 23 45 67 89" className={inp} /></div>
                    <div className="flex gap-3 justify-end pt-2">
                      <button onClick={() => { setShowCreerPersonne(false); setResultatsRecherche([]); }} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50">Retour</button>
                      <button onClick={handleCreerPersonne} disabled={creationEnCours || !nouveauNom.trim() || !nouveauPrenom.trim()} className="px-5 py-2 rounded-lg bg-green-700 text-white text-sm font-semibold hover:bg-green-800 disabled:opacity-40 flex items-center gap-2">
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
                  <button onClick={() => { setPersonneSelectionnee(null); setShowCreerPersonne(false); setResultatsRecherche([]); }} className="text-xs text-red-600 hover:text-red-800 font-medium">Changer</button>
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
                  <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50">Annuler</button>
                  <button onClick={handleSubmitManuel} disabled={loading || !typeDonneeId || !valeur.trim()} className="px-5 py-2 rounded-lg bg-green-700 text-white text-sm font-semibold hover:bg-green-800 disabled:opacity-40 flex items-center gap-2">
                    {loading ? "En cours..." : <><Check className="w-4 h-4" /> Ajouter</>}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-green-600" />
              <h2 className="text-green-800 font-bold text-lg">Ajout de Données</h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"><X className="w-5 h-5" /></button>
          </div>
          <div className="w-full h-px bg-green-100 mb-4" />
          <div className="space-y-4">
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4">
              <button onClick={() => setVue("manuel")} className="w-full h-14 bg-[#F0FDF4] border border-green-500 rounded-2xl cursor-pointer flex items-center justify-center gap-3 hover:bg-green-100 transition-colors">
                <Plus className="w-5 h-5 text-green-600" /><span className="text-green-800 font-semibold text-base">Saisie manuelle</span>
              </button>
            </div>
            <div className="bg-[#F0FDF4] border border-green-200 rounded-2xl p-4">
              <h3 className="text-gray-700 font-semibold mb-3 text-base">Import depuis Excel</h3>
              <div className="flex items-center gap-4">
                <label className="inline-flex items-center px-4 bg-green-600 text-white rounded-xl cursor-pointer hover:bg-green-700 transition-colors font-medium text-sm" style={{ height: "38px" }}>
                  <FileUp className="w-4 h-4 mr-2" /> Choisir un fichier
                  <input type="file" accept=".xlsx" onChange={handleFileSelect} className="hidden" />
                </label>
                <span className="text-gray-500 text-sm">{nomFichier || "Aucun fichier choisi"}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50">Fermer</button>
          <button onClick={handleSubmitExcel} disabled={loading || !fichier} className="px-5 py-2 rounded-lg bg-green-700 text-white text-sm font-semibold hover:bg-green-800 disabled:opacity-40 flex items-center gap-2">
            {loading ? "Import en cours..." : <><Upload className="w-4 h-4" /> Importer</>}
          </button>
        </div>
      </div>
    </div>
  );
}
