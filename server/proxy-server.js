const express = require('express');
const cors = require('cors');
const app = express();
const { https } = require('follow-redirects');
const PORT = 3002;

// Enable CORS for all routes - allow your Vue app's port
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // You can add specific domain checks here if needed
    // if (allowedOrigins.includes(origin)) {
    //   callback(null, true);
    // } else {
    //   callback(new Error('Not allowed by CORS'));
    // }
    callback(null, true);
  },
  credentials: true
}));

app.use(express.json());

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'Proxy server is running',
        timestamp: new Date().toISOString()
    });
});

// Card activation endpoint
// Helper to perform POST request using follow-redirects
function postRequest(url, data, headers = {}) {
    return new Promise((resolve, reject) => {
        const jsonData = JSON.stringify(data);
        const urlObj = new URL(url);

        const options = {
            method: 'POST',
            hostname: urlObj.hostname,
            path: urlObj.pathname,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(jsonData),
                ...headers
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(JSON.parse(body));
                    } catch (e) {
                        reject(new Error('Failed to parse JSON response'));
                    }
                } else {
                    reject(new Error(`API responded with status: ${res.statusCode}`));
                }
            });
        });

        req.on('error', reject);
        req.write(jsonData);
        req.end();
    });
}

// Activate card
app.post('/cards/activate', async (req, res) => {
    try {
        console.log('Activation request:', req.body);

        const data = await postRequest('https://api.espees.org/cards/activate', req.body);
        res.json(data);
    } catch (error) {
        console.error('Activation error:', error);
        res.status(500).json({ 
            error: 'Failed to activate card',
            message: error.message 
        });
    }
});

// Add card
app.post('/cards/add', async (req, res) => {
    try {
        console.log('Add card request:', req.body);

        const data = await postRequest('https://api.espees.org/cards/add', req.body);
        res.json(data);
    } catch (error) {
        console.error('Add card error:', error);
        res.status(500).json({ 
            error: 'Failed to add card',
            message: error.message 
        });
    }
});

// Balance and transactions
app.post('/cards/balance', async (req, res) => {
    try {
        console.log('Balance request:', req.body);

        // Get balance
        const balanceData = await postRequest('https://api.espees.org/cards/balance', req.body);

        // Get transactions
        let transactionsData = { error: 'Transactions not available' };
        try {
            transactionsData = await postRequest(
                'https://api.espees.org/cards/transactions',
                req.body,
                { 'x-api-key': 'ynE78nw7bD8zq4ecJLZmg1HFTtBZDSvF9PWHeRZn' }
            );
        } catch (transactionsError) {
            console.warn('Transactions API error:', transactionsError.message);
        }

        res.json({ balance: balanceData, transactions: transactionsData });

    } catch (error) {
        console.error('Balance check error:', error);
        res.status(500).json({ 
            error: 'Failed to retrieve balance',
            message: error.message 
        });
    }
});

// // 404 handler for undefined routes
// app.use('*', (req, res) => {
//     res.status(404).json({
//         error: 'Route not found',
//         message: `Cannot ${req.method} ${req.originalUrl}`
//     });
// });

// Global error handler
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        error: 'Internal server error',
        message: 'Something went wrong'
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Card Proxy Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔗 Available endpoints:`);
    console.log(`   POST http://localhost:${PORT}/proxy/cards/activate`);
    console.log(`   POST http://localhost:${PORT}/proxy/cards/add`);
    console.log(`   POST http://localhost:${PORT}/proxy/cards/balance`);
});