// Components
export { Dropdown } from './components/Dropdown';
export { PhilippineLocationPicker } from './components/PhilippineLocationPicker';

// Hooks
export { usePhilippineLocation } from './hooks/usePhilippineLocation';

// Data utilities
export {
  cities,
  regions,
  getCities,
  getCityByName,
  getBarangaysByCity,
  getCitiesByProvince,
  getCitiesByRegion,
  searchCities,
  searchBarangays,
} from './data/philippineData';

// Types
export type {
  City,
  Barangay,
  Province,
  Region,
  DropdownItem,
  DropdownStyles,
  DropdownProps,
  PhilippineLocationPickerProps,
  UsePhilippineLocationOptions,
  UsePhilippineLocationReturn,
} from './types';
