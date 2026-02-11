# React Native Philippines Cities and Barangays

A React Native dropdown component for selecting Philippine cities and barangays with dynamic selection. When a city is selected, the barangay dropdown automatically updates to show only the barangays within that city.

## Features

- Pure JavaScript implementation (no native dependencies required)
- TypeScript support with full type definitions
- Searchable dropdowns for easy navigation
- Customizable styles
- Includes major Philippine cities with their barangays
- Custom hook for programmatic control
- Zero external dependencies (uses only React Native built-in components)

## Installation

```bash
npm install react-native-philippines-cities-barangays
# or
yarn add react-native-philippines-cities-barangays
```

## Quick Start

### Using the PhilippineLocationPicker Component

The easiest way to add city and barangay selection:

```tsx
import React from 'react';
import { View } from 'react-native';
import { PhilippineLocationPicker } from 'react-native-philippines-cities-barangays';

const App = () => {
  const handleLocationChange = ({ city, barangay }) => {
    console.log('Selected city:', city?.name);
    console.log('Selected barangay:', barangay?.name);
  };

  return (
    <View style={{ padding: 20 }}>
      <PhilippineLocationPicker
        onLocationChange={handleLocationChange}
        searchable={true}
      />
    </View>
  );
};

export default App;
```

### Using the Custom Hook

For more control over the selection:

```tsx
import React from 'react';
import { View, Text, Button } from 'react-native';
import {
  usePhilippineLocation,
  Dropdown
} from 'react-native-philippines-cities-barangays';

const App = () => {
  const {
    selectedCity,
    selectedBarangay,
    cities,
    barangays,
    setCity,
    setBarangay,
    reset,
  } = usePhilippineLocation({
    onCityChange: (city) => console.log('City changed:', city?.name),
    onBarangayChange: (barangay) => console.log('Barangay changed:', barangay?.name),
  });

  const cityItems = cities.map((city) => ({
    label: city.name,
    value: city.name,
  }));

  const barangayItems = barangays.map((brgy) => ({
    label: brgy.name,
    value: brgy.name,
  }));

  return (
    <View style={{ padding: 20 }}>
      <Dropdown
        items={cityItems}
        selectedValue={selectedCity?.name || null}
        onValueChange={(value) => setCity(value)}
        placeholder="Select City"
        modalTitle="Select City"
      />

      <Dropdown
        items={barangayItems}
        selectedValue={selectedBarangay?.name || null}
        onValueChange={(value) => setBarangay(value)}
        placeholder="Select Barangay"
        modalTitle="Select Barangay"
        disabled={!selectedCity}
      />

      <Button title="Reset" onPress={reset} />

      {selectedCity && (
        <Text>Selected: {selectedCity.name}, {selectedBarangay?.name}</Text>
      )}
    </View>
  );
};

export default App;
```

### Using Data Utilities Directly

Access the data programmatically:

```tsx
import {
  getCities,
  getCityByName,
  getBarangaysByCity,
  getCitiesByProvince,
  getCitiesByRegion,
  searchCities,
  searchBarangays,
} from 'react-native-philippines-cities-barangays';

// Get all cities
const allCities = getCities();

// Get a specific city
const manila = getCityByName('Manila');

// Get barangays for a city
const manilaBarangays = getBarangaysByCity('Manila');

// Get cities by province
const metromanilaCities = getCitiesByProvince('Metro Manila');

// Search cities
const matchingCities = searchCities('maka'); // Returns Makati, etc.

// Search barangays within a city
const matchingBarangays = searchBarangays('Quezon City', 'project');
```

## API Reference

