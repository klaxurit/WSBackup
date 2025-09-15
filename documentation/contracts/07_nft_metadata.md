# NFT & Metadata - Génération dynamique on-chain

## Vue d'ensemble

Le système de métadonnées NFT génère **entièrement on-chain** des représentations visuelles uniques et informatives pour chaque position de liquidité Uniswap V3. Chaque NFT contient une image SVG dynamique avec métadonnées JSON intégrées.

### Contrats principaux
- **NonfungibleTokenPositionDescriptor** (`0x9B68c7451096fff25B34c3221e3F6973AffFc93F`) : Point d'entrée principal
- **NFTDescriptor Library** (`0x2a59ed5A2B6d0C8f15fEe55Bd9e5A23C94f37B8a`) : Génération des métadonnées

## Architecture du système

### Point d'entrée - tokenURI
```solidity
function tokenURI(INonfungiblePositionManager positionManager, uint256 tokenId)
    external view returns (string memory)
```

#### Workflow de génération :
1. **Récupération données position** : Appel `positionManager.positions(tokenId)`
2. **Calcul pool address** : `PoolAddress.computeAddress()` déterministique  
3. **Ordre des tokens** : Priorisation basée sur `tokenRatioPriority()`
4. **Génération métadonnées** : Appel `NFTDescriptor.constructTokenURI()`
5. **Output final** : `data:application/json;base64,[JSON-encodé]`

### Structure des métadonnées JSON
```json
{
  "name": "Uniswap - 0.3% - USDC/ETH - 1500<>2000",
  "description": "This NFT represents a liquidity position in a Uniswap V3 USDC-ETH pool...",
  "image": "data:image/svg+xml;base64,[SVG-encodé]"
}
```

## Génération SVG dynamique

### Composants visuels multicouches

#### 1. Background génératif (`generateSVGDefs`)
```solidity
function tokenToColorHex(uint256 token, uint256 offset) internal pure returns (string memory)
```

- **Dérivation couleurs** : Basée sur l'adresse des tokens via manipulation de bits
- **Effets de filtre** : Filtres SVG complexes avec cercles colorés multiples
- **Modes de fusion** : `overlay` et `exclusion` pour combinaisons uniques

#### 2. Visualisation des ranges de prix (`generateSvgCurve`)
```solidity
function getCurve(int24 tickLower, int24 tickUpper, int24 tickSpacing) 
    internal pure returns (string memory curve)
```

**8 courbes pré-définies** représentent différentes largeurs de ranges :
- `curve1` : Ranges étroites (haute concentration)
- `curve8` : Ranges larges (faible concentration)

**Indication status position** :
- `overRange = -1` : Position en dessous prix actuel (fade-down)
- `overRange = 1` : Position au dessus prix actuel (fade-up)
- `overRange = 0` : Position active (pas de fade)

#### 3. Cercles de status
- **Positions actives** : Deux cercles blancs aux extrémités de courbe
- **Hors-range** : Cercle unique surligné avec anneau indicateur

### Informations affichées dans le SVG

#### Données de position
- **Token ID** : Identifiant unique  
- **Range de ticks** : Valeurs Min et Max tick
- **Fee tier** : Pourcentage de fees du pool
- **Adresses tokens** : Adresses complètes en texte bordure (animé)
- **Minimap** : Indicateur visuel basé sur le midpoint des ticks

#### Fonctionnalités spéciales NFT
```solidity
function isRare(uint256 tokenId, address poolAddress) internal pure returns (bool)
```

**NFT Rares** reçoivent animations spéciales :
- Hash de tokenId et pool address
- Rareté diminue avec tokenId plus élevés
- Animation sparkle rotative pour positions rares

## Conversion prix et formatage

### Conversion tick vers prix lisible
```solidity
function tickToDecimalString(
    int24 tick, 
    int24 tickSpacing, 
    uint8 baseTokenDecimals,
    uint8 quoteTokenDecimals, 
    bool flipRatio
) internal pure returns (string memory)
```

#### Fonctionnalités avancées :
- **Gestion valeurs extrêmes** : MIN/MAX ticks
- **Ajustement décimales** : Différences entre tokens
- **Flip ratio** : Présentation cohérente
- **Precision 5 chiffres** : Significatifs

### Système de priorité des tokens
```solidity
function tokenRatioPriority(address token, uint256 chainId) private pure returns (int256)
```

