import { useState } from "react";
import { useForm } from "react-hook-form";
import logoImage from "../assets/image.png";
import backgroundImage from "../assets/nature.png";

// ─── Icônes SVG ───────────────────────────────────────────────────────────────
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
  </svg>
);

// ─── Utilitaire : force du mot de passe ──────────────────────────────────────
function pwdStrength(p) {
  if (!p) return 0;
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
}
const STRENGTH_LABEL = ["", "Faible", "Moyen", "Fort", "Très fort"];
const STRENGTH_COLOR = ["", "bg-red-400", "bg-yellow-400", "bg-green-400", "bg-green-600"];
const STRENGTH_TEXT  = ["", "text-red-500", "text-yellow-500", "text-green-500", "text-green-700"];

// ─── Types d'utilisateurs ─────────────────────────────────────────────────────
const TYPES = [
  { value: "USAGER",             label: "Usager",             icon: "👤", description: "Citoyen ou personne physique" },
  { value: "CIL",                label: "CIL",                icon: "🛡️", description: "Comission de l'Informatique et Libertés" },
  { value: "DPO",                label: "DPO",                icon: "🔒", description: "Délégué à la Protection des Données" },
  { value: "UTILISATEUR_METIER", label: "Utilisateur Métier", icon: "💼", description: "Utilisateur interne de l'organisation" },
];

const MAIN_STEPS = ["Informations personnelles", "Type & Demande d'acces"];

// ─── Champ réutilisable ───────────────────────────────────────────────────────
const Field = ({ label, error, children }) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-medium text-gray-700">{label} <span className="text-red-500">*</span></label>
    {children}
    {error && <span className="text-red-500 text-xs">{error.message}</span>}
  </div>
);

const inputCls = (err) =>
  `h-10 px-3 rounded-lg border text-sm outline-none bg-white/70 w-full ${err ? "border-red-300 bg-red-50" : "border-gray-300 focus:border-green-500"}`;

