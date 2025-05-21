import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  balance: string;
  error: string | null;
}

const initialState: WalletState = {
  isConnected: false,
  address: null,
  chainId: null,
  balance: '0',
  error: null,
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setWalletConnected: (state, action: PayloadAction<{ address: string; chainId: number }>) => {
      state.isConnected = true;
      state.address = action.payload.address;
      state.chainId = action.payload.chainId;
      state.error = null;
    },
    setWalletDisconnected: (state) => {
      state.isConnected = false;
      state.address = null;
      state.chainId = null;
      state.balance = '0';
      state.error = null;
    },
    setBalance: (state, action: PayloadAction<string>) => {
      state.balance = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
  },
});

export const { setWalletConnected, setWalletDisconnected, setBalance, setError } = walletSlice.actions;
export default walletSlice.reducer; 