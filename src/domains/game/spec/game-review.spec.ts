import { beforeEach, describe, expect, it } from 'vitest';

import { BFEvent, EventPublisher } from '../../..';
import {
  GameIsDeletedError,
  GameNotEndedError,
  IncorrectReviewStarsError,
  MissingAuthorForReviewError,
  ReviewTooLongError,
} from '../errors';
import { GameCreated, GameDeleted, GameEnded, GameStarted, SomeoneReviewedTheGame } from '../events';
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

  describe('reviewGame', () => {
    it('should emit SomeoneReviewedTheGame', () => {
      const history: Array<BFEvent> = [];
      history.push(new GameCreated(gameId));
      history.push(new GameStarted(undefined, gameId));
      history.push(new GameEnded(undefined, gameId));
      t = new Game(history);
      t.reviewGame(simpleEventPublisher, 'comment', 5, 'author');
      expect(eventsRaised.length).to.equal(1);
      expect(eventsRaised[0] instanceof SomeoneReviewedTheGame).to.be.true;
    });
    it('should emit SomeoneReviewedTheGame with no comment', () => {
      const history: Array<BFEvent> = [];
      history.push(new GameCreated(gameId));
      history.push(new GameStarted(undefined, gameId));
      history.push(new GameEnded(undefined, gameId));
      t = new Game(history);
      t.reviewGame(simpleEventPublisher, undefined, 5, 'author');
      expect(eventsRaised.length).to.equal(1);
      expect(eventsRaised[0] instanceof SomeoneReviewedTheGame).to.be.true;
    });
    it('should not emit SomeoneReviewedTheGame if stars <= 0', () => {
      const history: Array<BFEvent> = [];
      history.push(new GameCreated(gameId));
      history.push(new GameStarted(undefined, gameId));
      history.push(new GameEnded(undefined, gameId));
      t = new Game(history);
      expect(() =>
        t.reviewGame(simpleEventPublisher, 'comment', 0, 'author')
      ).to.throw(IncorrectReviewStarsError);
      expect(eventsRaised.length).to.equal(0);
    });
    it('should not emit SomeoneReviewedTheGame if stars > 5', () => {
      const history: Array<BFEvent> = [];
      history.push(new GameCreated(gameId));
      history.push(new GameStarted(undefined, gameId));
      history.push(new GameEnded(undefined, gameId));
      t = new Game(history);
      expect(() =>
        t.reviewGame(simpleEventPublisher, 'comment', 6, 'author')
      ).to.throw(IncorrectReviewStarsError);
      expect(eventsRaised.length).to.equal(0);
    });

    it('should not emit SomeoneReviewedTheGame if author is missing', () => {
      const history: Array<BFEvent> = [];
      history.push(new GameCreated(gameId));
      history.push(new GameStarted(undefined, gameId));
      history.push(new GameEnded(undefined, gameId));
      t = new Game(history);
      expect(() =>
        t.reviewGame(simpleEventPublisher, 'comment', 5, undefined)
      ).to.throw(MissingAuthorForReviewError);
      expect(eventsRaised.length).to.equal(0);
    });

    it('should not emit SomeoneReviewedTheGame if comment is too long', () => {
      const history: Array<BFEvent> = [];
      history.push(new GameCreated(gameId));
      history.push(new GameStarted(undefined, gameId));
      history.push(new GameEnded(undefined, gameId));
      t = new Game(history);
      const stringOfLength1000 = new Array(1001).join('a');
      expect(() =>
        t.reviewGame(simpleEventPublisher, stringOfLength1000, 1, 'author')
      ).to.throw(ReviewTooLongError);
      expect(eventsRaised.length).to.equal(0);
    });

    it('should not emit SomeoneReviewedTheGame if Game is deleted', () => {
      const history: Array<BFEvent> = [];
      history.push(new GameCreated(gameId));
      history.push(new GameDeleted(gameId));
      t = new Game(history);
      expect(() =>
        t.reviewGame(simpleEventPublisher, 'comment', 5, 'author')
      ).to.throw(GameIsDeletedError);
      expect(eventsRaised.length).to.equal(0);
    });

    it('should not emit SomeoneReviewedTheGame if Game is not ended', () => {
      const history: Array<BFEvent> = [];
      history.push(new GameCreated(gameId));
      history.push(new GameStarted(undefined, gameId));
      history.push(
        new GameEnded(new Date(new Date().getTime() + 1000), gameId)
      );
      t = new Game(history);
      expect(() =>
        t.reviewGame(simpleEventPublisher, 'comment', 5, 'author')
      ).to.throw(GameNotEndedError);
      expect(eventsRaised.length).to.equal(0);
    });
  });
});
