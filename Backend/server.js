const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');
const transactionRoutes = require('./routes/transaction');

const app = express();
const PORT = process.env.PORT || 5000;
const DB_URI = process.env.MONGO_URI ;

// Middleware
app.use(express.json());

mongoose.set('debug', true);

app.use(cors({
    origin: 'http://localhost:3000' // Allow requests from your React frontend
}));

// Database Connection
mongoose.connect(DB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Routes
app.use('/api', transactionRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
