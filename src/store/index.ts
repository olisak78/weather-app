import { configureStore } from '@reduxjs/toolkit';
import appReducer from './slices/appSlice';
import locationReducer from './slices/locationSlice';
import weatherReducer from './slices/weatherSlice';

export const store = configureStore({
  reducer: {
    app: appReducer,
    location: locationReducer,
    weather: weatherReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
