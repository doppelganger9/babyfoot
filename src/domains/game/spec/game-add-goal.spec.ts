import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';

import { Event, EventPublisher } from '../../..';
import { GameAlreadyEndedError, GameIsDeletedError, GameNotStartedError, UnknownPlayerError } from '../errors';
import { GameCreated, GameDeleted, GameEnded, GameStarted, PlayerAddedToGameWithTeam } from '../events';
import { Game } from '../game';
import { GameId } from '../game-id';

chai.use(chaiAsPromised);
const { expect, assert } = chai;
describe('Game', () => {
  let t: Game;
  const gameId: GameId = new GameId('game1');
  let eventsRaised = [];
  class SimpleEventPublisher extends EventPublisher {
    constructor() {
      super();
    }
    public publish(evt: Event): void {
      eventsRaised.push(evt);
      super.publish(evt);
    }
  }
  const simpleEventPublisher = new SimpleEventPublisher();

  beforeEach(() => {
    eventsRaised = [];
  });
  describe('addGoalFromPlayer', () => {
    it('happy path', () => {
      const history: Array<Event> = [];
      history.push(new GameCreated(gameId));
      history.push(new GameStarted(undefined, gameId));
      history.push(new PlayerAddedToGameWithTeam('player', 'red', gameId));
      t = new Game(history);
      t.addGoalFromPlayer(simpleEventPublisher, 'player');
      expect(eventsRaised.length).to.equal(1);
    });
    it('should not add a goal to a player if game is deleted', () => {
      const history: Array<Event> = [];
      history.push(new GameCreated(gameId));
      history.push(new GameStarted(undefined, gameId));
      history.push(new PlayerAddedToGameWithTeam('player', 'red', gameId));
      history.push(new GameDeleted(gameId));
      t = new Game(history);
      expect(() =>
        t.addGoalFromPlayer(simpleEventPublisher, 'player')
      ).to.throw(GameIsDeletedError);
      expect(eventsRaised.length).to.equal(0);
    });
    it('should not add a goal to a player if game is not started', () => {
      const history: Array<Event> = [];
      history.push(new GameCreated(gameId));
      t = new Game(history);
      expect(() =>
        t.addGoalFromPlayer(simpleEventPublisher, 'player')
      ).to.throw(GameNotStartedError);
      expect(eventsRaised.length).to.equal(0);
    });
    it('should not add a goal to a player if game has already ended', () => {
      const history: Array<Event> = [];
      history.push(new GameCreated(gameId));
      history.push(new GameStarted(undefined, gameId));
      history.push(new PlayerAddedToGameWithTeam('player', 'red', gameId));
      history.push(new GameEnded(undefined, gameId));
      t = new Game(history);
      expect(() =>
        t.addGoalFromPlayer(simpleEventPublisher, 'player')
      ).to.throw(GameAlreadyEndedError);
      expect(eventsRaised.length).to.equal(0);
    });
    it('should not add a goal to an unknown player', () => {
      const history: Array<Event> = [];
      history.push(new GameCreated(gameId));
      history.push(new GameStarted(undefined, gameId));
      t = new Game(history);
      expect(() =>
        t.addGoalFromPlayer(simpleEventPublisher, 'player')
      ).to.throw(UnknownPlayerError);
      expect(eventsRaised.length).to.equal(0);
    });
  });
});
