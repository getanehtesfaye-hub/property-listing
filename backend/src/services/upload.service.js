const fs = require('fs');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');

/**
 * Uploads a file (either locally saved or to Cloudinary) and returns its accessible URL.
 * @param {Object} file - Multer file object
 * @returns {Promise<string>} - The file's secure/accessible URL
 */
const uploadSingleFile = async (file) => {
  if (isCloudinaryConfigured) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'property_listing_platform',
      });
      // Delete temporary local file after successful upload to Cloudinary
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      return result.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error, falling back to local storage:', error);
      return `/uploads/${file.filename}`;
    }
  }

  // Return static relative path
  return `/uploads/${file.filename}`;
};

/**
 * Uploads multiple files.
 * @param {Array} files - Array of Multer file objects
 * @returns {Promise<Array<string>>} - Array of file URLs
 */
const uploadMultipleFiles = async (files) => {
  if (!files || files.length === 0) return [];
  const uploadPromises = files.map((file) => uploadSingleFile(file));
  return Promise.all(uploadPromises);
};

module.exports = {
  uploadSingleFile,
  uploadMultipleFiles,
};
