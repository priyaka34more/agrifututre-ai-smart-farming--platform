/**
 * Data Validation Service for AgriFuture AI
 * Provides comprehensive input validation and sanitization
 */

class ValidationService {
  constructor() {
    this.validationRules = {
      city: {
        required: true,
        minLength: 2,
        maxLength: 50,
        pattern: /^[a-zA-Z\s\-']+$/,
        message: 'Please enter a valid city name (2-50 characters)'
      },
      crop: {
        required: true,
        allowedValues: ['wheat', 'rice', 'cotton', 'soybean', 'maize', 'sugarcane', 'pulses', 'vegetables'],
        message: 'Please select a valid crop type'
      },
      quantity: {
        required: true,
        min: 0.1,
        max: 10000,
        type: 'number',
        message: 'Quantity must be between 0.1 and 10,000'
      },
      question: {
        required: true,
        minLength: 5,
        maxLength: 500,
        message: 'Question must be between 5 and 500 characters'
      },
      phone: {
        required: false,
        pattern: /^[+]?[1-9]\d{9,14}$/,
        message: 'Please enter a valid phone number'
      },
      email: {
        required: false,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Please enter a valid email address'
      }
    };
  }

  /**
   * Trim and sanitize string input
   */
  sanitizeString(input) {
    if (typeof input !== 'string') return '';
    return input.trim().replace(/\s+/g, ' ');
  }

  /**
   * Validate a single field
   */
  validateField(fieldName, value, customRules = null) {
    const rules = customRules || this.validationRules[fieldName];
    
    if (!rules) {
      return { isValid: true, message: '' };
    }

    // Sanitize input
    if (typeof value === 'string') {
      value = this.sanitizeString(value);
    }

    // Required validation
    if (rules.required && (!value || value === '')) {
      return { isValid: false, message: `${fieldName} is required` };
    }

    // Skip other validations if field is not required and empty
    if (!rules.required && (!value || value === '')) {
      return { isValid: true, message: '', sanitizedValue: value };
    }

    // Type validation
    if (rules.type === 'number') {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        return { isValid: false, message: `${fieldName} must be a number` };
      }
      value = numValue;
    }

    // Length validation
    if (rules.minLength && value.length < rules.minLength) {
      return { isValid: false, message: rules.message };
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      return { isValid: false, message: rules.message };
    }

    // Range validation for numbers
    if (rules.min !== undefined && value < rules.min) {
      return { isValid: false, message: rules.message };
    }

    if (rules.max !== undefined && value > rules.max) {
      return { isValid: false, message: rules.message };
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(value)) {
      return { isValid: false, message: rules.message };
    }

    // Allowed values validation
    if (rules.allowedValues && !rules.allowedValues.includes(value.toLowerCase())) {
      return { isValid: false, message: rules.message };
    }

    return { isValid: true, message: '', sanitizedValue: value };
  }

  /**
   * Validate multiple fields
   */
  validateForm(formData, fieldRules = null) {
    const errors = {};
    const sanitizedData = {};
    let isValid = true;

    for (const [fieldName, value] of Object.entries(formData)) {
      const validation = this.validateField(fieldName, value, fieldRules?.[fieldName]);
      
      if (!validation.isValid) {
        errors[fieldName] = validation.message;
        isValid = false;
      }
      
      sanitizedData[fieldName] = validation.sanitizedValue || value;
    }

    return {
      isValid,
      errors,
      sanitizedData
    };
  }

  /**
   * Validate weather search input
   */
  validateWeatherInput(city) {
    const validation = this.validateField('city', city);
    
    if (!validation.isValid) {
      return validation;
    }

    // Additional weather-specific validation
    const sanitizedCity = validation.sanitizedValue;
    
    // Check for common invalid inputs
    const invalidInputs = ['123', 'test', 'abc', 'xxx', 'null', 'undefined'];
    if (invalidInputs.includes(sanitizedCity.toLowerCase())) {
      return {
        isValid: false,
        message: 'Please enter a real city name'
      };
    }

    return {
      isValid: true,
      message: '',
      sanitizedValue: sanitizedCity
    };
  }

  /**
   * Validate market prediction input
   */
  validateMarketInput(crop) {
    const validation = this.validateField('crop', crop.toLowerCase());
    
    if (!validation.isValid) {
      return validation;
    }

    return {
      isValid: true,
      message: '',
      sanitizedValue: validation.sanitizedValue
    };
  }

  /**
   * Validate chat question input
   */
  validateChatQuestion(question) {
    const validation = this.validateField('question', question);
    
    if (!validation.isValid) {
      return validation;
    }

    // Additional chat-specific validation
    const sanitizedQuestion = validation.sanitizedValue;
    
    // Check for spam or inappropriate content
    const spamPatterns = [
      /^(.)\1{10,}$/,  // Repeated characters
      /^[0-9\s]+$/,   // Only numbers
      /^(.)\1\1\1\1\1\1\1\1\1$/ // Same character repeated
    ];

    for (const pattern of spamPatterns) {
      if (pattern.test(sanitizedQuestion)) {
        return {
          isValid: false,
          message: 'Please enter a meaningful question'
        };
      }
    }

    return {
      isValid: true,
      message: '',
      sanitizedValue: sanitizedQuestion
    };
  }

  /**
   * Validate image file before upload
   */
  validateImageFile(file) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

    if (!file) {
      return { isValid: false, message: 'Please select an image' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, message: 'Please select a valid image file (JPEG, PNG, or WebP)' };
    }

    if (file.size > maxSize) {
      return { isValid: false, message: 'Image size must be less than 10MB' };
    }

    return { isValid: true, message: '' };
  }

  /**
   * Real-time validation helper
   */
  validateOnInput(fieldName, value, customRules = null) {
    const validation = this.validateField(fieldName, value, customRules);
    
    return {
      ...validation,
      shouldShowError: !validation.isValid && value.length > 0
    };
  }
}

// Export singleton instance
const validationService = new ValidationService();
export default validationService;
