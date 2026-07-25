# Rafraîchissement automatique des traitements/déclarations côté DPO

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Quand un UtilisateurMetier modifie un traitement qui a une déclaration existante chez le DPO et clique "Enregistrer", le traitement disparaît automatiquement de la liste des traitements du DPO et la déclaration apparaît dans la liste des déclarations du DPO — sans rechargement manuel.

**Architecture:** Le backend gère déjà la logique (`updateTraitement` met `envoyeAuDpo=false` et promeut la déclaration BROUILLON→EN_ATTENTE). Le problème est que le dashboard DPO ne rafraîchit pas les traitements et déclarations après modification. Solution : ajouter du polling sur `allTraitements` et `declarations` dans `DpoDashboard.jsx`, comme c'est déjà fait pour `demandes`.

**Tech Stack:** React 19, Axios

---

## Comprendre le problème

### Flux actuel (défaillant)
1. UM modifie un traitement → `PUT /api/traitements/{id}` → backend met `envoyeAuDpo=false` et promeut la déclaration
2. DPO a chargé `allTraitements` et `declarations` une seule fois au montage du composant
3. **Resultat** : le DPO ne voit jamais les changements tant qu'il ne recharge pas la page

### Flux désiré
1. UM modifie un traitement → backend met à jour
2. Le dashboard DPO rafraîchit automatiquement les traitements et déclarations
3. Le traitement disparaît de la liste, la déclaration apparaît

### Logique backend existante (déjà en place)
Dans `TraitementService.updateTraitement()` :
- Si la déclaration liée a un DPO assigné → `envoyeAuDpo = false`
- Si la déclaration est BROUILLON → passe en EN_ATTENTE

### Filtres frontend existants (déjà corrects)
- `DpoDashboard.jsx:262-266` : masque les traitements ayant une déclaration soumise (non-BROUILLON)
- `DpoDashboard.jsx:73-74` : `estDeclarationVisible` affiche les déclarations non-BROUILLON

---

### Task 1: Ajouter le polling des traitements et déclarations dans DpoDashboard

**Files:**
- Modify: `src/pages/DpoDashboard.jsx:84-119`

- [ ] **Step 1: Ajouter le polling des traitements**

Dans `DpoDashboard.jsx`, après le `useEffect` de chargement initial des traitements (lignes 90-119), ajouter un `useEffect` de polling :

Après la ligne 119 (fermeture du dernier `useEffect` de chargement), ajouter :

```javascript
useEffect(() => {
  const storedId = localStorage.getItem("dpoId");
  if (!storedId) return;
  const interval = setInterval(() => {
    api.get(`/traitements/dpo/${storedId}`)
      .then(res => { if (res.data) setAllTraitements(res.data); })
      .catch(() => {});
  }, 15000);
  return () => clearInterval(interval);
}, []);
```

- [ ] **Step 2: Ajouter le polling des déclarations**

Juste après le polling des traitements, ajouter le polling des déclarations :

```javascript
useEffect(() => {
  const storedId = localStorage.getItem("dpoId");
  if (!storedId) return;
  const interval = setInterval(() => {
    api.get(`/declarations/mes-declarations?dpoId=${storedId}`)
      .then(res => { if (res.data) setDeclarations(res.data.filter(estDeclarationVisible)); })
      .catch(() => {});
  }, 15000);
  return () => clearInterval(interval);
}, [estDeclarationVisible]);
```

- [ ] **Step 3: Vérifier que le code compile**

Run: `cd C:\Users\Test\Sofitex_Frontend && npx vite build --logLevel error 2>&1 | head -20`
Expected: Pas d'erreurs de compilation

---

## Résumé du comportement résultant

| Scénario | Avant | Après |
|----------|-------|-------|
| UM modifie traitement avec déclaration DPO | DPO ne voit rien changer | En ~15s, traitement disparaît, déclaration apparaît |
| DPO ouvre le dashboard | Données chargées une fois | Données rafraîchies toutes les 15s |
| Performance | — | 2 requêtes GET toutes les 15s (léger) |

## Notes

- Le polling à 15 secondes est un bon compromis entre réactivité et charge serveur
- Les demandes sont déjà pollées toutes les 30 secondes (ligne 69-72)
- Le `cleanup` via `return () => clearInterval(interval)` évite les fuites mémoire
- Le `storedId` est vérifié en dehors du callback pour éviter les appels inutiles
