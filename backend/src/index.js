require('dotenv').config();
const app = require('./app');
const prisma = require('./config/db');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const exitHandler = () => {
  if (server) {
    server.close(() => {
      console.log('Server closed');
      prisma.$disconnect();
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

const unexpectedErrorHandler = (error) => {
  console.error('Unexpected error occurred:', error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received');
  if (server) {
    server.close();
    prisma.$disconnect();
  }
});
