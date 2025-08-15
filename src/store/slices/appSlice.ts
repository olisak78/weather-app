import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Theme, Language, Units } from '../../types';

interface AppState {
  theme: Theme;
  language: Language;
  units: Units;
}

const initialState: AppState = {
  theme: 'light',
  language: 'en',
  units: 'metric',
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    setLanguage: (state, action: PayloadAction<Language>) => {
      state.language = action.payload;
    },
    toggleUnits: (state) => {
      state.units = state.units === 'metric' ? 'imperial' : 'metric';
    },
    setUnits: (state, action: PayloadAction<Units>) => {
      state.units = action.payload;
    },
  },
});

export const { toggleTheme, setLanguage, toggleUnits, setUnits } =
  appSlice.actions;
export default appSlice.reducer;