### PhilippineLocationPicker Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onCityChange` | `(city: City \| null) => void` | - | Callback when city selection changes |
| `onBarangayChange` | `(barangay: Barangay \| null, city: City \| null) => void` | - | Callback when barangay selection changes |
| `onLocationChange` | `(location: { city: City \| null; barangay: Barangay \| null }) => void` | - | Callback when either selection changes |
| `initialCity` | `string` | - | Initial city name |
| `initialBarangay` | `string` | - | Initial barangay name |
| `cityPlaceholder` | `string` | `'Select City'` | Placeholder for city dropdown |
| `barangayPlaceholder` | `string` | `'Select Barangay'` | Placeholder for barangay dropdown |
| `citySearchPlaceholder` | `string` | `'Search city...'` | Search placeholder for city dropdown |
| `barangaySearchPlaceholder` | `string` | `'Search barangay...'` | Search placeholder for barangay dropdown |
| `cityModalTitle` | `string` | `'Select City'` | Modal title for city dropdown |
| `barangayModalTitle` | `string` | `'Select Barangay'` | Modal title for barangay dropdown |
| `searchable` | `boolean` | `true` | Enable search functionality |
| `disabled` | `boolean` | `false` | Disable both dropdowns |
| `containerStyle` | `ViewStyle` | - | Container style |
| `dropdownStyles` | `DropdownStyles` | - | Custom dropdown styles |
| `labelStyle` | `TextStyle` | - | Label text style |
| `showLabels` | `boolean` | `true` | Show labels above dropdowns |
| `cityLabel` | `string` | `'City'` | Label text for city dropdown |
| `barangayLabel` | `string` | `'Barangay'` | Label text for barangay dropdown |
| `testID` | `string` | - | Test ID for testing |

### Dropdown Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `DropdownItem[]` | `[]` | Array of items to display |
| `selectedValue` | `string \| null` | `null` | Currently selected value |
| `onValueChange` | `(value: string \| null, item: DropdownItem \| null) => void` | - | Callback when selection changes |
| `placeholder` | `string` | `'Select an option'` | Placeholder text |
| `disabled` | `boolean` | `false` | Disable the dropdown |
| `searchable` | `boolean` | `true` | Enable search functionality |
| `searchPlaceholder` | `string` | `'Search...'` | Search input placeholder |
| `modalTitle` | `string` | `'Select Option'` | Modal header title |
| `styles` | `DropdownStyles` | - | Custom styles |
| `testID` | `string` | - | Test ID for testing |

### usePhilippineLocation Hook

```tsx
const {
  selectedCity,      // Currently selected city (City | null)
  selectedBarangay,  // Currently selected barangay (Barangay | null)
  cities,           // All available cities (City[])
  barangays,        // Barangays for selected city (Barangay[])
  setCity,          // Function to set city by name
  setBarangay,      // Function to set barangay by name
  reset,            // Function to reset both selections
  getCityByName,    // Function to get city by name
  getBarangayByName // Function to get barangay by city and barangay name
} = usePhilippineLocation({
  initialCity: 'Manila',
  initialBarangay: 'Ermita',
  onCityChange: (city) => {},
  onBarangayChange: (barangay, city) => {},
});
```

### Types

```typescript
interface City {
  name: string;
  code?: string;
  province: string;
  region: string;
  barangays: Barangay[];
}

interface Barangay {
  name: string;
  code?: string;
}

interface DropdownItem {
  label: string;
  value: string;
}

interface DropdownStyles {
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
```

## Included Cities

The package includes major Philippine cities and their barangays:

**Metro Manila:**
- Manila, Quezon City, Makati, Taguig, Pasig, Parañaque, Pasay, Mandaluyong, Marikina, San Juan, Caloocan, Las Piñas, Muntinlupa, Navotas, Malabon, Valenzuela, Pateros

**Major Provincial Cities:**
- Cebu City, Davao City, Baguio, Iloilo City, Zamboanga City, Cagayan de Oro, General Santos, Angeles, Antipolo, Batangas City

## Customization Example

```tsx
import { PhilippineLocationPicker } from 'react-native-philippines-cities-barangays';

<PhilippineLocationPicker
  onLocationChange={handleLocationChange}
  cityLabel="Municipality/City"
  barangayLabel="Barangay"
  cityPlaceholder="Choose your city..."
  barangayPlaceholder="Choose your barangay..."
  containerStyle={{ paddingHorizontal: 16 }}
  labelStyle={{ color: '#333', fontWeight: 'bold' }}
  dropdownStyles={{
    button: {
      borderColor: '#007AFF',
      borderRadius: 12,
    },
    buttonText: {
      color: '#007AFF',
    },
    selectedItem: {
      backgroundColor: '#e3f2fd',
    },
  }}
/>
```

## Contributing

Contributions are welcome! If you'd like to add more cities or barangays, please submit a pull request.

## License

MIT
