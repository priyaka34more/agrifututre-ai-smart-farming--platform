/**
 * Input validation utilities
 */

// Image validation with performance optimization
export const validateImage = (file) => {
  const maxSize = 20 * 1024 * 1024; // 20MB for better user experience
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const minWidth = 100;
  const minHeight = 100;
  
  return new Promise((resolve) => {
    // Quick synchronous checks first
    if (file.size > maxSize) {
      resolve({
        valid: false,
        error: 'Image size must be less than 20MB'
      });
      return;
    }
    
    if (!allowedTypes.includes(file.type)) {
      resolve({
        valid: false,
        error: 'Only JPG, PNG, and WebP images are allowed'
      });
      return;
    }
    
    // Check image dimensions with timeout
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    let timeoutId;
    
    const cleanup = () => {
      if (timeoutId) clearTimeout(timeoutId);
      URL.revokeObjectURL(objectUrl);
    };
    
    img.onload = () => {
      cleanup();
      if (img.width < minWidth || img.height < minHeight) {
        resolve({
          valid: false,
          error: `Image must be at least ${minWidth}x${minHeight} pixels`
        });
      } else {
        resolve({ valid: true });
      }
    };
    
    img.onerror = () => {
      cleanup();
      resolve({
        valid: false,
        error: 'Invalid image file'
      });
    };
    
    // Add timeout to prevent hanging
    timeoutId = setTimeout(() => {
      cleanup();
      resolve({
        valid: false,
        error: 'Image validation timed out'
      });
    }, 5000); // 5 seconds timeout
    
    img.src = objectUrl;
  });
};

// Form validation with performance optimization
export const validateYieldForm = (data) => {
  const errors = {};
  
  // Early return for missing required fields
  if (!data.crop_type) {
    errors.crop_type = 'Please select a crop type';
  }
  
  if (!data.soil_type) {
    errors.soil_type = 'Please select soil type';
  }
  
  // Numeric validations with proper type checking
  const landArea = parseFloat(data.land_area_acre);
  if (isNaN(landArea) || landArea <= 0) {
    errors.land_area_acre = 'Land area must be greater than 0';
  } else if (landArea > 1000) {
    errors.land_area_acre = 'Land area seems too large (max 1000 acres)';
  }
  
  const rainfall = parseFloat(data.rainfall_mm);
  if (isNaN(rainfall) || rainfall < 0) {
    errors.rainfall_mm = 'Rainfall must be 0 or greater';
  } else if (rainfall > 3000) {
    errors.rainfall_mm = 'Rainfall seems too high (max 3000mm)';
  }
  
  const temperature = parseFloat(data.temperature_c);
  if (isNaN(temperature) || temperature < -50 || temperature > 60) {
    errors.temperature_c = 'Temperature must be between -50°C and 60°C';
  }
  
  const fertilizerBudget = parseFloat(data.fertilizer_budget);
  if (isNaN(fertilizerBudget) || fertilizerBudget < 0) {
    errors.fertilizer_budget = 'Fertilizer budget must be 0 or greater';
  } else if (fertilizerBudget > 100000) {
    errors.fertilizer_budget = 'Fertilizer budget seems too high (max ₹100,000)';
  }
  
  const marketPrice = parseFloat(data.market_price_per_kg);
  if (isNaN(marketPrice) || marketPrice <= 0) {
    errors.market_price_per_kg = 'Market price must be greater than 0';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Email validation with better regex
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
};

// Phone validation (India) with better handling
export const validatePhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  const cleanPhone = phone.replace(/\D/g, '');
  const re = /^[6-9]\d{9}$/;
  return re.test(cleanPhone);
};

// Password validation
export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return {
      isValid: false,
      errors: ['Password is required']
    };
  }
  
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Address validation
export const validateAddress = (address) => {
  if (!address || typeof address !== 'string') {
    return {
      isValid: false,
      error: 'Address is required'
    };
  }
  
  const trimmed = address.trim();
  if (trimmed.length < 10) {
    return {
      isValid: false,
      error: 'Address must be at least 10 characters long'
    };
  }
  
  if (trimmed.length > 200) {
    return {
      isValid: false,
      error: 'Address must be less than 200 characters'
    };
  }
  
  return {
    isValid: true
  };
};

// Crop type validation
export const validateCropType = (cropType) => {
  const validCrops = [
    'wheat', 'rice', 'cotton', 'sugarcane', 'maize', 'pulses',
    'vegetables', 'fruits', 'spices', 'oilseeds', 'other'
  ];
  
  return validCrops.includes(cropType?.toLowerCase());
};

// Soil type validation
export const validateSoilType = (soilType) => {
  const validSoils = [
    'clay', 'loamy', 'sandy', 'silt', 'peat', 'chalk', 'other'
  ];
  
  return validSoils.includes(soilType?.toLowerCase());
};

// Batch validation for multiple fields
export const validateBatch = (validations) => {
  const errors = {};
  
  Object.entries(validations).forEach(([field, validator]) => {
    const result = validator();
    if (!result.isValid) {
      errors[field] = result.error || result.errors;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Required field validation
export const validateRequired = (value, fieldName) => {
  if (!value || value.toString().trim() === '') {
    return `${fieldName} is required`;
  }
  return null;
};

// Number range validation
export const validateRange = (value, min, max, fieldName) => {
  const num = parseFloat(value);
  if (isNaN(num)) {
    return `${fieldName} must be a number`;
  }
  if (num < min || num > max) {
    return `${fieldName} must be between ${min} and ${max}`;
  }
  return null;
};

// Sanitize input
export const sanitizeInput = (input) => {
  return input.toString()
    .trim()
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript protocol
    .substring(0, 1000); // Limit length
};

// Real-time validation feedback
export const createValidationRules = {
  land_area: {
    required: true,
    min: 0.1,
    max: 1000,
    message: 'Land area (acres)'
  },
  rainfall: {
    required: true,
    min: 0,
    max: 3000,
    message: 'Annual rainfall (mm)'
  },
  temperature: {
    required: true,
    min: -50,
    max: 60,
    message: 'Average temperature (°C)'
  },
  fertilizer_budget: {
    required: true,
    min: 0,
    max: 100000,
    message: 'Fertilizer budget (₹)'
  },
  market_price: {
    required: true,
    min: 0.1,
    max: 10000,
    message: 'Market price (₹/kg)'
  }
};

// Validate form field in real-time
export const validateField = (name, value) => {
  const rule = createValidationRules[name];
  if (!rule) return null;
  
  // Required check
  if (rule.required && (!value || value.toString().trim() === '')) {
    return `${rule.message} is required`;
  }
  
  // Convert to number for numeric fields
  const numValue = parseFloat(value);
  
  // Range check
  if (rule.min !== undefined && numValue < rule.min) {
    return `${rule.message} must be at least ${rule.min}`;
  }
  
  if (rule.max !== undefined && numValue > rule.max) {
    return `${rule.message} must not exceed ${rule.max}`;
  }
  
  return null;
};
