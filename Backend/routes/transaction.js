const router = require('express').Router();
const axios = require('axios');
const Transaction = require('../models/transactionModel');
const dataURL = process.env.DATA_URL || 'https://s3.amazonaws.com/roxiler.com/product_transaction.json';

// Initialize the database
const initDb = async () => {
    try {
        const { data } = await axios.get(dataURL);
        const validData = data.filter(item => typeof item.price === 'number'); // Ensure price is a number
        await Transaction.deleteMany(); // Clear existing data
        const docs = await Transaction.insertMany(validData);
        if (docs) console.log("Database Initialized Successfully");
    } catch (error) {
        console.log("Error initializing database:", error);
    }
};

// Call initDb only once to populate the database
initDb();

// API to get transaction data by month
router.get('/transactions', async (req, res) => {
    try {
        const page = parseInt(req.query.page) - 1 || 0;
        const limit = !isNaN(parseInt(req.query.limit)) ? parseInt(req.query.limit) : 10;
        const skip = page * limit;
        const search = req.query.search || '';
        const month = !isNaN(parseInt(req.query.month)) ? parseInt(req.query.month) : 0;

        const searchConfig = {
            $and: [
                month === 0 ? {} : {
                    $expr: {
                        $eq: [{ $month: "$dateOfSale" }, month]
                    }
                },
                {
                    $or: [
                        { title: { $regex: search, $options: 'i' } },
                        { description: { $regex: search, $options: 'i' } }
                    ]
                }
            ]
        };

        const data = await Transaction.find(searchConfig).skip(skip).limit(limit);
        const totalCount = await Transaction.countDocuments(searchConfig);

        const responseData = {
            success: true,
            totalCount,
            page: page + 1,
            limit,
            month,
            transactions: data
        };
        res.status(200).json(responseData);

    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({ error: error.message });
    }
});

// API for statistics by month
router.get('/statistics', async (req, res) => {
    try {
        const month = !isNaN(parseInt(req.query.month)) ? parseInt(req.query.month) : 0;
        const monthQuery = month === 0 ? {} : {
            $expr: {
                $eq: [{ $month: "$dateOfSale" }, month]
            }
        };

        const data = await Transaction.find(monthQuery);
        const response = data.reduce((acc, curr) => {
            const currPrice = parseFloat(curr.price);
            acc.totalSale += curr.sold ? currPrice : 0;
            acc.soldCount += curr.sold ? 1 : 0;
            acc.unsoldCount += curr.sold ? 0 : 1;
            return acc;
        }, { totalSale: 0, soldCount: 0, unsoldCount: 0 });

        response.totalSale = response.totalSale.toFixed(2);
        response.totalCount = data.length;

        res.status(200).json(response);
    } catch (error) {
        console.error("Error fetching statistics:", error);
        res.status(500).json({ error: error.message });
    }
});

// API to create a bar chart data
router.get('/bar-chart', async (req, res) => {
    try {
        const month = !isNaN(parseInt(req.query.month)) ? parseInt(req.query.month) : 0;
        const monthQuery = month === 0 ? {} : {
            $expr: {
                $eq: [{ $month: "$dateOfSale" }, month]
            }
        };

        const data = await Transaction.find(monthQuery);
        let accumulator = {};

        for (let i = 0; i <= 10; i++) {
            let range = i * 100;
            if (i === 10) range = '901-above';
            else if (i === 0) range = '0-100';
            else range = `${range - 100 + 1}-${range}`;
            accumulator[range] = 0;
        }

        const response = data.reduce((acc, curr) => {
            const currPrice = parseFloat(curr.price);
            let priceRange = Math.ceil(currPrice / 100) * 100;

            if (priceRange === 100) priceRange = '0-100';
            else if (priceRange > 900) priceRange = '901-above';
            else priceRange = `${priceRange - 100 + 1}-${priceRange}`;

            acc[priceRange]++;
            return acc;
        }, accumulator);

        res.status(200).json(response);
    } catch (error) {
        console.error("Error fetching bar chart data:", error);
        res.status(500).json({ error: error.message });
    }
});

// API for pie chart data
router.get('/pie-chart', async (req, res) => {
    try {
        const month = !isNaN(parseInt(req.query.month)) ? parseInt(req.query.month) : 0;
        const monthQuery = month === 0 ? {} : {
            $expr: {
                $eq: [{ $month: "$dateOfSale" }, month]
            }
        };

        const data = await Transaction.find(monthQuery);
        const response = data.reduce((acc, curr) => {
            acc[curr.category] = (acc[curr.category] || 0) + 1;
            return acc;
        }, {});

        res.status(200).json(response);
    } catch (error) {
        console.error("Error fetching pie chart data:", error);
        res.status(500).json({ error: error.message });
    }
});

// API to combine data from other APIs
router.get('/combined-data', async (req, res) => {
    try {
        const month = req.query.month || 0;
        const [stats, barChart, pieChart] = await Promise.all([
            axios.get(`${req.protocol}://${req.get('host')}/api/statistics?month=${month}`),
            axios.get(`${req.protocol}://${req.get('host')}/api/bar-chart?month=${month}`),
            axios.get(`${req.protocol}://${req.get('host')}/api/pie-chart?month=${month}`)
        ]);

        const response = {
            statsData: stats.data,
            barChartData: barChart.data,
            pieChartData: pieChart.data
        };

        res.status(200).json(response);
    } catch (error) {
        console.error("Error fetching combined data:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
