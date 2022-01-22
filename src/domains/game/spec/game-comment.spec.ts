import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { BFEvent, EventPublisher } from '../../..';
import {
  GameAlreadyEndedError,
  GameIsDeletedError,
  GameNotStartedError
} from '../errors';
import {
  GameCreated,
  GameDeleted,
  GameEnded,
  GameStarted,
  SomeoneAddedACommentOnGame
} from '../events';
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

  describe('commentGame', () => {
    it('should emit SomeoneAddedACommentOnGame', () => {
      const history: Array<BFEvent> = [];
      history.push(new GameCreated(gameId));
      history.push(new GameStarted(undefined, gameId));
      t = new Game(history);
      t.commentGame(simpleEventPublisher, 'comment', 'author');
      expect(eventsRaised.length).to.equal(1);
      expect(eventsRaised[0] instanceof SomeoneAddedACommentOnGame).to.be.true;
    });
    it('should not emit SomeoneAddedACommentOnGame if Game is deleted', () => {
      const history: Array<BFEvent> = [];
      history.push(new GameCreated(gameId));
      history.push(new GameDeleted(gameId));
      t = new Game(history);
      expect(() =>
        t.commentGame(simpleEventPublisher, 'comment', 'author')
      ).to.throw(GameIsDeletedError);
      expect(eventsRaised.length).to.equal(0);
    });
    it('should not emit SomeoneAddedACommentOnGame if Game is not yet started', () => {
      const history: Array<BFEvent> = [];
      history.push(new GameCreated(gameId));
      t = new Game(history);
      expect(() =>
        t.commentGame(simpleEventPublisher, 'comment', 'author')
      ).to.throw(GameNotStartedError);
      expect(eventsRaised.length).to.equal(0);
    });
    it('should not emit SomeoneAddedACommentOnGame if Game has already ended', () => {
      const history: Array<BFEvent> = [];
      history.push(new GameCreated(gameId));
      history.push(new GameStarted(undefined, gameId));
      history.push(new GameEnded(undefined, gameId));
      t = new Game(history);
      expect(() =>
        t.commentGame(simpleEventPublisher, 'comment', 'author')
      ).to.throw(GameAlreadyEndedError);
      expect(eventsRaised.length).to.equal(0);
    });
  });
});
