const express = require('express');
const cors = require('cors');
const app = express();
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
app.get('/proxy/health', (req, res) => {
    res.json({ 
        status: 'Proxy server is running',
        timestamp: new Date().toISOString()
    });
});

// Card activation endpoint
app.post('/proxy/cards/activate', async (req, res) => {
    try {
        console.log('Activation request:', req.body);
        
        const response = await fetch('https://api.espees.org/cards/activate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body)
        });
        
        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        res.json(data);
        
    } catch (error) {
        console.error('Activation error:', error);
        res.status(500).json({ 
            error: 'Failed to activate card',
            message: error.message 
        });
    }
});

// Add card endpoint
app.post('/proxy/cards/add', async (req, res) => {
    try {
        console.log('Add card request:', req.body);
        
        const response = await fetch('https://api.espees.org/cards/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body)
        });
        
        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        res.json(data);
        
    } catch (error) {
        console.error('Add card error:', error);
        res.status(500).json({ 
            error: 'Failed to add card',
            message: error.message 
        });
    }
});

// Balance and transactions endpoint
app.post('/proxy/cards/balance', async (req, res) => {
    try {
        console.log('Balance request:', req.body);
        
        // Get balance
        const balanceResponse = await fetch('https://api.espees.org/cards/balance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body)
        });
        
        if (!balanceResponse.ok) {
            throw new Error(`Balance API responded with status: ${balanceResponse.status}`);
        }
        
        const balanceData = await balanceResponse.json();

        // Get transactions
        let transactionsData = { error: 'Transactions not available' };
        try {
            const transactionsResponse = await fetch('https://api.espees.org/cards/transactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': 'ynE78nw7bD8zq4ecJLZmg1HFTtBZDSvF9PWHeRZn'
                },
                body: JSON.stringify(req.body)
            });
            
            if (transactionsResponse.ok) {
                transactionsData = await transactionsResponse.json();
            }
        } catch (transactionsError) {
            console.warn('Transactions API error:', transactionsError);
            // Continue with balance data only
        }

        const result = {
            balance: balanceData,
            transactions: transactionsData
        };
        
        res.json(result);
        
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