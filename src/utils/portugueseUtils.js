/**
 * Portuguese Real Estate Utilities
 * Contains functions specific to the Portuguese real estate market
 */

/**
 * Calculate IMT (Imposto Municipal sobre Transmissões Onerosas de Imóveis)
 * Property Transfer Tax in Portugal
 *
 * @param {Number} propertyValue - The value of the property in EUR
 * @param {String} propertyType - Type of property ('residential', 'commercial', 'land', 'secondary-home')
 * @param {String} location - Location type ('mainland', 'madeira', 'azores')
 * @returns {Object} IMT calculation results
 */
const calculateIMT = (propertyValue, propertyType = 'residential', location = 'mainland') => {
  if (!propertyValue || propertyValue <= 0) {
    return {
      imt: 0,
      rate: 0,
      details: 'Invalid property value'
    };
  }

  let imt = 0;
  let effectiveRate = 0;
  const islandReduction = location !== 'mainland' ? 0.8 : 1; // 20% reduction for islands

  // Primary Residence (Mainland rates - 2024)
  if (propertyType === 'residential') {
    if (propertyValue <= 97064) {
      // Exempt
      imt = 0;
      effectiveRate = 0;
    } else if (propertyValue <= 115038) {
      // 2% over €97,064
      imt = (propertyValue - 97064) * 0.02;
      effectiveRate = (imt / propertyValue) * 100;
    } else if (propertyValue <= 133495) {
      // Base + 5% over €115,038
      imt = (115038 - 97064) * 0.02 + (propertyValue - 115038) * 0.05;
      effectiveRate = (imt / propertyValue) * 100;
    } else if (propertyValue <= 176310) {
      // Base + 7% over €133,495
      imt = (115038 - 97064) * 0.02 +
             (133495 - 115038) * 0.05 +
             (propertyValue - 133495) * 0.07;
      effectiveRate = (imt / propertyValue) * 100;
    } else if (propertyValue <= 633453) {
      // Base + 8% over €176,310
      imt = (115038 - 97064) * 0.02 +
             (133495 - 115038) * 0.05 +
             (176310 - 133495) * 0.07 +
             (propertyValue - 176310) * 0.08;
      effectiveRate = (imt / propertyValue) * 100;
    } else {
      // 6% on total value (progressive rates don't apply above €633,453)
      imt = propertyValue * 0.06;
      effectiveRate = 6;
    }
  }

  // Secondary Home / Urban Property
  else if (propertyType === 'secondary-home') {
    if (propertyValue <= 97064) {
      imt = propertyValue * 0.01;
      effectiveRate = 1;
    } else if (propertyValue <= 115038) {
      imt = 97064 * 0.01 + (propertyValue - 97064) * 0.02;
      effectiveRate = (imt / propertyValue) * 100;
    } else if (propertyValue <= 133495) {
      imt = 97064 * 0.01 +
             (115038 - 97064) * 0.02 +
             (propertyValue - 115038) * 0.05;
      effectiveRate = (imt / propertyValue) * 100;
    } else if (propertyValue <= 176310) {
      imt = 97064 * 0.01 +
             (115038 - 97064) * 0.02 +
             (133495 - 115038) * 0.05 +
             (propertyValue - 133495) * 0.07;
      effectiveRate = (imt / propertyValue) * 100;
    } else if (propertyValue <= 633453) {
      imt = 97064 * 0.01 +
             (115038 - 97064) * 0.02 +
             (133495 - 115038) * 0.05 +
             (176310 - 133495) * 0.07 +
             (propertyValue - 176310) * 0.08;
      effectiveRate = (imt / propertyValue) * 100;
    } else {
      imt = propertyValue * 0.06;
      effectiveRate = 6;
    }
  }

  // Commercial Property or Land
  else if (propertyType === 'commercial' || propertyType === 'land') {
    // Flat rate of 6.5% for commercial properties
    imt = propertyValue * 0.065;
    effectiveRate = 6.5;
  }

  // Apply island reduction if applicable
  imt = imt * islandReduction;

  return {
    imt: Math.round(imt * 100) / 100, // Round to 2 decimals
    rate: Math.round(effectiveRate * 100) / 100,
    propertyValue,
    propertyType,
    location,
    islandReduction: location !== 'mainland' ? '20%' : 'N/A'
  };
};

/**
 * Portuguese Districts with their major cities
 */
