import swaggerJsdoc from 'swagger-jsdoc';

export const SwaggerUserDefinition = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Account API',
      version: '1.0.0',
      description: 'API documentation for user module',
    },
    tags: [
      {
        name: 'Users',
        description: 'account management operations',
      },
    ],
  },
  apis: ['../routes/account.router.mjs'],
});
