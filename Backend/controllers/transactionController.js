// /controllers/transactionController.js

const axios = require('axios');
const Transaction = require('../models/transactionModel');

// Helper function to get start and end of the month
const getMonthRange = (month) => {
    const year = 2021; // Keep the year static as per the requirement
    const startOfMonth = new Date(Date.UTC(year, month - 1, 1)); // Start of the month in UTC
    const endOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59)); // End of the month in UTC

    return { startOfMonth, endOfMonth };
};

// Initialize the database with data from third-party API
exports.initializeDatabase = async (req, res) => {
    try {
        const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
        await Transaction.deleteMany({}); // Clear existing data
        await Transaction.insertMany(response.data); // Seed data
        res.status(200).json({ message: "Database initialized successfully" });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data or initialize database' });
    }
};

// List transactions with pagination and search

exports.listTransactions = async (req, res) => {
    const { page = 1, perPage = 10, search = "", month } = req.query;
    const searchRegex = new RegExp(search, 'i');

    // Use the helper function to calculate the start and end of the month
    const { startOfMonth, endOfMonth } = getMonthRange(month);

    try {
        // Log the calculated date range to ensure correctness
        console.log("Start of Month:", startOfMonth);
        console.log("End of Month:", endOfMonth);

        // Query for transactions based on search and date range
        const transactions = await Transaction.find({
            $and: [
                { dateOfSale: { $gte: startOfMonth, $lte: endOfMonth } },
                {
                    $or: [
                        { title: searchRegex },
                        { description: searchRegex },
                        { price: { $regex: searchRegex } }
                    ]
                }
            ]
        })
        .skip((page - 1) * perPage)
        .limit(parseInt(perPage));

        // If no transactions found, return a message
        if (transactions.length === 0) {
            return res.status(404).json({ message: "No transactions found for the given month and search criteria" });
        }

        res.status(200).json(transactions);
    } catch (error) {
        console.error("Error retrieving transactions:", error);  // Log the error for debugging
        res.status(500).json({ error: "Failed to retrieve transactions" });
    }
};

// Get statistics for a specific month
exports.getStatistics = async (req, res) => {
    const { month } = req.query;
    const { startOfMonth, endOfMonth } = getMonthRange(month);

    try {
        const soldItems = await Transaction.find({ sold: true, dateOfSale: { $gte: startOfMonth, $lte: endOfMonth } }).countDocuments();
        const unsoldItems = await Transaction.find({ sold: false, dateOfSale: { $gte: startOfMonth, $lte: endOfMonth } }).countDocuments();
        const totalSales = await Transaction.aggregate([
            { $match: { sold: true, dateOfSale: { $gte: startOfMonth, $lte: endOfMonth } } },
            { $group: { _id: null, total: { $sum: "$price" } } }
        ]);

        res.status(200).json({
            totalSaleAmount: totalSales[0]?.total || 0,
            totalSoldItems: soldItems,
            totalUnsoldItems: unsoldItems
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve statistics" });
    }
};

// Get bar chart data for price ranges
exports.getBarChart = async (req, res) => {
    const { month } = req.query;
    const { startOfMonth, endOfMonth } = getMonthRange(month);

    const priceRanges = [
        { range: "0-100", min: 0, max: 100 },
        { range: "101-200", min: 101, max: 200 },
        { range: "201-300", min: 201, max: 300 },
        { range: "301-400", min: 301, max: 400 },
        { range: "401-500", min: 401, max: 500 },
        { range: "501-600", min: 501, max: 600 },
        { range: "601-700", min: 601, max: 700 },
        { range: "701-800", min: 701, max: 800 },
        { range: "801-900", min: 801, max: 900 },
        { range: "901-above", min: 901, max: Infinity }
    ];

    try {
        const result = await Promise.all(priceRanges.map(async (range) => {
            const count = await Transaction.find({
                price: { $gte: range.min, $lt: range.max },
                dateOfSale: { $gte: startOfMonth, $lte: endOfMonth }
            }).countDocuments();

            return { range: range.range, count };
        }));

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve bar chart data" });
    }
};

// Get pie chart data for categories
exports.getPieChart = async (req, res) => {
    const { month } = req.query;
    const { startOfMonth, endOfMonth } = getMonthRange(month);

    try {
        const result = await Transaction.aggregate([
            { $match: { dateOfSale: { $gte: startOfMonth, $lte: endOfMonth } } },
            { $group: { _id: "$category", count: { $sum: 1 } } }
        ]);

        res.status(200).json(result.map(item => ({ category: item._id, count: item.count })));
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve pie chart data" });
    }
};

// Get combined data from statistics, bar chart, and pie chart APIs
exports.getCombinedData = async (req, res) => {
    const { month } = req.query;

    try {
        const statistics = await exports.getStatistics(req, res);
        const barChart = await exports.getBarChart(req, res);
        const pieChart = await exports.getPieChart(req, res);

        res.status(200).json({ statistics, barChart, pieChart });
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve combined data" });
    }
};
