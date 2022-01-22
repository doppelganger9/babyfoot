import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { BFEvent, EventPublisher, UnknownGameError } from '../../..';
import { GameAlreadyEndedError, GameIsDeletedError, MissingInitialDateTimeError } from '../errors';
import { GameCreated, GameDeleted, GameEnded, GameStarted, GameDateUpdated } from '../events';
import { Game } from '../game';
import { GameId } from '../game-id';

chai.use(chaiAsPromised);
const { expect, assert } = chai;

describe('Game', () => {
  let t: Game;
  const gameId: GameId = new GameId('game1');
  let eventsRaised: Array<any> = [];
  const date = new Date();

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

  describe('.updateInitialDateTime should', () => {
    it('emit a GameUpdated', () => {
      const history: Array<BFEvent> = [];
      history.push(new GameCreated(gameId));
      history.push(new GameStarted(new Date(), gameId));
      t = new Game(history);
      t.updateInitialDateTime(simpleEventPublisher, date);
      expect(eventsRaised.length).to.equal(1);
      expect(eventsRaised[0]).to.be.instanceof(GameDateUpdated);
    });

    it('does not emit a GameUpdated if the Game is deleted', () => {
      const history: Array<BFEvent> = [];
      history.push(new GameCreated(gameId));
      history.push(new GameDeleted(gameId));
      t = new Game(history);
      expect(() => t.updateInitialDateTime(simpleEventPublisher, date)).to.throw(GameIsDeletedError);
      expect(eventsRaised.length).to.equal(0);
    });

    it('throw error and does not emit a GameUpdated if the date is null', () => {
      const history: Array<BFEvent> = [];
      history.push(new GameCreated(gameId));
      t = new Game(history);
      expect(() => t.updateInitialDateTime(simpleEventPublisher, null)).to.throw(MissingInitialDateTimeError);
      expect(eventsRaised.length).to.equal(0);
    });

  });

  describe('.update projections should', () => {
    it('emit a GameUpdated', () => {
      const updatedInitialDateTime = new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 5);// 5 days ago.
      const history: Array<BFEvent> = [];

      history.push(new GameCreated(gameId));
      history.push(new GameStarted(new Date(), gameId));
      const tBeforeUpdate = new Game(history);
      expect(t.projection.initialDatetime).to.not.equal(updatedInitialDateTime);

      history.push(new GameDateUpdated(gameId, updatedInitialDateTime));
      t = new Game(history);
      expect(t.projection.initialDatetime).to.equal(updatedInitialDateTime);
    });
  });

});
