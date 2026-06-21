const prisma = require('../config/db');

const sendMessage = async (req, res) => {
  try {
   const { senderName, senderEmail, senderPhone, message, propertyId } = req.body;

    const property = await prisma.property.findUnique({
      where: { id: propertyId }
    });

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const newMessage = await prisma.message.create({
      data: {
        senderName,
        senderEmail,
          senderPhone,
        message,
        propertyId,
        ownerId: property.ownerId
      }
    });

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const deleteMessage = async (req, res) => {
  try {
    await prisma.message.delete({
      where: { id: req.params.id }
    });

    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOwnerMessages = async (req, res) => {
  try {
    const ownerId = req.user.id; // owner logged in

    const messages = await prisma.message.findMany({
      where: {
           ownerId: ownerId,
             },
           include: {
      property: true,
                   },
      orderBy: {
      createdAt: 'desc',
      },
      });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendMessage,
  getOwnerMessages,
  deleteMessage
};
