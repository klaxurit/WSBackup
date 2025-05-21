import { configureStore } from '@reduxjs/toolkit';
import walletReducer from './slices/walletSlice';
import swapReducer from './slices/swapSlice';
import tokensReducer from './slices/tokensSlice';

export const store = configureStore({
  reducer: {
    wallet: walletReducer,
    swap: swapReducer,
    tokens: tokensReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['wallet/setWalletConnected'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.provider'],
        // Ignore these paths in the state
        ignoredPaths: ['wallet.provider'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 