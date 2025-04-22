const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

/**
 * Hash service endpoint.
 * Expects JSON body: { input, method }
 * Example: { "input": "Hello World", "method": "md5" }
 */
app.post('/hash', (req, res) => {
  const { input, method } = req.body;

  if (!input || !method) {
    return res.status(400).json({ message: 'Missing input or method' });
  }

  try {
    // Convert method to lowercase so MD5 or SHA256 can still work
    const hashValue = crypto.createHash(method.toLowerCase()).update(input).digest('hex');
    return res.json({ hash: hashValue });
  } catch (error) {
    // If crypto.createHash fails, it usually means the algorithm is not supported
    return res.status(400).json({ message: 'Hash method not supported' });
  }
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Hash Value Generator Service running on port ${PORT}`);
});