const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');
const connectDB = require('./config/db');

// Load env vars
dotenv.config({ path: './config/config.env' });

// Connect to database
connectDB();

// Route files
const doctors = require('./routes/doctors');
const patients = require('./routes/patients');
const auth = require('./routes/auth');
const departments = require('./routes/departments');
const appointments = require('./routes/appointments');
const medicalRecords = require('./routes/medicalRecords');
const payments = require('./routes/payments');
const reviews = require('./routes/reviews');

const app = express();

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Enable CORS
app.use(cors({
    origin: 'http://localhost:5173', // Frontend URL
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Mount routers
app.use('/api/doctors', doctors);
app.use('/api/patients', patients);
app.use('/api/auth', auth);
app.use('/api/departments', departments);
app.use('/api/appointments', appointments);
app.use('/api/medical-records', medicalRecords);
app.use('/api/payments', payments);
app.use('/api/reviews', reviews);

// Catch 404 and forward to error handler
app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
    PORT,
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold)
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`.red);
    // Close server & exit process but first complete pending requests
    server.close(() => {
        console.log('Server closed'.red);
        process.exit(1);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.log(`Error: ${err.message}`.red);
    // Close server & exit process but first complete pending requests
    server.close(() => {
        console.log('Server closed'.red);
        process.exit(1);
    });
});
