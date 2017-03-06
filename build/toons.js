'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getToons = getToons;

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

var _config = require('config');

var _config2 = _interopRequireDefault(_config);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var GUILD_NAME = _config2.default.get('guild.guild');
var GUILD_REALM = _config2.default.get('guild.guildRealm');
function getToons(accessToken, tag) {
    return _requestPromise2.default.get('https://us.api.battle.net/wow/user/characters', {
        json: true,
        qs: { access_token: accessToken }
    }).then(function (response) {
        return _lodash2.default.chain(response.characters).filter(function (toon) {
            return toon.guild === GUILD_NAME && toon.guildRealm === GUILD_REALM;
        }).map(function (toon) {
            return _lodash2.default.extend({ tag: tag }, toon);
        }).value();
    }).then(function (toons) {
        if (toons.length === 0) return Promise.reject(new Error('Account has no toons in ' + GUILD_REALM + '/' + GUILD_NAME));
        return toons;
    });
}