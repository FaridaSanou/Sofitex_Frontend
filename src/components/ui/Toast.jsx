import { Icon } from "./Icon";

export default function Toast({ toast }) {
  if (!toast) return null;
  const isSuccess = toast.type !== "error";
  return (
    <div className={`fixed bottom-6 right-6 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium z-50 transition-all flex items-center gap-2 ${isSuccess ? "bg-green-700" : "bg-red-500"}`}>
      <Icon name={isSuccess ? "check" : "close"} className="w-4 h-4" />
      {toast.msg}
    </div>
  );
}
