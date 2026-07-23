import { useEffect, useState } from "react";

export default function VerificationGuard({ children }) {
  const [autorise, setAutorise] = useState(false);

  useEffect(() => {
    const verifier = async () => {
      const token = localStorage.getItem("token");
      const email = localStorage.getItem("email");
      if (!token || !email) {
        window.location.href = "/";
        return;
      }
      try {
        const res = await fetch(`http://localhost:8080/api/verification/fonction?email=${email}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) { window.location.href = "/"; return; }
        const data = await res.json();
        if (data.demandeRejetee === true || data.demandeRejetee === "true") {
          window.location.href = `/compte-inactif?statut=rejetee&motif=${encodeURIComponent(data.motifRejet || "")}`;
          return;
        }
        if (data.demandeEnAttente === true || data.demandeEnAttente === "true") {
          window.location.href = "/compte-inactif?statut=en_attente";
          return;
        }
        setAutorise(true);
      } catch {
        setAutorise(true);
      }
    };
    verifier();
  }, []);

  if (!autorise) return null;
  return children;
}
