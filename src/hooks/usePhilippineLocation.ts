import { useState, useCallback, useMemo } from 'react';
import {
  getCities,
  getCityByName,
  getBarangaysByCity,
} from '../data/philippineData';
import {
  City,
  Barangay,
  UsePhilippineLocationOptions,
  UsePhilippineLocationReturn,
} from '../types';

export const usePhilippineLocation = (
  options: UsePhilippineLocationOptions = {}
): UsePhilippineLocationReturn => {
  const {
    initialCity,
    initialBarangay,
    onCityChange,
    onBarangayChange,
  } = options;

  const [selectedCityName, setSelectedCityName] = useState<string | null>(
    initialCity || null
  );
  const [selectedBarangayName, setSelectedBarangayName] = useState<string | null>(
    initialBarangay || null
  );

  const cities = useMemo(() => getCities(), []);

  const selectedCity = useMemo((): City | null => {
    if (!selectedCityName) return null;
    return getCityByName(selectedCityName) || null;
  }, [selectedCityName]);

  const barangays = useMemo((): Barangay[] => {
    if (!selectedCityName) return [];
    return getBarangaysByCity(selectedCityName);
  }, [selectedCityName]);

  const selectedBarangay = useMemo((): Barangay | null => {
    if (!selectedCity || !selectedBarangayName) return null;
    return (
      selectedCity.barangays.find(
        (b) => b.name.toLowerCase() === selectedBarangayName.toLowerCase()
      ) || null
    );
  }, [selectedCity, selectedBarangayName]);

  const setCity = useCallback(
    (cityName: string | null) => {
      const city = cityName ? getCityByName(cityName) || null : null;
      setSelectedCityName(cityName);
      setSelectedBarangayName(null);

      if (onCityChange) {
        onCityChange(city);
      }
    },
    [onCityChange]
  );

  const setBarangay = useCallback(
    (barangayName: string | null) => {
      setSelectedBarangayName(barangayName);

      if (onBarangayChange && selectedCity) {
        const barangay = barangayName
          ? selectedCity.barangays.find(
              (b) => b.name.toLowerCase() === barangayName.toLowerCase()
            ) || null
          : null;
        onBarangayChange(barangay, selectedCity);
      }
    },
    [selectedCity, onBarangayChange]
  );

  const reset = useCallback(() => {
    setSelectedCityName(null);
    setSelectedBarangayName(null);
  }, []);

  const getCityByNameFn = useCallback((name: string): City | undefined => {
    return getCityByName(name);
  }, []);

  const getBarangayByName = useCallback(
    (cityName: string, barangayName: string): Barangay | undefined => {
      const city = getCityByName(cityName);
      if (!city) return undefined;
      return city.barangays.find(
        (b) => b.name.toLowerCase() === barangayName.toLowerCase()
      );
    },
    []
  );

  return {
    selectedCity,
    selectedBarangay,
    cities,
    barangays,
    setCity,
    setBarangay,
    reset,
    getCityByName: getCityByNameFn,
    getBarangayByName,
  };
};

export default usePhilippineLocation;
