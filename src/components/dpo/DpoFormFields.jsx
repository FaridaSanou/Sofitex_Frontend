export function Field({ label, children, required }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-600 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

export function Input({ name, value, onChange, type = "text", placeholder = "" }) {
  return (
    <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
  );
}

export function Textarea({ name, value, onChange, rows = 2, placeholder = "" }) {
  return (
    <textarea name={name} value={value} onChange={onChange} rows={rows} placeholder={placeholder}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
  );
}

export function CheckField({ label, name, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
      <input type="checkbox" name={name} checked={checked} onChange={onChange} className="w-4 h-4 accent-green-700" />
      {label}
    </label>
  );
}

export function SectionTitle({ title }) {
  return (
    <h5 className="font-bold text-green-800 text-sm uppercase border-b border-green-200 pb-1 mt-4 mb-3">{title}</h5>
  );
}
