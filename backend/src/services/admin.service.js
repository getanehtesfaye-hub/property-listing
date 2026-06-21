const prisma = require('../config/db');
const ApiError = require('../utils/apiError');

/**
 * Get system metrics for Admin Dashboard
 */
const getSystemMetrics = async () => {
  const [
    totalUsers,
    totalOwners,
    totalProperties,
    publishedProperties,
    archivedProperties,
    disabledProperties,
  ] = await Promise.all([
    // Users with USER role
    prisma.user.count({ where: { role: 'USER' } }),
    // Users with OWNER role
    prisma.user.count({ where: { role: 'OWNER' } }),
    // All active properties (not soft-deleted)
    prisma.property.count({ where: { deletedAt: null } }),
    // Count properties by status
    prisma.property.count({ where: { status: 'PUBLISHED', deletedAt: null } }),
    prisma.property.count({ where: { status: 'ARCHIVED', deletedAt: null } }),
    prisma.property.count({ where: { status: 'DISABLED', deletedAt: null } }),
  ]);

  return {
    totalUsers,
    totalOwners,
    totalProperties,
    publishedProperties,
    archivedProperties,
    disabledProperties,
  };
};

/**
 * Disable a property listing (changes status to DISABLED)
 */
const disableProperty = async (propertyId) => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });

  if (!property || property.deletedAt) {
    throw new ApiError(404, 'Property not found');
  }

  return prisma.property.update({
    where: { id: propertyId },
    data: {
      status: 'DISABLED',
    },
  });
};
const enableProperty = async (id) => {
  return await prisma.property.update({
    where: { id },
    data: {
      status: 'PUBLISHED',
    },
  });
};

module.exports = {
  getSystemMetrics,
  disableProperty,
  enableProperty
};
