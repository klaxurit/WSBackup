# RouteDisplay Component

Le composant `RouteDisplay` affiche visuellement les routes de swap optimisées dans l'interface WinnieSwap.

## Fonctionnalités

- **Single Route**: Affiche une route directe avec icône bleue
- **Split Route**: Affiche les routes divisées avec icône orange
- **Token Display**: Montre les logos des tokens avec fallback
- **Fee Information**: Affiche les frais de route
- **Responsive Design**: S'adapte aux écrans mobiles

## Props

```typescript
interface RouteDisplayProps {
  optimizedRoute: OptimizedRoute | null;
  fromToken: BerachainToken | null;
  toToken: BerachainToken | null;
}
```

## Utilisation

```tsx
import { RouteDisplay } from '../RouteDisplay';

<RouteDisplay
  optimizedRoute={swap.optimizedRoute}
  fromToken={fromToken}
  toToken={toToken}
/>
```

## Structure Visuelle

### Single Route
```
🔥 Best Route                  0.3% fee
BERA → HONEY
```

### Split Route
```
🔀 Split Order                 0.25% fee
60%: BERA → HONEY
40%: BERA → USDC → HONEY
ⓘ Order split across 2 routes for better pricing
```

## Styles

Les styles sont définis dans `_routeDisplay.scss` avec:
- Animations d'apparition fluides
- Couleurs différenciées (bleu/orange)
- Design responsive
- Effets de hover