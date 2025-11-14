/**
 * Transform data object to return localized fields based on language
 * @param {Object} data - The data object to transform
 * @param {string} lang - Language code ('vi' or 'en')
 * @returns {Object} - Transformed data with localized fields
 */
export function localizeData(data, lang = 'en') {
  if (!data || typeof data !== 'object') {
    return data;
  }

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => localizeData(item, lang));
  }

  // Handle null or undefined
  if (data === null || data === undefined) {
    return data;
  }

  // Create a new object to avoid mutating the original
  const transformed = { ...data };

  // Transform fields that have vi/en structure
  const localizedFields = ['title', 'content', 'description', 'name', 'question', 'explanation'];
  
  for (const field of localizedFields) {
    if (transformed[field]) {
      // If field is already a string (old format), keep it as is
      if (typeof transformed[field] === 'string') {
        continue;
      }
      
      // If field has vi/en structure, extract the appropriate language
      if (typeof transformed[field] === 'object' && !Array.isArray(transformed[field])) {
        if (transformed[field][lang] !== undefined) {
          transformed[field] = transformed[field][lang];
        } else if (transformed[field].en !== undefined) {
          transformed[field] = transformed[field].en;
        } else if (transformed[field].vi !== undefined) {
          transformed[field] = transformed[field].vi;
        }
      }
    }
  }

  // Handle options array in quiz questions
  if (transformed.options) {
    if (Array.isArray(transformed.options)) {
      transformed.options = transformed.options.map(option => {
        // If option is already a string, keep it as is
        if (typeof option === 'string') {
          return option;
        }
        
        // Handle {vi: "...", en: "..."} format
        if (option && typeof option === 'object' && !Array.isArray(option)) {
          if (option[lang] !== undefined && option[lang] !== null) {
            return String(option[lang]);
          } else if (option.en !== undefined && option.en !== null) {
            return String(option.en);
          } else if (option.vi !== undefined && option.vi !== null) {
            return String(option.vi);
          }
        }
        
        // Fallback: convert to string
        return String(option);
      });
    } else if (typeof transformed.options === 'object') {
      // Handle case where options might be an object with numeric keys (Mongoose quirk)
      const optionsArray = [];
      const keys = Object.keys(transformed.options)
        .filter(k => !isNaN(Number(k)) && k !== '_id' && k !== '__v')
        .map(Number)
        .sort((a, b) => a - b);
      
      for (const key of keys) {
        const option = transformed.options[key];
        if (typeof option === 'string') {
          optionsArray.push(option);
        } else if (option && typeof option === 'object') {
          if (option[lang] !== undefined && option[lang] !== null) {
            optionsArray.push(String(option[lang]));
          } else if (option.en !== undefined && option.en !== null) {
            optionsArray.push(String(option.en));
          } else if (option.vi !== undefined && option.vi !== null) {
            optionsArray.push(String(option.vi));
          } else {
            optionsArray.push(String(option));
          }
        } else {
          optionsArray.push(String(option));
        }
      }
      transformed.options = optionsArray;
    }
  }

  // Handle nested objects (like codeExercise.description)
  if (transformed.codeExercise && transformed.codeExercise.description) {
    if (typeof transformed.codeExercise.description === 'string') {
      // Keep as is
    } else if (typeof transformed.codeExercise.description === 'object' && !Array.isArray(transformed.codeExercise.description)) {
      if (transformed.codeExercise.description[lang] !== undefined) {
        transformed.codeExercise.description = transformed.codeExercise.description[lang];
      } else if (transformed.codeExercise.description.en !== undefined) {
        transformed.codeExercise.description = transformed.codeExercise.description.en;
      } else if (transformed.codeExercise.description.vi !== undefined) {
        transformed.codeExercise.description = transformed.codeExercise.description.vi;
      }
    }
  }

  // Recursively transform nested objects (but skip already processed fields)
  for (const key in transformed) {
    // Skip options and localized fields as they're already processed
    if (key === 'options' || localizedFields.includes(key)) {
      continue;
    }
    
    if (transformed[key] && typeof transformed[key] === 'object' && !Array.isArray(transformed[key])) {
      // Skip if it's a mongoose document metadata
      if (key !== '_id' && key !== '__v') {
        transformed[key] = localizeData(transformed[key], lang);
      }
    } else if (Array.isArray(transformed[key])) {
      transformed[key] = transformed[key].map(item => 
        typeof item === 'object' && item !== null ? localizeData(item, lang) : item
      );
    }
  }

  return transformed;
}
