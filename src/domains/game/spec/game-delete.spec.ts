import { beforeEach, describe, expect, it } from 'vitest';

import { BFEvent, EventPublisher } from '../../..';
import { GameCreated, GameDeleted } from '../events';
import { Game } from '../game';
import { GameId } from '../game-id';

describe('Game', () => {
  let t: Game;
  const gameId: GameId = new GameId('game1');
  let eventsRaised: Array<any> = [];
  class SimpleEventPublisher extends EventPublisher {
    constructor() {
      super();
    }
    public publish(evt: BFEvent): void {
      eventsRaised.push(evt);
      super.publish(evt);
    }
  }
  const simpleEventPublisher = new SimpleEventPublisher();

  beforeEach(() => {
    eventsRaised = [];
  });
  describe('.deleteGame should', () => {
    it('emit GameDeleted', () => {
      const history: Array<BFEvent> = [];
      history.push(new GameCreated(gameId));
      t = new Game(history);
      t.deleteGame(simpleEventPublisher);
      expect(eventsRaised.length).to.equal(1);
      expect(eventsRaised[0]).to.be.instanceOf(GameDeleted);
    });
    it('not emit any GameDeleted on an already deleted Game', () => {
      const history: Array<BFEvent> = [];
      history.push(new GameCreated(gameId));
      history.push(new GameDeleted(gameId));
      t = new Game(history);
      t.deleteGame(simpleEventPublisher);
      t.deleteGame(simpleEventPublisher);
      expect(eventsRaised.length).to.equal(0);
    });
  });
});
