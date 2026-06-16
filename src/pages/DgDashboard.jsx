import { useState, useEffect } from "react";
import api from "../services/api";

// ═══════════════════════════════════════════════════════════════════
// Utilitaires dates
// ═══════════════════════════════════════════════════════════════════
const toDate = (d) => {
    if (!d) return null;
    if (Array.isArray(d)) return new Date(d[0], d[1] - 1, d[2], d[3] || 0, d[4] || 0);
    return new Date(d);
};
const formatDate = (d) => {
    const date = toDate(d);
    return date instanceof Date && !isNaN(date)
        ? date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
        : "—";
};

// ═══════════════════════════════════════════════════════════════════
// Icônes SVG
// ═══════════════════════════════════════════════════════════════════
function Icon({ name, className = "w-5 h-5" }) {
    const cls = `inline-block flex-shrink-0 ${className}`;
    switch (name) {
        case "check":
            return <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
        case "close":
            return <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
        case "eye":
            return <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
        case "clipboard":
            return <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>;
        case "home":
            return <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
        case "bell":
            return <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;
        case "history":
            return <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
        case "logout":
            return <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
        default:
            return null;
    }
}

// ═══════════════════════════════════════════════════════════════════
// Badge statut traitement
// ═══════════════════════════════════════════════════════════════════
function BadgeStatut({ statut }) {
    const map = {
        EN_COURS: { label: "En attente", cls: "bg-yellow-100 text-yellow-800" },
        VALIDE: { label: "Validé", cls: "bg-green-100 text-green-800" },
        REJETE: { label: "Rejeté", cls: "bg-red-100 text-red-800" },
    };
    const s = map[statut] || { label: statut, cls: "bg-gray-100 text-gray-600" };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s.cls}`}>{s.label}</span>;
}

// ═══════════════════════════════════════════════════════════════════
// Toast
// ═══════════════════════════════════════════════════════════════════
function Toast({ toast }) {
    if (!toast) return null;
    const ok = toast.type !== "error";
    return (
        <div className={`fixed bottom-6 right-6 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium z-50 flex items-center gap-2 ${ok ? "bg-green-700" : "bg-red-500"}`}>
            <Icon name={ok ? "check" : "close"} className="w-4 h-4" />
            {toast.msg}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════
// Modal Détail + Décision
// ═══════════════════════════════════════════════════════════════════
function ModalDecision({ traitement, onClose, onDecision }) {
    const [commentaire, setCommentaire] = useState("");
    const [action, setAction] = useState(null); // "VALIDE" | "REJETE"

    const handleConfirm = () => {
        if (!action) return;
        onDecision(traitement.idTraitement, action, commentaire);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl">
                {/* Header */}
                <div className="bg-green-900 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-lg">Décision sur la déclaration</h3>
                        <p className="text-green-300 text-xs">#{traitement.idTraitement} — {traitement.description}</p>
                    </div>
                    <button onClick={onClose} className="text-green-300 hover:text-white">
                        <Icon name="close" className="w-5 h-5" />
                    </button>
                </div>

                {/* Détails */}
                <div className="p-6 space-y-4 text-sm">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-xs text-gray-400 font-semibold mb-0.5">Département</p>
                            <p className="font-medium text-gray-800">{traitement.department || "—"}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-xs text-gray-400 font-semibold mb-0.5">Statut actuel</p>
                            <BadgeStatut statut={traitement.statut} />
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3 col-span-2">
                            <p className="text-xs text-gray-400 font-semibold mb-0.5">Description</p>
                            <p className="text-gray-800">{traitement.description || "—"}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3 col-span-2">
                            <p className="text-xs text-gray-400 font-semibold mb-0.5">Finalité</p>
                            <p className="text-gray-800">{traitement.texte || "—"}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-xs text-gray-400 font-semibold mb-0.5">Conservation</p>
                            <p className="text-gray-800">{traitement.dureeConservation} mois</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-xs text-gray-400 font-semibold mb-0.5">Date création</p>
                            <p className="text-gray-800">{formatDate(traitement.dateCreation)}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-xs text-gray-400 font-semibold mb-0.5">Certification</p>
                            <p className="text-gray-800">{traitement.certificationSecurite || "—"}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-xs text-gray-400 font-semibold mb-0.5">DPO responsable</p>
                            <p className="text-gray-800">{traitement.dpoNomComplet || "—"}</p>
                        </div>
                    </div>

                    {/* Choix de décision */}
                    {traitement.statut === "EN_COURS" && (
                        <>
                            <div className="border-t border-gray-100 pt-4">
                                <p className="text-sm font-semibold text-gray-700 mb-3">Votre décision <span className="text-red-500">*</span></p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setAction("VALIDE")}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${action === "VALIDE" ? "border-green-600 bg-green-50 text-green-700" : "border-gray-200 text-gray-500 hover:border-green-300"}`}
                                    >
                                        <Icon name="check" className="w-4 h-4" /> Valider
                                    </button>
                                    <button
                                        onClick={() => setAction("REJETE")}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${action === "REJETE" ? "border-red-500 bg-red-50 text-red-600" : "border-gray-200 text-gray-500 hover:border-red-300"}`}
                                    >
                                        <Icon name="close" className="w-4 h-4" /> Rejeter
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Commentaire {action === "REJETE" && <span className="text-red-500">*</span>}
                                </label>
                                <textarea
                                    rows={3}
                                    value={commentaire}
                                    onChange={e => setCommentaire(e.target.value)}
                                    placeholder={action === "REJETE" ? "Motif du rejet obligatoire..." : "Commentaire optionnel..."}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>

                            <div className="flex gap-3 justify-end pt-2">
                                <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50">
                                    Annuler
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    disabled={!action || (action === "REJETE" && !commentaire.trim())}
                                    className={`px-5 py-2 rounded-lg text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all ${action === "REJETE" ? "bg-red-500 hover:bg-red-600" : "bg-green-700 hover:bg-green-800"}`}
                                >
                                    {action === "VALIDE" ? <><Icon name="check" className="w-4 h-4 mr-1.5" />Confirmer la validation</> :
                                        action === "REJETE" ? <><Icon name="close" className="w-4 h-4 mr-1.5" />Confirmer le rejet</> :
                                            "Choisir une décision"}
                                </button>
                            </div>
                        </>
                    )}

                    {/* Déjà traité */}
                    {traitement.statut !== "EN_COURS" && (
                        <div className={`rounded-xl p-4 text-sm font-medium flex items-center gap-2 ${traitement.statut === "VALIDE" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                            <Icon name={traitement.statut === "VALIDE" ? "check" : "close"} className="w-4 h-4" />
                            Cette déclaration a déjà été {traitement.statut === "VALIDE" ? "validée" : "rejetée"}.
                            <button onClick={onClose} className="ml-auto underline text-xs">Fermer</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════
// Composant principal DgDashboard
// ═══════════════════════════════════════════════════════════════════
function DgDashboard() {
    const [activeSection, setActiveSection] = useState("dashboard");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [traitements, setTraitements] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [selectedTraitement, setSelectedTraitement] = useState(null);
    const [toast, setToast] = useState(null);
    const [recherche, setRecherche] = useState("");
    const [filtreStatut, setFiltreStatut] = useState("tous");

    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    useEffect(() => {
        // Charger tous les traitements envoyés (visibles par DG = ADMINISTRATEUR)
        api.get("/traitements").then(res => setTraitements(res.data)).catch(() => { });
        api.get("/sessions").then(res => setSessions(res.data)).catch(() => { });
    }, []);

    // Décision DG : VALIDE ou REJETE via PATCH /api/traitements/{id}/statut
    const handleDecision = (id, statut, commentaire) => {
        api.patch(`/traitements/${id}/statut`, null, { params: { statut } })
            .then(res => {
                setTraitements(prev => prev.map(t => t.idTraitement === id ? res.data : t));
                showToast(statut === "VALIDE" ? "Déclaration validée avec succès !" : "Déclaration rejetée.");
            })
            .catch(err => {
                console.error("Erreur décision DG:", err.response?.status, err.response?.data);
                showToast("Erreur lors de l'enregistrement de la décision.", "error");
            });
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = "/";
    };

    // Stats
    const enAttente = traitements.filter(t => t.statut === "EN_COURS" && t.envoyeAuDpo).length;
    const valides = traitements.filter(t => t.statut === "VALIDE").length;
    const rejetes = traitements.filter(t => t.statut === "REJETE").length;

    // Filtres
    const traitementsFiltres = traitements
        .filter(t => t.envoyeAuDpo) // uniquement ceux transmis au DPO/DG
        .filter(t => {
            if (filtreStatut === "EN_COURS") return t.statut === "EN_COURS";
            if (filtreStatut === "VALIDE") return t.statut === "VALIDE";
            if (filtreStatut === "REJETE") return t.statut === "REJETE";
            return true;
        })
        .filter(t =>
            !recherche ||
            t.description?.toLowerCase().includes(recherche.toLowerCase()) ||
            t.department?.toLowerCase().includes(recherche.toLowerCase())
        );

    const navItems = [
        { id: "dashboard", label: "Tableau de bord", icon: "home" },
        { id: "declarations", label: "Déclarations", icon: "clipboard", badge: enAttente },
        { id: "historique", label: "Historique", icon: "history" },
    ];

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            {/* ── Sidebar ── */}
            <aside className={`${sidebarOpen ? "w-64" : "w-16"} bg-green-900 text-white flex flex-col transition-all duration-300 shadow-xl`}>
                <div className="flex items-center gap-3 px-4 py-5 border-b border-green-800">
                    <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-green-900 font-black text-sm">DG</span>
                    </div>
                    {sidebarOpen && (
                        <div>
                            <p className="font-bold text-sm leading-tight">Direction Générale</p>
                            <p className="text-green-400 text-xs">SOFITEX · Plateforme CIL</p>
                        </div>
                    )}
                </div>

                <nav className="flex-1 py-4 space-y-1 px-2">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveSection(item.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeSection === item.id ? "bg-white text-green-900 shadow" : "text-green-200 hover:bg-green-800"}`}
                        >
                            <Icon name={item.icon} className="w-5 h-5 flex-shrink-0" />
                            {sidebarOpen && <span className="flex-1 text-left">{item.label}</span>}
                            {sidebarOpen && item.badge > 0 && (
                                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">{item.badge}</span>
                            )}
                        </button>
                    ))}
                </nav>

                <div className="px-3 py-4 border-t border-green-800">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-700 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">DG</span>
                        </div>
                        {sidebarOpen && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate">Directeur Général</p>
                                <p className="text-green-400 text-xs truncate">{localStorage.getItem("email") || ""}</p>
                            </div>
                        )}
                        {sidebarOpen && (
                            <button onClick={handleLogout} className="text-green-400 hover:text-white">
                                <Icon name="logout" className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <button onClick={() => setSidebarOpen(o => !o)} className="w-full flex items-center justify-center py-2 mt-2 rounded-lg text-green-400 hover:bg-green-800 text-sm">
                        {sidebarOpen ? "◀ Réduire" : "▶"}
                    </button>
                </div>
            </aside>

            {/* ── Main ── */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(o => !o)} className="text-gray-500 hover:text-gray-700">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-lg font-bold text-gray-800">
                                {activeSection === "dashboard" && "Tableau de bord"}
                                {activeSection === "declarations" && "Déclarations à traiter"}
                                {activeSection === "historique" && "Historique des décisions"}
                            </h1>
                            <p className="text-xs text-gray-400">
                                {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                            </p>
                        </div>
                    </div>
                    {enAttente > 0 && (
                        <button onClick={() => setActiveSection("declarations")} className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                            <Icon name="bell" className="w-5 h-5" />
                            <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">{enAttente > 9 ? "9+" : enAttente}</span>
                        </button>
                    )}
                </header>

                <main className="flex-1 overflow-y-auto p-6">

                    {/* ── Dashboard ── */}
                    {activeSection === "dashboard" && (
                        <div className="space-y-6">
                            {/* Stats */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                <div className="bg-white rounded-2xl p-5 shadow-sm border border-yellow-100">
                                    <p className="text-3xl font-black text-yellow-600">{enAttente}</p>
                                    <p className="text-sm font-semibold text-gray-700 mt-1">En attente de décision</p>
                                    <p className="text-xs text-gray-400 mt-0.5">Déclarations transmises par le DPO</p>
                                </div>
                                <div className="bg-white rounded-2xl p-5 shadow-sm border border-green-100">
                                    <p className="text-3xl font-black text-green-600">{valides}</p>
                                    <p className="text-sm font-semibold text-gray-700 mt-1">Déclarations validées</p>
                                    <p className="text-xs text-gray-400 mt-0.5">Approuvées par la DG</p>
                                </div>
                                <div className="bg-white rounded-2xl p-5 shadow-sm border border-red-100">
                                    <p className="text-3xl font-black text-red-500">{rejetes}</p>
                                    <p className="text-sm font-semibold text-gray-700 mt-1">Déclarations rejetées</p>
                                    <p className="text-xs text-gray-400 mt-0.5">Renvoyées pour correction</p>
                                </div>
                            </div>

                            {/* Déclarations en attente */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="font-bold text-gray-800">Déclarations en attente de décision</h2>
                                    {enAttente > 0 && (
                                        <button onClick={() => setActiveSection("declarations")} className="text-xs text-green-700 font-semibold hover:underline">
                                            Voir tout →
                                        </button>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    {traitements.filter(t => t.envoyeAuDpo && t.statut === "EN_COURS").slice(0, 5).map(t => (
                                        <div
                                            key={t.idTraitement}
                                            className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl hover:bg-yellow-100 transition cursor-pointer"
                                            onClick={() => setSelectedTraitement(t)}
                                        >
                                            <div>
                                                <p className="font-semibold text-sm text-gray-800">{t.description}</p>
                                                <p className="text-xs text-gray-400">{t.department} · {formatDate(t.dateCreation)}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <BadgeStatut statut={t.statut} />
                                                <button className="text-xs bg-green-700 text-white px-3 py-1 rounded-lg hover:bg-green-800">
                                                    Décider
                                                </button>
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

                    {/* ── Déclarations ── */}
                    {activeSection === "declarations" && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                            {/* Filtres */}
                            <div className="p-5 border-b border-gray-100 space-y-3">
                                <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                                    <h2 className="font-bold text-gray-800">
                                        Déclarations ({traitementsFiltres.length})
                                    </h2>
                                    <input
                                        value={recherche}
                                        onChange={e => setRecherche(e.target.value)}
                                        placeholder="Rechercher..."
                                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 w-full sm:w-56"
                                    />
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    {[
                                        { key: "tous", label: "Toutes" },
                                        { key: "EN_COURS", label: "En attente" },
                                        { key: "VALIDE", label: "Validées" },
                                        { key: "REJETE", label: "Rejetées" },
                                    ].map(f => (
                                        <button
                                            key={f.key}
                                            onClick={() => setFiltreStatut(f.key)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${filtreStatut === f.key ? "bg-green-700 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                                        >
                                            {f.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-green-50 text-green-900">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-semibold">#</th>
                                            <th className="px-4 py-3 text-left font-semibold">Description</th>
                                            <th className="px-4 py-3 text-left font-semibold">Département</th>
                                            <th className="px-4 py-3 text-left font-semibold">DPO</th>
                                            <th className="px-4 py-3 text-left font-semibold">Date</th>
                                            <th className="px-4 py-3 text-left font-semibold">Statut</th>
                                            <th className="px-4 py-3 text-left font-semibold">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {traitementsFiltres.map(t => (
                                            <tr key={t.idTraitement} className="hover:bg-green-50 transition">
                                                <td className="px-4 py-3 text-gray-400 text-xs">#{t.idTraitement}</td>
                                                <td className="px-4 py-3 font-medium text-gray-800">{t.description}</td>
                                                <td className="px-4 py-3 text-gray-600">{t.department || "—"}</td>
                                                <td className="px-4 py-3 text-gray-600">{t.dpoNomComplet || "—"}</td>
                                                <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(t.dateCreation)}</td>
                                                <td className="px-4 py-3"><BadgeStatut statut={t.statut} /></td>
                                                <td className="px-4 py-3">
                                                    <button
                                                        onClick={() => setSelectedTraitement(t)}
                                                        className={`text-xs px-3 py-1 rounded-lg font-medium ${t.statut === "EN_COURS"
                                                            ? "bg-green-700 text-white hover:bg-green-800"
                                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                            }`}
                                                    >
                                                        <Icon name="eye" className="w-3.5 h-3.5 mr-1" />
                                                        {t.statut === "EN_COURS" ? "Décider" : "Voir"}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {traitementsFiltres.length === 0 && (
                                    <div className="py-12 text-center text-gray-400 text-sm">
                                        <Icon name="clipboard" className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                                        Aucune déclaration trouvée
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── Historique ── */}
                    {activeSection === "historique" && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {/* Validées */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                                    <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                        <Icon name="check" className="w-4 h-4 text-green-600" /> Déclarations validées
                                    </h3>
                                    <div className="space-y-2">
                                        {traitements.filter(t => t.statut === "VALIDE").length === 0 && (
                                            <p className="text-sm text-gray-400 text-center py-4">Aucune déclaration validée</p>
                                        )}
                                        {traitements.filter(t => t.statut === "VALIDE").map(t => (
                                            <div key={t.idTraitement} className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                                                <div>
                                                    <p className="font-semibold text-sm text-gray-800">{t.description}</p>
                                                    <p className="text-xs text-gray-400">{t.department} · {formatDate(t.dateCreation)}</p>
                                                </div>
                                                <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                                                    <Icon name="check" className="w-3 h-3" /> Validé
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Rejetées */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                                    <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                        <Icon name="close" className="w-4 h-4 text-red-500" /> Déclarations rejetées
                                    </h3>
                                    <div className="space-y-2">
                                        {traitements.filter(t => t.statut === "REJETE").length === 0 && (
                                            <p className="text-sm text-gray-400 text-center py-4">Aucune déclaration rejetée</p>
                                        )}
                                        {traitements.filter(t => t.statut === "REJETE").map(t => (
                                            <div key={t.idTraitement} className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                                                <div>
                                                    <p className="font-semibold text-sm text-gray-800">{t.description}</p>
                                                    <p className="text-xs text-gray-400">{t.department} · {formatDate(t.dateCreation)}</p>
                                                </div>
                                                <span className="text-xs text-red-500 font-semibold flex items-center gap-1">
                                                    <Icon name="close" className="w-3 h-3" /> Rejeté
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* ── Modal décision ── */}
            {selectedTraitement && (
                <ModalDecision
                    traitement={selectedTraitement}
                    onClose={() => setSelectedTraitement(null)}
                    onDecision={handleDecision}
                />
            )}

            <Toast toast={toast} />
        </div>
    );
}

export default DgDashboard;
