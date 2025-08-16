import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch, useWeatherCache } from '../../hooks';
import { fetchLocations } from '../../store/slices/locationSlice';
import {
  setSelectedLocation,
  fetchWeatherData,
  setCachedWeatherData,
} from '../../store/slices/weatherSlice';
import { Location } from '../../types';
import AutocompleteInput from '../../components/AutocompleteInput/AutocompleteInput';
import ThemeToggle from '../../components/ThemeToggle/ThemeToggle';
import LanguageSelector from '../../components/LanguageSelector/LanguageSelector';
import UnitsToggle from '../../components/UnitsToggle/UnitsToggle';
import WeatherDisplay from '../../components/WeatherDisplay/WeatherDisplay';
import logo from '../../logo.svg';
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
    fromCache,
  } = useAppSelector((state) => state.weather);
  const { language } = useAppSelector((state) => state.app);

  // Initialize weather cache hook
  const { getCachedWeather, setCachedWeather } = useWeatherCache();

  useEffect(() => {
    dispatch(fetchLocations(false));
  }, [dispatch]);

  const handleLocationSelect = (location: Location) => {
    dispatch(setSelectedLocation(location));

    // Check cache first
    const cachedEntry = getCachedWeather(location);

    if (cachedEntry) {
      console.log(`Using cached weather data for ${location.name_in_english}`);
      // Use cached data
      dispatch(
        setCachedWeatherData({
          weatherData: cachedEntry.data,
          usedCoordinates: cachedEntry.usedCoordinates,
        })
      );
    } else {
      console.log(
        `No cached data for ${location.name_in_english}, fetching fresh data`
      );
      // Fetch fresh data and cache it
      dispatch(fetchWeatherData({ location, language }))
        .unwrap()
        .then((result) => {
          // Cache the fresh data
          setCachedWeather(
            location,
            result.weatherData,
            result.usedCoordinates
          );
        })
        .catch((error) => {
          console.error('Failed to fetch weather data:', error);
        });
    }
  };

  const handleRefreshData = () => {
    dispatch(fetchLocations(true));
  };

  const handleRetryWeather = () => {
    if (selectedLocation) {
      // Force refresh - skip cache
      console.log(
        `Force refreshing weather for ${selectedLocation.name_in_english}`
      );
      dispatch(fetchWeatherData({ location: selectedLocation, language }))
        .unwrap()
        .then((result) => {
          // Update cache with fresh data
          setCachedWeather(
            selectedLocation,
            result.weatherData,
            result.usedCoordinates
          );
        })
        .catch((error) => {
          console.error('Failed to retry weather data:', error);
        });
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
                <WeatherDisplay
                  weatherData={null as any}
                  selectedLocation={null as any}
                  loading={true}
                />
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
                  {/* Coordinates indicator */}
                  {usedCoordinates && (
                    <div className='home-page__coordinate-notice'>
                      <small>
                        {language === 'he'
                          ? 'נתוני מזג האוויר התקבלו באמצעות קואורדינטות'
                          : 'Weather data retrieved using coordinates'}
                      </small>
                    </div>
                  )}

                  <WeatherDisplay
                    weatherData={weatherData}
                    selectedLocation={selectedLocation}
                    loading={false}
                  />
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
