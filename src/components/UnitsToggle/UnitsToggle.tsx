import React from 'react';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { toggleUnits } from '../../store/slices/appSlice';
import { RiCelsiusFill, RiFahrenheitFill } from 'react-icons/ri';
import './UnitsToggle.scss';

const UnitsToggle: React.FC = () => {
  const { units } = useAppSelector((state) => state.app);
  const dispatch = useAppDispatch();

  const handleToggle = () => {
    dispatch(toggleUnits());
  };

  return (
    <div className='units-toggle'>
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
              {units === 'metric'
                ? (RiCelsiusFill as any)({})
                : (RiFahrenheitFill as any)({})}
            </span>
          </div>
        </div>
      </button>
    </div>
  );
};

export default UnitsToggle;
