import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { toggleTheme } from '../../store/slices/appSlice';
import './ThemeToggle.scss';

const ThemeToggle: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useAppSelector((state) => state.app);
  const dispatch = useAppDispatch();

  const handleToggle = () => {
    dispatch(toggleTheme());
  };

  return (
    <div className='theme-toggle'>
      <button
        className={`theme-toggle__button ${theme}`}
        onClick={handleToggle}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
      >
        <div className='theme-toggle__slider'>
          <div className='theme-toggle__icon'>
            {theme === 'light' ? '☀️' : '🌙'}
          </div>
        </div>
        <span className='theme-toggle__label'>
          {theme === 'light' ? t('lightTheme') : t('darkTheme')}
        </span>
      </button>
    </div>
  );
};

export default ThemeToggle;
