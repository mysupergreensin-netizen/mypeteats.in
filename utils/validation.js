/**
 * Input validation and sanitization utilities
 */

/**
 * Validate and sanitize title
 */
export function validateTitle(title) {
  if (!title || typeof title !== 'string') {
    return { valid: false, error: 'Title is required and must be a string' };
  }
  
  const trimmed = title.trim();
  if (trimmed.length < 1) {
    return { valid: false, error: 'Title cannot be empty' };
  }
  if (trimmed.length > 200) {
    return { valid: false, error: 'Title must not exceed 200 characters' };
  }
  
  return { valid: true, value: trimmed };
}

/**
 * Validate and sanitize SKU
 */
export function validateSKU(sku) {
  if (!sku || typeof sku !== 'string') {
    return { valid: false, error: 'SKU is required and must be a string' };
  }
  
  const trimmed = sku.trim().toUpperCase();
  if (trimmed.length < 1) {
    return { valid: false, error: 'SKU cannot be empty' };
  }
  if (!/^[A-Z0-9-]+$/.test(trimmed)) {
    return { valid: false, error: 'SKU must contain only uppercase letters, numbers, and hyphens' };
  }
  
  return { valid: true, value: trimmed };
}

/**
 * Validate price in cents
 */
export function validatePrice(price) {
  if (price === undefined || price === null) {
    return { valid: false, error: 'Price is required' };
  }
  
  const num = Number(price);
  if (isNaN(num)) {
    return { valid: false, error: 'Price must be a number' };
  }
  
  if (!Number.isInteger(num)) {
    return { valid: false, error: 'Price must be an integer (cents)' };
  }
  
  if (num < 0) {
    return { valid: false, error: 'Price must be non-negative' };
  }
  
  if (num > 999999999) {
    return { valid: false, error: 'Price exceeds maximum allowed value' };
  }
  
  return { valid: true, value: num };
}

/**
 * Validate inventory count
 */
export function validateInventory(inventory) {
  if (inventory === undefined || inventory === null) {
    return { valid: true, value: 0 }; // Default to 0
  }
  
  const num = Number(inventory);
  if (isNaN(num)) {
    return { valid: false, error: 'Inventory must be a number' };
  }
  
  if (!Number.isInteger(num)) {
    return { valid: false, error: 'Inventory must be an integer' };
  }
  
  if (num < 0) {
    return { valid: false, error: 'Inventory cannot be negative' };
  }
  
  return { valid: true, value: num };
}

/**
 * Validate URL
 */
export function validateURL(url) {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URL must be a non-empty string' };
  }

  const trimmed = url.trim();

  // Allow relative paths (e.g., files served from /uploads)
  if (
    trimmed.startsWith('/') ||
    trimmed.startsWith('./') ||
    trimmed.startsWith('../')
  ) {
    return { valid: true, value: trimmed };
  }

  // Allow data URLs for uploaded image strings
  if (trimmed.startsWith('data:')) {
    // Basic safeguard: must look like an image data URI
    if (/^data:image\/(png|jpe?g|webp);base64,/i.test(trimmed)) {
      return { valid: true, value: trimmed };
    }
    return { valid: false, error: 'Invalid data URL format' };
  }

  // If protocol missing, assume https
  const normalized = /^(https?:)?\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const urlObj = new URL(normalized);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { valid: false, error: 'URL must use http or https protocol' };
    }
    return { valid: true, value: urlObj.toString() };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
}

/**
 * Validate array of URLs (for images)
 */
export function validateImageURLs(urls) {
  if (!Array.isArray(urls)) {
    return { valid: false, error: 'Images must be an array' };
  }
  
  const validated = [];
  for (const url of urls) {
    const result = validateURL(url);
    if (!result.valid) {
      return result;
    }
    validated.push(result.value);
  }
  
  return { valid: true, value: validated };
}

/**
 * Validate categories array
 */
export function validateCategories(categories) {
  if (!Array.isArray(categories)) {
    return { valid: false, error: 'Categories must be an array' };
  }
  
  const validated = [];
  for (const cat of categories) {
    if (typeof cat !== 'string') {
      return { valid: false, error: 'All categories must be strings' };
    }
    const trimmed = cat.trim();
    if (trimmed.length > 0) {
      validated.push(trimmed);
    }
  }
  
  return { valid: true, value: validated };
}

/**
 * Escape HTML to prevent XSS
 */
export function escapeHTML(str) {
  if (typeof str !== 'string') {
    return '';
  }
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  return str.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Sanitize description (escape HTML)
 */
export function sanitizeDescription(description) {
  if (!description || typeof description !== 'string') {
    return '';
  }
  
  if (description.length > 5000) {
    return description.substring(0, 5000);
  }
  
  // For now, just escape HTML. In future, could use a markdown parser
  return escapeHTML(description);
}

