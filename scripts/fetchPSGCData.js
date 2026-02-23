#!/usr/bin/env node

/**
 * =============================================================================
 * PSGC Data Fetcher Script
 * =============================================================================
 *
 * This script fetches the latest Philippine Standard Geographic Code (PSGC)
 * data from the official PSGC API and generates a TypeScript data file for
 * use in the react-native-philippines-cities-barangays package.
 *
 * @description
 * The Philippine Standard Geographic Code (PSGC) is a systematic classification
 * and coding of geographic areas in the Philippines maintained by the Philippine
 * Statistics Authority (PSA).
 *
 * @source https://psgc.gitlab.io/api/
 * @data_provider Philippine Statistics Authority (PSA)
 *
 * =============================================================================
 * USAGE
 * =============================================================================
 *
 * Run this script to update the Philippine geographic data:
 *
 *   node scripts/fetchPSGCData.js
 *
 * After running, rebuild the TypeScript:
 *
 *   npm run build
 *
 * =============================================================================
 * DATA STRUCTURE
 * =============================================================================
 *
 * The script fetches and transforms the following data:
 *
 * 1. REGIONS (17 total)
 *    - National Capital Region (NCR)
 *    - Cordillera Administrative Region (CAR)
 *    - Regions I through XIII
 *    - BARMM (Bangsamoro Autonomous Region in Muslim Mindanao)
 *
 * 2. PROVINCES (81 total)
 *    - Each province belongs to a region
 *
 * 3. CITIES/MUNICIPALITIES (1,634 total)
 *    - Each city/municipality belongs to a province and region
 *    - Includes both cities and municipalities
 *
 * 4. BARANGAYS (42,046 total)
 *    - Each barangay belongs to a city/municipality
 *    - Smallest administrative division in the Philippines
 *
 * =============================================================================
 * API ENDPOINTS USED
 * =============================================================================
 *
 * Base URL: https://psgc.gitlab.io/api
 *
 * - /regions.json                          - List of all regions
 * - /provinces.json                        - List of all provinces
 * - /cities-municipalities.json            - List of all cities and municipalities
 * - /regions/{regionCode}/barangays.json   - Barangays per region
 *
 * Barangays are fetched per region to avoid memory issues with the large
 * combined barangays endpoint (~42,000 entries).
 *
 * =============================================================================
 * OUTPUT
 * =============================================================================
 *
 * Generates: src/data/philippineData.ts
 *
 * The output file contains:
 * - `regions`: Array of Region objects with name and code
 * - `cities`: Array of City objects with name, code, province, region, and barangays
 * - Helper functions: getCities, getCityByName, getBarangaysByCity, etc.
 *
 * =============================================================================
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

/**
 * Base URL for the PSGC API
 * @constant {string}
 */
const PSGC_BASE_URL = 'https://psgc.gitlab.io/api';

/**
 * Maps PSGC region codes to human-readable region codes
 * Used to maintain backward compatibility with existing data format
 *
 * @constant {Object.<string, string>}
 */
const REGION_CODE_MAP = {
  '010000000': 'Region I',      // Ilocos Region
  '020000000': 'Region II',     // Cagayan Valley
  '030000000': 'Region III',    // Central Luzon
  '040000000': 'Region IV-A',   // CALABARZON
  '170000000': 'Region IV-B',   // MIMAROPA
  '050000000': 'Region V',      // Bicol Region
  '060000000': 'Region VI',     // Western Visayas
  '070000000': 'Region VII',    // Central Visayas
  '080000000': 'Region VIII',   // Eastern Visayas
  '090000000': 'Region IX',     // Zamboanga Peninsula
  '100000000': 'Region X',      // Northern Mindanao
  '110000000': 'Region XI',     // Davao Region
  '120000000': 'Region XII',    // SOCCSKSARGEN
  '130000000': 'NCR',           // National Capital Region
  '140000000': 'CAR',           // Cordillera Administrative Region
  '150000000': 'BARMM',         // Bangsamoro Autonomous Region in Muslim Mindanao
  '160000000': 'Region XIII',   // Caraga
};

/**
 * Fetches JSON data from a URL using HTTPS
 *
 * @param {string} url - The URL to fetch
 * @returns {Promise<Object>} Parsed JSON data
 * @throws {Error} If the request fails or JSON parsing fails
 */
