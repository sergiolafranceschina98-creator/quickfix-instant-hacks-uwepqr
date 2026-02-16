import { createApplication } from "@specific-dev/framework";
import * as appSchema from './db/schema.js';
import * as authSchema from './db/auth-schema.js';
import { registerSolveRoutes } from './routes/solve.js';
import { registerSavedHacksRoutes } from './routes/saved-hacks.js';

// Combine app and auth schemas
const schema = { ...appSchema, ...authSchema };

// Create application with schema for full database type support
export const app = await createApplication(schema);

// Export App type for use in route files
export type App = typeof app;

// Enable storage and authentication
app.withStorage();
app.withAuth();

// Register routes - IMPORTANT: Always use registration functions to avoid circular dependency issues
registerSolveRoutes(app, app.fastify);
registerSavedHacksRoutes(app, app.fastify);

await app.run();
app.logger.info('QuickFix application started');
