const express = require('express');
const cors = require('cors');
//const fetch = require('node-fetch');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Proxy endpoints
app.post('/proxy/cards/activate', async (req, res) => {
  console.log(req.body)
  try {
    const response = await fetch('https://api.espees.org/cards/activate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body)
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: error.message });
  }
});

app.post('/proxy/cards/add', async (req, res) => {
  try {
    const response = await fetch('https://api.espees.org/cards/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body)
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/proxy/cards/balance', async (req, res) => {
  try {
    const response = await fetch('https://api.espees.org/cards/balance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body)
    });
    
    const data = await response.json();

     const response2 = await fetch('https://api.espees.org/cards/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key':'ynE78nw7bD8zq4ecJLZmg1HFTtBZDSvF9PWHeRZn'
      },
      body: JSON.stringify(req.body)
    });
    const transactions = await response2.json()
    var result = {"body": data,"transactions":transactions}
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});