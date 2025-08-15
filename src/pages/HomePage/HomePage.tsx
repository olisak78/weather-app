import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { fetchLocations } from '../../store/slices/locationSlice';
import {
  setSelectedLocation,
  fetchWeatherData,
} from '../../store/slices/weatherSlice';
import { Location } from '../../types';
import { formatLocationName } from '../../utils/stringUtils';
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
  } = useAppSelector((state) => state.weather);
  const { language } = useAppSelector((state) => state.app);

  useEffect(() => {
    dispatch(fetchLocations(false));
  }, [dispatch]);

  const handleLocationSelect = (location: Location) => {
    dispatch(setSelectedLocation(location));
    const rawLocationName =
      language === 'he' ? location.city_name_he : location.city_name_en;
    // Use the formatted location name for weather API query
    const locationName = formatLocationName(rawLocationName, language);
    dispatch(fetchWeatherData(locationName));
  };

  const handleRefreshData = () => {
    dispatch(fetchLocations(true));
  };

  console.log('Weather data before rendering:', weatherData);
  console.log('Weather data temp_c:', weatherData?.temp_c);

  return (
    <div className='home-page'>
      <header className='home-page__header'>
        <div className='home-page__controls'>
          <LanguageSelector />
          <UnitsToggle />
          <ThemeToggle />
        </div>
      </header>

      <main className='home-page__main'>
        <div className='home-page__container'>
          <h1 className='home-page__title'>{t('welcome')}</h1>

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
                    onClick={() => {
                      const rawLocationName =
                        language === 'he'
                          ? selectedLocation.city_name_he
                          : selectedLocation.city_name_en;
                      const locationName = formatLocationName(
                        rawLocationName,
                        language
                      );
                      dispatch(fetchWeatherData(locationName));
                    }}
                    disabled={weatherLoading}
                  >
                    {t('retryButton')}
                  </button>
                </div>
              )}

              {!weatherLoading && !weatherError && weatherData && (
                <WeatherDisplay weatherData={weatherData} loading={false} />
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HomePage;