// ─── Composant principal ─────────────────────────────────────────────────────
export default function CreateAccount() {
  const [mainStep, setMainStep]     = useState(0);
  const [subStep, setSubStep]       = useState(0);
  const [typeChoisi, setTypeChoisi] = useState("");
  const [showPwd, setShowPwd]       = useState(false);
  const [done, setDone]             = useState(false);
  const [loading, setLoading]       = useState(false);
  const [errGlobal, setErrGlobal]   = useState("");

  const { register, handleSubmit, watch, trigger, formState: { errors } } = useForm({ mode: "onTouched" });

  const motdepasse = watch("motdepasse", "");
  const score      = pwdStrength(motdepasse);

  const handleNextSubStep = async () => {
    const valid = await trigger(["nom", "prenom", "email", "telephone"]);
    if (valid) setSubStep(1);
  };

  const handleNextMain = async () => {
    const valid = await trigger(["motdepasse", "confirmPwd"]);
    if (valid) { setMainStep(1); setSubStep(0); }
  };

  const onSubmit = async (data) => {
    if (!typeChoisi) { setErrGlobal("Veuillez choisir un type d'utilisateur."); return; }
    setLoading(true);
    setErrGlobal("");
    try {
      const response = await fetch("http://localhost:8080/api/auth/inscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: data.nom, prenom: data.prenom, email: data.email,
          telephone: data.telephone, motDePasse: data.motdepasse,
          typeUtilisateur: typeChoisi,
          adresse: data.adresse, matricule: data.matricule,
          service: data.service, niveauResponsabilite: data.niveauResponsabilite,
          organisme: data.organisme, adresseProfessionnelle: data.adresseProfessionnelle,
          dateNomination: data.dateNomination,
          fonction: data.fonction, department: data.department,
        }),
      });
      if (!response.ok) { setErrGlobal("Une erreur est survenue. Veuillez réessayer."); return; }
      setDone(true);
    } catch { setErrGlobal("Impossible de contacter le serveur."); }
    finally { setLoading(false); }
  };

  // ── Succès ────────────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: "cover", backgroundPosition: "center", backgroundColor: "rgba(0,0,0,0.5)", backgroundBlendMode: "overlay" }}>
        <div className="rounded-2xl shadow-2xl p-10 w-full max-w-lg text-center"
          style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(240,253,244,0.95))" }}>
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✓</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Compte créé avec succès !</h2>
          <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full mb-4">EN_ATTENTE</span>
          <p className="text-sm text-gray-500 mb-6">Votre demande a bien été enregistrée.<br />Un administrateur validera votre compte sous peu.</p>
          <button onClick={() => { setDone(false); setMainStep(0); setSubStep(0); setTypeChoisi(""); }}
            className="border border-gray-300 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            ← Créer un autre compte
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: "cover", backgroundPosition: "center", backgroundColor: "rgba(0,0,0,0.5)", backgroundBlendMode: "overlay" }}>

      <div className="rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
        style={{ background: "linear-gradient(160deg, rgba(255,255,255,0.97) 0%, rgba(220,252,231,0.97) 100%)" }}>

        {/* ── En-tête ── */}
        <div className="px-8 py-6 text-center"
          style={{ background: "linear-gradient(135deg, #15803d, #166534)" }}>
          <img src={logoImage} alt="Logo" className="w-14 h-14 object-contain mx-auto mb-2" />
          <h1 className="text-xl font-semibold text-white">Créer un compte</h1>
          <p className="text-green-100 text-sm mt-1">Remplissez les informations pour accéder à la plateforme</p>
        </div>

        {/* ── Barre principale ── */}
        <div className="flex border-b border-gray-200">
          {MAIN_STEPS.map((label, i) => (
            <div key={i} className={`flex-1 py-3 text-center text-sm font-medium transition-colors
              ${mainStep === i ? "bg-white text-green-700 border-b-2 border-green-700" : "bg-gray-50 text-gray-400"}`}>
              <span className="inline-flex items-center gap-2 justify-center">
                <span className={`w-5 h-5 rounded-full text-xs flex items-center justify-center
                  ${mainStep > i ? "bg-green-600 text-white" : mainStep === i ? "bg-green-700 text-white" : "bg-gray-300 text-gray-500"}`}>
                  {mainStep > i ? "✓" : i + 1}
                </span>
                {label}
              </span>
            </div>
          ))}
        </div>

        <div className="p-8">

          {errGlobal && (
            <div className="bg-green-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">⚠️ {errGlobal}</div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>

            {/* ════ PARTIE 1 : INFORMATIONS PERSONNELLES ════ */}
            {mainStep === 0 && (
              <>
                {/* Sous-onglets */}
                <div className="flex gap-2 mb-6">
                  <div className={`flex-1 text-center py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer
                    ${subStep === 0 ? "bg-green-50 text-green-700 border border-green-300" : "bg-gray-100 text-gray-400"}`}>
                    Identité
                  </div>
                  <div className={`flex-1 text-center py-2 rounded-lg text-sm font-medium transition-colors
                    ${subStep === 1 ? "bg-green-50 text-green-700 border border-green-300" : "bg-gray-100 text-gray-400"}`}>
                    Sécurité
                  </div>
                </div>

                {/* ── Identité : 2 colonnes ── */}
                {subStep === 0 && (
                  <>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <Field label="Nom" error={errors.nom}>
                        <input placeholder="Ex : Traoré" className={inputCls(errors.nom)}
                          {...register("nom", { required: "Champ requis" })} />
                      </Field>
                      <Field label="Prénom" error={errors.prenom}>
                        <input placeholder="Ex : Aminata" className={inputCls(errors.prenom)}
                          {...register("prenom", { required: "Champ requis" })} />
                      </Field>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <Field label="Adresse e-mail" error={errors.email}>
                        <input type="email" placeholder="aminata@gmail.com" className={inputCls(errors.email)}
                          {...register("email", {
                            required: "Champ requis",
                            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Email invalide" },
                          })} />
                      </Field>
                      <Field label="Téléphone" error={errors.telephone}>
                        <input type="tel" placeholder="+226 70 00 00 00" className={inputCls(errors.telephone)}
                          {...register("telephone", { required: "Champ requis" })} />
                      </Field>
                    </div>

                    <button type="button" onClick={handleNextSubStep}
                      className="w-full h-10 bg-green-700 hover:bg-green-800 text-white font-medium rounded-lg text-sm transition-colors">
                      Continuer →
                    </button>
                  </>
                )}

                {/* ── Sécurité ── */}
                {subStep === 1 && (
                  <>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <Field label="Mot de passe" error={errors.motdepasse}>
                        <div className="relative">
                          <input type={showPwd ? "text" : "password"} placeholder="Min. 8 caractères"
                            className={inputCls(errors.motdepasse) + " pr-10"}
                            {...register("motdepasse", {
                              required: "Champ requis",
                              minLength: { value: 8, message: "8 caractères minimum" },
                            })} />
                          <button type="button" onClick={() => setShowPwd(v => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            {showPwd ? <EyeOffIcon /> : <EyeIcon />}
                          </button>
                        </div>
                      </Field>
                      <Field label="Confirmer le mot de passe" error={errors.confirmPwd}>
                        <div className="relative">
                          <input type={showPwd ? "text" : "password"} placeholder="Répétez le mot de passe"
                            className={inputCls(errors.confirmPwd) + " pr-10"}
                            {...register("confirmPwd", {
                              required: "Champ requis",
                              validate: (val) => val === motdepasse || "Mots de passe différents",
                            })} />
                          <button type="button" onClick={() => setShowPwd(v => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            {showPwd ? <EyeOffIcon /> : <EyeIcon />}
                          </button>
                        </div>
                      </Field>
                    </div>

                    {motdepasse && (
                      <div className="mb-4">
                        <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${STRENGTH_COLOR[score]}`} style={{ width: `${score * 25}%` }} />
                        </div>
                        <span className={`text-xs ${STRENGTH_TEXT[score]}`}>{STRENGTH_LABEL[score]}</span>
                      </div>
                    )}

                    <div className="flex gap-3 mt-2">
                      <button type="button" onClick={() => setSubStep(0)}
                        className="flex-1 h-10 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                        ← Retour
                      </button>
                      <button type="button" onClick={handleNextMain}
                        className="flex-1 h-10 bg-green-700 hover:bg-green-800 text-white font-medium rounded-lg text-sm transition-colors">
                        Continuer →
                      </button>
                    </div>
                  </>
                )}
              </>
            )}

            {/* ════ PARTIE 2 : TYPE & ACCÈS ════ */}
            {mainStep === 1 && (
              <>
                {/* Cartes de type */}
                {!typeChoisi && (
                  <>
                    <p className="text-sm font-medium text-gray-700 mb-4">
                      Choisissez un type d'utilisateur<span className="text-green-500">*</span>
                    </p>
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      {TYPES.map((t) => (
                        <button key={t.value} type="button" onClick={() => setTypeChoisi(t.value)}
                          className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all text-center bg-white/60">
                          <span className="text-3xl">{t.icon}</span>
                          <span className="text-sm font-semibold text-gray-800">{t.label}</span>
                          <span className="text-xs text-gray-400">{t.description}</span>
                        </button>
                      ))}
                    </div>
                    <button type="button" onClick={() => setMainStep(0)}
                      className="w-full h-10 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                      ← Retour
                    </button>
                  </>
                )}

                {/* Champs spécifiques */}
                {typeChoisi && (
                  <>
                    {/* Badge type */}
                    <div className="flex items-center gap-3 mb-5 p-3 bg-green-50 border border-green-200 rounded-xl">
                      <span className="text-2xl">{TYPES.find(t => t.value === typeChoisi)?.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">{TYPES.find(t => t.value === typeChoisi)?.label}</p>
                        <button type="button" onClick={() => setTypeChoisi("")}
                          className="text-xs text-green-700 hover:underline">Changer de type</button>
                      </div>
                    </div>

                    <div className="bg-green50 border border-yellow-200 text-yellow-800 text-sm rounded-lg px-4 py-3 mb-5">
                      ⚠️ Votre compte sera en statut <strong>EN_ATTENTE</strong> jusqu'à validation.
                    </div>

                    {/* ── USAGER ── */}
                    {typeChoisi === "USAGER" && (
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <Field label="Adresse" error={errors.adresse}>
                          <input placeholder="01 BP 00, Ouagadougou" className={inputCls(errors.adresse)}
                            {...register("adresse", { required: "Champ requis" })} />
                        </Field>
                        <Field label="Matricule" error={errors.matricule}>
                          <input placeholder="MAT-2024-001" className={inputCls(errors.matricule)}
                            {...register("matricule", { required: "Champ requis" })} />
                        </Field>
                      </div>
                    )}

                    {/* ── CIL ── */}
                    {typeChoisi === "CIL" && (
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <Field label="Service" error={errors.service}>
                          <input placeholder="Ex : Service informatique" className={inputCls(errors.service)}
                            {...register("service", { required: "Champ requis" })} />
                        </Field>
                        <Field label="Niveau de responsabilité" error={errors.niveauResponsabilite}>
                          <input placeholder="Ex : Responsable" className={inputCls(errors.niveauResponsabilite)}
                            {...register("niveauResponsabilite", { required: "Champ requis" })} />
                        </Field>
                      </div>
                    )}

                    {/* ── DPO ── */}
                    {typeChoisi === "DPO" && (
                      <>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <Field label="Organisme" error={errors.organisme}>
                            <input placeholder="Ex : Ministère de la santé" className={inputCls(errors.organisme)}
                              {...register("organisme", { required: "Champ requis" })} />
                          </Field>
                          <Field label="Date de nomination" error={errors.dateNomination}>
                            <input type="date" className={inputCls(errors.dateNomination)}
                              {...register("dateNomination", { required: "Champ requis" })} />
                          </Field>
                        </div>
                        <div className="mb-6">
                          <Field label="Adresse professionnelle" error={errors.adresseProfessionnelle}>
                            <input placeholder="Ex : 01 BP 00, Ouagadougou" className={inputCls(errors.adresseProfessionnelle)}
                              {...register("adresseProfessionnelle", { required: "Champ requis" })} />
                          </Field>
                        </div>
                      </>
                    )}

                    {/* ── UTILISATEUR_METIER ── */}
                    {typeChoisi === "UTILISATEUR_METIER" && (
                      <>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <Field label="Fonction" error={errors.fonction}>
                            <input placeholder="Ex : Directeur" className={inputCls(errors.fonction)}
                              {...register("fonction", { required: "Champ requis" })} />
                          </Field>
                          <Field label="Département" error={errors.department}>
                            <input placeholder="Ex : Département RH" className={inputCls(errors.department)}
                              {...register("department", { required: "Champ requis" })} />
                          </Field>
                        </div>
                        <div className="mb-6">
                          <Field label="Date de nomination" error={errors.dateNomination}>
                            <input type="date" className={inputCls(errors.dateNomination)}
                              {...register("dateNomination", { required: "Champ requis" })} />
                          </Field>
                        </div>
                      </>
                    )}

                    <button type="submit" disabled={loading}
                      className="w-full h-10 bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white font-medium rounded-lg text-sm transition-colors">
                      {loading ? "Envoi en cours..." : "✓ Créer le compte"}
                    </button>
                  </>
                )}
              </>
            )}

          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Déjà un compte ?{" "}
            <a href="/login" className="text-green-700 font-medium hover:underline">Se connecter</a>
          </p>

        </div>
      </div>
    </div>
  );
}
