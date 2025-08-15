import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { fetchLocations } from '../../store/slices/locationSlice';
import {
  setSelectedLocation,
  fetchWeatherData,
} from '../../store/slices/weatherSlice';
import { Location } from '../../types';
import AutocompleteInput from '../../components/AutocompleteInput/AutocompleteInput';
import ThemeToggle from '../../components/ThemeToggle/ThemeToggle';
import LanguageSelector from '../../components/LanguageSelector/LanguageSelector';
import UnitsToggle from '../../components/UnitsToggle/UnitsToggle';
import WeatherDisplay from '../../components/WeatherDisplay/WeatherDisplay';
import './HomePage.scss';

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { loading: locationsLoading, error: locationsError } = useAppSelector(
    (state) => state.location
  );
  const {
    selectedLocation,
    weatherData,
    loading: weatherLoading,
    error: weatherError,
    usedCoordinates,
  } = useAppSelector((state) => state.weather);
  const { language } = useAppSelector((state) => state.app);

  useEffect(() => {
    dispatch(fetchLocations(false));
  }, [dispatch]);

  const handleLocationSelect = (location: Location) => {
    dispatch(setSelectedLocation(location));

    // Always use the enhanced fetchWeatherData with location object and language
    dispatch(fetchWeatherData({ location, language }));
  };

  const handleRefreshData = () => {
    dispatch(fetchLocations(true));
  };

  const handleRetryWeather = () => {
    if (selectedLocation) {
      dispatch(fetchWeatherData({ location: selectedLocation, language }));
    }
  };

  return (
    <div className='home-page'>
      <header className='home-page__header'>
        <h1 className='home-page__title'>{t('welcome')}</h1>
        <div className='home-page__controls'>
          <LanguageSelector />
          <UnitsToggle />
          <ThemeToggle />
        </div>
      </header>

      <main className='home-page__main'>
        <div className='home-page__container'>
          <div className='home-page__search-section'>
            {locationsLoading && (
              <div className='home-page__loading'>
                <div className='home-page__spinner'></div>
                {t('loading')}
              </div>
            )}

            {locationsError && (
              <div className='home-page__error'>
                <div className='home-page__error-message'>{t('error')}</div>
                <button
                  className='home-page__retry-button'
                  onClick={handleRefreshData}
                  disabled={locationsLoading}
                >
                  {t('retryButton')}
                </button>
              </div>
            )}

            {!locationsLoading && !locationsError && (
              <AutocompleteInput onLocationSelect={handleLocationSelect} />
            )}
          </div>

          {/* Weather Display Section */}
          {selectedLocation && (
            <div className='home-page__weather-section'>
              {weatherLoading && (
                <WeatherDisplay weatherData={null as any} loading={true} />
              )}

              {weatherError && !weatherLoading && (
                <div className='home-page__weather-error'>
                  <div className='home-page__error-message'>
                    {t('error')}: {weatherError}
                  </div>
                  <button
                    className='home-page__retry-button'
                    onClick={handleRetryWeather}
                  >
                    {t('retryButton')}
                  </button>
                </div>
              )}

              {weatherData && !weatherLoading && !weatherError && (
                <div className='home-page__weather-container'>
                  {usedCoordinates && (
                    <div className='home-page__coordinate-notice'>
                      <small>
                        {language === 'he'
                          ? 'נתוני מזג האוויר התקבלו באמצעות קואורדינטות'
                          : 'Weather data retrieved using coordinates'}
                      </small>
                    </div>
                  )}
                  <WeatherDisplay weatherData={weatherData} loading={false} />
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HomePage;
