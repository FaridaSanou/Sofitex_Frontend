export function pwdStrength(p) {
  if (!p) return 0;
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
}

export const STRENGTH_LABEL = ["", "Faible", "Moyen", "Fort", "Très fort"];
export const STRENGTH_COLOR = ["", "bg-red-400", "bg-yellow-400", "bg-green-400", "bg-green-600"];
export const STRENGTH_TEXT = ["", "text-red-500", "text-yellow-500", "text-green-500", "text-green-700"];

export function PasswordStrength({ password }) {
  const score = pwdStrength(password);
  if (!password) return null;
  return (
    <div className="mb-4">
      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${STRENGTH_COLOR[score]}`} style={{ width: `${score * 25}%` }} />
      </div>
      <span className={`text-xs ${STRENGTH_TEXT[score]}`}>{STRENGTH_LABEL[score]}</span>
    </div>
  );
}
