// Importing Express in ES Module
import 'dotenv/config';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { CacheService } from './config/cache-service/cache-service.mjs';
import { ServiceVerify, SetCurrentUser, TokenVerify } from './config/jwt-authentication/token-verify.mjs';
import connectDB from './config/mongodb/connect-mongo-db.mjs';
import { AccountRoutes } from './src/account/index.mjs';
import { UserRoutes } from './src/user/index.mjs';
import swaggerSpec from './swagger.mjs';

// Connect to DB
await connectDB(process.env.MONGO_URI);

const settings = {
  cache_mode: process.env.REDIS_HOST && process.env.REDIS_PORT ? 'redis' : 'in-memory', // 'redis' for real Redis, anything else for in-memory mock
  redis_host: process.env.REDIS_HOST, // Redis host
  redis_port: process.env.REDIS_PORT, // Redis port
  cache_prefix: 'user-service', // Prefix for keys
  cache_ttl: 1000 * 10,
};

const cacheService = new CacheService(settings);
await cacheService.connectRedis();

// Initialize Express app
const app = express();

// Body parser middleware
app.use(express.json());

// Swagger setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Serve Swagger JSON
app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec); // Send the swaggerSpec as JSON
});

// Apply authentication middleware
app.use(ServiceVerify, TokenVerify, SetCurrentUser);

// Test route with cache
app.get('/', cacheService.cacheMiddleware(30000), (req, res) => {
  res.send({ data: 'Hello, World!' });
});

// Use user routes
app.use('/api/v1/users', UserRoutes);
app.use('/api/v1/accounts', AccountRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
