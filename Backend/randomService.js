const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/random', (req, res) => {
  const randomNumber = Math.floor(Math.random() * 100); // random number between 0 and 99
  res.json({ number: randomNumber});
});

const PORT = 5002;
app.listen(PORT, () => {
  console.log(`Random Number Generator Service running on port ${PORT}`);
});