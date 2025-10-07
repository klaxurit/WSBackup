# Tasks - Feature Modal de Dépôt/Retrait Vault

## 📋 Vue d'ensemble
Implémentation d'une modal interactive pour gérer les dépôts et retraits dans les vaults avec une timeline visuelle montrant la progression de l'utilisateur à travers les différentes étapes du processus.

---

## 🏗️ Phase 1 : Architecture et Composants de Base ✅

### 1.1 Composant Timeline ✅
- [x] Créer le composant `VaultTimeline.tsx` avec props pour nombre d'étapes et étape active
- [x] Implémenter le style visuel de la timeline (numéros des étapes, lignes de connexion, états : active, completed, pending)
- [x] Ajouter les animations de transition entre les étapes
- [x] Créer le fichier SCSS `_vault-timeline.scss` avec les styles appropriés

### 1.2 Hook de Gestion d'État de la Modal ✅
- [x] Créer le hook `useVaultModalState.ts` pour gérer :
  - L'état d'ouverture/fermeture de la modal
  - Le mode de dépôt actuel (deposit-only / with-staking / single-sided)
  - L'étape actuelle dans le processus
  - La persistance de l'état (localStorage) pour garder l'étape si l'utilisateur ferme la modal
  - Observation des hooks existants pour déterminer automatiquement l'étape
- [x] Implémenter les fonctions : `openModal()`, `closeModal()`, `resetModal()`, `getStepNumbers()`
- [x] Gérer la logique de détermination automatique de l'étape en cours selon les approvals et transactions

### 1.3 Types TypeScript ✅
- [x] Créer le fichier `types/vaultModal.ts` avec les interfaces :
  - `DepositMode`: 'deposit-only' | 'with-staking' | 'single-sided'
  - `VaultModalStep`: enum avec toutes les étapes possibles
  - `VaultDepositModalState`: état global de la modal de dépôt
  - `StepConfig`: configuration pour chaque étape
  - `VaultWithdrawModalState`: état pour la modal de retrait

### 1.4 Structure de Base de la Modal ✅
- [x] Créer le composant `VaultDepositModal.tsx` utilisant le `Modal.tsx` existant
- [x] Intégrer la Timeline dans le header de la modal
- [x] Créer le fichier SCSS `_vault-deposit-modal.scss` avec les styles de base
- [x] Créer un composant de test `_test_VaultModalDemo.tsx` pour valider la Phase 1

---

## 🔄 Phase 2 : Modal de Dépôt - Mode "Deposit Only" ✅

### 2.1 Structure de la Modal ✅
- [x] Créer le composant `VaultDepositModal.tsx` qui utilise le composant `Modal.tsx` existant
- [x] Intégrer le composant `VaultTimeline` en haut de la modal
- [x] Système de routing par props `children` (simple et flexible)
- [x] Gestion de la fermeture de la modal

### 2.2 Composants d'Étapes Créés ✅
- [x] Créer le composant `ApprovalStep.tsx` :
  - Affichage du token à approuver avec logo
  - Allowance actuelle vs demandée (∞)
  - Bouton "Approve [TOKEN]" avec loader
  - Gestion de l'état isApproving
- [x] Créer le composant `ConfirmDepositStep.tsx` :
  - Bannière Auto-Compound (conditionnelle)
  - Montants des deux tokens avec logos
  - Est. Received / Min. Received
  - Message explicatif
  - Bouton "Confirm Supply"
- [x] Créer le composant `WaitingStep.tsx` :
  - Loader animé
  - Titre et description personnalisables
  - Message d'instruction wallet
- [x] Créer le composant `SuccessStep.tsx` :
  - Icône de succès avec animation
  - Message de confirmation
  - Lien vers l'explorateur
  - Bouton "Close"
- [x] Créer le composant `ErrorStep.tsx` :
  - Icône d'erreur avec animation
  - Message d'erreur détaillé
  - Code d'erreur
  - Boutons "Try Again" et "Close"

### 2.3 Styles ✅
- [x] Styles complets dans `_vault-deposit-modal.scss`
- [x] Animations pour success (pop) et error (shake)
- [x] Styles responsifs
- [x] Cohérence visuelle avec l'app

### 2.4 Exports et Organisation ✅
- [x] Fichier `ModalSteps/index.ts` pour exports centralisés
- [x] Composant de test mis à jour avec toutes les étapes
- [x] Utilisation des classes de boutons existantes (`btn btn__main`)

---

## 🚀 Phase 3 : Intégration avec les Hooks Existants ✅

### 3.1 Modal Double-Sided Deposit ✅
- [x] Créer le composant `DoubleSideDepositModal.tsx`
- [x] Intégrer avec le hook `useDoubleDeposit` existant
- [x] Observer les états (t0Allowance, t1Allowance, deposite) pour déterminer l'étape
- [x] Modifier `doubleSideForm.tsx` pour ouvrir la modal au lieu d'exécuter directement
- [x] Gestion automatique des transitions d'étapes

