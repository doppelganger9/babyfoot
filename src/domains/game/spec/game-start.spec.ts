import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { BFEvent, EventPublisher } from '../../..';
import {
  GameAlreadyEndedError,
  GameAlreadyStartedError,
  GameIsDeletedError
} from '../errors';
import { GameCreated, GameDeleted, GameEnded, GameStarted } from '../events';
import { Game } from '../game';
import { GameId } from '../game-id';

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

  describe('.startGame should', () => {
    it('emit GameStarted', () => {
      const history: Array<BFEvent> = [];
      history.push(new GameCreated(gameId));
      t = new Game(history);
      t.startGame(simpleEventPublisher);
      expect(eventsRaised.length).to.equal(1);
      expect(eventsRaised.pop()).to.be.instanceOf(GameStarted);
    });
    it('not allow to start an already started Game', () => {
      const history: Array<BFEvent> = [];
      history.push(new GameCreated(gameId));
      history.push(new GameStarted(undefined, gameId));
      t = new Game(history);
      expect(() => t.startGame(simpleEventPublisher)).to.throw(
        GameAlreadyStartedError
      );
      expect(eventsRaised.length).to.equal(0);
    });
    it('not allow to start an already ended Game', () => {
      const history: Array<BFEvent> = [];
      history.push(new GameCreated(gameId));
      history.push(new GameStarted(undefined, gameId));
      history.push(new GameEnded(undefined, gameId));
      t = new Game(history);
      expect(() => t.startGame(simpleEventPublisher)).to.throw(
        GameAlreadyEndedError
      );
      expect(eventsRaised.length).to.equal(0);
    });
    it('not allow to start a deleted Game', () => {
      const history: Array<BFEvent> = [];
      history.push(new GameCreated(gameId));
      history.push(new GameDeleted(gameId));
      t = new Game(history);
      expect(() => t.startGame(simpleEventPublisher)).to.throw(
        GameIsDeletedError
      );
      expect(eventsRaised.length).to.equal(0);
    });
  });
});
