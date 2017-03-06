import config from 'config';
import passport from 'passport';
import { Strategy } from 'passport-bnet';
import http from 'http';
import firebase from 'firebase-admin';
import _ from 'lodash';

import { Server } from './express';
import { getToons } from './toons';

const BNET_ID = config.get<string>('bnet.id');
const BNET_SECRET = config.get<string>('bnet.secret');
const BNET_CALLBACK = config.get<string>('bnet.callback');
const HOST_NAME = config.get<string>('server.host');
const HOST_PORT = config.get<number>('server.port');
const HOST_CALLBACK = config.get<string>('server.callback');
const URL_BASE = config.get<string>('urls.base');
const URL_CALLBACK = config.get<string>('urls.callback');
const FIREBASE_DB = config.get<string>('firebase.databaseURL');
const FIREBASE_CREDENTIAL = config.get<Object>('firebase.credentials');

firebase.initializeApp({
  databaseURL: FIREBASE_DB,
  credential: firebase.credential.cert(FIREBASE_CREDENTIAL),
});

passport.use(new Strategy({
  clientID: BNET_ID,
  clientSecret: BNET_SECRET,
  callbackURL: BNET_CALLBACK,
  region: 'us',
  scope: 'wow.profile',
}, (accessToken, refreshToken, profile, done) => {
  profile.uid = `bt|${ profile.battletag.replace('#', '-') }`;
  const uid = profile.uid;
  const refFull = firebase.database().ref('/toons');
  const refLink = firebase.database().ref('/users').child(uid).child('/toons');

  getToons(accessToken, uid)
    .then((toons) => {
      const set = _.keyBy(toons, 'name');
      const link = _.mapValues(set, _.constant(true));
      
      return Promise.all([
        refFull.update(set),
        refLink.set(link),
      ]);
    })
    .then(() => done(null, profile))
    .catch((err) => done(err));
}));

class ApiServer extends Server {
  protected api(): void {
    this.app.get(URL_BASE, passport.authenticate('bnet'));
    this.app.get(URL_CALLBACK, passport.authenticate('bnet', { session: false }), (req, res) => {
      const uid = req.user.uid;
      firebase.auth().createCustomToken(uid)
        .then((token) => {
          res.redirect(`${ HOST_CALLBACK }?token=${ token }`);
        })
        .catch((err) => {
          res.status(500).send(err);
        });
    });
  }
}

const server = new ApiServer();
http.createServer(server.app).listen(HOST_PORT, HOST_NAME);