**Ordre de priorité** :
1. **WETH** : Toujours dénominateur (référence ratio)
2. **Stablecoins** : Prioritaires comme numérateurs (USDC > USDT > DAI)  
3. **Autres tokens** : Priorité par défaut

## Patterns d'implémentation

### Approche 100% on-chain
**Avantages** :
- Aucune dépendance externe ou IPFS
- SVG généré entièrement en smart contracts
- Métadonnées calculées de manière déterministe
- Accessibilité permanente et immutabilité garantie

**Techniques d'optimisation gas** :
- Chemins de courbes pré-calculés stockés comme constantes
- Concaténation string efficace via `abi.encodePacked()`
- Algorithmes de conversion décimale optimisés
- Appels externes minimaux

### Manipulation de chaînes sophistiquée
```solidity
// Échappement guillemets
function escapeQuotes(string memory symbol) internal pure returns (string memory)

// Encodage Base64  
function encode(bytes memory data) internal pure returns (string memory)

// Conversion décimale précise
function fixedPointToDecimalString(uint256 value, uint8 decimals) internal pure returns (string memory)
```

## Exemples d'utilisation

### Récupération métadonnées NFT
```typescript
const positionManager = new ethers.Contract(POSITION_MANAGER_ADDRESS, POSITION_MANAGER_ABI);
const descriptor = new ethers.Contract(DESCRIPTOR_ADDRESS, DESCRIPTOR_ABI);

// Via position manager (approche standard)
const tokenURI = await positionManager.tokenURI(tokenId);

// Via descriptor direct (plus flexible)
const tokenURI = await descriptor.tokenURI(positionManager.address, tokenId);

// Décodage des métadonnées
const jsonData = atob(tokenURI.split(',')[1]);
const metadata = JSON.parse(jsonData);

console.log({
  name: metadata.name,
  description: metadata.description,
  imageDataURI: metadata.image
});
```

### Génération preview personnalisée  
```typescript
// Simulation d'une position pour preview
async function generatePositionPreview(
  token0: string,
  token1: string, 
  fee: number,
  tickLower: number,
  tickUpper: number
): Promise<string> {
  // Simuler les données de position
  const mockPosition = {
    nonce: 0,
    operator: ethers.constants.AddressZero,
    token0,
    token1,
    fee,
    tickLower,
    tickUpper,
    liquidity: 1000000,
    feeGrowthInside0LastX128: 0,
    feeGrowthInside1LastX128: 0,
    tokensOwed0: 0,
    tokensOwed1: 0
  };
  
  // Note : Nécessiterait adaptation du contrat pour accepter données mockées
  // ou déploiement temporaire d'une position
}
```

### Extraction couleurs pour UI
```typescript
// Récréer algorithme de couleur côté frontend
function tokenToColorHex(tokenAddress: string, offset: number = 0): string {
  const token = BigNumber.from(tokenAddress);
  const shifted = token.shr(offset * 8);
  
  return '#' + [
    shifted.and(0xff).toHexString().slice(2).padStart(2, '0'),
    shifted.shr(8).and(0xff).toHexString().slice(2).padStart(2, '0'),
    shifted.shr(16).and(0xff).toHexString().slice(2).padStart(2, '0')
  ].join('');
}

// Usage pour cohérence UI
const token0Color = tokenToColorHex(position.token0, 0);
const token1Color = tokenToColorHex(position.token1, 1);
```

## Considérations techniques

### Précision mathématique
- **Tick Math** : Conversion précise ticks ↔ prix
- **Sqrt Price X96** : Arithmétique fixed-point
- **Ajustement décimales** : Tokens avec différentes précisions

### Fonctionnalités de sécurité  
- **Validation inputs** : Tous paramètres validés avant traitement
- **Fonctions pures** : Plupart des fonctions pures pour prévisibilité
- **Pas de dépendances externes** : Élimine points de défaillance externes

### Limitations
- **Coût gas élevé** : Génération on-chain coûteuse en gas
- **Taille limitée** : Contraintes de taille pour données on-chain
- **Pas de mise à jour** : Métadonnées figées au moment de mint

Ce système représente une approche sophistiquée de génération de métadonnées NFT on-chain, créant des représentations uniques, informatives et visuellement attrayantes de positions financières complexes entièrement dans l'environnement blockchain.