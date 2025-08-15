import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { toggleUnits } from '../../store/slices/appSlice';
import './UnitsToggle.scss';

const UnitsToggle: React.FC = () => {
  const { t } = useTranslation();
  const { units } = useAppSelector((state) => state.app);
  const dispatch = useAppDispatch();

  const handleToggle = () => {
    dispatch(toggleUnits());
  };

  return (
    <div className='units-toggle'>
      <span className='units-toggle__label'>{t('units')}:</span>
      <button
        className={`units-toggle__button ${units}`}
        onClick={handleToggle}
        aria-label={`Switch to ${
          units === 'metric' ? 'imperial' : 'metric'
        } units`}
      >
        <div className='units-toggle__track'>
          <div className='units-toggle__slider'>
            <span className='units-toggle__text'>
              {units === 'metric' ? t('metric') : t('imperial')}
            </span>
          </div>
        </div>
      </button>
    </div>
  );
};

export default UnitsToggle;
