import bodyParser from 'body-parser';
import express from 'express';
import logger from 'morgan';
import passport from 'passport';

export abstract class Server {
  public readonly app: express.Application;

  constructor() {
    this.app = express();
    this.config();
    this.api();
  }

  protected abstract api(): void;

  protected config(): void {
    this.app.use(logger('dev'));
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({
      extended: true,
    }));
    this.app.use(passport.initialize());

    this.app.use((err, req, res, next) => {
      res.status(500);
      res.render('error', { error: err });
    });
  }
}