### 3.2 Modal Single-Sided Deposit ✅
- [x] Créer le composant `SingleSideDepositModal.tsx`
- [x] Intégrer avec le hook `useSingleDeposit` existant
- [x] Observer les états (allowance, deposit) pour déterminer l'étape
- [x] Modifier `oneSideForm.tsx` pour ouvrir la modal
- [x] Afficher le "Zap" correctement avec les montants swap

### 3.3 Modal Withdraw ✅
- [x] Créer le composant `VaultWithdrawModal.tsx` (wrapper modal)
- [x] Créer le composant `WithdrawModal.tsx` (logique)
- [x] Créer le composant `ConfirmWithdrawStep.tsx`
- [x] Intégrer avec le hook `useVaultWithdraw` existant
- [x] Modifier `UserVaultDetail/index.tsx` pour ouvrir la modal de withdraw
- [x] Afficher le résumé détaillé (balances, underlying tokens)

### 3.4 Export des Types ✅
- [x] Exporter `UseDoubleDepositReturn` depuis `useDoubleDeposit.ts`
- [x] Exporter `UseSingleDepositReturn` depuis `useSingleDeposit.ts`
- [x] Exporter `UseVaultWithdrawReturn` depuis `useVaultWithdraw.ts`
- [x] Exporter `ConfirmWithdrawStep` depuis `ModalSteps/index.ts`

### 3.5 Nettoyage ✅
- [x] Supprimer les imports inutilisés (Loader dans index.tsx)
- [x] Retirer le composant de test de la VaultDetailPage
- [x] Garder `_test_VaultModalDemo.tsx` pour référence (à supprimer plus tard)

---

## 🎯 Phase 4 : Modal de Dépôt - Mode "With Staking" (TODO)

### 3.1 Logique Conditionnelle
- [ ] Détecter si le vault a un contrat de staking associé
- [ ] Adapter le nombre d'étapes dans la timeline (5 étapes au lieu de 3)

### 3.2 Étapes 1-3 : Identiques à "Deposit Only"
- [ ] Réutiliser les composants existants
- [ ] Ajuster le numéro total d'étapes dans la timeline

### 3.3 Étape 4 : Approve Vault Token pour Staking
- [ ] Créer une variante du composant `ApprovalStep.tsx` pour les vault tokens
- [ ] Afficher :
  - Montant de tokens vault (WIN-[TOKEN0]-[TOKEN1])
  - Logo du vault token
  - Allowance pour le contrat de staking
  - Bouton "Approve WIN-[TOKEN0]-[TOKEN1]"
- [ ] Créer/utiliser un hook pour gérer l'approval du vault token vers le contrat de staking
- [ ] Passer à l'étape suivante après confirmation

### 3.4 Étape 5 : Confirm Stake
- [ ] Créer le composant `ConfirmStakeStep.tsx` affichant :
  - Titre : "Deposit Liquidity to Vault"
  - Montant de vault tokens à staker
  - Logo du vault token
  - Valeur USD
  - APR du staking
  - Estimated Yearly Rewards
  - Note : "Rewards must be claimed separately"
  - Bouton "Confirm Stake"
- [ ] Créer un hook `useVaultStaking.ts` pour gérer la transaction de staking
- [ ] Gérer l'état de waiting (étape 6 similaire à étape 3)

### 3.5 Étape 6 : Waiting for Staking Confirmation
- [ ] Réutiliser le composant `WaitingStep.tsx` avec un message adapté
- [ ] Écouter la confirmation de la transaction de staking
- [ ] Passer à l'écran de succès

---

## 🔵 Phase 4 : Modal de Dépôt - Mode "Single-Sided"

### 4.1 Adaptation de la Structure
- [ ] Créer une variante simplifiée avec 2 étapes seulement
- [ ] Adapter la timeline pour 2 étapes

