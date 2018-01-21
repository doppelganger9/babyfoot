import * as express from 'express';
import * as http from 'http';
import * as bodyParser from 'body-parser';
import { registerRoutes } from './routes';
import { Application } from 'express';

var createExpressMiddleware = function createExpressMiddleware(port: number): Application {
  var app = express();
  app.set('port', port);

  app.use(bodyParser.json());
  app.use(
    bodyParser.urlencoded({
      extended: false
    })
  );

  return app;
};

var startServer = function startServer(app: Application) {
  var server = http.createServer(app);
  server.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
  });
};

exports.run = function run(port: number) {
  var app = createExpressMiddleware(port);

  registerRoutes(app);

  startServer(app);
};
