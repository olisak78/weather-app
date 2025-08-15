import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { setLanguage } from '../../store/slices/appSlice';
import { Language } from '../../types';
import './LanguageSelector.scss';

const LanguageSelector: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { language } = useAppSelector((state) => state.app);
  const dispatch = useAppDispatch();

  const handleToggle = () => {
    const newLanguage: Language = language === 'en' ? 'he' : 'en';
    dispatch(setLanguage(newLanguage));
    i18n.changeLanguage(newLanguage);

    // Update document direction
    document.documentElement.dir = newLanguage === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLanguage;
  };

  return (
    <div className='language-selector'>
      <button
        className={`language-selector__button ${language}`}
        onClick={handleToggle}
        aria-label={`Switch to ${
          language === 'en' ? 'Hebrew' : 'English'
        } language`}
      >
        <div className='language-selector__track'>
          <div className='language-selector__slider'>
            <span className='language-selector__text'>
              {language === 'en' ? '🇺🇸' : '🇮🇱'}
            </span>
          </div>
        </div>
      </button>
    </div>
  );
};

export default LanguageSelector;
