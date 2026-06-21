const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./routes');
const errorMiddleware = require('./middleware/error.middleware');
const ApiError = require('./utils/apiError');

const app = express();

// Enable CORS
app.use(cors());

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Mount API routes
app.use('/api', routes);

// Handle 404 for unknown endpoints
app.use((req, res, next) => {
  next(new ApiError(404, 'Endpoint not found'));
});

// Centralized error handler
app.use(errorMiddleware);

module.exports = app;
