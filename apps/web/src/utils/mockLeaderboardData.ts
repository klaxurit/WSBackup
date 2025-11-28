export interface LeaderboardUser {
  rank: number;
  address: string;
  beraname?: string;
  totalValueUSD: number;
  positions: number;
  feesEarned: number;
  weeklyChange: number; // %
  badge?: 'whale' | 'farmer' | 'diamond-hands';
}

// Génération de données mockées réalistes pour le leaderboard
export const MOCK_LEADERBOARD_DATA: LeaderboardUser[] = [
  {
    rank: 1,
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    beraname: 'honeybera.bera',
    totalValueUSD: 1247382.50,
    positions: 12,
    feesEarned: 28472.33,
    weeklyChange: 12.4,
    badge: 'whale'
  },
  {
    rank: 2,
    address: '0x8Ba1f109551bD432803012645Ac136ddd64DBA72',
    beraname: 'berachad.bera',
    totalValueUSD: 892156.80,
    positions: 18,
    feesEarned: 19234.12,
    weeklyChange: 8.7,
    badge: 'whale'
  },
  {
    rank: 3,
    address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    beraname: 'megabera.bera',
    totalValueUSD: 645329.20,
    positions: 9,
    feesEarned: 15876.45,
    weeklyChange: -2.3,
    badge: 'whale'
  },
  {
    rank: 4,
    address: '0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5',
    beraname: 'yieldmaster.bera',
    totalValueUSD: 487234.90,
    positions: 24,
    feesEarned: 12456.78,
    weeklyChange: 15.2,
    badge: 'farmer'
  },
  {
    rank: 5,
    address: '0x3E5e9111Ae8eB78Fe1CC3bb8915d5D461F3Ef9A9',
    totalValueUSD: 356789.40,
    positions: 7,
    feesEarned: 8934.56,
    weeklyChange: 5.8
  },
  {
    rank: 6,
    address: '0x7F5C764cBc14f9669B88837ca1490cCa17c31607',
    beraname: 'stickyvault.bera',
    totalValueUSD: 298765.30,
    positions: 15,
    feesEarned: 7234.89,
    weeklyChange: 9.4,
    badge: 'diamond-hands'
  },
  {
    rank: 7,
    address: '0xf5ED909Ff51045A4c1a8fc194809108a6F33d656',
    beraname: 'axurit.bera',
    totalValueUSD: 245678.90,
    positions: 11,
    feesEarned: 6123.45,
    weeklyChange: -4.2
  },
  {
    rank: 8,
    address: '0x4200000000000000000000000000000000000006',
    beraname: 'lpfarmer.bera',
    totalValueUSD: 198234.50,
    positions: 32,
    feesEarned: 5678.90,
    weeklyChange: 22.1,
    badge: 'farmer'
  },
  {
    rank: 9,
    address: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
    totalValueUSD: 187456.20,
    positions: 8,
    feesEarned: 4892.34,
    weeklyChange: 3.7
  },
  {
    rank: 10,
    address: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
    beraname: 'beraking.bera',
    totalValueUSD: 165234.80,
    positions: 19,
    feesEarned: 4456.78,
    weeklyChange: 11.3
  },
  {
    rank: 11,
    address: '0x350a791Bfc2C21F9Ed5d10980Dad2e2638ffa7f6',
    totalValueUSD: 152890.40,
    positions: 14,
    feesEarned: 4012.45,
    weeklyChange: 7.9
  },
  {
    rank: 12,
    address: '0x2E3D870790dC77A83DD1d18184Acc7439A53f475',
    totalValueUSD: 138765.90,
    positions: 6,
    feesEarned: 3678.90,
    weeklyChange: -1.5
  },
  {
    rank: 13,
    address: '0x4F604735c1cF31399C6E711D5962b2B3E0225AD3',
    totalValueUSD: 125678.30,
    positions: 22,
    feesEarned: 3456.12,
    weeklyChange: 18.6,
    badge: 'farmer'
  },
  {
    rank: 14,
    address: '0x68f180fcCe6836688e9084f035309E29Bf0A2095',
    totalValueUSD: 112345.60,
    positions: 10,
    feesEarned: 3123.45,
    weeklyChange: 4.2
  },
  {
    rank: 15,
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    beraname: 'hodler.bera',
    totalValueUSD: 98765.40,
    positions: 5,
    feesEarned: 2890.67,
    weeklyChange: -0.8,
    badge: 'diamond-hands'
  },
  {
    rank: 16,
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    totalValueUSD: 89234.20,
    positions: 13,
    feesEarned: 2678.90,
    weeklyChange: 6.5
  },
  {
    rank: 17,
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    totalValueUSD: 78456.80,
    positions: 9,
    feesEarned: 2456.78,
    weeklyChange: 9.8
  },
  {
    rank: 18,
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    totalValueUSD: 72345.60,
    positions: 17,
    feesEarned: 2234.56,
    weeklyChange: 14.2
  },
  {
    rank: 19,
    address: '0x8E870D67F660D95d5be530380D0eC0bd388289E1',
    totalValueUSD: 65789.40,
    positions: 7,
    feesEarned: 2012.34,
    weeklyChange: 3.1
  },
  {
    rank: 20,
    address: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
    totalValueUSD: 58234.90,
    positions: 11,
    feesEarned: 1890.12,
    weeklyChange: -3.4
  },
  {
    rank: 21,
    address: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0',
    totalValueUSD: 52678.30,
    positions: 8,
    feesEarned: 1678.90,
    weeklyChange: 5.7
  },
  {
    rank: 22,
    address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    totalValueUSD: 48123.50,
    positions: 15,
    feesEarned: 1567.89,
    weeklyChange: 11.9
  },
  {
    rank: 23,
    address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    totalValueUSD: 43567.80,
    positions: 6,
    feesEarned: 1456.78,
    weeklyChange: 2.8
  },
  {
    rank: 24,
    address: '0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32',
    totalValueUSD: 39234.60,
    positions: 12,
    feesEarned: 1345.67,
    weeklyChange: 7.3
  },
  {
    rank: 25,
    address: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
    totalValueUSD: 35678.90,
    positions: 9,
    feesEarned: 1234.56,
    weeklyChange: -2.1
  },
  {
    rank: 26,
    address: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2',
    totalValueUSD: 32145.70,
    positions: 14,
    feesEarned: 1123.45,
    weeklyChange: 4.9
  },
  {
    rank: 27,
    address: '0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F',
    totalValueUSD: 28956.40,
    positions: 7,
    feesEarned: 1012.34,
    weeklyChange: 8.6
  },
  {
    rank: 28,
    address: '0x0D8775F648430679A709E98d2b0Cb6250d2887EF',
    totalValueUSD: 25789.20,
    positions: 10,
    feesEarned: 901.23,
    weeklyChange: 1.4
  },
  {
    rank: 29,
    address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
    totalValueUSD: 23456.80,
    positions: 5,
    feesEarned: 890.12,
    weeklyChange: -4.7
  },
  {
    rank: 30,
    address: '0x3845badAde8e6dFF049820680d1F14bD3903a5d0',
    totalValueUSD: 21234.50,
    positions: 13,
    feesEarned: 778.90,
    weeklyChange: 6.2
  }
];

