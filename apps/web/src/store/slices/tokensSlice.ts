import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
}

export interface TokenBalance {
  tokenAddress: string;
  balance: string;
  priceUSD: number | null;
}

export interface TokensState {
  tokens: Token[];
  balances: TokenBalance[];
  loading: boolean;
  error: string | null;
}

const initialState: TokensState = {
  tokens: [],
  balances: [],
  loading: false,
  error: null,
};

const tokensSlice = createSlice({
  name: 'tokens',
  initialState,
  reducers: {
    setTokens: (state, action: PayloadAction<Token[]>) => {
      state.tokens = action.payload;
      state.error = null;
    },
    setBalances: (state, action: PayloadAction<TokenBalance[]>) => {
      state.balances = action.payload;
    },
    updateTokenBalance: (state, action: PayloadAction<TokenBalance>) => {
      const index = state.balances.findIndex(
        (balance) => balance.tokenAddress === action.payload.tokenAddress
      );
      if (index !== -1) {
        state.balances[index] = action.payload;
      } else {
        state.balances.push(action.payload);
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setTokens,
  setBalances,
  updateTokenBalance,
  setLoading,
  setError,
} = tokensSlice.actions;

export default tokensSlice.reducer; 