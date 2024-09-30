import { describe, expect, it } from 'vitest';

import { GameId } from '../game-id';

describe('GameId', () => {
  it('When create GameId Then toString returns id', () => {
    const gameId: GameId = new GameId('game1');
    expect(gameId.toString()).to.eql('Game:game1');
  });
});
