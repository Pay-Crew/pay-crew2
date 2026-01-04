// better-auth object factory
import { AuthFactoryType } from './factory/auth';
// hono object factory
import honoFactory from './factory/hono';

// public router without authentication
const apiPublic = (auth: AuthFactoryType) => {
  const app = honoFactory();

  // better-auth endpoints: /api/auth/*
  app.on(['POST', 'GET'], '/api/auth/*', (c) => {
    return auth(c.env).handler(c.req.raw);
  });

  return app;
};

export default apiPublic;
