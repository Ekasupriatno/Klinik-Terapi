/**
 * Validates image file type and size
 * @param {File} file - The file to validate
 * @param {Object} options - Validation options
 * @returns {Object} - { valid: boolean, error: string }
 */
export const validateImage = (file, options = {}) => {
  const {
    maxSizeMB = 5,
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  } = options;

  // Check if file exists
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}` 
    };
  }

  // Check file size
  const fileSizeMB = file.size / (1024 * 1024);
  if (fileSizeMB > maxSizeMB) {
    return { 
      valid: false, 
      error: `File size exceeds ${maxSizeMB}MB limit. Current size: ${fileSizeMB.toFixed(2)}MB` 
    };
  }

  return { valid: true, error: null };
};

/**
 * Compresses an image file to reduce size while maintaining quality
 * @param {File} file - The image file to compress
 * @param {Object} options - Compression options
 * @returns {Promise<File>} - Compressed file
 */
export const compressImage = async (file, options = {}) => {
  const {
    maxSizeMB = 1,
    maxWidthOrHeight = 1920,
    useWebWorker = true,
    initialQuality = 0.8
  } = options;

  const compressionOptions = {
    maxSizeMB,
    maxWidthOrHeight,
    useWebWorker,
    initialQuality
  };

  try {
    const { default: imageCompression } = await import('browser-image-compression');
    const compressedFile = await imageCompression(file, compressionOptions);
    console.log(`Original size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
    console.log(`Compressed size: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
    console.log(`Compression ratio: ${((1 - compressedFile.size / file.size) * 100).toFixed(2)}%`);
    
    return compressedFile;
  } catch (error) {
    console.error('Error compressing image:', error);
    throw new Error('Failed to compress image. Please try a different file.');
  }
};

/**
 * Processes an image file with validation and compression
 * @param {File} file - The image file to process
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} - { file: File, originalSize: number, compressedSize: number }
 */
export const processImage = async (file, options = {}) => {
  const { maxInputSizeMB = 5 } = options;
  const validation = validateImage(file, {
    ...options,
    maxSizeMB: maxInputSizeMB,
  });
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Compress the image
  const compressedFile = await compressImage(file, options);

  return {
    file: compressedFile,
    originalSize: file.size,
    compressedSize: compressedFile.size,
    compressionRatio: ((1 - compressedFile.size / file.size) * 100).toFixed(2)
  };
};

/**
 * Reads a file as a data URL for preview
 * @param {File} file - The file to read
 * @returns {Promise<string>} - Data URL
 */
export const readFileAsDataURL = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
