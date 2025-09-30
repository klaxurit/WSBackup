# Guide de Cohérence des Styles - WinnieSwap

## 🎨 Design System - Boutons

### Classes de Base
```scss
.btn {
  // Styles de base communs à tous les boutons
  font-family: "TT Hoves", system-ui, sans-serif;
  outline: none;
  border: none;
  display: flex;
  justify-content: center;
  font-weight: 500;
  border-radius: 18px;
  cursor: pointer;
  align-items: center;
}
```

### Tailles Standardisées
```scss
.btn--large {
  font-size: 18px;
  padding: 20px 24px 18px 24px;
  letter-spacing: 0.36px;
  line-height: 140%;
  height: 56px;
}

.btn--small {
  font-size: 16px;
  padding: 10px 14px 10px 14px;
  letter-spacing: 0.32px;
  height: 40px;
}

.btn--tiny {
  font-size: 14px;
  padding: 6px 10px 6px 10px;
  letter-spacing: 0.28px;
  height: 32px;
  border-radius: 12px;
}
```

### Variantes de Couleur
```scss
// Bouton principal (actions importantes)
.btn__main {
  background: $beryl-pure;           // #FFD056 (doré)
  color: rgba(255, 208, 86);        // Texte doré
  text-shadow: 0px 1.5px 1px #100A25, -0.5px 0px 0px #180E00, 0.5px 0px 0px #180E00, 0px -0.5px 0px #180E00;
}

// Bouton accent (actions secondaires)
.btn__accent {
  background: $beryl-008;            // #FFD056 avec 8% d'opacité
  color: $beryl-pure;               // Texte doré
  text-shadow: 0px 1.5px 1px #100A25, -0.5px 0px 0px #180E00, 0.5px 0px 0px #180E00, 0px -0.5px 0px #180E00;
}

// Bouton neutre (actions tertiaires)
.btn__shade {
  color: $onyx-light;               // #b1b0ad
  background: $white-004;            // rgba(255, 255, 255, 0.04)
  text-shadow: 0px 1.5px 1px #100A25, -0.5px 0px 0px #180E00, 0.5px 0px 0px #180E00, 0px -0.5px 0px #180E00;
}

// Bouton désactivé
.btn__disabled {
  pointer-events: none;
  color: $beryl-048;                // #FFD056 avec 48% d'opacité
  background-color: $white-008;      // rgba(255, 255, 255, 0.08)
  text-shadow: 0px 1.5px 1px #100A25, -0.5px 0px 0px #180E00, 0.5px 0px 0px #180E00, 0px -0.5px 0px #180E00;
}
```

## 🚫 Règles d'Interdiction

### ❌ Ne PAS faire
1. **Redéfinir les styles de boutons** dans des composants spécifiques
2. **Utiliser des couleurs hardcodées** au lieu des variables SCSS
3. **Écraser les styles généraux** sans justification technique
4. **Créer des variantes de boutons** non documentées

### ✅ Bonnes Pratiques
1. **Utiliser les classes standardisées** : `btn btn--large btn__main`
2. **Respecter la hiérarchie des couleurs** : main > accent > shade > disabled
3. **Utiliser les variables SCSS** : `$beryl-pure`, `$onyx-light`, etc.
4. **Documenter les exceptions** si des styles spécifiques sont nécessaires

## 📋 Checklist de Cohérence

### Avant de créer un nouveau bouton :
- [ ] Utilise-t-il les classes standardisées ?
- [ ] Respecte-t-il la hiérarchie des couleurs ?
- [ ] Utilise-t-il les variables SCSS ?
- [ ] Est-il cohérent avec les autres boutons de l'app ?

### Avant de modifier un bouton existant :
- [ ] Le changement s'applique-t-il à tous les boutons similaires ?
- [ ] Respecte-t-il le design system ?
- [ ] N'écrase-t-il pas les styles généraux ?

## 🎯 Exemples d'Usage

### Bouton d'action principale
```tsx
<button className="btn btn--large btn__main">
  Approve Token
</button>
```

### Bouton d'action secondaire
```tsx
<button className="btn btn--small btn__accent">
  Manage Position
</button>
```

### Bouton de filtre
```tsx
<button className="btn btn--tiny btn__shade">
  Open Positions
</button>
```

### Bouton désactivé
```tsx
<button className="btn btn--large btn__disabled" disabled>
  Enter Amount
</button>
```

## 🔧 Variables SCSS Disponibles

```scss
// Couleurs principales
$beryl-pure: #FFD056;           // Doré principal
$beryl-008: rgba(255, 208, 86, 0.08);
$beryl-010: rgba(255, 208, 86, 0.10);
$beryl-012: rgba(255, 208, 86, 0.12);
$beryl-048: rgba(255, 208, 86, 0.48);
$beryl-064: rgba(255, 208, 86, 0.64);
$beryl-080: rgba(255, 208, 86, 0.80);

// Couleurs neutres
$onyx-light: #b1b0ad;
$onyx-medium: #666;
$onyx-darker: #333;
$white: #ffffff;
$white-004: rgba(255, 255, 255, 0.04);
$white-006: rgba(255, 255, 255, 0.06);
$white-008: rgba(255, 255, 255, 0.08);
```

## 📝 Notes de Migration

### Changements Appliqués
1. **Suppression** des styles spécifiques `VaultDetailPage__ActionButton`
2. **Harmonisation** avec le design system global
3. **Utilisation** des variables SCSS standardisées

### Prochaines Étapes
1. Vérifier tous les autres composants pour des incohérences similaires
2. Créer des composants réutilisables pour les boutons complexes
3. Mettre à jour la documentation des composants
