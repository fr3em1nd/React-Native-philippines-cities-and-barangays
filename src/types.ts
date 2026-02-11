import { ViewStyle, TextStyle } from 'react-native';

export interface Barangay {
  name: string;
  code?: string;
}

export interface City {
  name: string;
  code?: string;
  province: string;
  region: string;
  barangays: Barangay[];
}

export interface Province {
  name: string;
  code?: string;
  region: string;
}

export interface Region {
  name: string;
  code: string;
}

export interface DropdownItem {
  label: string;
  value: string;
}

export interface DropdownStyles {
  container?: ViewStyle;
  button?: ViewStyle;
  buttonText?: TextStyle;
  placeholder?: TextStyle;
  modalOverlay?: ViewStyle;
  modalContent?: ViewStyle;
  modalHeader?: ViewStyle;
  modalTitle?: TextStyle;
  closeButton?: ViewStyle;
  closeButtonText?: TextStyle;
  searchInput?: ViewStyle & TextStyle;
  listItem?: ViewStyle;
  listItemText?: TextStyle;
  selectedItem?: ViewStyle;
  selectedItemText?: TextStyle;
  emptyText?: TextStyle;
}

export interface DropdownProps {
  items: DropdownItem[];
  selectedValue: string | null;
  onValueChange: (value: string | null, item: DropdownItem | null) => void;
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  modalTitle?: string;
  styles?: DropdownStyles;
  testID?: string;
}

export interface PhilippineLocationPickerProps {
  onCityChange?: (city: City | null) => void;
  onBarangayChange?: (barangay: Barangay | null, city: City | null) => void;
  onLocationChange?: (location: { city: City | null; barangay: Barangay | null }) => void;
  initialCity?: string;
  initialBarangay?: string;
  cityPlaceholder?: string;
  barangayPlaceholder?: string;
  citySearchPlaceholder?: string;
  barangaySearchPlaceholder?: string;
  cityModalTitle?: string;
  barangayModalTitle?: string;
  searchable?: boolean;
  disabled?: boolean;
  containerStyle?: ViewStyle;
  dropdownStyles?: DropdownStyles;
  labelStyle?: TextStyle;
  showLabels?: boolean;
  cityLabel?: string;
  barangayLabel?: string;
  testID?: string;
}

export interface UsePhilippineLocationOptions {
  initialCity?: string;
  initialBarangay?: string;
  onCityChange?: (city: City | null) => void;
  onBarangayChange?: (barangay: Barangay | null, city: City | null) => void;
}

export interface UsePhilippineLocationReturn {
  selectedCity: City | null;
  selectedBarangay: Barangay | null;
  cities: City[];
  barangays: Barangay[];
  setCity: (cityName: string | null) => void;
  setBarangay: (barangayName: string | null) => void;
  reset: () => void;
  getCityByName: (name: string) => City | undefined;
  getBarangayByName: (cityName: string, barangayName: string) => Barangay | undefined;
}
