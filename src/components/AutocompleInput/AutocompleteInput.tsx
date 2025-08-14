import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Location } from '../../types';
import './AutocompleteInput.scss';
import { useAppSelector } from '../../hooks';

interface AutocompleteInputProps {
  onLocationSelect: (location: Location) => void;
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  onLocationSelect,
}) => {
  const { t, i18n } = useTranslation();
  const { locations } = useAppSelector((state) => state.location);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = i18n.language as 'en' | 'he';
  const isRTL = currentLanguage === 'he';

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredLocations([]);
      setIsDropdownOpen(false);
      return;
    }

    const nameField =
      currentLanguage === 'he' ? 'city_name_he' : 'city_name_en';
    const filtered = locations
      .filter((location) =>
        location[nameField].toLowerCase().startsWith(searchTerm.toLowerCase())
      )
      .slice(0, 20); // Limit results for performance

    setFilteredLocations(filtered);
    setIsDropdownOpen(filtered.length > 0);
    setHighlightedIndex(-1);
  }, [searchTerm, locations, currentLanguage]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleLocationSelect = (location: Location) => {
    const locationName =
      currentLanguage === 'he' ? location.city_name_he : location.city_name_en;
    setSearchTerm(locationName);
    setIsDropdownOpen(false);
    onLocationSelect(location);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isDropdownOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredLocations.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        e.preventDefault();
        if (
          highlightedIndex >= 0 &&
          highlightedIndex < filteredLocations.length
        ) {
          handleLocationSelect(filteredLocations[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsDropdownOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Delay closing to allow for click events on dropdown items
    setTimeout(() => {
      if (!dropdownRef.current?.contains(document.activeElement)) {
        setIsDropdownOpen(false);
      }
    }, 150);
  };

  const getDisplayName = (location: Location) => {
    return currentLanguage === 'he'
      ? location.city_name_he
      : location.city_name_en;
  };

  return (
    <div className={`autocomplete ${isRTL ? 'rtl' : 'ltr'}`}>
      <input
        ref={inputRef}
        type='text'
        value={searchTerm}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={t('searchPlaceholder')}
        className='autocomplete__input'
      />

      {isDropdownOpen && (
        <div ref={dropdownRef} className='autocomplete__dropdown'>
          <div className='autocomplete__list'>
            {filteredLocations.slice(0, 5).map((location, index) => (
              <div
                key={location.city_code}
                className={`autocomplete__item ${
                  index === highlightedIndex ? 'highlighted' : ''
                }`}
                onClick={() => handleLocationSelect(location)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                {getDisplayName(location)}
              </div>
            ))}
          </div>

          {filteredLocations.length > 5 && (
            <div className='autocomplete__more'>
              +{filteredLocations.length - 5} more results
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AutocompleteInput;