const portugueseDistricts = {
  'Aveiro': {
    code: 'AVR',
    region: 'Centro',
    cities: ['Aveiro', 'Ovar', 'Águeda', 'Ílhavo', 'Oliveira de Azeméis']
  },
  'Beja': {
    code: 'BEJ',
    region: 'Alentejo',
    cities: ['Beja', 'Castro Verde', 'Serpa', 'Moura', 'Odemira']
  },
  'Braga': {
    code: 'BRG',
    region: 'Norte',
    cities: ['Braga', 'Guimarães', 'Barcelos', 'Famalicão', 'Esposende']
  },
  'Bragança': {
    code: 'BRN',
    region: 'Norte',
    cities: ['Bragança', 'Mirandela', 'Macedo de Cavaleiros', 'Miranda do Douro']
  },
  'Castelo Branco': {
    code: 'CBR',
    region: 'Centro',
    cities: ['Castelo Branco', 'Covilhã', 'Fundão', 'Belmonte']
  },
  'Coimbra': {
    code: 'CMB',
    region: 'Centro',
    cities: ['Coimbra', 'Figueira da Foz', 'Cantanhede', 'Lousã']
  },
  'Évora': {
    code: 'EVR',
    region: 'Alentejo',
    cities: ['Évora', 'Estremoz', 'Montemor-o-Novo', 'Vendas Novas']
  },
  'Faro': {
    code: 'FAR',
    region: 'Algarve',
    cities: ['Faro', 'Portimão', 'Loulé', 'Albufeira', 'Lagos', 'Tavira']
  },
  'Guarda': {
    code: 'GRD',
    region: 'Centro',
    cities: ['Guarda', 'Seia', 'Gouveia', 'Manteigas']
  },
  'Leiria': {
    code: 'LEI',
    region: 'Centro',
    cities: ['Leiria', 'Marinha Grande', 'Alcobaça', 'Nazaré', 'Caldas da Rainha']
  },
  'Lisboa': {
    code: 'LIS',
    region: 'Lisboa',
    cities: ['Lisboa', 'Sintra', 'Cascais', 'Loures', 'Oeiras', 'Amadora', 'Odivelas']
  },
  'Portalegre': {
    code: 'PTL',
    region: 'Alentejo',
    cities: ['Portalegre', 'Elvas', 'Ponte de Sor', 'Campo Maior']
  },
  'Porto': {
    code: 'PRT',
    region: 'Norte',
    cities: ['Porto', 'Vila Nova de Gaia', 'Matosinhos', 'Gondomar', 'Maia', 'Valongo']
  },
  'Santarém': {
    code: 'STR',
    region: 'Centro',
    cities: ['Santarém', 'Torres Novas', 'Entroncamento', 'Tomar', 'Almeirim']
  },
  'Setúbal': {
    code: 'STB',
    region: 'Lisboa',
    cities: ['Setúbal', 'Almada', 'Barreiro', 'Seixal', 'Sesimbra']
  },
  'Viana do Castelo': {
    code: 'VCT',
    region: 'Norte',
    cities: ['Viana do Castelo', 'Ponte de Lima', 'Caminha', 'Valença']
  },
  'Vila Real': {
    code: 'VRL',
    region: 'Norte',
    cities: ['Vila Real', 'Chaves', 'Peso da Régua', 'Lamego']
  },
  'Viseu': {
    code: 'VIS',
    region: 'Centro',
    cities: ['Viseu', 'Lamego', 'Tondela', 'São Pedro do Sul']
  },
  'Açores': {
    code: 'AZR',
    region: 'Açores',
    cities: ['Ponta Delgada', 'Angra do Heroísmo', 'Horta']
  },
  'Madeira': {
    code: 'MDR',
    region: 'Madeira',
    cities: ['Funchal', 'Câmara de Lobos', 'Machico', 'Santa Cruz']
  }
};

/**
 * Get district information by name
 * @param {String} districtName - Name of the district
 * @returns {Object} District information
 */
const getDistrictInfo = (districtName) => {
  return portugueseDistricts[districtName] || null;
};

/**
 * Get all districts
 * @returns {Array} Array of district names
 */
const getAllDistricts = () => {
  return Object.keys(portugueseDistricts);
};

/**
 * Get cities by district
 * @param {String} districtName - Name of the district
 * @returns {Array} Array of cities in the district
 */
const getCitiesByDistrict = (districtName) => {
  const district = portugueseDistricts[districtName];
  return district ? district.cities : [];
};

/**
 * Calculate Stamp Duty (Imposto do Selo)
 * Applied to property purchases with mortgages
 *
 * @param {Number} loanAmount - Mortgage loan amount
 * @returns {Number} Stamp duty amount
 */
const calculateStampDuty = (loanAmount) => {
  if (!loanAmount || loanAmount <= 0) {
    return 0;
  }
  // 0.6% of loan amount
  return Math.round(loanAmount * 0.006 * 100) / 100;
};

/**
 * Validate Portuguese ZIP code format
 * @param {String} zipCode - ZIP code to validate
 * @returns {Boolean} True if valid
 */
const validatePortugueseZipCode = (zipCode) => {
  const zipRegex = /^\d{4}-\d{3}$/;
  return zipRegex.test(zipCode);
};

/**
 * Format price in Portuguese currency format
 * @param {Number} amount - Amount to format
 * @returns {String} Formatted price string
 */
const formatPortuguesePrice = (amount) => {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};

/**
 * Convert square meters to square feet
 * @param {Number} squareMeters
 * @returns {Number} Square feet
 */
const squareMetersToFeet = (squareMeters) => {
  return Math.round(squareMeters * 10.764 * 100) / 100;
};

/**
 * Convert square feet to square meters
 * @param {Number} squareFeet
 * @returns {Number} Square meters
 */
const squareFeetToMeters = (squareFeet) => {
  return Math.round(squareFeet / 10.764 * 100) / 100;
};

module.exports = {
  calculateIMT,
  calculateStampDuty,
  portugueseDistricts,
  getDistrictInfo,
  getAllDistricts,
  getCitiesByDistrict,
  validatePortugueseZipCode,
  formatPortuguesePrice,
  squareMetersToFeet,
  squareFeetToMeters
};
