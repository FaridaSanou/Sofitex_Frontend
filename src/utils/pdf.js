import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export function telechargerTraitementPdf(traitement) {
  const doc = new jsPDF();
  const titre = `Traitement #${traitement.idTraitement}`;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(titre, 14, 20);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Généré le ${new Date().toLocaleDateString("fr-FR")}`, 14, 28);

  doc.setDrawColor(22, 163, 74);
  doc.setLineWidth(0.5);
  doc.line(14, 32, 196, 32);

  const rows = [
    ["Département", traitement.department || "—"],
    ["Statut", traitement.statut || "—"],
    ["Description", traitement.description || "—"],
    ["Texte / Finalité", traitement.texte || "—"],
    ["Certification sécurité", traitement.certificationSecurite || "—"],
    ["Durée de conservation", traitement.dureeConservation ? `${traitement.dureeConservation} mois` : "—"],
    ["Date de création", traitement.dateCreation || "—"],
    ["Date de fin", traitement.dateFin || "—"],
    ["Nombre de données", String(traitement.nombreDonnee ?? 0)],
    ["Session", traitement.sessionCollecteId ? `#${traitement.sessionCollecteId}` : "Sans session"],
    ["Envoyé au DPO", traitement.envoyeAuDpo ? "Oui" : "Non"],
  ];
  if (traitement.dateEnvoiDpo) rows.push(["Date d'envoi DPO", traitement.dateEnvoiDpo]);

  autoTable(doc, {
    startY: 38,
    head: [["Champ", "Valeur"]],
    body: rows,
    theme: "striped",
    headStyles: { fillColor: [22, 163, 74], fontStyle: "bold" },
    styles: { fontSize: 9 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 60 } },
  });

  doc.save(`traitement_${traitement.idTraitement}.pdf`);
}

export function telechargerDeclarationPdf(declaration) {
  const doc = new jsPDF();
  const titre = `Déclaration #${declaration.idDeclaration}`;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(titre, 14, 20);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Généré le ${new Date().toLocaleDateString("fr-FR")}`, 14, 28);

  doc.setDrawColor(22, 163, 74);
  doc.setLineWidth(0.5);
  doc.line(14, 32, 196, 32);

  const rows = [
    ["Type", declaration.typeDeclaration || "—"],
    ["Statut", declaration.statut || "—"],
    ["Traitement", declaration.traitementDescription || declaration.denominationTraitement || "—"],
    ["Date de soumission", declaration.dateSoumission || "—"],
    ["Secteur", declaration.secteur || "—"],
    ["Nature de la demande", declaration.natureDemande || "—"],
    ["Responsable", declaration.responsableDeclaration || "—"],
    ["Contact confidentialité", declaration.contactConfidentialite || "—"],
    ["Date de mise en oeuvre", declaration.dateMiseEnOeuvre || "—"],
    ["Origine", declaration.origineDeclaration || "—"],
    ["DPO", declaration.dpoNomPrenom || "—"],
    ["Durée de conservation", declaration.dureeConservation || "—"],
    ["Lieu de stockage", declaration.lieuStockage || "—"],
  ];

  autoTable(doc, {
    startY: 38,
    head: [["Champ", "Valeur"]],
    body: rows,
    theme: "striped",
    headStyles: { fillColor: [22, 163, 74], fontStyle: "bold" },
    styles: { fontSize: 9 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 60 } },
  });

  doc.save(`declaration_${declaration.idDeclaration}.pdf`);
}