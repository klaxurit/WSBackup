import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface TokenAmount {
  tokenAddress: string;
  amount: string;
}

export interface SwapState {
  inputToken: TokenAmount | null;
  outputToken: TokenAmount | null;
  slippage: number;
  deadline: number;
  isExactInput: boolean;
  priceImpact: number | null;
  route: string[] | null;
  error: string | null;
}

const initialState: SwapState = {
  inputToken: null,
  outputToken: null,
  slippage: 0.5, // 0.5%
  deadline: 20 * 60, // 20 minutes
  isExactInput: true,
  priceImpact: null,
  route: null,
  error: null,
};

const swapSlice = createSlice({
  name: 'swap',
  initialState,
  reducers: {
    setInputToken: (state, action: PayloadAction<TokenAmount>) => {
      state.inputToken = action.payload;
      state.error = null;
    },
    setOutputToken: (state, action: PayloadAction<TokenAmount>) => {
      state.outputToken = action.payload;
      state.error = null;
    },
    setSlippage: (state, action: PayloadAction<number>) => {
      state.slippage = action.payload;
    },
    setDeadline: (state, action: PayloadAction<number>) => {
      state.deadline = action.payload;
    },
    setIsExactInput: (state, action: PayloadAction<boolean>) => {
      state.isExactInput = action.payload;
    },
    setPriceImpact: (state, action: PayloadAction<number | null>) => {
      state.priceImpact = action.payload;
    },
    setRoute: (state, action: PayloadAction<string[] | null>) => {
      state.route = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    resetSwap: (state) => {
      state.inputToken = null;
      state.outputToken = null;
      state.priceImpact = null;
      state.route = null;
      state.error = null;
    },
  },
});

export const {
  setInputToken,
  setOutputToken,
  setSlippage,
  setDeadline,
  setIsExactInput,
  setPriceImpact,
  setRoute,
  setError,
  resetSwap,
} = swapSlice.actions;

export default swapSlice.reducer; 