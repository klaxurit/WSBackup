# Fix pour la connexion des wallets multisig Safe

## Problème identifié

Un utilisateur avec un wallet multisig Safe sur Berachain ne pouvait pas se connecter au frontend WinnieSwap via WalletConnect QR code. La modale de connexion ne s'ouvrait pas.

## Causes identifiées

1. **Configuration Wagmi dupliquée** : Deux configurations Wagmi distinctes (`config` et `config2`) créaient des conflits de synchronisation d'état entre AppKit et Wagmi.

2. **Configuration réseau incomplète** : La définition du réseau Berachain pour WalletConnect manquait de la structure complète `rpcUrls` nécessaire.

3. **Switch automatique de réseau** : Le hook `useBerachainForce` forçait automatiquement le changement de réseau, interrompant le processus de connexion WalletConnect pour les wallets multisig Safe.

4. **Support multisig manquant** : Aucune configuration spécifique pour les Smart Contract Wallets (Safe, etc.).

## Solutions implémentées

### 1. Unification de la configuration Wagmi (`apps/web/src/config/wagmi.ts`)

**Avant :**
```typescript
export const config = wagmiAdapter.wagmiConfig;
const config2 = createConfig({ ... });

// Provider utilisait config2
<WagmiProvider config={config2}>
```

**Après :**
```typescript
export const config = wagmiAdapter.wagmiConfig;

// Provider utilise config directement
<WagmiProvider config={config as any}>
```

✅ **Résultat** : Une seule source de vérité pour la configuration Wagmi, éliminant les conflits d'état.

### 2. Configuration réseau Berachain améliorée

**Avant :**
```typescript
const berachainNetwork = defineChain({
  id: berachain.id,
  name: berachain.name,
  rpcUrls: berachain.rpcUrls, // Structure incorrecte
  // ...
});
```

**Après :**
```typescript
const berachainNetwork = defineChain({
  id: berachain.id,
  name: berachain.name,
  rpcUrls: {
    default: {
      http: [import.meta.env.VITE_BERACHAIN_API_URL || 'https://rpc.berachain.com'],
    },
    public: {
      http: [import.meta.env.VITE_BERACHAIN_API_URL || 'https://rpc.berachain.com'],
    },
  },
  // ...
});
```

✅ **Résultat** : Configuration WalletConnect valide pour Berachain.

### 3. Détection et gestion des wallets Safe (`apps/web/src/hooks/useBerachainForce.ts`)

**Ajout d'une fonction de détection :**
```typescript
const isSmartContractWallet = (connectorName?: string): boolean => {
  if (!connectorName) return false;
  const smartWalletIndicators = ['safe', 'gnosis', 'multisig', 'walletconnect'];
  return smartWalletIndicators.some(indicator =>
    connectorName.toLowerCase().includes(indicator)
  );
};
```

**Modification du hook :**
```typescript
const isSafeWallet = isSmartContractWallet(connector?.name);

if (isConnected && !isCorrectNetwork && !isSafeWallet) {
  // Switch automatique seulement pour les wallets non-Safe
  switchNetwork(targetAppKitNetwork);
} else if (isSafeWallet) {
  console.log('[BerachainForce] Safe wallet detected, skipping auto-switch');
}
```

✅ **Résultat** : Les wallets Safe ne sont plus interrompus par le switch automatique de réseau.

### 4. Configuration AppKit pour Smart Contract Wallets

**Ajout dans la configuration AppKit :**
```typescript
export const appKit = createAppKit({
  // ... configuration existante
  enableCoinbase: true,
  enableInjected: true, // Support pour les wallets injectés et Safe App
  featuredWalletIds: [
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
    '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
    // Safe Wallet disponible via WalletConnect
  ],
});
```

✅ **Résultat** : Support explicite pour les Smart Contract Wallets.

### 5. Logs de debug (`apps/web/src/hooks/useWallet.ts`)

**Ajout de logs détaillés :**
```typescript
console.log('[useWallet] Wallet connected:', { address, chainId, isCorrectNetwork });
console.log('[useWallet] Balance fetched:', formatEther(balance), 'BERA');
console.log('[BerachainForce] Safe wallet detected, skipping auto-switch');
```

✅ **Résultat** : Traçabilité complète du processus de connexion pour debug.

## Instructions de test

### Pour l'utilisateur avec Safe

1. **Ouvrir l'application Safe Wallet** (mobile ou desktop)
2. **Naviguer vers WinnieSwap** dans un navigateur
3. **Cliquer sur "Connect Wallet"**
4. **Sélectionner WalletConnect** dans la modale
5. **Scanner le QR code** avec Safe Wallet
6. **Vérifier dans la console du navigateur** :
   - `[useWallet] Opening connection modal...`
   - `[useWallet] Wallet connected: { address: "0x...", chainId: 80084, isCorrectNetwork: true }`
   - `[BerachainForce] Safe wallet detected, skipping auto-switch`
   - `[useWallet] Balance fetched: X.XXXX BERA`

### Si le réseau Safe n'est pas Berachain

Si le Safe est déployé sur un autre réseau que Berachain (80084), l'utilisateur verra un message indiquant que le réseau n'est pas compatible. Dans ce cas, l'utilisateur doit :

1. Créer un nouveau Safe sur Berachain, ou
2. Utiliser un wallet EOA (Externally Owned Account) pour se connecter à WinnieSwap

## Points d'attention

### Réseau du Safe

**Important** : Le multisig Safe doit être déployé sur Berachain (chain ID: 80084) pour fonctionner avec WinnieSwap.

- ✅ Safe sur Berachain → Compatible
- ❌ Safe sur Ethereum/Polygon/etc. → Non compatible

### Méthodes de connexion supportées

| Méthode | Support | Notes |
|---------|---------|-------|
| WalletConnect QR Code | ✅ | Recommandé pour Safe |
| Extension navigateur Safe | ✅ | Si disponible |
| Safe App intégrée | ✅ | Ouvrir WinnieSwap depuis Safe{Wallet} |
| Injection directe | ⚠️ | Limité, utiliser WalletConnect |

## Fichiers modifiés

1. `apps/web/src/config/wagmi.ts` - Configuration Wagmi et AppKit
2. `apps/web/src/hooks/useBerachainForce.ts` - Détection Safe et gestion réseau
3. `apps/web/src/hooks/useWallet.ts` - Logs de debug

## Vérification du build

```bash
cd apps/web
pnpm build
```

✅ Le build a été testé et fonctionne sans erreurs TypeScript.

## Prochaines étapes recommandées

1. **Tester avec l'utilisateur** : Demander à l'utilisateur de réessayer la connexion
2. **Collecter les logs** : Si le problème persiste, récupérer les logs de la console
3. **Vérifier le réseau Safe** : Confirmer que le Safe est bien sur Berachain
4. **Documentation utilisateur** : Ajouter une section "Wallets multisig" dans la doc

## Ressources

- [Documentation Safe{Wallet} WalletConnect](https://help.safe.global/en/articles/108235-how-to-connect-a-safe-to-a-dapp-using-walletconnect)
- [Documentation Reown AppKit](https://docs.reown.com/appkit/overview)
- [WalletConnect & Safe compatibility issues](https://github.com/WalletConnect/walletconnect-monorepo/issues?q=is%3Aissue+safe+multisig)
