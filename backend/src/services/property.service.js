const prisma = require('../config/db');
const ApiError = require('../utils/apiError');
const { validatePublishData } = require('../validators/property.validator');

/**
 * Get properties with filtering, pagination, and sorting
 */
const getProperties = async (queries, userRole = null, currentUserId = null) => {
  const page = parseInt(queries.page) || 1;
  const limit = parseInt(queries.limit) || 10;
  const skip = (page - 1) * limit;

  const { location, minPrice, maxPrice, status, sortBy, myListings } = queries;

  // Base where clause: exclude soft-deleted properties
  const whereClause = {
    deletedAt: null,
  };

  // Visibility and role constraints:
  if (userRole === 'ADMIN') {
    // Admins can see all properties (optionally filter by status)
    if (status) {
      whereClause.status = status;
    }
  } else if (userRole === 'OWNER' && myListings === 'true') {
    // Owners querying their own listings
    whereClause.ownerId = currentUserId;
    if (status) {
      whereClause.status = status;
    }
  } else {
    // Guests or general view: Only show PUBLISHED properties
    // Owners looking at general listings can see their own drafts, but for others, only PUBLISHED
    if (currentUserId && userRole === 'OWNER') {
      whereClause.OR = [
        { ownerId: currentUserId },
        { status: 'PUBLISHED' },
      ];
    } else {
      whereClause.status = 'PUBLISHED';
    }

    // Apply specific status filter if it aligns with visibility constraints
    if (status) {
      if (status === 'PUBLISHED') {
        whereClause.status = 'PUBLISHED';
      } else if (currentUserId && userRole === 'OWNER' && status !== 'PUBLISHED') {
        // Owners can filter their own non-published listings
        whereClause.ownerId = currentUserId;
        whereClause.status = status;
      } else {
        // Users/Guests cannot view other statuses
        whereClause.status = 'PUBLISHED';
      }
    }
  }

  // Location search (case-insensitive contains)
  if (location && location.trim() !== '') {
    whereClause.location = {
      contains: location,
      mode: 'insensitive',
    };
  }

  // Price range filters
  if (minPrice || maxPrice) {
    whereClause.price = {};
    if (minPrice) {
      whereClause.price.gte = parseFloat(minPrice);
    }
    if (maxPrice) {
      whereClause.price.lte = parseFloat(maxPrice);
    }
  }

  // Sorting logic
  let orderBy = { createdAt: 'desc' };
  if (sortBy) {
    if (sortBy === 'price_asc') {
      orderBy = { price: 'asc' };
    } else if (sortBy === 'price_desc') {
      orderBy = { price: 'desc' };
    } else if (sortBy === 'oldest') {
      orderBy = { createdAt: 'asc' };
    }
  }

  const [totalCount, data] = await Promise.all([
    prisma.property.count({ where: whereClause }),
    prisma.property.findMany({
      where: whereClause,
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
      orderBy,
      skip,
      take: limit,
    }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return {
    data,
    page,
    totalPages,
    totalCount,
  };
};

/**
 * Get a single property by ID
 */
const getPropertyById = async (id, userRole = null, currentUserId = null) => {
  const property = await prisma.property.findUnique({
    where: { id },
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
  });

  // Verify property exists and is not soft-deleted
  if (!property || property.deletedAt) {
    throw new ApiError(404, 'Property not found');
  }

  // Visibility check: DRAFT, ARCHIVED, or DISABLED properties are only visible to the owner or admin
  if (property.status !== 'PUBLISHED') {
    const isOwner = currentUserId && property.ownerId === currentUserId;
    const isAdmin = userRole === 'ADMIN';

    if (!isOwner && !isAdmin) {
      throw new ApiError(403, 'You do not have permission to view this property listing');
    }
  }

  return property;
};

/**
 * Create a new property (DRAFT by default)
 */
const createProperty = async (propertyData, ownerId) => {
  const { title, description, location, price, images } = propertyData;

  const parsedPrice = price !== undefined ? parseFloat(price) : 0;

  // Create property and its image records in a transaction
  return prisma.property.create({
    data: {
      title,
      description: description || '',
      location: location || '',
      price: parsedPrice,
      status: 'DRAFT',
      ownerId,
      images: {
        create: images && images.length > 0 ? images.map((url) => ({ imageUrl: url })) : [],
      },
    },
    include: {
      images: true,
    },
  });
};

/**
 * Update an existing property (DRAFT only)
 */
const updateProperty = async (id, propertyData, ownerId, userRole) => {
  const property = await prisma.property.findUnique({
    where: { id },
    include: { images: true },
  });

  if (!property || property.deletedAt) {
    throw new ApiError(404, 'Property not found');
  }

  // Authorization check: Only owner or admin can edit
  const isOwner = property.ownerId === ownerId;
  const isAdmin = userRole === 'ADMIN';
  if (!isOwner && !isAdmin) {
    throw new ApiError(403, 'You do not have permission to modify this property');
  }

  // Rule 2: Published properties cannot be edited
  if (property.status !== 'DRAFT') {
    throw new ApiError(400, `Cannot edit property. Only properties in DRAFT status can be modified. Current status: ${property.status}`);
  }

  const { title, description, location, price, images } = propertyData;
  const updateData = {};

  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (location !== undefined) updateData.location = location;
  if (price !== undefined) updateData.price = parseFloat(price);

  return prisma.$transaction(async (tx) => {
    // If images are provided, delete old ones and create new ones
    if (images && Array.isArray(images)) {
      await tx.propertyImage.deleteMany({
        where: { propertyId: id },
      });

      updateData.images = {
        create: images.map((url) => ({ imageUrl: url })),
      };
    }

    return tx.property.update({
      where: { id },
      data: updateData,
      include: {
        images: true,
      },
    });
  });
};

/**
 * Publish property (using database transaction)
 */
const publishProperty = async (id, ownerId) => {
  // Use database transaction to validate and publish
  return prisma.$transaction(async (tx) => {
    // 1. Fetch property inside transaction to lock the record
    const property = await tx.property.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!property || property.deletedAt) {
      throw new ApiError(404, 'Property not found');
    }

    // Authorization: Only owner can publish
    if (property.ownerId !== ownerId) {
      throw new ApiError(403, 'Only the property owner can publish this listing');
    }

    // Status check
    if (property.status === 'PUBLISHED') {
      throw new ApiError(400, 'Property is already published');
    }
    if (property.status === 'DISABLED') {
      throw new ApiError(400, 'Cannot publish listing that has been disabled by Admin');
    }

    // 2. Validate property content strictly (Rule 3)
    validatePublishData(property);

    // 3. Update status and publishedAt
    return tx.property.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
      include: {
        images: true,
      },
    });
  });
};

/**
 * Archive property
 */
const archiveProperty = async (id, ownerId) => {
  const property = await prisma.property.findUnique({
    where: { id },
  });

  if (!property || property.deletedAt) {
    throw new ApiError(404, 'Property not found');
  }

  // Authorization: Only owner can archive
  if (property.ownerId !== ownerId) {
    throw new ApiError(403, 'Only the property owner can archive this listing');
  }

  return prisma.property.update({
    where: { id },
    data: {
      status: 'ARCHIVED',
    },
  });
};

/**
 * Soft delete property (sets deletedAt)
 */
const softDeleteProperty = async (id, userId, userRole) => {
  const property = await prisma.property.findUnique({
    where: { id },
  });

  if (!property || property.deletedAt) {
    throw new ApiError(404, 'Property not found');
  }

  // Authorization: Owner or Admin
  const isOwner = property.ownerId === userId;
  const isAdmin = userRole === 'ADMIN';

  if (!isOwner && !isAdmin) {
    throw new ApiError(403, 'You do not have permission to delete this listing');
  }

  return prisma.property.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });
};

module.exports = {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  publishProperty,
  archiveProperty,
  softDeleteProperty,
};
