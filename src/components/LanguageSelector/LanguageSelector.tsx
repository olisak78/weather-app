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

  const languages = [
    { code: 'en' as Language, name: 'English', flag: '🇺🇸' },
    { code: 'he' as Language, name: 'עברית', flag: '🇮🇱' },
  ];

  const handleLanguageChange = (languageCode: Language) => {
    dispatch(setLanguage(languageCode));
    i18n.changeLanguage(languageCode);

    // Update document direction
    document.documentElement.dir = languageCode === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = languageCode;
  };

  return (
    <div className='language-selector'>
      <span className='language-selector__label'>{t('language')}:</span>
      <div className='language-selector__options'>
        {languages.map((lang) => (
          <button
            key={lang.code}
            className={`language-selector__option ${
              language === lang.code ? 'active' : ''
            }`}
            onClick={() => handleLanguageChange(lang.code)}
            aria-label={`Switch to ${lang.name}`}
          >
            <span className='language-selector__flag'>{lang.flag}</span>
            <span className='language-selector__name'>
              {lang.code.toUpperCase()}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;
