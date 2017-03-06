import config from 'config';
import passport from 'passport';
import { Strategy } from 'passport-bnet';
import https from 'https';

import { Server } from './express';

const BNET_ID = config.get<string>('bnet.id');
const BNET_SECRET = config.get<string>('bnet.secret');
const BNET_CALLBACK = config.get<string>('bnet.callback');
const HOST_NAME = config.get<string>('server.host');
const HOST_PORT = config.get<number>('server.port');
const HOST_KEY = config.get<string>('server.key');
const HOST_CERT = config.get<string>('server.certificate');
const URL_BASE = config.get<string>('urls.base');
const URL_CALLBACK = config.get<string>('urls.callback');

passport.use(new Strategy({
  clientID: BNET_ID,
  clientSecret: BNET_SECRET,
  callbackURL: BNET_CALLBACK,
  region: 'us',
  scope: 'wow.profile',
}, (accessToken, refreshToken, profile, done) =>
  done(null, profile),
));

class ApiServer extends Server {
  protected api(): void {
    this.app.get('/beans', (req, res) => res.send('Helo'));
    this.app.get(URL_BASE, passport.authenticate('bnet'));
    this.app.get(URL_CALLBACK, passport.authenticate('bnet', { failureRedirect: '/' }), (req, res) => res.redirect('/'));
  }
}

const server = new ApiServer();
https.createServer({ key: HOST_KEY, cert: HOST_CERT }, server.app).listen(HOST_PORT, HOST_NAME);
