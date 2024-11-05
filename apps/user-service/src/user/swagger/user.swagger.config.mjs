import swaggerJsdoc from 'swagger-jsdoc';

export const SwaggerUserDefinition = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'User API',
      version: '1.0.0',
      description: 'API documentation for user module',
    },
    tags: [
      {
        name: 'Users',
        description: 'User management operations',
      },
    ],
  },
  apis: ['../routes/userRoute.mjs'],
});
