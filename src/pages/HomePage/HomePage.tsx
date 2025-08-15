import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '../../hooks';
import {
  fetchLocations,
  setSelectedLocation,
  refreshLocations,
} from '../../store/slices/locationSlice';
import { Location } from '../../types';
import { getCacheInfo } from '../../utils/cacheUtils';
import { getLocationDisplayName as formatLocationName } from '../../utils/stringUtils';
import AutocompleteInput from '../../components/AutocompleteInput/AutocompleteInput';
import ThemeToggle from '../../components/ThemeToggle/ThemeToggle';
import LanguageSelector from '../../components/LanguageSelector/LanguageSelector';
import './HomePage.scss';

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { selectedLocation, loading, error, lastUpdated, cacheStatus } =
    useAppSelector((state) => state.location);
  const { language } = useAppSelector((state) => state.app);

  useEffect(() => {
    dispatch(fetchLocations(false)); // false = don't force refresh, use cache if valid
  }, [dispatch]);

  const handleLocationSelect = (location: Location) => {
    dispatch(setSelectedLocation(location));
  };

  const handleRefreshData = () => {
    dispatch(refreshLocations());
  };

  const getLocationDisplayName = (location: Location) => {
    return formatLocationName(location, language);
  };

  const formatLastUpdated = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString(language === 'he' ? 'he-IL' : 'en-US');
  };

  const getCacheStatusMessage = () => {
    const cacheInfo = getCacheInfo();

    if (!cacheInfo.hasCache) {
      return t('noCacheData');
    }

    if (!cacheInfo.isValid) {
      return t('cacheExpired');
    }

    if (cacheInfo.age && cacheInfo.expiresAt) {
      const hoursOld = Math.floor(cacheInfo.age / (1000 * 60 * 60));
      const expiresAt = cacheInfo.expiresAt.toLocaleString(
        language === 'he' ? 'he-IL' : 'en-US'
      );
      return t('cacheValid', { hours: hoursOld, expiresAt });
    }

    return t('cacheStatusUnknown');
  };

  return (
    <div className='home-page'>
      <header className='home-page__header'>
        <div className='home-page__controls'>
          <LanguageSelector />
          <ThemeToggle />
        </div>
      </header>

      <main className='home-page__main'>
        <div className='home-page__container'>
          <h1 className='home-page__title'>{t('welcome')}</h1>

          <div className='home-page__search-section'>
            {loading && (
              <div className='home-page__loading'>
                <div className='home-page__spinner'></div>
                {t('loading')}
              </div>
            )}

            {error && (
              <div className='home-page__error'>
                <div className='home-page__error-message'>{t('error')}</div>
                <button
                  className='home-page__retry-button'
                  onClick={handleRefreshData}
                  disabled={loading}
                >
                  {t('retryButton')}
                </button>
              </div>
            )}

            {!loading && !error && (
              <>
                <AutocompleteInput onLocationSelect={handleLocationSelect} />

                {/* Cache Status Info */}
                <div className='home-page__cache-info'>
                  <div className={`home-page__cache-status ${cacheStatus}`}>
                    <span className='home-page__cache-indicator'></span>
                    {getCacheStatusMessage()}
                  </div>

                  {lastUpdated && (
                    <div className='home-page__last-updated'>
                      {t('lastUpdated')}: {formatLastUpdated(lastUpdated)}
                    </div>
                  )}

                  <button
                    className='home-page__refresh-button'
                    onClick={handleRefreshData}
                    disabled={loading}
                    title={t('refreshData')}
                  >
                    <span className='home-page__refresh-icon'>🔄</span>
                    {t('refreshButton')}
                  </button>
                </div>
              </>
            )}
          </div>

          {selectedLocation && (
            <div className='home-page__selected-location'>
              <h2 className='home-page__selected-title'>
                {t('selectedLocation')}
              </h2>
              <div className='home-page__location-card'>
                <div className='home-page__location-name'>
                  {getLocationDisplayName(selectedLocation)}
                </div>
                <div className='home-page__location-code'>
                  {t('code')}: {selectedLocation.city_code}
                </div>
                {language === 'en' && selectedLocation.city_name_he && (
                  <div className='home-page__location-alt'>
                    Hebrew: {selectedLocation.city_name_he}
                  </div>
                )}
                {language === 'he' && selectedLocation.city_name_en && (
                  <div className='home-page__location-alt'>
                    English: {selectedLocation.city_name_en}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HomePage;
