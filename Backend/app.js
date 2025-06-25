require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authenticate = require('./middlewares/authMiddleware');
const authorizeRole = require('./middlewares/roleMiddleware');

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

app.get('/admin', authenticate, authorizeRole('admin'), (req, res) => {
  res.json({ message: 'Welcome Admin', user: req.user });
});

app.get('/user', authenticate, authorizeRole('user'), (req, res) => {
  res.json({ message: 'Welcome User', user: req.user });
});

app.get('/visitor', authenticate, authorizeRole('visitor'), (req, res) => {
  res.json({ message: 'Welcome Visitor', user: req.user });
});

app.listen(process.env.PORT || 9000, () => {
  console.log(`Server running on port ${process.env.PORT || 9000}`);
});