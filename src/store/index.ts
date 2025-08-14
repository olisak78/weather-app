import { configureStore } from '@reduxjs/toolkit';
import appReducer from './slices/appSlice';
import locationReducer from './slices/locationSlice';

export const store = configureStore({
  reducer: {
    app: appReducer,
    location: locationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
