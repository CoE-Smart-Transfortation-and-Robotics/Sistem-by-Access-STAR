require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const authenticate = require('./middlewares/authMiddleware');
const authorizeRole = require('./middlewares/roleMiddleware');
const userRoutes = require('./routes/userRoutes');

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

app.use('/api/users', userRoutes);

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

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'System by Access STAR API',
      version: '1.0.0',
      description: 'API untuk aplikasi System by Access STAR',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        }
      }
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(process.env.PORT || 9000, () => {
  console.log(`Server running on port ${process.env.PORT || 9000}`);
});