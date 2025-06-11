import type { BerachainToken } from "../hooks/useBerachainTokenList";

export const BERACHAIN_TOKENS: BerachainToken[] = [
  // {
  //   name: 'USDC',
  //   symbol: 'USDC',
  //   address: '0x549943e04f40284185054145c6E4e9568C1D3241',
  //   decimals: 6,
  // },
  // {
  //   name: 'WBTC',
  //   symbol: 'WBTC',
  //   logoSymbol: 'btc',
  //   address: '0x0555E30da8f98308EdB960aa94C0Db47230d2B9c',
  //   decimals: 8,
  // },
  // {
  //   name: 'WETH',
  //   symbol: 'WETH',
  //   logoSymbol: 'eth',
  //   address: '0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590',
  //   decimals: 18,
  // },
  {
    id: 123123123,
    chainId: 80069,
    isVerified: false,
    name: 'Mock Bera',
    symbol: 'mBera',
    address: '0xC672D663A6945E4D7fCd3b8dcb73f9a5116F19E1',
    decimals: 18,
    coingeckoId: "berachain-bera"
  },
  {
    id: 123123124,
    chainId: 80069,
    isVerified: false,
    name: 'Mock Honey',
    symbol: 'mHoney',
    address: '0x41936CA1174EE86B24c05a07653Df4Be68A0ED02',
    decimals: 18,
    coingeckoId: "honey-3"
  },
  {
    id: 123123125,
    chainId: 80069,
    isVerified: false,
    name: 'Mock USDC',
    symbol: 'mUSDC',
    address: '0xEB587A20C3fF1aa2B6DA888483eb1ffb7009c020',
    decimals: 18,
  },
  {
    id: 123123126,
    chainId: 80069,
    isVerified: false,
    name: 'Mock Honey 2',
    symbol: 'mHoney2',
    address: '0x92F7c1aa2BFDC2Fc09D3a596cEAfF9D55dd04aa7',
    decimals: 18,
  }
]; 
