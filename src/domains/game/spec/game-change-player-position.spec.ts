import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { BFEvent, EventPublisher } from '../../..';
import {
  GameAlreadyEndedError,
  GameIsDeletedError,
  GameNotStartedError,
  UnknownPlayerError
} from '../errors';
import {
  GameCreated,
  GameDeleted,
  GameEnded,
  GameStarted,
  PlayerAddedToGameWithTeam,
  PlayerChangedPositionOnGame
} from '../events';
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

  describe('changePlayerPositionOnGame', () => {
    it('should emit event', () => {
      const history: Array<BFEvent> = [];
      history.push(new GameCreated(gameId));
      history.push(new GameStarted(undefined, gameId));
      history.push(new PlayerAddedToGameWithTeam(new PlayerId('player'), 'red', gameId));
      t = new Game(history);
      t.changeUserPositionOnGame(simpleEventPublisher, new PlayerId('player'), 'goal');
      expect(eventsRaised.length).to.equal(1);
      expect(eventsRaised[0] instanceof PlayerChangedPositionOnGame).to.be.true;
    });
    it("should not allow to change a player's position on a deleted game", () => {
      const history: Array<BFEvent> = [];
      history.push(new GameCreated(gameId));
      history.push(new GameStarted(undefined, gameId));
      history.push(new GameDeleted(gameId));
      t = new Game(history);
      expect(() =>
        t.changeUserPositionOnGame(simpleEventPublisher, new PlayerId('player'), 'goal'),
      ).to.throw(GameIsDeletedError);
    });
    it("should not allow to change a player's on a game not yet started", () => {
      const history: Array<BFEvent> = [];
      history.push(new GameCreated(gameId));
      t = new Game(history);
      expect(() =>
        t.changeUserPositionOnGame(simpleEventPublisher, new PlayerId('player'), 'goal'),
      ).to.throw(GameNotStartedError);
    });
    it("should not allow to change a player's position on a game already ended", () => {
      const history: Array<BFEvent> = [];
      history.push(new GameCreated(gameId));
      history.push(new GameStarted(undefined, gameId));
      history.push(new GameEnded(undefined, gameId));
      t = new Game(history);
      expect(() =>
        t.changeUserPositionOnGame(simpleEventPublisher, new PlayerId('player'), 'goal'),
      ).to.throw(GameAlreadyEndedError);
    });
    it("should not allow to change an unknown player's position", () => {
      const history: Array<BFEvent> = [];
      history.push(new GameCreated(gameId));
      history.push(new GameStarted(undefined, gameId));
      t = new Game(history);
      expect(() =>
        t.changeUserPositionOnGame(simpleEventPublisher, new PlayerId('player'), 'goal'),
      ).to.throw(UnknownPlayerError);
    });
  });
});