function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    console.log(`Fetching: ${url}`);
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse JSON from ${url}: ${e.message}`));
        }
      });
    }).on('error', reject);
  });
}

/**
 * Fetches all geographic data from the PSGC API
 *
 * This function:
 * 1. Fetches all regions
 * 2. Fetches all provinces
 * 3. Fetches all cities/municipalities
 * 4. Fetches barangays per region (to avoid memory issues)
 *
 * @returns {Promise<Object>} Object containing regions, provinces, citiesMunicipalities, and barangays
 */
async function fetchAllData() {
  console.log('Fetching regions...');
  const regions = await fetchJSON(`${PSGC_BASE_URL}/regions.json`);

  console.log('Fetching provinces...');
  const provinces = await fetchJSON(`${PSGC_BASE_URL}/provinces.json`);

  console.log('Fetching cities and municipalities...');
  const citiesMunicipalities = await fetchJSON(`${PSGC_BASE_URL}/cities-municipalities.json`);

  // Fetch barangays per region to avoid memory issues with the large dataset
  const allBarangays = [];
  for (const region of regions) {
    console.log(`Fetching barangays for ${region.name}...`);
    try {
      const regionBarangays = await fetchJSON(`${PSGC_BASE_URL}/regions/${region.code}/barangays.json`);
      allBarangays.push(...regionBarangays);
    } catch (e) {
      console.error(`Failed to fetch barangays for ${region.name}: ${e.message}`);
    }
  }

  return { regions, provinces, citiesMunicipalities, barangays: allBarangays };
}

/**
 * Transforms raw PSGC data into the format expected by the package
 *
 * This function:
 * 1. Creates lookup maps for provinces and regions
 * 2. Groups barangays by their parent city/municipality
 * 3. Transforms data to match the package's type definitions
 * 4. Sorts cities and barangays alphabetically
 *
 * @param {Object} data - Raw data from fetchAllData()
 * @param {Array} data.regions - Array of region objects
 * @param {Array} data.provinces - Array of province objects
 * @param {Array} data.citiesMunicipalities - Array of city/municipality objects
 * @param {Array} data.barangays - Array of barangay objects
 * @returns {Object} Transformed data with regions, provinces, and cities arrays
 */
function transformData({ regions, provinces, citiesMunicipalities, barangays }) {
  console.log('\nTransforming data...');
  console.log(`Total regions: ${regions.length}`);
  console.log(`Total provinces: ${provinces.length}`);
  console.log(`Total cities/municipalities: ${citiesMunicipalities.length}`);
  console.log(`Total barangays: ${barangays.length}`);

  // Create lookup maps for efficient data joining
  const provinceMap = new Map();
  provinces.forEach(p => {
    provinceMap.set(p.code, p);
  });

  const regionMap = new Map();
  regions.forEach(r => {
    regionMap.set(r.code, r);
  });

  // Group barangays by city/municipality code
  // PSGC uses 'cityCode' for cities and 'municipalityCode' for municipalities
  const barangaysByCity = new Map();
  barangays.forEach(b => {
    const cityCode = b.cityCode || b.municipalityCode;
    if (cityCode && cityCode !== false) {
      if (!barangaysByCity.has(cityCode)) {
        barangaysByCity.set(cityCode, []);
      }
      barangaysByCity.get(cityCode).push({
        name: b.name,
        code: b.code,
      });
    }
  });

  console.log(`Barangays grouped into ${barangaysByCity.size} cities/municipalities`);

  // Transform regions to match package format
  const transformedRegions = regions.map(r => ({
    name: r.name,
    code: REGION_CODE_MAP[r.code] || r.code,
  }));

  // Transform provinces to match package format
  const transformedProvinces = provinces.map(p => {
    const region = regionMap.get(p.regionCode);
    return {
      name: p.name,
      code: p.code,
      region: REGION_CODE_MAP[p.regionCode] || (region ? region.name : p.regionCode),
    };
  });

  // Transform cities with their barangays
  const transformedCities = citiesMunicipalities.map(c => {
    const province = provinceMap.get(c.provinceCode);
    const region = regionMap.get(c.regionCode);
    const cityBarangays = barangaysByCity.get(c.code) || [];

    // Sort barangays alphabetically for easier lookup
    cityBarangays.sort((a, b) => a.name.localeCompare(b.name));

    return {
      name: c.name,
      code: c.code,
      province: province ? province.name : (c.provinceCode || 'Metro Manila'),
      region: REGION_CODE_MAP[c.regionCode] || (region ? region.name : c.regionCode),
      barangays: cityBarangays,
    };
  });

  // Sort cities alphabetically for easier lookup
  transformedCities.sort((a, b) => a.name.localeCompare(b.name));

  return {
    regions: transformedRegions,
    provinces: transformedProvinces,
    cities: transformedCities,
  };
}

/**
 * Escapes special characters for TypeScript string literals
 *
 * Handles:
 * - Backslashes (\ -> \\)
 * - Single quotes (' -> \')
 *
 * @param {string} str - The string to escape
 * @returns {string} Escaped string safe for TypeScript single-quoted literals
 */
function escapeForTypeScript(str) {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

/**
 * Generates the TypeScript file content from transformed data
 *
 * This function:
 * 1. Serializes data to TypeScript-compatible format with single quotes
 * 2. Properly escapes special characters in strings (e.g., "Brooke's Point")
 * 3. Generates helper functions for data access
 *
 * @param {Object} data - Transformed data from transformData()
 * @param {Array} data.regions - Array of region objects
 * @param {Array} data.provinces - Array of province objects
 * @param {Array} data.cities - Array of city objects with barangays
 * @returns {string} Complete TypeScript file content
 */
function generateTypeScriptFile({ regions, provinces, cities }) {
  console.log('\nGenerating TypeScript file...');

  /**
   * Custom serializer that converts JavaScript values to TypeScript code
   * Handles nested objects and arrays with proper indentation
   *
   * @param {*} value - Value to serialize
   * @param {number} indent - Current indentation level
   * @returns {string} TypeScript code representation
   */
  const serializeValue = (value, indent = 0) => {
    const spaces = '  '.repeat(indent);

    if (value === null) return 'null';
    if (typeof value === 'boolean') return value.toString();
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'string') return `'${escapeForTypeScript(value)}'`;

    if (Array.isArray(value)) {
      if (value.length === 0) return '[]';
      const items = value.map(item => serializeValue(item, indent + 1));
      return `[\n${spaces}  ${items.join(`,\n${spaces}  `)}\n${spaces}]`;
    }

    if (typeof value === 'object') {
      const entries = Object.entries(value)
        .map(([k, v]) => `${k}: ${serializeValue(v, indent + 1)}`);
      return `{\n${spaces}  ${entries.join(`,\n${spaces}  `)}\n${spaces}}`;
    }

    return String(value);
  };

  const regionsStr = `[\n  ${regions.map(r => serializeValue(r, 1)).join(',\n  ')}\n]`;
  const citiesStr = `[\n  ${cities.map(c => serializeValue(c, 1)).join(',\n  ')}\n]`;

  const content = `// Auto-generated from PSGC (Philippine Standard Geographic Code) API
