import request from 'request-promise';
import config from 'config';
import _ from 'lodash';

interface ICharacter {
  guild: string;
  guildRealm: string;
  tag: string;
}

const GUILD_NAME = config.get<string>('guild.guild');
const GUILD_REALM = config.get<string>('guild.guildRealm');

export function getToons(accessToken: string, tag: string): Promise<ICharacter[]> {
  return <any>
    request.get('https://us.api.battle.net/wow/user/characters', {
      json: true,
      qs: { access_token: accessToken },
    })
      .then((response) =>
        _.chain(<ICharacter[]>response.characters)
          .filter((toon) => toon.guild === GUILD_NAME && toon.guildRealm === GUILD_REALM)
          .map((toon) => _.extend({ tag }, toon))
          .value(),
      )
      .then((toons) => {
        if (toons.length === 0)
          return <any>Promise.reject(new Error(`Account has no toons in ${ GUILD_REALM }/${ GUILD_NAME }`));

        return toons;
      });
}