### 4.2 Étape 1 : Approve Token
- [ ] Réutiliser le composant `ApprovalStep.tsx`
- [ ] Un seul token à approuver (celui sélectionné par l'utilisateur)

### 4.3 Étape 2 : Confirm Zap
- [ ] Créer le composant `ConfirmZapStep.tsx` affichant :
  - Titre : "Confirm Zap"
  - Token déposé (montant + logo)
  - Est. Received (Pool tokens)
  - Min. Received (Pool tokens)
  - Bouton "Confirm Supply"
- [ ] Utiliser le hook `useSingleDeposit` existant
- [ ] Intégrer la logique de swap automatique (50/50)

### 4.4 Étape 3 : Waiting & Success
- [ ] Réutiliser les composants existants `WaitingStep` et `SuccessStep`
- [ ] Message adapté pour le "Zap"

---

## 🔴 Phase 5 : Modal de Retrait

### 5.1 Structure de Base
- [ ] Créer le composant `VaultWithdrawModal.tsx`
- [ ] Timeline avec 3 étapes
- [ ] Réutiliser le système de gestion d'état

### 5.2 Étape 1 : Approve Vault Token
- [ ] Créer/réutiliser le composant d'approval pour les vault tokens
- [ ] Afficher :
  - Montant de WIN-[TOKEN0]-[TOKEN1] à retirer
  - Allowance actuelle vs demandée
  - Bouton "Approve WIN-[TOKEN0]-[TOKEN1]"
- [ ] Utiliser le hook `useVaultWithdraw` existant

### 5.3 Étape 2 : Confirm Withdraw
- [ ] Créer le composant `ConfirmWithdrawStep.tsx` affichant :
  - Titre : "Withdraw from Sticky Vault"
  - Section "Your Balances" :
    - Free Liquidity : montant de vault tokens
    - Underlying Tokens : montants équivalents en TOKEN0/TOKEN1
  - Section "Withdrawal Summary" :
    - Selected to Withdraw
    - From Free Liquidity
    - Underlying Tokens détaillés
  - Bouton "Withdraw X WIN-[TOKEN0]-[TOKEN1]"
- [ ] Calculer et afficher les montants sous-jacents basés sur le quote
- [ ] Afficher les logos des tokens

### 5.4 Étape 3 : Waiting & Success
- [ ] Réutiliser `WaitingStep.tsx` avec message de retrait
- [ ] Message : "Withdraw from Sticky Vault X WIN-[TOKEN0]-[TOKEN1]"
- [ ] Écran de succès avec résumé des tokens reçus

---

## 🎨 Phase 6 : Intégration UI/UX

### 6.1 Mise à Jour du Bouton de Formulaire
- [ ] Modifier le bouton `VaultDetailPage__FormButton` pour ouvrir la modal au lieu d'exécuter directement
- [ ] Ajouter des états visuels au bouton selon l'étape en cours :
  - "Deposit" / "Withdraw" (par défaut)
  - "Approving..." (pendant approval)
  - "Confirming..." (pendant transaction)
  - "Processing..." (pendant staking)
- [ ] Intégrer un loader dans le bouton si nécessaire

### 6.2 Gestion des Erreurs
- [ ] Créer le composant `ErrorStep.tsx` pour afficher les erreurs de transaction
- [ ] Afficher :
  - Message d'erreur détaillé
  - Code d'erreur si disponible
  - Bouton "Try Again" pour réessayer
  - Bouton "Close" pour fermer la modal
- [ ] Logger les erreurs pour le débogage

### 6.3 Animations et Transitions
- [ ] Ajouter des animations de transition entre les étapes
- [ ] Animation d'ouverture/fermeture de la modal (déjà géré par Modal.tsx)
- [ ] Animation du loader (déjà géré par Loader.tsx)
- [ ] Animation de la timeline (mise à jour des étapes)

### 6.4 Responsive Design
- [ ] Tester la modal sur différentes tailles d'écran
- [ ] Adapter la timeline pour mobile (version compacte)
- [ ] Ajuster les paddings et spacings

---

## 🔧 Phase 7 : Logique Métier et Hooks

### 7.1 Hook Unifié pour le Dépôt
- [ ] Créer ou adapter un hook `useVaultDeposit.ts` qui centralise :
  - Le mode de dépôt (deposit-only, with-staking, single-sided)
  - Les allowances nécessaires
  - Les transactions à effectuer
  - L'état global du processus
- [ ] Exposer des fonctions claires : `approveToken0()`, `approveToken1()`, `deposit()`, `stake()`

### 7.2 Hook pour le Staking
- [ ] Créer le hook `useVaultStaking.ts` si non existant
- [ ] Gérer l'approval du vault token vers le contrat de staking
- [ ] Gérer la transaction de staking
- [ ] Récupérer les informations d'APR et de rewards estimés
- [ ] Gérer les états de loading, success, error

### 7.3 Persistance de l'État
- [ ] Sauvegarder l'état de la modal dans localStorage :
  - Mode de dépôt
  - Étape actuelle
  - Montants saisis
  - Hash de transaction en cours
- [ ] Restaurer l'état si l'utilisateur ferme et rouvre la modal
- [ ] Nettoyer le localStorage après succès ou reset manuel

### 7.4 Validation des Données
- [ ] Valider les montants saisis (> 0, <= balance)
- [ ] Valider que les tokens ont bien les allowances nécessaires avant chaque transaction
- [ ] Vérifier que le vault a un contrat de staking avant d'afficher le mode "with-staking"

---

## 🧪 Phase 8 : Tests et Validation

### 8.1 Tests Fonctionnels
- [ ] Tester le flux complet "Deposit Only" :
  - Sans approval nécessaire
  - Avec approval token0
  - Avec approval token1
  - Avec approval des deux tokens
- [ ] Tester le flux complet "With Staking"
- [ ] Tester le flux complet "Single-Sided"
- [ ] Tester le flux complet "Withdraw"

### 8.2 Tests de Persistance
- [ ] Vérifier que l'état est sauvegardé quand on ferme la modal
- [ ] Vérifier que l'état est restauré quand on rouvre la modal
- [ ] Vérifier que l'état est nettoyé après succès

### 8.3 Tests d'Erreur
- [ ] Tester avec une transaction rejetée par l'utilisateur
- [ ] Tester avec une transaction qui échoue on-chain
- [ ] Tester avec un manque de balance
- [ ] Tester avec un manque de gas

### 8.4 Tests UI
- [ ] Vérifier l'affichage correct sur desktop
- [ ] Vérifier l'affichage correct sur tablette
- [ ] Vérifier l'affichage correct sur mobile
- [ ] Vérifier toutes les animations

---

## 🚀 Phase 9 : Intégration Finale et Polissage

### 9.1 Connexion avec VaultDetailPage
- [ ] Remplacer les boutons d'action actuels par des boutons qui ouvrent les modals
- [ ] Supprimer l'ancien code de formulaire inline (ou le garder en commentaire pour référence)
- [ ] S'assurer que le rafraîchissement des données fonctionne après dépôt/retrait

### 9.2 Gestion du Champ autoCompoundAddress
- [ ] Vérifier si le champ `autoCompoundAddress` existe dans l'objet vault du GraphQL
- [ ] Si non, l'ajouter à la query GraphQL dans VaultDetailPage
- [ ] Utiliser ce champ pour déterminer si on affiche "with Auto-Compound"

### 9.3 Optimisations
- [ ] Mémoriser les calculs coûteux avec `useMemo`
- [ ] Optimiser les re-renders avec `useCallback`
- [ ] Lazy load des composants de modal si nécessaire

### 9.4 Documentation
- [ ] Documenter l'architecture de la modal dans un fichier README
- [ ] Ajouter des commentaires dans le code pour les parties complexes
- [ ] Créer un guide pour ajouter de nouvelles étapes si nécessaire

### 9.5 Nettoyage du Code
- [ ] Supprimer les console.logs de debug
- [ ] Supprimer le code commenté inutile
- [ ] Vérifier que tous les TODOs sont résolus
- [ ] Formater le code avec Prettier

---

## 📝 Notes Importantes

### Dépendances Identifiées
- Composant `Modal.tsx` ✅ (existant)
- Composant `Loader.tsx` ✅ (existant)
- Hook `useDoubleDeposit` ✅ (existant)
- Hook `useSingleDeposit` ✅ (existant)
- Hook `useVaultWithdraw` ✅ (existant)
- Hook `useTokenAllowance` ✅ (existant)
- Composant `LiquidityInput` ✅ (existant)
- Composant `TokenPairLogos` ✅ (existant)

### À Créer
- Hook `useVaultStaking.ts` ❌
- Hook `useVaultModalState.ts` ❌
- Tous les composants de la modal ❌
- Tous les styles SCSS ❌

### Points d'Attention
1. Le champ `autoCompoundAddress` n'est pas encore dans l'objet vault - à vérifier/ajouter
2. Le mode "Single-sided" n'est pas encore fonctionnel selon l'utilisateur - mettre en place la modal mais ne pas tester le fonctionnement complet
3. Bien gérer la persistance pour éviter de perdre l'état si l'utilisateur ferme accidentellement la modal
4. Les logos des tokens doivent être affichés correctement (utiliser `logoUri` des tokens)
5. Les montants doivent être formatés avec les bons decimals

### Ordre d'Implémentation Recommandé
1. Phase 1 : Fondations (Timeline, Hook d'état, Types)
2. Phase 2 : Mode "Deposit Only" (le plus simple)
3. Phase 7.1-7.3 : Logique de persistance
4. Phase 5 : Modal de Retrait (similaire à deposit)
5. Phase 3 : Mode "With Staking" (plus complexe)
6. Phase 4 : Mode "Single-Sided" (peut rester basique)
7. Phase 6 : Intégration UI/UX
8. Phase 8 : Tests
9. Phase 9 : Finalisation

---

## 🎯 Critères de Succès
- ✅ L'utilisateur peut déposer via la modal avec une interface claire
- ✅ L'utilisateur peut retirer via la modal
- ✅ La timeline indique clairement la progression
- ✅ L'état est préservé si l'utilisateur ferme la modal
- ✅ Toutes les erreurs sont gérées proprement
- ✅ L'UI est responsive et agréable
- ✅ Les trois modes de dépôt sont disponibles
- ✅ Le mode "with-staking" fonctionne quand un contrat de staking existe

