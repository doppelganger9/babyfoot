import { beforeEach, describe, expect, it } from 'vitest';

import { BFEvent, EventPublisher } from '../../..';
import { GameAlreadyEndedError, GameIsDeletedError } from '../errors';
import { GameCreated, GameDeleted, GameEnded, GameStarted } from '../events';
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

  describe('.endGame should', () => {
    it('emit GameEnded on an existing and started Game', () => {
      const history: Array<BFEvent> = [];
      history.push(new GameCreated(gameId));
      history.push(new GameStarted(new Date(), gameId));
      t = new Game(history);
      t.endGame(simpleEventPublisher);
      expect(eventsRaised.length).to.equal(1);
      expect(eventsRaised.pop()).to.be.an.instanceOf(GameEnded);
    });

    it('not emit GameEnded on an existing but not yet started Game', () => {
      const history: Array<BFEvent> = [];
      history.push(new GameCreated(gameId));
      t = new Game(history);
      expect(() => t.endGame(simpleEventPublisher)).to.throw(Error);
      expect(eventsRaised.length).to.equal(0);
    });
    it('not emit GameEnded on a deleted Game', () => {
      const history: Array<BFEvent> = [];
      history.push(new GameCreated(gameId));
      history.push(new GameDeleted(gameId));
      t = new Game(history);
      expect(() => t.endGame(simpleEventPublisher)).to.throw(
        GameIsDeletedError
      );
      expect(eventsRaised.length).to.equal(0);
    });
    it('not allow to end an already ended Game', () => {
      const history: Array<BFEvent> = [];
      history.push(new GameCreated(gameId));
      history.push(new GameStarted(undefined, gameId));
      history.push(new GameEnded(undefined, gameId));
      t = new Game(history);
      expect(() => t.endGame(simpleEventPublisher)).to.throw(
        GameAlreadyEndedError
      );
      expect(eventsRaised.length).to.equal(0);
    });
    it('update its duration and currentEndDatetime projections', () => {
      const history: Array<BFEvent> = [];
      history.push(new GameCreated(gameId));
      const date = new Date();
      const duration = 5000;
      const datePlusDuration = new Date(date.getTime() + duration);
      history.push(new GameStarted(date, gameId));
      history.push(new GameEnded(datePlusDuration, gameId));
      t = new Game(history);
      expect(t.projection.currentStartDatetime).to.equal(date);
      expect(t.projection.currentEndDatetime).to.equal(datePlusDuration);
      expect(t.projection.duration).to.equal(duration);
    });
  });
});
