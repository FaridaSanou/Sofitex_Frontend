export function Field({ label, error, children, required }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="block text-sm font-medium text-gray-700">{label} {required && <span className="text-red-500">*</span>}</label>
      {children}
      {error && <span className="text-red-500 text-xs">{error.message || error}</span>}
    </div>
  );
}

export function inputCls(err) {
  return `h-10 px-3 rounded-lg border text-sm outline-none bg-white/70 w-full ${err ? "border-red-300 bg-red-50" : "border-gray-300 focus:border-green-500"}`;
}
