import { useState } from "react";
import { useForm } from "react-hook-form";
import logoImage from "../assets/image.png";
import backgroundImage from "../assets/nature.png";
import { Field, inputCls } from "../components/forms/Field";
import { EyeIcon, EyeOffIcon } from "../components/auth/EyeIcon";
import { PasswordStrength } from "../components/auth/PasswordStrength";
import AccountTypeSelector, { TYPES } from "../components/auth/AccountTypeSelector";
import CreateAccountSuccess from "../components/auth/CreateAccountSuccess";

const MAIN_STEPS = ["Informations personnelles", "Type & Accès"];

export default function CreateAccount() {
  const [mainStep, setMainStep] = useState(0);
  const [subStep, setSubStep] = useState(0);
  const [typeChoisi, setTypeChoisi] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errGlobal, setErrGlobal] = useState("");

  const { register, handleSubmit, watch, trigger, formState: { errors } } = useForm({ mode: "onTouched" });

  const motdepasse = watch("motdepasse", "");

  const handleNextSubStep = async () => {
    const valid = await trigger(["nom", "prenom", "email", "telephone"]);
    if (valid) setSubStep(1);
  };

  const handleNextMain = async () => {
    const valid = await trigger(["motdepasse", "confirmPwd"]);
    if (valid) { setMainStep(1); setSubStep(0); }
  };

  const onSubmit = async (data) => {
    if (!typeChoisi) { setErrGlobal("Veuillez choisir un type de compte."); return; }
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
      if (!response.ok) {
        try {
          const body = await response.json();
          setErrGlobal(body.message || body.detail || "Une erreur est survenue. Veuillez réessayer.");
        } catch {
          setErrGlobal("Une erreur est survenue. Veuillez réessayer.");
        }
        return;
      }
      setDone(true);
    } catch (e) {
      setErrGlobal("Impossible de contacter le serveur.");
    } finally { setLoading(false); }
  };

  const handleReset = () => { setDone(false); setMainStep(0); setSubStep(0); setTypeChoisi(""); };

  if (done) return <CreateAccountSuccess onReset={handleReset} />;

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: "cover", backgroundPosition: "center", backgroundColor: "rgba(0,0,0,0.5)", backgroundBlendMode: "overlay" }}>
      <div className="rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
        style={{
          background: "linear-gradient(160deg, rgba(255,255,255,0.97) 0%, rgba(220,252,231,0.97) 100%)",
          boxShadow: "0 0 0 3px #15803d, 0 0 0 6px rgba(21,128,61,0.15), 0 24px 60px rgba(0,0,0,0.35)",
          border: "1px solid rgba(21,128,61,0.3)",
        }}>
        <div className="px-6 py-4 text-center"
          style={{ background: "linear-gradient(135deg, #15803d, #166534)" }}>
          <img src={logoImage} alt="Logo" className="w-10 h-10 object-contain mx-auto mb-1" />
          <h1 className="text-xl font-semibold text-white">Créer un compte</h1>
          <p className="text-green-100 text-sm mt-1">Remplissez les informations pour accéder à la plateforme</p>
        </div>

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

        <div className="p-6">
          {errGlobal && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">⚠️ {errGlobal}</div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            {mainStep === 0 && (
              <>
                <div className="flex gap-2 mb-6">
                  <div className={`flex-1 text-center py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer
                    ${subStep === 0 ? "bg-green-50 text-green-700 border border-green-300" : "bg-gray-100 text-gray-400"}`}>
                    👤 Identité
                  </div>
                  <div className={`flex-1 text-center py-2 rounded-lg text-sm font-medium transition-colors
                    ${subStep === 1 ? "bg-green-50 text-green-700 border border-green-300" : "bg-gray-100 text-gray-400"}`}>
                    🔐 Sécurité
                  </div>
                </div>

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

                    <PasswordStrength password={motdepasse} />

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

            {mainStep === 1 && (
              <>
                {!typeChoisi && (
                  <>
                    <AccountTypeSelector typeChoisi={typeChoisi} setTypeChoisi={setTypeChoisi} />
                    <button type="button" onClick={() => setMainStep(0)}
                      className="w-full h-10 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                      ← Retour
                    </button>
                  </>
                )}

                {typeChoisi && (
                  <>
                    <div className="flex items-center gap-3 mb-5 p-3 bg-green-50 border border-green-200 rounded-xl">
                      <span className="text-2xl">{TYPES.find(t => t.value === typeChoisi)?.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">{TYPES.find(t => t.value === typeChoisi)?.label}</p>
                        <button type="button" onClick={() => setTypeChoisi("")}
                          className="text-xs text-green-700 hover:underline">Changer de type</button>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm rounded-lg px-4 py-3 mb-5">
                      ⚠️ Votre compte sera en statut <strong>EN_ATTENTE</strong> jusqu'à validation.
                    </div>

                    {typeChoisi === "DPO" && (
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <Field label="Département" error={errors.department}>
                          <input placeholder="Ex : Département IT" className={inputCls(errors.department)}
                            {...register("department", { required: "Champ requis" })} />
                        </Field>
                        <Field label="Téléphone professionnel" error={errors.telProfessionnel}>
                          <input type="tel" placeholder="Ex : +226 70 00 00 00" className={inputCls(errors.telProfessionnel)}
                            {...register("telProfessionnel", { required: "Champ requis" })} />
                        </Field>
                      </div>
                    )}

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
                          <Field label="Téléphone professionnel" error={errors.telProfessionnel}>
                            <input type="tel" placeholder="Ex : +226 70 00 00 00" className={inputCls(errors.telProfessionnel)}
                              {...register("telProfessionnel", { required: "Champ requis" })} />
                          </Field>
                        </div>
                      </>
                    )}

                    {typeChoisi === "DG" && (
                      <>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <Field label="Organisme" error={errors.organisme}>
                            <input placeholder="Ex : Direction Générale des Finances" className={inputCls(errors.organisme)}
                              {...register("organisme", { required: "Champ requis" })} />
                          </Field>
                          <Field label="Téléphone professionnel" error={errors.telProfessionnel}>
                            <input type="tel" placeholder="Ex : +226 70 00 00 00" className={inputCls(errors.telProfessionnel)}
                              {...register("telProfessionnel", { required: "Champ requis" })} />
                          </Field>
                        </div>
                        <div className="mb-4">
                          <Field label="Département" error={errors.department}>
                            <input placeholder="Ex : Direction Générale" className={inputCls(errors.department)}
                              {...register("department", { required: "Champ requis" })} />
                          </Field>
                        </div>
                      </>
                    )}

                    <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                      <button type="button"
                        onClick={() => { setTypeChoisi(""); setMainStep(0); setSubStep(1); }}
                        style={{
                          flex: 1, height: "40px",
                          border: "2px solid #15803d",
                          borderRadius: "10px",
                          color: "#15803d",
                          background: "transparent",
                          fontSize: "14px", fontWeight: 500, cursor: "pointer",
                        }}>
                        ← Retour aux informations
                      </button>
                      <button type="submit"
                        style={{
                          flex: 1, height: "40px",
                          background: "linear-gradient(135deg, #15803d, #166534)",
                          border: "none", borderRadius: "10px",
                          color: "white", fontSize: "14px", fontWeight: 500,
                          cursor: "pointer",
                        }}>
                        ✓ Créer le compte
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Déjà un compte ?{" "}
            <a href="/" className="text-green-700 font-medium hover:underline">Se connecter</a>
          </p>
        </div>
      </div>
    </div>
  );
}
