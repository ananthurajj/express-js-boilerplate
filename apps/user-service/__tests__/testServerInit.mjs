import 'dotenv/config';
import express from 'express';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import swaggerUi from 'swagger-ui-express';
import { CacheService } from '../config/cache-service/cache-service.mjs';
import { ServiceVerify, SetCurrentUser, TokenVerify } from '../config/jwt-authentication/token-verify.mjs';
import { AccountRoutes } from '../src/account/index.mjs';
import { UserRoutes } from '../src/user/index.mjs';
import swaggerSpec from '../swagger.mjs';

class TestServerInit {
  constructor() {
    this.db = new MongoMemoryServer();
    this.cacheService = new CacheService({ cache_mode: 'in-memory', cache_prefix: 'test-service' });
  }

  async start() {
    await this.db.start();
    const mongoUri = this.db.getUri();
    console.log(`MongoDB URI: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    this.app = express();
    this.app.use(express.json());

    // Initialize cache
    await this.cacheService.connectRedis();

    // Swagger setup
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    this.app.get('/swagger.json', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerSpec);
    });

    // Middleware setup
    this.app.use(ServiceVerify, TokenVerify, SetCurrentUser);

    // Routes
    this.app.get('/', this.cacheService.cacheMiddleware(30000), (req, res) => {
      res.send({ data: 'Hello, World!' });
    });
    this.app.use('/api/v1/users', UserRoutes);
    this.app.use('/api/v1/accounts', AccountRoutes);

    return this.app;
  }

  async stop() {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await this.db.stop();
    await this.cacheService.close();
  }

  getRequest() {
    return request(this.app);
  }
}

export default TestServerInit;
