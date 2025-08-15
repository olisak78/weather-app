// src/components/AutocompleteInput/AutocompleteInput.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../hooks';
import { Location } from '../../types';
import './AutocompleteInput.scss';

interface AutocompleteInputProps {
  onLocationSelect: (location: Location) => void;
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  onLocationSelect,
}) => {
  const { t } = useTranslation();
  const { locations } = useAppSelector((state) => state.location);
  const { language } = useAppSelector((state) => state.app);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Filter locations based on search term - allow searching in any language
  const filteredLocations = useMemo(() => {
    if (!searchTerm.trim()) return [];

    const searchTermLower = searchTerm.toLowerCase().trim();

    return locations
      .filter((location) => {
        // Search in Hebrew name
        const hebrewMatch = location.name_in_hebrew
          .toLowerCase()
          .includes(searchTermLower);

        // Search in English name
        const englishMatch = location.name_in_english
          .toLowerCase()
          .includes(searchTermLower);
        return hebrewMatch || englishMatch;
      })
      .slice(0, 50); // Limit results for performance
  }, [searchTerm, locations]);

  // Get display name based on current language
  const getDisplayName = (location: Location): string => {
    if (language === 'he') {
      return location.name_in_hebrew || location.name_in_english;
    }
    return location.name_in_english || location.name_in_hebrew;
  };

  // Get secondary name for display (opposite language)
  const getSecondaryName = (location: Location): string => {
    if (language === 'he') {
      return location.name_in_english !== location.name_in_hebrew
        ? location.name_in_english
        : '';
    }
    return location.name_in_hebrew !== location.name_in_english
      ? location.name_in_hebrew
      : '';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsOpen(value.trim().length > 0);
    setSelectedIndex(-1);
  };

  const handleLocationClick = (location: Location) => {
    setSearchTerm(getDisplayName(location));
    setIsOpen(false);
    setSelectedIndex(-1);
    onLocationSelect(location);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || filteredLocations.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredLocations.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredLocations.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredLocations.length) {
          handleLocationClick(filteredLocations[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleBlur = () => {
    // Delay closing to allow for clicks on options
    setTimeout(() => setIsOpen(false), 150);
  };

  const handleFocus = () => {
    if (searchTerm.trim()) {
      setIsOpen(true);
    }
  };

  // Reset when locations change (e.g., after refresh)
  useEffect(() => {
    if (locations.length === 0) {
      setSearchTerm('');
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  }, [locations]);

  return (
    <div className='autocomplete-input'>
      <div className='autocomplete-input__wrapper'>
        <input
          type='text'
          className='autocomplete-input__field'
          placeholder={t('searchPlaceholder')}
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={handleFocus}
          autoComplete='off'
        />

        {isOpen && filteredLocations.length > 0 && (
          <ul className='autocomplete-input__dropdown'>
            {filteredLocations.map((location, index) => {
              const displayName = getDisplayName(location);
              const secondaryName = getSecondaryName(location);

              return (
                <li
                  key={location.symbol_number}
                  className={`autocomplete-input__option ${
                    index === selectedIndex
                      ? 'autocomplete-input__option--selected'
                      : ''
                  }`}
                  onClick={() => handleLocationClick(location)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className='autocomplete-input__option-content'>
                    <div className='autocomplete-input__primary-name'>
                      {displayName}
                    </div>
                    {secondaryName && (
                      <div className='autocomplete-input__secondary-name'>
                        {secondaryName}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {isOpen && searchTerm.trim() && filteredLocations.length === 0 && (
          <div className='autocomplete-input__no-results'>{t('noResults')}</div>
        )}
      </div>
    </div>
  );
};

export default AutocompleteInput;
