import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';

import { GameId } from './game-id';

chai.use(chaiAsPromised);
const { expect, assert } = chai;

describe('GameId', () => {
  it('When create GameId Then toString returns id', () => {
    const gameId: GameId = new GameId('game1');
    expect(gameId.toString()).to.eql('Game:game1');
  });
});
