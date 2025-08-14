import React, { useEffect } from 'react';
import { useAppSelector } from './hooks';
import HomePage from './pages/HomePage/HomePage';
import './styles/globals.scss';

const App: React.FC = () => {
  const { theme, language } = useAppSelector((state) => state.app);

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    // Apply language direction to document
    document.documentElement.dir = language === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  return (
    <div className='app'>
      <HomePage />
    </div>
  );
};

export default App;
