import nature from "../../assets/nature.png";

export default function AuthCard({ children, title, subtitle, logo }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: `url(${nature})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "rgba(0, 0, 0, 0.55)",
        backgroundBlendMode: "overlay",
      }}
    >
      <div className="rounded-2xl w-full max-w-lg overflow-hidden"
        style={{
          background: "linear-gradient(160deg, rgba(255,255,255,0.97) 0%, rgba(220,252,231,0.97) 100%)",
          boxShadow: "0 0 0 3px #15803d, 0 0 0 6px rgba(21,128,61,0.15), 0 24px 60px rgba(0,0,0,0.35)",
          border: "1px solid rgba(21,128,61,0.3)",
        }}>
        <div className="px-6 py-4 text-center"
          style={{ background: "linear-gradient(135deg, #15803d, #166534)" }}>
          <div className="w-16 h-16 rounded-full mx-auto mb-2 p-1"
            style={{ background: "rgba(255,255,255,1)", border: "2px solid rgba(255,255,255,0.6)" }}>
            <img src={logo} alt="Logo" className="w-full h-full object-contain rounded-full" />
          </div>
          <h1 className="text-xl font-semibold text-white">{title}</h1>
          {subtitle && <p className="text-green-100 text-sm mt-1">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}
