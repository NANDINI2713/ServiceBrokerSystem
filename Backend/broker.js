


// === broker.js patch for persistent OTP during session ===
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'yournewpassword',
  database: 'service_broker',
});

db.connect((err) => {
  if (err) console.error('MySQL connection error:', err.message);
  else console.log('Connected to MySQL database.');
});

const otpMap = new Map();

app.post('/signup', async (req, res) => {
  const { id, email, password } = req.body;
  if (!id || !email || !password) return res.status(400).json({ message: "All fields are required" });

  db.query("SELECT * FROM users WHERE id = ?", [id], async (err, results) => {
    if (err) return res.status(500).json({ message: "Database query error" });
    if (results && results.length > 0) return res.status(400).json({ message: "User already exists" });

    const hash = await bcrypt.hash(password, 10);
    db.query("INSERT INTO users (id, email, passwordHash) VALUES (?, ?, ?)", [id, email, hash], (err) => {
      if (err) return res.status(500).json({ message: "Error saving user" });
      res.json({ message: "Signup successful" });
    });
  });
});


app.post('/login', async (req, res) => {
  const { id, password } = req.body;
  if (!id || !password) return res.status(400).json({ message: "ID and password required" });

  db.query("SELECT * FROM users WHERE id = ?", [id], async (err, results) => {
    if (results.length === 0) return res.status(400).json({ message: "User not found" });

    const user = results[0];
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ message: "Invalid password" });

    res.json({ message: "Login successful" });
  });
});

app.post('/generateOtp', (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ message: "User ID required" });
  const otp = Math.floor(100000 + Math.random() * 900000);
  otpMap.set(userId, otp);
  console.log(`OTP for ${userId}: ${otp}`);
  console.log("Current OTP Map:", [...otpMap.entries()]);
  res.json({ message: "OTP sent to provider's contact" });
});

app.post('/addService', (req, res) => {
  const { serviceName, ip, port, userId, otp } = req.body;
  if (!serviceName || !ip || !port || !userId || !otp) return res.status(400).json({ message: 'Missing required fields' });
  if (otpMap.get(userId) != otp) return res.status(403).json({ message: 'Invalid or missing OTP' });
  // Do NOT delete OTP here to allow re-use during session

  const checkQuery = "SELECT * FROM services WHERE serviceName = ? AND port = ? AND userId = ?";
  db.query(checkQuery, [serviceName, port, userId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error checking service' });
    if (results.length > 0) return res.status(409).json({ message: 'Service already added by this user' });

    const insertQuery = "INSERT INTO services (serviceName, ip, port, userId) VALUES (?, ?, ?, ?)";
    db.query(insertQuery, [serviceName, ip, port, userId], (err) => {
      if (err) return res.status(500).json({ message: 'This service has been already added by another user' });
      res.json({ message: 'Service registered successfully' });
    });
  });
});

app.post('/removeService', (req, res) => {
  const { serviceName, port, userId, otp } = req.body;
  if (!serviceName || !port || !userId || !otp) return res.status(400).json({ message: 'Missing required fields' });
  if (otpMap.get(userId) != otp) return res.status(403).json({ message: 'Invalid or missing OTP' });
  // Do NOT delete OTP here to allow re-use during session

  const deleteQuery = "DELETE FROM services WHERE serviceName = ? AND port = ? AND userId = ?";
  db.query(deleteQuery, [serviceName, port, userId], (err) => {
    if (err) return res.status(500).json({ message: 'Error removing service' });
    res.json({ message: 'Service removed successfully' });
  });
});

app.get('/getServices', (req, res) => {
  const userId = req.query.userId;
  const query = userId ? "SELECT * FROM services WHERE userId = ?" : "SELECT * FROM services";
  const values = userId ? [userId] : [];

  db.query(query, values, (err, results) => {
    if (err) return res.status(500).json({ message: 'Error fetching services' });
    const displayNames = {
      randomNumberGenerator: 'Random Number Generator',
      hashValueGenerator: 'Hash Value Generator',
    };
    const serviceList = results.map(service => ({
      serviceName: service.serviceName,
      displayName: displayNames[service.serviceName] || service.serviceName,
      port: service.port
    }));
    res.json({ services: serviceList });
  });
});

app.post('/invokeService', async (req, res) => {
  const { serviceName, endpoint, method, data } = req.body;
  try {
    const serviceResult = await db.promise().query('SELECT ip, port FROM services WHERE serviceName = ? LIMIT 1', [serviceName]);
    if (serviceResult[0].length === 0) return res.status(404).json({ message: 'Service not found' });

    const { ip, port } = serviceResult[0][0];
    const url = `http://${ip}:${port}${endpoint}`;
    let response;
    if (method === 'GET') response = await axios.get(url);
    else if (method === 'POST') response = await axios.post(url, data);

    return res.json(response.data);
  } catch (err) {
    console.error('Invoke Service Error:', err);
    return res.status(500).json({ message: 'Failed to invoke service' });
  }
});


app.post('/verifyOtp', (req, res) => {
  const { userId, otp } = req.body;
  if (!userId || !otp) return res.status(400).json({ valid: false, message: "Missing userId or OTP" });

  const validOtp = otpMap.get(userId);
  const isValid = parseInt(otp) === validOtp;

  res.json({ valid: isValid });
});


const PORT = 4000;
app.listen(PORT, () => console.log(`Broker server running on port ${PORT}`));