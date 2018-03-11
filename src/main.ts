import * as express from 'express';
import * as http from 'http';
import * as bodyParser from 'body-parser';
import { Routes } from './routes/routes';
import { Application, Request, Response, Router } from 'express';
import * as cors from 'cors';
import * as helmet from 'helmet';
import * as admin from 'firebase-admin';

function logErrors(err: any, req: Request, res: Response, next: any) {
  console.error(err.stack);
  next(err);
}

function errorHandler(err: any, req: Request, res: Response, next: any) {
  res.status(500);
  res.render('error', { error: err });
}

function manageError(err: any, req: Request, res: Response, next: any) {
  if (err.constructor) {
    const errorName = err.constructor.name;

    console.log('error: ' + errorName);
    console.log(err);

    const isLocal =
      req.connection.remoteAddress &&
      ['localhost', '::1', '127.0.0.1'].includes(
        req.connection.remoteAddress
      );
    const stack = isLocal ? err.stack!.split('\n') : undefined;

    res.status(400).send({
      error: err,
      errorName,
      stack
    });
  } else {
    next(err);
  }
}

function createExpressMiddleware(port: string | number, router: Router): Application {
  const app = express();
  app.set('port', port);

  app.use(helmet());
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.BABYFOOTAPI_CORS_ORIGINS) {
      console.error('in production mode, you need to specify BABYFOOTAPI_CORS_ORIGINS for CORS!');
      process.exit(1);
    }
    app.use(cors({ origin: process.env.BABYFOOTAPI_CORS_ORIGINS!.split(' ') }));
  } else {
    app.use(cors());
  }

  app.use(bodyParser.json());
  app.use(
    bodyParser.urlencoded({
      extended: false
    })
  );
  app.use('/', router);

  app.use(logErrors);
  app.use(manageError);
  app.use(errorHandler);

  return app;
}

function configureFirebaseAdminSDK(): void {
  if (process.env.NODE_ENV === 'production') {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    const databaseURL = process.env.FIREBASE_DATABASE_URL;
    if (!projectId || !clientEmail || !privateKey) {
      console.error('ERROR: you need to pass an environment variable named'
        + 'FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY'
        + ' containing the related Firebase Admin SDK authentication information');
      process.exit(1);
    } else {
      console.log('FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY environment variable found');
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        databaseURL,
      });
    }
  } else {
    console.warn('No firebase admin SDK init in development mode');
  }
}

function startServer(app: Application): void {
  const server = http.createServer(app);
  server.listen(app.get('port'), () => {
    console.log('Babyfoot API Express server listening on port ' + app.get('port'));
  });
}

export function run(port: string | number) {
  const routes = new Routes();
  const router = express.Router();
  routes.registerRoutes(router);

  const app = createExpressMiddleware(port, router);

  configureFirebaseAdminSDK();

  startServer(app);
}
