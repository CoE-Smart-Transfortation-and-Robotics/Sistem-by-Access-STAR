const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');

const app = express();

const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API is running');
});

app.use('/api/auth', authRoutes);


app.listen(9000, () => {
  console.log('Server running on port 9000');
});
