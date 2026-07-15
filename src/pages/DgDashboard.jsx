import { useState, useEffect } from "react";
import api from "../services/api";
import { Icon } from "../components/ui/Icon";
import { BadgeStatut } from "../components/ui/BadgeStatut";
import { SimpleStatCard } from "../components/ui/StatCard";
import Toast from "../components/ui/Toast";
import NotificationBell from "../components/ui/NotificationBell";
import DgSidebar from "../components/dg/DgSidebar";
import ModalDecision from "../components/dg/ModalDecision";
import { formatDate } from "../utils/date";

function DgDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [declarations, setDeclarations] = useState([]);
  const [historique, setHistorique] = useState([]);
  const [selectedDeclaration, setSelectedDeclaration] = useState(null);
  const [toast, setToast] = useState(null);
  const [recherche, setRecherche] = useState("");
  const [filtreStatut, setFiltreStatut] = useState("tous");
  const [dgUserId, setDgUserId] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchEnAttente = () => {
    api.get("/declarations/en-attente")
      .then(res => setDeclarations(res.data))
      .catch(() => { });
  };

  useEffect(() => {
    fetchEnAttente();
    const email = localStorage.getItem("email");
    if (email) {
      api.get("/verification/fonction", { params: { email } })
        .then(res => { if (res.data?.userId) setDgUserId(Number(res.data.userId)); })
        .catch(() => {});
    }
  }, []);

  const handleValider = async (id) => {
    const res = await api.put(`/declarations/${id}/valider`);
    const updated = res.data;
    setDeclarations(prev => prev.filter(d => d.idDeclaration !== id));
    setHistorique(prev => [{ ...updated, decidedAt: new Date().toISOString(), decision: "APPROUVEE_DG" }, ...prev]);
    showToast("Déclaration validée avec succès !");
  };

  const handleRejeter = async (id, commentaire) => {
    const res = await api.put(`/declarations/${id}/rejeter`, { commentaire });
    const updated = res.data;
    setDeclarations(prev => prev.filter(d => d.idDeclaration !== id));
    setHistorique(prev => [{ ...updated, decidedAt: new Date().toISOString(), decision: "REJETEE_DG" }, ...prev]);
    showToast("Déclaration rejetée.");
  };

  const enAttente = declarations.length;
  const valides = historique.filter(h => h.decision === "APPROUVEE_DG").length;
  const rejetes = historique.filter(h => h.decision === "REJETEE_DG").length;

  const declarationsFiltrees = declarations
    .filter(d => filtreStatut === "tous" ? true : d.statut === filtreStatut)
    .filter(d => !recherche ||
      d.traitementDescription?.toLowerCase().includes(recherche.toLowerCase()) ||
      d.secteur?.toLowerCase().includes(recherche.toLowerCase()) ||
      d.responsableDeclaration?.toLowerCase().includes(recherche.toLowerCase())
    );

  const TYPE_LABELS = {
    NORMALE: "Normale",
    AUTORISATION: "Autorisation",
    COLLECTE_SITE: "Collecte site",
    VIDEO_SURVEILLANCE: "Vidéosurveillance",
  };

  const headerTitles = {
    dashboard: "Tableau de bord",
    declarations: "Déclarations à traiter",
    historique: "Historique des décisions",
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <DgSidebar sidebarOpen={sidebarOpen} activeSection={activeSection} setActiveSection={setActiveSection} enAttente={enAttente} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(o => !o)} className="text-gray-500 hover:text-gray-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-800">{headerTitles[activeSection]}</h1>
              <p className="text-xs text-gray-400">
                {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          </div>
          {dgUserId ? (
            <NotificationBell utilisateurId={dgUserId} onNavigate={() => setActiveSection("declarations")} />
          ) : enAttente > 0 && (
            <button onClick={() => setActiveSection("declarations")} className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
              <Icon name="bell" className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">{enAttente > 9 ? "9+" : enAttente}</span>
            </button>
          )}
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {activeSection === "dashboard" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <SimpleStatCard label="En attente de décision" value={enAttente} color="bg-yellow-600" borderColor="border-yellow-100" textColor="text-yellow-600" />
                <SimpleStatCard label="Déclarations validées" value={valides} color="bg-green-600" borderColor="border-green-100" textColor="text-green-600" />
                <SimpleStatCard label="Déclarations rejetées" value={rejetes} color="bg-red-500" borderColor="border-red-100" textColor="text-red-500" />
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-bold text-gray-800">Déclarations en attente de décision</h2>
                  {enAttente > 0 && (
                    <button onClick={() => setActiveSection("declarations")} className="text-xs text-green-700 font-semibold hover:underline">Voir tout →</button>
                  )}
                </div>
                <div className="space-y-3">
                  {declarations.slice(0, 5).map(d => (
                    <div key={d.idDeclaration} className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl hover:bg-yellow-100 transition cursor-pointer"
                      onClick={() => setSelectedDeclaration(d)}>
                      <div>
                        <p className="font-semibold text-sm text-gray-800">{d.traitementDescription || `Déclaration #${d.idDeclaration}`}</p>
                        <p className="text-xs text-gray-400">{d.secteur || "—"} · {formatDate(d.dateSoumission)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <BadgeStatut statut={d.statut} />
                        <button className="text-xs bg-green-700 text-white px-3 py-1 rounded-lg hover:bg-green-800">Décider</button>
                      </div>
                    </div>
                  ))}
                  {enAttente === 0 && (
                    <div className="py-8 text-center text-gray-400 text-sm">
                      <Icon name="check" className="w-8 h-8 mx-auto mb-2 text-green-400" />
                      Aucune déclaration en attente — tout est à jour.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeSection === "declarations" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="p-5 border-b border-gray-100 space-y-3">
                <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                  <h2 className="font-bold text-gray-800">Déclarations ({declarationsFiltrees.length})</h2>
                  <div className="flex gap-2">
                    <button onClick={fetchEnAttente} className="px-3 py-2 text-xs font-semibold bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                      Rafraîchir
                    </button>
                    <input value={recherche} onChange={e => setRecherche(e.target.value)} placeholder="Rechercher..."
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 w-full sm:w-56" />
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {[{ key: "tous", label: "Toutes" }, { key: "EN_ATTENTE", label: "En attente" }].map(f => (
                    <button key={f.key} onClick={() => setFiltreStatut(f.key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${filtreStatut === f.key ? "bg-green-700 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-green-50 text-green-900">
                    <tr>
                      {["#", "Dénomination", "Type", "Secteur", "DPO", "Date", "Statut", "Action"].map(h => (
                        <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {declarationsFiltrees.map(d => (
                      <tr key={d.idDeclaration} className="hover:bg-green-50 transition">
                        <td className="px-4 py-3 text-gray-400 text-xs">#{d.idDeclaration}</td>
                        <td className="px-4 py-3 font-medium text-gray-800">{d.traitementDescription || "—"}</td>
                        <td className="px-4 py-3 text-gray-600 text-xs">{TYPE_LABELS[d.typeDeclaration] || d.typeDeclaration || "—"}</td>
                        <td className="px-4 py-3 text-gray-600">{d.secteur || "—"}</td>
                        <td className="px-4 py-3 text-gray-600">{d.dpoNomPrenom || "—"}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(d.dateSoumission)}</td>
                        <td className="px-4 py-3"><BadgeStatut statut={d.statut} /></td>
                        <td className="px-4 py-3">
                          <button onClick={() => setSelectedDeclaration(d)} className="text-xs px-3 py-1 rounded-lg font-medium bg-green-700 text-white hover:bg-green-800">
                            <Icon name="eye" className="w-3.5 h-3.5 mr-1" /> Décider
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {declarationsFiltrees.length === 0 && (
                  <div className="py-12 text-center text-gray-400 text-sm">
                    <Icon name="clipboard" className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    Aucune déclaration trouvée
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === "historique" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <Icon name="check" className="w-4 h-4 text-green-600" /> Déclarations validées
                  </h3>
                  <div className="space-y-2">
                    {historique.filter(h => h.decision === "APPROUVEE_DG").length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-4">Aucune déclaration validée</p>
                    )}
                    {historique.filter(h => h.decision === "APPROUVEE_DG").map(d => (
                      <div key={d.idDeclaration} className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                        <div>
                          <p className="font-semibold text-sm text-gray-800">{d.traitementDescription || `Déclaration #${d.idDeclaration}`}</p>
                          <p className="text-xs text-gray-400">{d.secteur || "—"} · {formatDate(d.dateSoumission)}</p>
                        </div>
                        <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                          <Icon name="check" className="w-3 h-3" /> Validée
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <Icon name="close" className="w-4 h-4 text-red-500" /> Déclarations rejetées
                  </h3>
                  <div className="space-y-2">
                    {historique.filter(h => h.decision === "REJETEE_DG").length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-4">Aucune déclaration rejetée</p>
                    )}
                    {historique.filter(h => h.decision === "REJETEE_DG").map(d => (
                      <div key={d.idDeclaration} className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                        <div>
                          <p className="font-semibold text-sm text-gray-800">{d.traitementDescription || `Déclaration #${d.idDeclaration}`}</p>
                          <p className="text-xs text-gray-400">{d.secteur || "—"} · {formatDate(d.dateSoumission)}</p>
                        </div>
                        <span className="text-xs text-red-500 font-semibold flex items-center gap-1">
                          <Icon name="close" className="w-3 h-3" /> Rejetée
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {historique.length === 0 && (
                <div className="py-8 text-center text-gray-400 text-sm">
                  <Icon name="history" className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                  Aucune décision prise pour le moment
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {selectedDeclaration && (
        <ModalDecision declaration={selectedDeclaration} onClose={() => setSelectedDeclaration(null)} onValider={handleValider} onRejeter={handleRejeter} />
      )}
      <Toast toast={toast} />
    </div>
  );
}

export default DgDashboard;
