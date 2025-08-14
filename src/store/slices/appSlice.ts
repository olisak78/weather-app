import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Theme, Language } from '../../types';

interface AppState {
  theme: Theme;
  language: Language;
}

const initialState: AppState = {
  theme: 'light',
  language: 'en',
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
  },
});

export const { toggleTheme, setLanguage } = appSlice.actions;
export default appSlice.reducer;
