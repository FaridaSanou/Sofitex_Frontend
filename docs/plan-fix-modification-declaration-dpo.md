# Fix: Modification déclaration depuis la liste traitements DPO

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Quand le DPO modifie un traitement qui a déjà une déclaration et clique "Modifier", la déclaration est correctement mise à jour via l'API, le traitement disparaît de la liste des traitements et la déclaration apparaît dans la liste des déclarations.

**Architecture:** Deux bugs frontend à corriger — le type de déclaration n'est pas récupéré lors du chargement, et les listes ne sont pas rafraîchies après la mise à jour.

**Tech Stack:** React 19, Axios

---

### Bug 1 : `typeDeclaration` non défini → endpoint API incorrect

**Fichier :** `src/components/dpo/ModalCreerDeclaration.jsx`

**Cause :** `chargerDeclaration()` (ligne 66-85) récupère les champs du formulaire mais ignore `typeDeclaration` de la réponse. Quand le DPO modifie depuis un traitement, `typeDeclaration` reste `""`, donc le suffixe endpoint est vide (`PUT /declarations/{id}` au lieu de `PUT /declarations/{id}/normale`). Le backend renvoie 404.

- [ ] **Step 1: Ajouter `setTypeDeclaration` dans `chargerDeclaration`**

Dans `ModalCreerDeclaration.jsx`, modifier la fonction `chargerDeclaration` (lignes 66-85) pour ajouter `setTypeDeclaration(d.typeDeclaration)` :

**Avant :**
```jsx
const chargerDeclaration = useCallback((declarationId, callback) => {
  api.get(`/declarations/${declarationId}`)
    .then((res) => {
      const d = res.data;
      setForm(prev => ({
        ...prev,
        dateMiseEnOeuvre: d.dateMiseEnOeuvre || prev.dateMiseEnOeuvre,
        responsableDeclaration: d.responsableDeclaration || prev.responsableDeclaration,
        contactConfidentialite: d.contactConfidentialite || prev.contactConfidentialite,
        secteur: d.secteur || prev.secteur,
        denominationTraitement: d.denominationTraitement || prev.denominationTraitement,
        finaliteTraitement: d.finaliteTraitement || prev.finaliteTraitement,
        categoriesPersonnesConcernees: d.categoriesPersonnesConcernees || prev.categoriesPersonnesConcernees,
        nombrePersonnesConcernees: d.nombrePersonnesConcernees || prev.nombrePersonnesConcernees,
        typeTraitement: d.typeTraitement || prev.typeTraitement,
      }));
      if (callback) callback();
    })
    .catch(() => { if (callback) callback(); });
}, []);
```

**Après :**
```jsx
const chargerDeclaration = useCallback((declarationId, callback) => {
  api.get(`/declarations/${declarationId}`)
    .then((res) => {
      const d = res.data;
      if (d.typeDeclaration) setTypeDeclaration(d.typeDeclaration);
      setForm(prev => ({
        ...prev,
        dateMiseEnOeuvre: d.dateMiseEnOeuvre || prev.dateMiseEnOeuvre,
        responsableDeclaration: d.responsableDeclaration || prev.responsableDeclaration,
        contactConfidentialite: d.contactConfidentialite || prev.contactConfidentialite,
        secteur: d.secteur || prev.secteur,
        denominationTraitement: d.denominationTraitement || prev.denominationTraitement,
        finaliteTraitement: d.finaliteTraitement || prev.finaliteTraitement,
        categoriesPersonnesConcernees: d.categoriesPersonnesConcernees || prev.categoriesPersonnesConcernees,
        nombrePersonnesConcernees: d.nombrePersonnesConcernees || prev.nombrePersonnesConcernees,
        typeTraitement: d.typeTraitement || prev.typeTraitement,
      }));
      if (callback) callback();
    })
    .catch(() => { if (callback) callback(); });
}, []);
```

---

### Bug 2 : Les listes ne sont pas rafraîchies après la mise à jour

**Fichier :** `src/pages/DpoDashboard.jsx`

**Cause :** Après un PUT réussi, `setDeclarations` utilise `prev.map(...)` qui ne trouvent pas la déclaration (elle n'était pas dans la liste car BROUILLON+AUTOMATIQUE). `allTraitements` n'est pas rafraîchi non plus (le backend a mis `envoyeAuDpo=false`).

- [ ] **Step 2: Modifier `handleCreateDeclaration` pour rafraîchir les listes**

Dans `DpoDashboard.jsx`, remplacer le bloc `if (declarationId)` dans `handleCreateDeclaration` (lignes 208-212) :

**Avant :**
```jsx
if (declarationId) {
  const suffix = updateSuffixes[typeDeclaration] || "";
  api.put(`/declarations/${declarationId}${suffix}`, payload)
    .then((res) => { setDeclarations((prev) => prev.map((d) => d.idDeclaration === declarationId ? res.data : d)); showToast("âœ… DÃ©claration mise Ã  jour !"); })
    .catch(() => addLocal(declarationId));
}
```

**Après :**
```jsx
if (declarationId) {
  const suffix = updateSuffixes[typeDeclaration] || "";
  api.put(`/declarations/${declarationId}${suffix}`, payload)
    .then((res) => {
      // Ajouter ou mettre à jour la déclaration dans la liste
      setDeclarations((prev) => {
        const exists = prev.some(d => d.idDeclaration === declarationId);
        return exists ? prev.map(d => d.idDeclaration === declarationId ? res.data : d) : [res.data, ...prev];
      });
      // Rafraîchir les traitements pour refléter envoyeAuDpo = false
      const storedId = localStorage.getItem("dpoId");
      if (storedId) {
        api.get(`/traitements/dpo/${storedId}`).then(r => { if (r.data) setAllTraitements(r.data); }).catch(() => {});
      }
      showToast("âœ… DÃ©claration mise Ã  jour !");
    })
    .catch(() => addLocal(declarationId));
}
```

---

- [ ] **Step 3: Vérifier que le code compile**

Run: `cd C:\Users\Test\Sofitex_Frontend && npx vite build --logLevel error 2>&1 | head -20`
Expected: Pas d'erreurs de compilation

---

## Résumé des changements

| Fichier | Ligne(s) | Changement |
|---------|----------|------------|
| `ModalCreerDeclaration.jsx` | 66-85 | Ajouter `if (d.typeDeclaration) setTypeDeclaration(d.typeDeclaration)` dans `chargerDeclaration` |
| `DpoDashboard.jsx` | 208-212 | Après PUT réussi : ajouter/met à jour la déclaration dans la liste + rafraîchir `allTraitements` |
