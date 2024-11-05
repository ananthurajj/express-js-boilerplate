// Exporting the model
export { UserModel } from './models/user.model.mjs';

// Exporting the controller functions
export * as UserController from './controllers/user.controller.mjs';

// Exporting the routes
export { default as UserRoutes } from './routes/user.router.mjs';

export { SwaggerUserDefinition } from './swagger/user.swagger.config.mjs';
