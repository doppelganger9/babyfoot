import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { BFEvent, EventPublisher } from '../../..';
import { GameAlreadyEndedError, GameIsDeletedError, GameNotStartedError, UnknownPlayerError } from '../errors';
import { GameCreated, GameDeleted, GameEnded, GameStarted, PlayerAddedToGameWithTeam } from '../events';
import { Game } from '../game';
import { GameId } from '../game-id';
import { PlayerId } from '../../player';

chai.use(chaiAsPromised);
const { expect, assert } = chai;
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
  describe('addGoalFromPlayer', () => {
    it('happy path', () => {
      const history: Array<BFEvent> = [];
      history.push(new GameCreated(gameId));
      history.push(new GameStarted(undefined, gameId));
      history.push(new PlayerAddedToGameWithTeam(new PlayerId('player'), 'red', gameId));
      t = new Game(history);
      t.addGoalFromPlayer(simpleEventPublisher, new PlayerId('player'));
      expect(eventsRaised.length).to.equal(1);
    });
    it('should not add a goal to a player if game is deleted', () => {
      const history: Array<BFEvent> = [];
      history.push(new GameCreated(gameId));
      history.push(new GameStarted(undefined, gameId));
      history.push(new PlayerAddedToGameWithTeam(new PlayerId('player'), 'red', gameId));
      history.push(new GameDeleted(gameId));
      t = new Game(history);
      expect(() =>
        t.addGoalFromPlayer(simpleEventPublisher, new PlayerId('player'))
      ).to.throw(GameIsDeletedError);
      expect(eventsRaised.length).to.equal(0);
    });
    it('should not add a goal to a player if game is not started', () => {
      const history: Array<BFEvent> = [];
      history.push(new GameCreated(gameId));
      t = new Game(history);
      expect(() =>
        t.addGoalFromPlayer(simpleEventPublisher, new PlayerId('player'))
      ).to.throw(GameNotStartedError);
      expect(eventsRaised.length).to.equal(0);
    });
    it('should not add a goal to a player if game has already ended', () => {
      const history: Array<BFEvent> = [];
      history.push(new GameCreated(gameId));
      history.push(new GameStarted(undefined, gameId));
      history.push(new PlayerAddedToGameWithTeam(new PlayerId('player'), 'red', gameId));
      history.push(new GameEnded(undefined, gameId));
      t = new Game(history);
      expect(() =>
        t.addGoalFromPlayer(simpleEventPublisher, new PlayerId('player'))
      ).to.throw(GameAlreadyEndedError);
      expect(eventsRaised.length).to.equal(0);
    });
    it('should not add a goal to an unknown player', () => {
      const history: Array<BFEvent> = [];
      history.push(new GameCreated(gameId));
      history.push(new GameStarted(undefined, gameId));
      t = new Game(history);
      expect(() =>
        t.addGoalFromPlayer(simpleEventPublisher, new PlayerId('player'))
      ).to.throw(UnknownPlayerError);
      expect(eventsRaised.length).to.equal(0);
    });
  });
});
