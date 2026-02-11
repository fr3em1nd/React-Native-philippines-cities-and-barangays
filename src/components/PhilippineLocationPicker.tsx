import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Dropdown } from './Dropdown';
import { getCities, getCityByName } from '../data/philippineData';
import {
  PhilippineLocationPickerProps,
  City,
  Barangay,
  DropdownItem,
} from '../types';

const defaultStyles = StyleSheet.create({
  container: {
    width: '100%',
  },
  dropdownWrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
});

export const PhilippineLocationPicker: React.FC<PhilippineLocationPickerProps> = ({
  onCityChange,
  onBarangayChange,
  onLocationChange,
  initialCity,
  initialBarangay,
  cityPlaceholder = 'Select City',
  barangayPlaceholder = 'Select Barangay',
  citySearchPlaceholder = 'Search city...',
  barangaySearchPlaceholder = 'Search barangay...',
  cityModalTitle = 'Select City',
  barangayModalTitle = 'Select Barangay',
  searchable = true,
  disabled = false,
  containerStyle,
  dropdownStyles,
  labelStyle,
  showLabels = true,
  cityLabel = 'City',
  barangayLabel = 'Barangay',
  testID,
}) => {
  const [selectedCityName, setSelectedCityName] = useState<string | null>(
    initialCity || null
  );
  const [selectedBarangayName, setSelectedBarangayName] = useState<string | null>(
    initialBarangay || null
  );

  const cities = useMemo(() => getCities(), []);

  const selectedCity = useMemo(() => {
    if (!selectedCityName) return null;
    return getCityByName(selectedCityName) || null;
  }, [selectedCityName]);

  const selectedBarangay = useMemo(() => {
    if (!selectedCity || !selectedBarangayName) return null;
    return (
      selectedCity.barangays.find(
        (b) => b.name.toLowerCase() === selectedBarangayName.toLowerCase()
      ) || null
    );
  }, [selectedCity, selectedBarangayName]);

  const cityItems: DropdownItem[] = useMemo(() => {
    return cities.map((city) => ({
      label: city.name,
      value: city.name,
    }));
  }, [cities]);

  const barangayItems: DropdownItem[] = useMemo(() => {
    if (!selectedCity) return [];
    return selectedCity.barangays.map((barangay) => ({
      label: barangay.name,
      value: barangay.name,
    }));
  }, [selectedCity]);

  const handleCityChange = useCallback(
    (value: string | null, _item: DropdownItem | null) => {
      const city = value ? getCityByName(value) || null : null;
      setSelectedCityName(value);
      setSelectedBarangayName(null);

      if (onCityChange) {
        onCityChange(city);
      }

      if (onLocationChange) {
        onLocationChange({ city, barangay: null });
      }
    },
    [onCityChange, onLocationChange]
  );

  const handleBarangayChange = useCallback(
    (value: string | null, _item: DropdownItem | null) => {
      setSelectedBarangayName(value);

      const barangay = value && selectedCity
        ? selectedCity.barangays.find(
            (b) => b.name.toLowerCase() === value.toLowerCase()
          ) || null
        : null;

      if (onBarangayChange) {
        onBarangayChange(barangay, selectedCity);
      }

      if (onLocationChange) {
        onLocationChange({ city: selectedCity, barangay });
      }
    },
    [selectedCity, onBarangayChange, onLocationChange]
  );

  // Handle initial values
  useEffect(() => {
    if (initialCity && !selectedCityName) {
      setSelectedCityName(initialCity);
    }
  }, [initialCity]);

  useEffect(() => {
    if (initialBarangay && selectedCity && !selectedBarangayName) {
      const barangayExists = selectedCity.barangays.some(
        (b) => b.name.toLowerCase() === initialBarangay.toLowerCase()
      );
      if (barangayExists) {
        setSelectedBarangayName(initialBarangay);
      }
    }
  }, [initialBarangay, selectedCity]);

  return (
    <View
      style={[defaultStyles.container, containerStyle]}
      testID={testID}
    >
      <View style={defaultStyles.dropdownWrapper}>
        {showLabels && (
          <Text style={[defaultStyles.label, labelStyle]}>{cityLabel}</Text>
        )}
        <Dropdown
          items={cityItems}
          selectedValue={selectedCityName}
          onValueChange={handleCityChange}
          placeholder={cityPlaceholder}
          searchable={searchable}
          searchPlaceholder={citySearchPlaceholder}
          modalTitle={cityModalTitle}
          disabled={disabled}
          styles={dropdownStyles}
          testID={testID ? `${testID}-city` : undefined}
        />
      </View>

      <View style={defaultStyles.dropdownWrapper}>
        {showLabels && (
          <Text style={[defaultStyles.label, labelStyle]}>{barangayLabel}</Text>
        )}
        <Dropdown
          items={barangayItems}
          selectedValue={selectedBarangayName}
          onValueChange={handleBarangayChange}
          placeholder={
            selectedCity ? barangayPlaceholder : 'Select a city first'
          }
          searchable={searchable}
          searchPlaceholder={barangaySearchPlaceholder}
          modalTitle={barangayModalTitle}
          disabled={disabled || !selectedCity}
          styles={dropdownStyles}
          testID={testID ? `${testID}-barangay` : undefined}
        />
      </View>
    </View>
  );
};

export default PhilippineLocationPicker;
