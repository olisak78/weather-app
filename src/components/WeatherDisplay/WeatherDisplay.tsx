import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../hooks';
import { WeatherData, Location } from '../../types';
import './WeatherDisplay.scss';

interface WeatherDisplayProps {
  weatherData: WeatherData;
  selectedLocation: Location;
  loading?: boolean;
}

const WeatherDisplay: React.FC<WeatherDisplayProps> = ({
  weatherData,
  loading = false,
  selectedLocation,
}) => {
  const { t } = useTranslation();
  const { units, language } = useAppSelector((state) => state.app);

  // Add defensive checks
  if (
    !weatherData ||
    weatherData.temp_c === null ||
    weatherData.temp_c === undefined
  ) {
    return (
      <div className='weather-display weather-display--loading'>
        <div className='weather-display__spinner'></div>
        <p>{t('loadingWeather')}</p>
      </div>
    );
  }

  const getTemperatureColor = (temp: number, isMetric: boolean): string => {
    // Convert to Celsius for consistent color coding
    const tempC = isMetric ? temp : ((temp - 32) * 5) / 9;

    if (tempC <= 0) return 'temp-freezing';
    if (tempC <= 10) return 'temp-cold';
    if (tempC <= 20) return 'temp-cool';
    if (tempC <= 30) return 'temp-warm';
    return 'temp-hot';
  };

  const formatTemperature = (): {
    value: number;
    unit: string;
    colorClass: string;
  } => {
    const isMetric = units === 'metric';
    // Add null checks here too
    const tempC = weatherData.temp_c ?? 0;
    const tempF = weatherData.temp_f ?? 32;
    const temp = isMetric ? tempC : tempF;
    const unit = isMetric ? '°C' : '°F';
    const colorClass = getTemperatureColor(temp, isMetric);

    return { value: Math.round(temp), unit, colorClass };
  };

  const formatWindSpeed = (): { value: number; unit: string } => {
    const isMetric = units === 'metric';
    const windKph = weatherData.wind_kph ?? 0;
    const windMph = weatherData.wind_mph ?? 0;
    const speed = isMetric ? windKph : windMph;
    const unit = isMetric ? t('kph') : t('mph');

    return { value: Math.round(speed), unit };
  };

  const formatPressure = (): { value: number; unit: string } => {
    const isMetric = units === 'metric';
    const pressureMb = weatherData.pressure_mb ?? 0;
    const pressureIn = weatherData.pressure_in ?? 0;
    const pressure = isMetric ? pressureMb : pressureIn;
    const unit = isMetric ? t('mb') : t('in');

    return {
      value: isMetric ? Math.round(pressure) : Number(pressure.toFixed(2)),
      unit,
    };
  };

  const formatVisibility = (): { value: number; unit: string } => {
    const isMetric = units === 'metric';
    const visKm = weatherData.vis_km ?? 0;
    const visMiles = weatherData.vis_miles ?? 0;
    const visibility = isMetric ? visKm : visMiles;
    const unit = isMetric ? t('km') : t('miles');

    return { value: Math.round(visibility), unit };
  };

  const temperature = formatTemperature();
  const windSpeed = formatWindSpeed();
  const pressure = formatPressure();
  const visibility = formatVisibility();

  if (loading) {
    return (
      <div className='weather-display weather-display--loading'>
        <div className='weather-display__spinner'></div>
        <p>{t('loadingWeather')}</p>
      </div>
    );
  }

  return (
    <div className='weather-display'>
      <div className='weather-display__header'>
        <h2 className='weather-display__location'>
          {language === 'he'
            ? `${selectedLocation.name_in_hebrew || ''}`
            : `${selectedLocation.name_in_english || ''},${' '}${
                weatherData?.location?.country
              }`}
        </h2>
        <p className='weather-display__updated'>
          {t('lastUpdated')}:{' '}
          {weatherData.last_updated
            ? new Date(weatherData.last_updated).toLocaleString(
                language === 'he' ? 'he-IL' : 'en-US'
              )
            : ''}
        </p>
      </div>

      <div className='weather-display__main'>
        <div className='weather-display__primary'>
          <div className='weather-display__temperature'>
            <span
              className={`weather-display__temp-value ${temperature.colorClass}`}
            >
              {temperature.value}
              {temperature.unit}
            </span>
          </div>

          <div className='weather-display__condition'>
            <img
              src={`https:${weatherData.condition?.icon || ''}`}
              alt={weatherData.condition?.text || 'Weather condition'}
              className='weather-display__condition-icon'
            />
            <span className='weather-display__condition-text'>
              {weatherData.condition?.text || 'Unknown'}
            </span>
          </div>
        </div>

        <div className='weather-display__details'>
          <div className='weather-display__detail-item'>
            <span className='weather-display__detail-label'>
              {t('humidity')}
            </span>
            <span className='weather-display__detail-value'>
              {weatherData.humidity ?? 0}%
            </span>
          </div>

          <div className='weather-display__detail-item'>
            <span className='weather-display__detail-label'>{t('wind')}</span>
            <span className='weather-display__detail-value'>
              {windSpeed.value} {windSpeed.unit} {weatherData.wind_dir || 'N/A'}
            </span>
          </div>

          <div className='weather-display__detail-item'>
            <span className='weather-display__detail-label'>
              {t('pressure')}
            </span>
            <span className='weather-display__detail-value'>
              {pressure.value} {pressure.unit}
            </span>
          </div>

          <div className='weather-display__detail-item'>
            <span className='weather-display__detail-label'>
              {t('visibility')}
            </span>
            <span className='weather-display__detail-value'>
              {visibility.value} {visibility.unit}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherDisplay;
