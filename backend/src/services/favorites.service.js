const prisma = require('../config/db');
const ApiError = require('../utils/apiError');

/**
 * Get all favorite properties for a user
 */
const getUserFavorites = async (userId) => {
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    include: {
      property: {
        include: {
          images: true,
          owner: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: {
      id: 'desc',
    },
  });

  // Filter out any favorites where the property is soft-deleted or disabled by admin
  return favorites
    .filter(
      (fav) =>
        fav.property &&
        !fav.property.deletedAt &&
        fav.property.status === 'PUBLISHED'
    )
    .map((fav) => fav.property);
};

/**
 * Add a property to favorites
 */
const addFavorite = async (userId, propertyId) => {
  // Check if property exists, is not soft-deleted, and is published
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });

  if (!property || property.deletedAt) {
    throw new ApiError(404, 'Property not found');
  }

  if (property.status !== 'PUBLISHED') {
    throw new ApiError(400, 'Cannot favorite a property that is not published');
  }

  // Check if already favorited
  const existingFavorite = await prisma.favorite.findUnique({
    where: {
      userId_propertyId: {
        userId,
        propertyId,
      },
    },
  });

  if (existingFavorite) {
    return existingFavorite;
  }

  return prisma.favorite.create({
    data: {
      userId,
      propertyId,
    },
  });
};

/**
 * Remove a property from favorites
 */
const removeFavorite = async (userId, propertyId) => {
  // Check if favorite exists
  const existingFavorite = await prisma.favorite.findUnique({
    where: {
      userId_propertyId: {
        userId,
        propertyId,
      },
    },
  });

  if (!existingFavorite) {
    throw new ApiError(404, 'Property is not in your favorites list');
  }

  return prisma.favorite.delete({
    where: {
      userId_propertyId: {
        userId,
        propertyId,
      },
    },
  });
};

module.exports = {
  getUserFavorites,
  addFavorite,
  removeFavorite,
};
