import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FaSearch } from 'react-icons/fa';
import { useAppSelector } from '../../hooks';
import { Location } from '../../types';
import { getLocationDisplayName } from '../../utils/stringUtils';
import './AutocompleteInput.scss';

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
    const filtered = locations.filter((location) =>
      location[nameField].toLowerCase().startsWith(searchTerm.toLowerCase())
    );

    setFilteredLocations(filtered);
    setIsDropdownOpen(filtered.length > 0);
    setHighlightedIndex(-1);
  }, [searchTerm, locations, currentLanguage]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleLocationSelect = (location: Location) => {
    const locationName = getLocationDisplayName(location, currentLanguage);
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

  const handleSearchIconClick = () => {
    // Currently does nothing as requested
    // Can be implemented later for specific search functionality
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && dropdownRef.current) {
      const highlightedElement = dropdownRef.current.querySelector(
        `.autocomplete__item:nth-child(${highlightedIndex + 1})`
      ) as HTMLElement;

      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
        });
      }
    }
  }, [highlightedIndex]);

  return (
    <div className={`autocomplete ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className='autocomplete__input-wrapper'>
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
        <button
          type='button'
          className='autocomplete__search-icon'
          onClick={handleSearchIconClick}
          aria-label='Search'
        >
          {(FaSearch as any)({})}
        </button>
      </div>

      {isDropdownOpen && (
        <div ref={dropdownRef} className='autocomplete__dropdown'>
          <div className='autocomplete__list'>
            {filteredLocations.map((location, index) => (
              <div
                key={location.city_code}
                className={`autocomplete__item ${
                  index === highlightedIndex ? 'highlighted' : ''
                }`}
                onClick={() => handleLocationSelect(location)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                {getLocationDisplayName(location, currentLanguage)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AutocompleteInput;
