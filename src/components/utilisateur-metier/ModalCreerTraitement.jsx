import { useState, useEffect } from "react";
import { Plus, Check, FileUp } from "lucide-react";
import api from "../../services/api";

const DIRECTIONS = ["DSI", "DRH", "Direction Commerciale", "Direction Financière", "Direction Générale", "Direction Technique", "Direction Qualité", "Direction Logistique", "Direction Juridique", "Autre"];
const ORIGINES = ["Directement auprès des personnes (formulaires en ligne, papier)", "Via des objets connectés ou capteurs", "Importation de fichiers externes ou bases de données existantes"];
const inp = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600";

export default function ModalCreerTraitement({ onClose, onSave, sessions, onSaveManuel, onSaveExcel, initialData }) {
  const [etape, setEtape] = useState(1);
  const creePar = localStorage.getItem("nom") || localStorage.getItem("email") || "Utilisateur inconnu";
  const userEmail = localStorage.getItem("email") || "";
  const isEdit = !!initialData;

  const [fichierExcel, setFichierExcel] = useState(null);
  const [traitementCree, setTraitementCree] = useState(null);
  const [creationEnCours, setCreationEnCours] = useState(false);

  const [personneSelectionnee, setPersonneSelectionnee] = useState(null);
  const [rechercheNom, setRechercheNom] = useState("");
  const [resultatsRecherche, setResultatsRecherche] = useState([]);
  const [rechercheEnCours, setRechercheEnCours] = useState(false);
  const [erreurRecherche, setErreurRecherche] = useState("");
  const [typesDonnee, setTypesDonnee] = useState([]);
  const [typeDonneeId, setTypeDonneeId] = useState("");
  const [valeur, setValeur] = useState("");
  const [showCreerPersonne, setShowCreerPersonne] = useState(false);
  const [nouveauNom, setNouveauNom] = useState("");
  const [nouveauPrenom, setNouveauPrenom] = useState("");
  const [nouveauEmail, setNouveauEmail] = useState("");
  const [nouveauTelephone, setNouveauTelephone] = useState("");
  const [loadingData, setLoadingData] = useState(false);

  const [form, setForm] = useState({
    nom: initialData?.description || initialData?.nom || "", finalite: initialData?.texte || "", denomination: "",
    date_mise_en_oeuvre: initialData?.dateMiseEnOeuvre || "",
    type_traitement: "", duree_conservation: initialData?.dureeConservation ? String(initialData.dureeConservation) : "",
    nombre_personnes: initialData?.nombrePersonnesConcernees ? String(initialData.nombrePersonnesConcernees) : "",
    categorie_personnes: initialData?.categoriesDonnees || "", origine_donnees: initialData?.origineDonnees || "",
    lieu_stockage: initialData?.lieuStockage || "",
    sessionCollecteId: initialData?.sessionCollecteId ? String(initialData.sessionCollecteId) : "",
    responsable_nom: initialData?.nomPrenomResponsable || "", responsable_departement: initialData?.department || "",
    responsable_fonction: initialData?.fonctionResponsable || "", responsable_email: initialData?.contactConfidentialite || "",
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    if (etape === 4 && !initialData) {
      api.get("/types-donnee").then(res => setTypesDonnee(res.data)).catch(() => setTypesDonnee([]));
    }
  }, [etape, initialData]);

  const handleRechercherPersonne = () => {
    if (!rechercheNom.trim()) return;
    setErreurRecherche(""); setRechercheEnCours(true);
    api.get(`/personnes?q=${encodeURIComponent(rechercheNom.trim())}`)
      .then(res => setResultatsRecherche(res.data))
      .catch(() => setErreurRecherche("Erreur lors de la recherche."))
      .finally(() => setRechercheEnCours(false));
  };

  const handleSelectionnerPersonne = (p) => { setPersonneSelectionnee(p); setResultatsRecherche([]); };

  const handleCreerPersonneEtSuite = () => {
    if (!nouveauNom.trim() || !nouveauPrenom.trim()) return;
    setLoadingData(true);
    api.post("/personnes", { nom: nouveauNom.trim(), prenom: nouveauPrenom.trim(), email: nouveauEmail.trim() || null, telephone: nouveauTelephone.trim() || null })
      .then(res => setPersonneSelectionnee(res.data))
      .catch(() => alert("Erreur lors de la création de la personne."))
      .finally(() => setLoadingData(false));
  };

  const handleAjouterDonneeManuelle = () => {
    if (!typeDonneeId || !valeur.trim() || !personneSelectionnee || !traitementCree) return;
    setLoadingData(true);
    onSaveManuel({ valeur: valeur.trim(), typeDonneeId: Number(typeDonneeId), traitementId: traitementCree.idTraitement, personneId: personneSelectionnee.id, dateCollecte: new Date().toISOString() }, () => setLoadingData(false));
  };

  const etape1Ok = form.nom && form.finalite && form.type_traitement;
  const etape2Ok = form.duree_conservation && form.categorie_personnes;
  const etape3Ok = form.responsable_nom && form.responsable_email;
  const canNext = etape === 1 ? etape1Ok : etape === 2 ? etape2Ok : etape === 3 ? etape3Ok : false;

  const buildPayload = () => ({
    nom: form.nom, finalite: form.finalite, denomination: form.denomination,
    date_mise_en_oeuvre: form.date_mise_en_oeuvre || null, type_traitement: form.type_traitement,
    duree_conservation: parseInt(form.duree_conservation) || 0,
    nombre_personnes: form.nombre_personnes ? parseInt(form.nombre_personnes) : 0,
    categorie_personnes: form.categorie_personnes, origine_donnees: form.origine_donnees,
    lieu_stockage: form.lieu_stockage,
    sessionCollecteId: form.sessionCollecteId ? parseInt(form.sessionCollecteId) : null,
    responsable_nom: form.responsable_nom, responsable_departement: form.responsable_departement,
    responsable_fonction: form.responsable_fonction, responsable_email: form.responsable_email,
    creePar: creePar,
  });

  const handleFichierChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.name.split('.').pop().toLowerCase() !== "xlsx") { alert("Veuillez sélectionner un fichier Excel (.xlsx)"); e.target.value = ""; return; }
    setFichierExcel(file);
  };

  const steps = isEdit ? ["Traitement", "Détails & Conformité", "Responsable"] : ["Traitement", "Détails & Conformité", "Responsable", "Données"];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-screen overflow-y-auto">
        <div className="px-8 pt-8 pb-0">
          <div className="flex items-center justify-between relative mb-2">
            {steps.map((s, i) => {
              const stepNum = i + 1;
              const isCompleted = stepNum < etape;
              const isActive = stepNum === etape;
              return (
                <div key={i} className="flex flex-col items-center relative z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${isCompleted ? "bg-green-600 text-white shadow-md" : isActive ? "bg-green-600 text-white shadow-lg animate-pulse" : "bg-white border-2 border-gray-300 text-gray-400"}`}>
                    {isCompleted ? (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>) : stepNum}
                  </div>
                  <span className={`text-xs mt-2 font-medium ${isActive ? "text-[#1e293b]" : "text-gray-400"}`}>{s}</span>
                </div>
              );
            })}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-0" style={{ transform: 'translateY(-50%)' }}>
              <div className="h-full bg-green-600 transition-all duration-500" style={{ width: `${((etape - 1) / (steps.length - 1)) * 100}%` }} />
            </div>
          </div>
        </div>

        <hr className="border-t border-gray-200 my-6 mx-8" />

        <div className="px-8 space-y-5">
          {etape === 1 && (
            <div className="space-y-4">
              <h4 className="font-bold text-[#0f172a] text-lg mb-4">Informations du Traitement</h4>
              <div><label className="block text-sm font-semibold text-gray-700 mb-1">Nom du traitement <span className="text-red-500">*</span></label><input value={form.nom} onChange={e => set("nom", e.target.value)} placeholder="Ex: Gestion de la paie des employés" className={inp} /></div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-1">Finalité du traitement <span className="text-red-500">*</span></label><input value={form.finalite} onChange={e => set("finalite", e.target.value)} placeholder="Ex: Permettre le paiement des producteurs de coton" className={inp} /></div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-1">Dénomination du traitement</label><input value={form.denomination} onChange={e => set("denomination", e.target.value)} placeholder="Ex: Traitement des données salariales" className={inp} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-semibold text-gray-700 mb-1">Date de mise en œuvre</label><input type="date" value={form.date_mise_en_oeuvre} onChange={e => set("date_mise_en_oeuvre", e.target.value)} className={inp} /></div>
                <div><label className="block text-sm font-semibold text-gray-700 mb-1">Type de traitement <span className="text-red-500">*</span></label>
                  <select value={form.type_traitement} onChange={e => set("type_traitement", e.target.value)} className={inp}>
                    <option value="">-- Sélectionner --</option>
                    {["Collecte", "Enregistrement", "Organisation", "Conservation", "Consultation", "Utilisation", "Communication", "Diffusion", "Effacement"].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {etape === 2 && (
            <div className="space-y-4">
              <h4 className="font-bold text-[#0f172a] text-lg mb-4">Détails & Conformité</h4>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-semibold text-gray-700 mb-1">Durée de conservation (mois) <span className="text-red-500">*</span></label><input type="number" min="1" value={form.duree_conservation} onChange={e => set("duree_conservation", e.target.value)} placeholder="Ex: 60" className={inp} /></div>
                <div><label className="block text-sm font-semibold text-gray-700 mb-1">Nombre de personnes concernées</label><input type="number" min="0" value={form.nombre_personnes} onChange={e => set("nombre_personnes", e.target.value)} placeholder="Ex: 500" className={inp} /></div>
              </div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-1">Catégorie de personnes concernées <span className="text-red-500">*</span></label>
                <select value={form.categorie_personnes} onChange={e => set("categorie_personnes", e.target.value)} className={inp}>
                  <option value="">-- Sélectionner --</option>
                  {["Employés SOFITEX", "Producteurs de coton", "Clients", "Fournisseurs / Sous-traitants", "Visiteurs", "Candidats à l'embauche", "Usagers externes"].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-1">Origine des données</label>
                <select value={form.origine_donnees} onChange={e => set("origine_donnees", e.target.value)} className={inp}>
                  <option value="">-- Sélectionner --</option>
                  {ORIGINES.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-1">Lieu de stockage</label><input value={form.lieu_stockage} onChange={e => set("lieu_stockage", e.target.value)} placeholder="Ex: Serveur interne DSI, Cloud AWS..." className={inp} /></div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-1">Session de collecte</label>
                <select value={form.sessionCollecteId} onChange={e => set("sessionCollecteId", e.target.value)} className={inp}>
                  <option value="">-- Aucune session --</option>
                  {sessions.sort((a, b) => (a.nomSession || a.description || "").localeCompare(b.nomSession || b.description || "")).map(s => <option key={s.idSession} value={s.idSession}>{s.nomSession || s.description || `Session #${s.idSession}`}</option>)}
                </select>
              </div>
            </div>
          )}

          {etape === 3 && (
            <div className="space-y-4">
              <h4 className="font-bold text-[#0f172a] text-lg mb-4">Responsable du Traitement</h4>
              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm">
                <span className="font-semibold text-green-800">Créé par :</span> <span className="text-green-700">{creePar}</span>
                <p className="text-xs text-gray-400 mt-0.5">Récupéré automatiquement depuis votre session</p>
              </div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-1">Nom et prénom du responsable <span className="text-red-500">*</span></label><input value={form.responsable_nom} onChange={e => set("responsable_nom", e.target.value)} placeholder="Ex: Ouedraogo Amadou" className={inp} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-semibold text-gray-700 mb-1">Département</label>
                  <select value={form.responsable_departement} onChange={e => set("responsable_departement", e.target.value)} className={inp}>
                    <option value="">-- Sélectionner --</option>
                    {DIRECTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div><label className="block text-sm font-semibold text-gray-700 mb-1">Fonction</label><input value={form.responsable_fonction} onChange={e => set("responsable_fonction", e.target.value)} placeholder="Ex: Responsable RH" className={inp} /></div>
              </div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-1">Adresse email <span className="text-red-500">*</span></label><input type="email" value={form.responsable_email} onChange={e => set("responsable_email", e.target.value)} placeholder="contact@sofitex.bf" className={inp} /></div>
            </div>
          )}

          {etape === 4 && (
            <div className="space-y-4">
              <h4 className="font-bold text-[#0f172a] text-lg mt-6 mb-4">Ajout de Données</h4>

              {!traitementCree ? (
                <div className="space-y-4">
                  <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4">
                    <button onClick={() => { setCreationEnCours(true); onSave(buildPayload(), (traitement) => { setTraitementCree(traitement); setCreationEnCours(false); }, "manuel"); }}
                      disabled={creationEnCours}
                      className="w-full h-14 bg-[#F0FDF4] border border-green-500 rounded-2xl cursor-pointer flex items-center justify-center gap-3 hover:bg-green-100 transition-colors disabled:opacity-50">
                      {creationEnCours ? (<span className="text-green-800 font-semibold text-base">Création du traitement...</span>) : (<><Plus className="w-5 h-5 text-green-600" /><span className="text-green-800 font-semibold text-base">Saisie manuelle</span></>)}
                    </button>
                  </div>
                  <div className="bg-[#F0FDF4] border border-green-200 rounded-2xl p-4">
                    <h3 className="text-gray-700 font-semibold mb-3 text-base">Import depuis Excel</h3>
                    <details className="mb-3 text-xs text-gray-500 bg-white rounded-lg p-2 border border-green-100">
                      <summary className="cursor-pointer font-medium text-gray-600">Format attendu (.xlsx)</summary>
                      <div className="mt-2 space-y-1.5">
                        <p><strong>Format A — Colonnes prédéfinies :</strong><br />
                        <code>nom</code>* · <code>prenom</code>* · <code>email</code> · <code>telephone</code> · <code>date_naissance</code> · <code>numero_cnib</code> · <code>profession</code></p>
                        <p><strong>Format B — Type/Valeur personnalisés :</strong><br />
                        <code>nom</code>* · <code>prenom</code>* · <code>email</code> · <code>telephone</code> · <code>type_donnee</code>* · <code>valeur</code>*</p>
                        <p className="text-gray-400">* : obligatoire · La 1ʳᵉ ligne doit contenir les en-têtes</p>
                      </div>
                    </details>
                    <div className="flex items-center gap-4">
                      <label className="inline-flex items-center px-4 bg-green-600 text-white rounded-xl cursor-pointer hover:bg-green-700 transition-colors font-medium text-sm" style={{ height: "38px" }}>
                        <FileUp className="w-4 h-4 mr-2" /> Choisir un fichier
                        <input type="file" accept=".xlsx" onChange={handleFichierChange} className="hidden" />
                      </label>
                      <span className="text-gray-500 text-sm">{fichierExcel?.name || "Aucun fichier choisi"}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4">
                    <p className="font-semibold text-green-800 text-sm">{traitementCree.description || traitementCree.nom}</p>
                    <p className="text-xs text-green-600">{traitementCree.department || "—"} · {(traitementCree.nombreDonnee || 0) + 1} donnée(s)</p>
                  </div>

                  {!personneSelectionnee ? (
                    <>
                      {!showCreerPersonne ? (
                        <div className="space-y-4">
                          <h4 className="font-bold text-gray-800 text-base">Qui est la personne concernée ?</h4>
                          <div><label className="block text-sm font-semibold text-gray-700 mb-1">Rechercher</label>
                            <input value={rechercheNom} onChange={e => { setRechercheNom(e.target.value); setErreurRecherche(""); }} onKeyDown={e => e.key === "Enter" && handleRechercherPersonne()} placeholder="Nom, prénom, email ou téléphone..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                          </div>
                          {erreurRecherche && <p className="text-red-500 text-sm">{erreurRecherche}</p>}
                          <button onClick={handleRechercherPersonne} disabled={rechercheEnCours} className="w-full px-4 py-2 rounded-lg bg-green-700 text-white text-sm font-semibold hover:bg-green-800 disabled:opacity-40">{rechercheEnCours ? "Recherche..." : "Rechercher"}</button>
                          {resultatsRecherche.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-sm font-semibold text-gray-600">{resultatsRecherche.length} personne(s) trouvée(s) :</p>
                              {resultatsRecherche.map(p => (<button key={p.id} onClick={() => handleSelectionnerPersonne(p)} className="w-full text-left p-3 rounded-xl border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all"><p className="font-semibold text-gray-800">{p.nomComplet}</p>{p.email && <p className="text-xs text-gray-500">{p.email}</p>}{p.telephone && <p className="text-xs text-gray-500">{p.telephone}</p>}</button>))}
                            </div>
                          )}
                          {!rechercheEnCours && resultatsRecherche.length === 0 && (
                            <div className="text-center py-4 space-y-2"><p className="text-gray-500 text-sm">Aucune personne trouvée</p><button onClick={() => setShowCreerPersonne(true)} className="text-sm text-green-700 font-semibold hover:text-green-800">+ Créer une nouvelle personne</button></div>
                          )}
                          {resultatsRecherche.length > 0 && (<button onClick={() => setShowCreerPersonne(true)} className="w-full text-center text-sm text-green-700 font-semibold hover:text-green-800 mt-2">+ Personne non trouvée ? Créer une nouvelle personne</button>)}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <h4 className="font-bold text-gray-800 text-base">Créer une nouvelle personne</h4>
                          <p className="text-sm text-gray-500">Renseignez les informations ci-dessous :</p>
                          <div><label className="block text-sm font-semibold text-gray-700 mb-1">Nom <span className="text-red-500">*</span></label><input value={nouveauNom} onChange={e => setNouveauNom(e.target.value)} placeholder="Dupont" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
                          <div><label className="block text-sm font-semibold text-gray-700 mb-1">Prénom <span className="text-red-500">*</span></label><input value={nouveauPrenom} onChange={e => setNouveauPrenom(e.target.value)} placeholder="Jean" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
                          <div><label className="block text-sm font-semibold text-gray-700 mb-1">Email</label><input type="email" value={nouveauEmail} onChange={e => setNouveauEmail(e.target.value)} placeholder="jean.dupont@email.com" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
                          <div><label className="block text-sm font-semibold text-gray-700 mb-1">Téléphone</label><input value={nouveauTelephone} onChange={e => setNouveauTelephone(e.target.value)} placeholder="01 23 45 67 89" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
                          <div className="flex gap-3 justify-end pt-2">
                            <button onClick={() => { setShowCreerPersonne(false); setResultatsRecherche([]); }} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50">Retour</button>
                            <button onClick={handleCreerPersonneEtSuite} disabled={loadingData || !nouveauNom.trim() || !nouveauPrenom.trim()} className="px-5 py-2 rounded-lg bg-green-700 text-white text-sm font-semibold hover:bg-green-800 disabled:opacity-40 flex items-center gap-2">{loadingData ? "Création..." : <><Check className="w-4 h-4" /> Créer la personne</>}</button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center justify-between">
                        <div><p className="text-sm font-semibold text-green-800">{personneSelectionnee.nomComplet}</p>{personneSelectionnee.email && <p className="text-xs text-green-600">{personneSelectionnee.email}</p>}</div>
                        <button onClick={() => { setPersonneSelectionnee(null); setShowCreerPersonne(false); setResultatsRecherche([]); }} className="text-xs text-red-600 hover:text-red-800 font-medium">Changer</button>
                      </div>
                      <div><label className="block text-sm font-semibold text-gray-700 mb-1">Type de donnée <span className="text-red-500">*</span></label>
                        <select value={typeDonneeId} onChange={e => setTypeDonneeId(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                          <option value="">-- Sélectionner un type --</option>
                          {typesDonnee.map(t => (<option key={t.idTypeDonnee} value={t.idTypeDonnee}>{t.nom} {t.sensible ? "🔒" : ""}</option>))}
                        </select>
                      </div>
                      <div><label className="block text-sm font-semibold text-gray-700 mb-1">Valeur <span className="text-red-500">*</span></label><input value={valeur} onChange={e => setValeur(e.target.value)} placeholder="Ex: jean@email.com, 01 23 45 67 89, ..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
                      <div className="flex justify-end gap-3 pt-2">
                        <button onClick={() => { setTraitementCree(null); setPersonneSelectionnee(null); setResultatsRecherche([]); setShowCreerPersonne(false); setTypeDonneeId(""); setValeur(""); setNouveauNom(""); setNouveauPrenom(""); setNouveauEmail(""); setNouveauTelephone(""); }} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50">Annuler</button>
                        <button onClick={handleAjouterDonneeManuelle} disabled={loadingData || !typeDonneeId || !valeur.trim()} className="px-5 py-2 rounded-lg bg-green-700 text-white text-sm font-semibold hover:bg-green-800 disabled:opacity-40 flex items-center gap-2">{loadingData ? "En cours..." : <><Check className="w-4 h-4" /> Ajouter</>}</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-8 pb-6 flex justify-between items-center border-t border-[#e2e8f0] pt-6 mt-8">
          <button onClick={() => etape > 1 ? setEtape(e => e - 1) : onClose()}
            className="px-5 py-2.5 rounded-lg border border-[#cbd5e1] bg-white text-[#475569] text-sm font-medium hover:bg-green-50 hover:border-green-300 transition-all">← Précédent</button>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="bg-[#f1f5f9] px-3 py-1 rounded-full text-xs text-[#475569] font-medium">Utilisateur Métier</span>
              <span className="text-sm text-[#1e293b]">{userEmail}</span>
            </div>

            {etape < steps.length ? (
              <button onClick={() => setEtape(e => e + 1)} disabled={!canNext}
                className="px-6 py-2.5 rounded-lg bg-green-600 text-white text-sm font-bold hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm">Suivant →</button>
            ) : isEdit ? (
              <button onClick={() => onSave(buildPayload(), () => {}, "direct")}
                className="px-6 py-2.5 rounded-lg bg-amber-500 text-white text-sm font-bold hover:bg-amber-600 transition-all shadow-sm flex items-center gap-2">
                Enregistrer les modifications
              </button>
            ) : traitementCree ? (
              <button onClick={onClose} className="px-6 py-2.5 rounded-lg bg-gray-100 text-gray-700 text-sm font-bold hover:bg-gray-200 transition-all shadow-sm">Terminer</button>
            ) : (
              <div className="flex gap-3">
                {fichierExcel ? (
                  <button onClick={() => { onSave(buildPayload(), (traitementRetour) => { if (traitementRetour && onSaveExcel) { const fd = new FormData(); fd.append("fichier", fichierExcel); onSaveExcel(fd, traitementRetour.idTraitement, () => {}); } }, "excel"); }}
                    className="px-6 py-2.5 rounded-lg bg-green-600 text-white text-sm font-bold hover:bg-green-700 disabled:opacity-40 transition-all shadow-sm flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>Créer le traitement
                  </button>
                ) : (
                  <button onClick={() => onSave(buildPayload(), () => {}, "direct")}
                    className="px-6 py-2.5 rounded-lg bg-green-600 text-white text-sm font-bold hover:bg-green-700 transition-all shadow-sm flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>Créer le traitement
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
