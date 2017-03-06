'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _config = require('config');

var _config2 = _interopRequireDefault(_config);

var _passport = require('passport');

var _passport2 = _interopRequireDefault(_passport);

var _passportBnet = require('passport-bnet');

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _firebaseAdmin = require('firebase-admin');

var _firebaseAdmin2 = _interopRequireDefault(_firebaseAdmin);

var _express = require('./express');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BNET_ID = _config2.default.get('bnet.id');
var BNET_SECRET = _config2.default.get('bnet.secret');
var BNET_CALLBACK = _config2.default.get('bnet.callback');
var HOST_NAME = _config2.default.get('server.host');
var HOST_PORT = _config2.default.get('server.port');
var HOST_CALLBACK = _config2.default.get('server.callback');
var URL_BASE = _config2.default.get('urls.base');
var URL_CALLBACK = _config2.default.get('urls.callback');
var FIREBASE_DB = _config2.default.get('firebase.databaseURL');
var FIREBASE_CREDENTIAL = _config2.default.get('firebase.credentials');
_firebaseAdmin2.default.initializeApp({
    databaseURL: FIREBASE_DB,
    credential: _firebaseAdmin2.default.credential.cert(FIREBASE_CREDENTIAL)
});
_passport2.default.use(new _passportBnet.Strategy({
    clientID: BNET_ID,
    clientSecret: BNET_SECRET,
    callbackURL: BNET_CALLBACK,
    region: 'us',
    scope: 'wow.profile'
}, function (accessToken, refreshToken, profile, done) {
    return done(null, profile);
}));

var ApiServer = function (_Server) {
    _inherits(ApiServer, _Server);

    function ApiServer() {
        _classCallCheck(this, ApiServer);

        return _possibleConstructorReturn(this, (ApiServer.__proto__ || Object.getPrototypeOf(ApiServer)).apply(this, arguments));
    }

    _createClass(ApiServer, [{
        key: 'api',
        value: function api() {
            this.app.get(URL_BASE, _passport2.default.authenticate('bnet'));
            this.app.get(URL_CALLBACK, _passport2.default.authenticate('bnet', { session: false }), function (req, res) {
                var tag = req.user.battletag;
                _firebaseAdmin2.default.auth().createCustomToken('bt|' + tag).then(function (token) {
                    res.redirect(HOST_CALLBACK + '?token=' + token);
                }).catch(function (err) {
                    res.status(500).send(err);
                });
            });
        }
    }]);

    return ApiServer;
}(_express.Server);

var server = new ApiServer();
_http2.default.createServer(server.app).listen(HOST_PORT, HOST_NAME);