// Source: https://psgc.gitlab.io/api/
// Data from: Philippine Statistics Authority (PSA)
// Generated on: ${new Date().toISOString().split('T')[0]}

import { City, Region, Province } from '../types';

export const regions: Region[] = ${regionsStr};

export const cities: City[] = ${citiesStr};

// Helper functions
export const getCities = (): City[] => cities;

export const getCityByName = (name: string): City | undefined => {
  return cities.find(
    (city) => city.name.toLowerCase() === name.toLowerCase()
  );
};

export const getBarangaysByCity = (cityName: string): { name: string; code?: string }[] => {
  const city = getCityByName(cityName);
  return city ? city.barangays : [];
};

export const getCitiesByProvince = (province: string): City[] => {
  return cities.filter(
    (city) => city.province.toLowerCase() === province.toLowerCase()
  );
};

export const getCitiesByRegion = (region: string): City[] => {
  return cities.filter(
    (city) => city.region.toLowerCase() === region.toLowerCase()
  );
};

export const searchCities = (query: string): City[] => {
  const lowerQuery = query.toLowerCase();
  return cities.filter((city) =>
    city.name.toLowerCase().includes(lowerQuery)
  );
};

export const searchBarangays = (
  cityName: string,
  query: string
): { name: string; code?: string }[] => {
  const barangays = getBarangaysByCity(cityName);
  const lowerQuery = query.toLowerCase();
  return barangays.filter((barangay) =>
    barangay.name.toLowerCase().includes(lowerQuery)
  );
};
`;

  return content;
}

/**
 * Main entry point
 *
 * Orchestrates the data fetching, transformation, and file generation process.
 * Outputs progress information and final statistics to the console.
 *
 * @returns {Promise<void>}
 */
async function main() {
  try {
    console.log('='.repeat(60));
    console.log('PSGC Data Fetcher - Philippine Standard Geographic Code');
    console.log('='.repeat(60));
    console.log('');

    // Step 1: Fetch all data from PSGC API
    const rawData = await fetchAllData();

    // Step 2: Transform data to package format
    const transformedData = transformData(rawData);

    // Step 3: Generate TypeScript file content
    const tsContent = generateTypeScriptFile(transformedData);

    // Step 4: Write to output file
    const outputPath = path.join(__dirname, '..', 'src', 'data', 'philippineData.ts');
    fs.writeFileSync(outputPath, tsContent, 'utf8');

    // Output success message with statistics
    console.log('\n' + '='.repeat(60));
    console.log('SUCCESS!');
    console.log('='.repeat(60));
    console.log(`Output file: ${outputPath}`);
    console.log(`Total regions: ${transformedData.regions.length}`);
    console.log(`Total cities/municipalities: ${transformedData.cities.length}`);
    console.log(`Total barangays: ${rawData.barangays.length}`);
    console.log('');
    console.log('Run "npm run build" to compile the TypeScript files.');

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Execute the script
main();
