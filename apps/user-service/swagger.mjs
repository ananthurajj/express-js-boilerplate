import dotenv from 'dotenv';
import swaggerJsdoc from 'swagger-jsdoc';
import { accuntComponents } from './src/account/swagger/account.components.swagger.mjs';
import { SwaggerUserDefinition } from './src/user/index.mjs';
import { userComponents } from './src/user/swagger/user.components.swagger.mjs';
dotenv.config();

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'User Service',
      version: '1.0.0',
      description: 'API documentation for user service',
    },
    tags: [...SwaggerUserDefinition.tags],
    servers: [
      {
        url: `http://localhost:${process.env.PORT}`,
        description: 'Local server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT', // Specify that it uses JWT
        },
      },
      schemas: {
        ...userComponents,
        ...accuntComponents,
      },
    },
    security: [
      {
        BearerAuth: [], // Apply BearerAuth globally
      },
    ],
  },
  apis: [
    './src/user/routes/user.router.mjs', // Ensure this points to your route files
    './src/account/routes/account.router.mjs',
  ],
});

export default swaggerSpec;
