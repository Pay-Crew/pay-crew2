// hono
import { HTTPException } from 'hono/http-exception';
// hono object factory
import honoFactory from './factory/hono';
// better-auth object factory
import { AuthFactoryType } from './factory/auth';
// routes
import check from './routes/check';
import group from './routes/group';
import info from './routes/info';
import userProfile from './routes/userProfile';

// protected router with authentication
const apiProtected = (auth: AuthFactoryType) => {
  const app = honoFactory();

  // authentication middleware
  app.use('/api/*', async (c, next) => {
    const session = await auth(c.env).api.getSession({ headers: c.req.raw.headers });

    // if no session, throw unauthorized error
    if (!session) {
      throw new HTTPException(401, { message: 'Unauthorized' });
    }

    // set user and session in context for downstream handlers
    c.set('user', session.user);
    c.set('session', session.session);

    await next();
  });

  //* endpoint registration *//
  app.route('/', check);
  app.route('/', group);
  app.route('/', info);
  app.route('/', userProfile);

  return app;
};

export default apiProtected;
