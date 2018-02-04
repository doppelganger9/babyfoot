import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
const { expect, assert } = chai;
import { Game } from './game';
import { GameId, Player, TeamColors, PositionValue } from './game-id';
import {
  GameCreated,
  GameDeleted,
  GameEnded,
  GameStarted,
  GameUpdated,
  PlayerAddedToGameWithTeam,
  PlayerRemovedFromGame,
  AddedGoalFromPlayerToGame,
  PlayerChangedPositionOnGame,
  SomeoneAddedACommentOnGame,
  SomeoneReviewedTheGame,
} from './events';
import {
  Event,
  EventPublisher,
  generateUUID,
} from '../..';
import {
  GameAlreadyEndedError,
  GameAlreadyStartedError,
  GameIsDeletedError,
  GameNotStartedError,
  UnknownPlayerError,
  IncorrectReviewStarsError,
  MissingAuthorForReviewError,
  ReviewTooLongError,
  GameNotEndedError
} from './errors';

describe('Game', () => {
  let t: Game;
  const gameId: GameId = new GameId('game1');
  let eventsRaised = [];
  class SimpleEventPublisher extends EventPublisher {
    constructor() {
      super();
    }
    publish(evt: Event): void {
      eventsRaised.push(evt);
      super.publish(evt);
    }
  }
  const simpleEventPublisher = new SimpleEventPublisher();

  beforeEach(() => {
    eventsRaised = [];
  });

  describe('.create should', () => {
    it('create an instance from history', () => {
      t = new Game([]);
      expect(t).not.to.be.null;
      expect(t).not.to.be.undefined;
    });
  });

  describe('.createGame should', () => {
    it('emit GameCreated', () => {
      Game.createGame(simpleEventPublisher, generateUUID());
      expect(eventsRaised.length).to.equal(1);
      expect(eventsRaised[0]).to.be.instanceOf(GameCreated);
    });
  });

  describe('.deleteGame should', () => {
    it('emit GameDeleted', () => {
      let history: Array<Event> = [];
      history.push(new GameCreated(gameId));
      t = new Game(history);
      t.deleteGame(simpleEventPublisher);
      expect(eventsRaised.length).to.equal(1);
      expect(eventsRaised[0]).to.be.instanceOf(GameDeleted);
    });
    it('not emit any GameDeleted on an already deleted Game', () => {
      let history: Array<Event> = [];
      history.push(new GameCreated(gameId));
      history.push(new GameDeleted(gameId));
      t = new Game(history);
      t.deleteGame(simpleEventPublisher);
      t.deleteGame(simpleEventPublisher);
      expect(eventsRaised.length).to.equal(0);
    });
  });

  describe('.startGame should', () => {
    it('emit GameStarted', () => {
      let history: Array<Event> = [];
      history.push(new GameCreated(gameId));
      t = new Game(history);
      t.startGame(simpleEventPublisher);
      expect(eventsRaised.length).to.equal(1);
      expect(eventsRaised.pop()).to.be.instanceOf(GameStarted);
    });
    it('not allow to start an already started Game', () => {
      let history: Array<Event> = [];
      history.push(new GameCreated(gameId));
      history.push(new GameStarted(undefined, gameId));
      t = new Game(history);
      expect(() => t.startGame(simpleEventPublisher)).to.throw(
        GameAlreadyStartedError
      );
      expect(eventsRaised.length).to.equal(0);
    });
    it('not allow to start an already ended Game', () => {
      let history: Array<Event> = [];
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
      let history: Array<Event> = [];
      history.push(new GameCreated(gameId));
      history.push(new GameDeleted(gameId));
      t = new Game(history);
      expect(() => t.startGame(simpleEventPublisher)).to.throw(
        GameIsDeletedError
      );
      expect(eventsRaised.length).to.equal(0);
    });
  });
  describe('.removePlayerFromGame should', () => {
    it('not remove an unknown player from a game', () => {
      let history: Array<Event> = [];
      history.push(new GameCreated(gameId));
      t = new Game(history);
      expect(() =>
        t.removePlayerFromGame(simpleEventPublisher, 'toto')
      ).to.throw(Error, /unknown/);
    });
    it('not remove a player from a deleted game', () => {
      let history: Array<Event> = [];
      history.push(new GameCreated(gameId));
      history.push(new GameDeleted(gameId));
      t = new Game(history);
      expect(() =>
        t.removePlayerFromGame(simpleEventPublisher, 'toto')
      ).to.throw(GameIsDeletedError);
    });
    it('not remove a player from an already ended game', () => {
      let history: Array<Event> = [];
      history.push(new GameCreated(gameId));
      history.push(new GameStarted(undefined, gameId));
      history.push(new GameEnded(undefined, gameId));
      t = new Game(history);
      expect(() =>
        t.removePlayerFromGame(simpleEventPublisher, 'toto')
      ).to.throw(GameAlreadyEndedError);
    });
    it('remove an existing red team player from a game', () => {
      let history: Array<Event> = [];
      history.push(new GameCreated(gameId));
      history.push(new PlayerAddedToGameWithTeam('toto', 'red', gameId));
      t = new Game(history);
      t.removePlayerFromGame(simpleEventPublisher, 'toto');
      expect(eventsRaised.length).to.equal(1);
      expect(eventsRaised.pop()).to.be.an.instanceOf(PlayerRemovedFromGame);
    });
    it('should remove the red player from decision projections', () => {
      let history: Array<Event> = [];
      history.push(new GameCreated(gameId));
      history.push(new PlayerAddedToGameWithTeam('toto', 'red', gameId));
      history.push(new PlayerRemovedFromGame('toto', gameId));
      t = new Game(history);
      expect(t.players.includes('toto')).to.be.false;
      expect(t.teamRedMembers.includes('toto')).to.be.false;
      expect(t.teamBlueMembers.includes('toto')).to.be.false;
    });
    it('should remove the blue player from decision projections', () => {
      let history: Array<Event> = [];
      history.push(new GameCreated(gameId));
      history.push(new PlayerAddedToGameWithTeam('toto', 'blue', gameId));
      history.push(new PlayerRemovedFromGame('toto', gameId));
      t = new Game(history);
      expect(t.players.includes('toto')).to.be.false;
      expect(t.teamRedMembers.includes('toto')).to.be.false;
      expect(t.teamBlueMembers.includes('toto')).to.be.false;
    });
    it('remove an existing blue team player from a game', () => {
      let history: Array<Event> = [];
      history.push(new GameCreated(gameId));
      history.push(new PlayerAddedToGameWithTeam('toto', 'blue', gameId));
      t = new Game(history);
      t.removePlayerFromGame(simpleEventPublisher, 'toto');
      expect(eventsRaised.length).to.equal(1);
      expect(eventsRaised.pop()).to.be.an.instanceOf(PlayerRemovedFromGame);
    });
  });
  describe('.addPlayerToGameWithTeam should', () => {
    it('add a new red player to a new game', () => {
      let history: Array<Event> = [];
      history.push(new GameCreated(gameId));
      t = new Game(history);
      t.addPlayerToGame(simpleEventPublisher, 'toto', 'red');
      expect(eventsRaised.length).to.equal(1);
      expect(eventsRaised.pop()).to.be.an.instanceOf(PlayerAddedToGameWithTeam);
    });
    it('should update the decision projection to add the red player', () => {
      let history: Array<Event> = [];
      history.push(new GameCreated(gameId));
      history.push(new PlayerAddedToGameWithTeam('toto', 'red', gameId));
      t = new Game(history);
      // projections assertions (move this in other tests dedicated to apply/projections?)
      expect(t.players.includes('toto')).to.be.true;
      expect(t.teamRedMembers.includes('toto')).to.be.true;
      expect(t.teamBlueMembers.includes('toto')).to.be.false;
    });
    it('should not update the decision projection to add the red player if it is already in this team', () => {
      let history: Array<Event> = [];
      history.push(new GameCreated(gameId));
      history.push(new PlayerAddedToGameWithTeam('toto', 'red', gameId));
      history.push(new PlayerAddedToGameWithTeam('toto', 'red', gameId));
      t = new Game(history);
      // projections assertions (move this in other tests dedicated to apply/projections?)
      expect(t.players.includes('toto')).to.be.true;
      expect(t.players.length).to.equal(1);
      expect(t.teamRedMembers.length).to.equal(1);
      expect(t.teamRedMembers.includes('toto')).to.be.true;
      expect(t.teamBlueMembers.length).to.equal(0);
      expect(t.teamBlueMembers.includes('toto')).to.be.false;
    });

    it('add a new blue player to a new game', () => {
      let history: Array<Event> = [];
      history.push(new GameCreated(gameId));
      t = new Game(history);
      t.addPlayerToGame(simpleEventPublisher, 'toto', 'blue');
      expect(eventsRaised.length).to.equal(1);
      expect(eventsRaised.pop()).to.be.an.instanceOf(PlayerAddedToGameWithTeam);
    });
    it('should update the decision projection to add the blue player', () => {
      let history: Array<Event> = [];
      history.push(new GameCreated(gameId));
      history.push(new PlayerAddedToGameWithTeam('toto', 'blue', gameId));
      t = new Game(history);
      // projections assertions (move this in other tests dedicated to apply/projections?)
      expect(t.players.includes('toto')).to.be.true;
      expect(t.teamRedMembers.includes('toto')).to.be.false;
      expect(t.teamBlueMembers.includes('toto')).to.be.true;
    });
    it('should not update the decision projection to add the blue player if it is already in this team', () => {
      let history: Array<Event> = [];
      history.push(new GameCreated(gameId));
      history.push(new PlayerAddedToGameWithTeam('toto', 'blue', gameId));
      history.push(new PlayerAddedToGameWithTeam('toto', 'blue', gameId));
      t = new Game(history);
      // projections assertions (move this in other tests dedicated to apply/projections?)
      expect(t.players.includes('toto')).to.be.true;
      expect(t.players.length).to.equal(1);
      expect(t.teamRedMembers.length).to.equal(0);
      expect(t.teamRedMembers.includes('toto')).to.be.false;
      expect(t.teamBlueMembers.length).to.equal(1);
      expect(t.teamBlueMembers.includes('toto')).to.be.true;
    });

    it('not add a player to a deleted game', () => {
      let history: Array<Event> = [];
      history.push(new GameCreated(gameId));
      history.push(new GameDeleted(gameId));
      t = new Game(history);
      expect(() =>
        t.addPlayerToGame(simpleEventPublisher, 'toto', 'blue')
      ).to.throw(Error, /deleted/);
    });
    it('not add a player to a game that is ended', () => {
      let history: Array<Event> = [];
      history.push(new GameCreated(gameId));
      history.push(new GameStarted(undefined, gameId));
      history.push(new GameEnded(undefined, gameId));
      t = new Game(history);
      expect(() =>
        t.addPlayerToGame(simpleEventPublisher, 'toto', 'blue')
      ).to.throw(Error, /ended/);
    });
    it('not add a red player previously added to the red team', () => {
      let history: Array<Event> = [];
      history.push(new GameCreated(gameId));
      history.push(new PlayerAddedToGameWithTeam('toto', 'red', gameId));
      t = new Game(history);
      expect(() =>
        t.addPlayerToGame(simpleEventPublisher, 'toto', 'red')
      ).to.throw(Error, /already/);
    });
    it('not add a blue player previously added to the blue team', () => {
      let history: Array<Event> = [];
      history.push(new GameCreated(gameId));
      history.push(new PlayerAddedToGameWithTeam('toto', 'blue', gameId));
      t = new Game(history);
      expect(() =>
        t.addPlayerToGame(simpleEventPublisher, 'toto', 'blue')
      ).to.throw(Error, /already/);
    });
    it('switch team for a player previously added to other team (blue to red)', () => {
      let history: Array<Event> = [];
      history.push(new GameCreated(gameId));
      history.push(new PlayerAddedToGameWithTeam('toto', 'red', gameId));
      t = new Game(history);
      expect(t.players.includes('toto')).to.be.true;
      expect(t.teamBlueMembers.includes('toto')).to.be.false;
      expect(t.teamRedMembers.includes('toto')).to.be.true;

      t.addPlayerToGame(simpleEventPublisher, 'toto', 'blue');

      expect(eventsRaised.length).to.equal(1);
      expect(eventsRaised.pop()).to.be.an.instanceOf(PlayerAddedToGameWithTeam);
    });
    it('update projections when switching team for a player previously added to other team (blue to red)', () => {
      let history: Array<Event> = [];
      history.push(new GameCreated(gameId));
      history.push(new PlayerAddedToGameWithTeam('toto', 'red', gameId));
      history.push(new PlayerAddedToGameWithTeam('toto', 'blue', gameId));
      t = new Game(history);
      // projections assertions (move this in other tests dedicated to apply/projections?)
      expect(t.players.includes('toto')).to.be.true;
      expect(t.teamBlueMembers.includes('toto')).to.be.true;
      expect(t.teamRedMembers.includes('toto')).to.be.false;
    });
    it('switch team for a player previously added to other team (red to blue)', () => {
      let history: Array<Event> = [];
      history.push(new GameCreated(gameId));
      history.push(new PlayerAddedToGameWithTeam('toto', 'blue', gameId));
      t = new Game(history);
      expect(t.players.includes('toto')).to.be.true;
      expect(t.teamBlueMembers.includes('toto')).to.be.true;
      expect(t.teamRedMembers.includes('toto')).to.be.false;

      t.addPlayerToGame(simpleEventPublisher, 'toto', 'red');

      expect(eventsRaised.length).to.equal(1);
      expect(eventsRaised.pop()).to.be.an.instanceOf(PlayerAddedToGameWithTeam);
    });

    it('switch team for a player previously added to other team (red to blue)', () => {
      let history: Array<Event> = [];
      history.push(new GameCreated(gameId));
      history.push(new PlayerAddedToGameWithTeam('toto', 'blue', gameId));
      history.push(new PlayerAddedToGameWithTeam('toto', 'red', gameId));
      t = new Game(history);
      expect(t.players.includes('toto')).to.be.true;
      expect(t.teamBlueMembers.includes('toto')).to.be.false;
      expect(t.teamRedMembers.includes('toto')).to.be.true;
    });
    it('not add a player more than once in the players list', () => {
      let history: Array<Event> = [];
      history.push(new GameCreated(gameId));
      history.push(new PlayerAddedToGameWithTeam('toto', 'blue', gameId));
      history.push(new PlayerAddedToGameWithTeam('toto', 'red', gameId));
      t = new Game(history);
      expect(t.players.includes('toto')).to.be.true;
      expect(t.players.length).to.be.equal(1);
      expect(t.teamBlueMembers.includes('toto')).to.be.false;
      expect(t.teamRedMembers.includes('toto')).to.be.true;
    });
  });

  describe('.endGame should', () => {
    it('emit GameEnded on an existing and started Game', () => {
      let history: Array<Event> = [];
      history.push(new GameCreated(gameId));
      history.push(new GameStarted(new Date(), gameId));
      t = new Game(history);
      t.endGame(simpleEventPublisher);
      expect(eventsRaised.length).to.equal(1);
      expect(eventsRaised.pop()).to.be.an.instanceOf(GameEnded);
    });

    it('not emit GameEnded on an existing but not yet started Game', () => {
      let history: Array<Event> = [];
      history.push(new GameCreated(gameId));
      t = new Game(history);
      expect(() => t.endGame(simpleEventPublisher)).to.throw(Error);
      expect(eventsRaised.length).to.equal(0);
    });
    it('not emit GameEnded on a deleted Game', () => {
      let history: Array<Event> = [];
      history.push(new GameCreated(gameId));
      history.push(new GameDeleted(gameId));
      t = new Game(history);
      expect(() => t.endGame(simpleEventPublisher)).to.throw(
        GameIsDeletedError
      );
      expect(eventsRaised.length).to.equal(0);
    });
    it('not allow to end an already ended Game', () => {
      let history: Array<Event> = [];
      history.push(new GameCreated(gameId));
      history.push(new GameStarted(undefined, gameId));
      history.push(new GameEnded(undefined, gameId));
      t = new Game(history);
      expect(() => t.endGame(simpleEventPublisher)).to.throw(
        GameAlreadyEndedError
      );
      expect(eventsRaised.length).to.equal(0);
    });
  });
  describe('addGoalFromPlayer', () => {
    it('happy path', () => {
      let history: Array<Event> = [];
      history.push(new GameCreated(gameId));
      history.push(new GameStarted(undefined, gameId));
      history.push(new PlayerAddedToGameWithTeam('player', 'red', gameId));
      t = new Game(history);
      t.addGoalFromPlayer(simpleEventPublisher, 'player');
      expect(eventsRaised.length).to.equal(1);
    });
    it('should not add a goal to a player if game is deleted', () => {
      let history: Array<Event> = [];
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
      let history: Array<Event> = [];
      history.push(new GameCreated(gameId));
      t = new Game(history);
      expect(() =>
        t.addGoalFromPlayer(simpleEventPublisher, 'player')
      ).to.throw(GameNotStartedError);
      expect(eventsRaised.length).to.equal(0);
    });
    it('should not add a goal to a player if game has already ended', () => {
      let history: Array<Event> = [];
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
      let history: Array<Event> = [];
      history.push(new GameCreated(gameId));
      history.push(new GameStarted(undefined, gameId));
      t = new Game(history);
      expect(() =>
        t.addGoalFromPlayer(simpleEventPublisher, 'player')
      ).to.throw(UnknownPlayerError);
      expect(eventsRaised.length).to.equal(0);
    });
  });
  describe('changePlayerPositionOnGame', () => {
    it('should emit event', () => {
      let history: Array<Event> = [];
      history.push(new GameCreated(gameId));
      history.push(new GameStarted(undefined, gameId));
      history.push(new PlayerAddedToGameWithTeam('player', 'red', gameId));
      t = new Game(history);
      t.changeUserPositionOnGame(simpleEventPublisher, 'player', 'goal');
      expect(eventsRaised.length).to.equal(1);
      expect(eventsRaised[0] instanceof PlayerChangedPositionOnGame).to.be.true;
    });
    it("should not allow to change a player's position on a deleted game", () => {
      let history: Array<Event> = [];
      history.push(new GameCreated(gameId));
      history.push(new GameStarted(undefined, gameId));
      history.push(new GameDeleted(gameId));
      t = new Game(history);
      expect(() =>
        t.changeUserPositionOnGame(simpleEventPublisher, 'player', 'goal')
      ).to.throw(GameIsDeletedError);
    });
    it("should not allow to change a player's on a game not yet started", () => {
      let history: Array<Event> = [];
      history.push(new GameCreated(gameId));
      t = new Game(history);
      expect(() =>
        t.changeUserPositionOnGame(simpleEventPublisher, 'player', 'goal')
      ).to.throw(GameNotStartedError);
    });
    it("should not allow to change a player's position on a game already ended", () => {
      let history: Array<Event> = [];
      history.push(new GameCreated(gameId));
      history.push(new GameStarted(undefined, gameId));
      history.push(new GameEnded(undefined, gameId));
      t = new Game(history);
      expect(() =>
        t.changeUserPositionOnGame(simpleEventPublisher, 'player', 'goal')
      ).to.throw(GameAlreadyEndedError);
    });
    it("should not allow to change an unknown player's position", () => {
      let history: Array<Event> = [];
      history.push(new GameCreated(gameId));
      history.push(new GameStarted(undefined, gameId));
      t = new Game(history);
      expect(() =>
        t.changeUserPositionOnGame(simpleEventPublisher, 'player', 'goal')
      ).to.throw(UnknownPlayerError);
    });
  });
  describe('commentGame', () => {
    it('should emit SomeoneAddedACommentOnGame', () => {
      let history: Array<Event> = [];
      history.push(new GameCreated(gameId));
      history.push(new GameStarted(undefined, gameId));
      t = new Game(history);
      t.commentGame(simpleEventPublisher, 'comment', 'author');
      expect(eventsRaised.length).to.equal(1);
      expect(eventsRaised[0] instanceof SomeoneAddedACommentOnGame).to.be.true;
    });
    it('should not emit SomeoneAddedACommentOnGame if Game is deleted', () => {
      let history: Array<Event> = [];
      history.push(new GameCreated(gameId));
      history.push(new GameDeleted(gameId));
      t = new Game(history);
      expect(() =>
        t.commentGame(simpleEventPublisher, 'comment', 'author')
      ).to.throw(GameIsDeletedError);
      expect(eventsRaised.length).to.equal(0);
    });
    it('should not emit SomeoneAddedACommentOnGame if Game is not yet started', () => {
      let history: Array<Event> = [];
      history.push(new GameCreated(gameId));
      t = new Game(history);
      expect(() =>
        t.commentGame(simpleEventPublisher, 'comment', 'author')
      ).to.throw(GameNotStartedError);
      expect(eventsRaised.length).to.equal(0);
    });
    it('should not emit SomeoneAddedACommentOnGame if Game has already ended', () => {
      let history: Array<Event> = [];
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
  describe('reviewGame', () => {
    it('should emit SomeoneReviewedTheGame', () => {
      let history: Array<Event> = [];
      history.push(new GameCreated(gameId));
      history.push(new GameStarted(undefined, gameId));
      history.push(new GameEnded(undefined, gameId));
      t = new Game(history);
      t.reviewGame(simpleEventPublisher, 'comment', 5, 'author');
      expect(eventsRaised.length).to.equal(1);
      expect(eventsRaised[0] instanceof SomeoneReviewedTheGame).to.be.true;
    });
    it('should emit SomeoneReviewedTheGame with no comment', () => {
      let history: Array<Event> = [];
      history.push(new GameCreated(gameId));
      history.push(new GameStarted(undefined, gameId));
      history.push(new GameEnded(undefined, gameId));
      t = new Game(history);
      t.reviewGame(simpleEventPublisher, undefined, 5, 'author');
      expect(eventsRaised.length).to.equal(1);
      expect(eventsRaised[0] instanceof SomeoneReviewedTheGame).to.be.true;
    });
    it('should not emit SomeoneReviewedTheGame if stars <= 0', () => {
      let history: Array<Event> = [];
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
      let history: Array<Event> = [];
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
      let history: Array<Event> = [];
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
      let history: Array<Event> = [];
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
      let history: Array<Event> = [];
      history.push(new GameCreated(gameId));
      history.push(new GameDeleted(gameId));
      t = new Game(history);
      expect(() =>
        t.reviewGame(simpleEventPublisher, 'comment', 5, 'author')
      ).to.throw(GameIsDeletedError);
      expect(eventsRaised.length).to.equal(0);
    });

    it('should not emit SomeoneReviewedTheGame if Game is not ended', () => {
      let history: Array<Event> = [];
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
  describe('happy path', () => {
    it('should work from event history', () => {
      let history: Array<Event> = [];
      history.push(new GameCreated(gameId));
      history.push(new PlayerAddedToGameWithTeam('cédric', 'blue', gameId));
      history.push(new PlayerAddedToGameWithTeam('david', 'blue', gameId));
      history.push(new PlayerAddedToGameWithTeam('franck', 'red', gameId));
      history.push(new PlayerAddedToGameWithTeam('gaëlle', 'red', gameId));
      history.push(new GameStarted(undefined, gameId));
      history.push(new AddedGoalFromPlayerToGame('cédric', gameId));
      history.push(new AddedGoalFromPlayerToGame('franck', gameId));
      history.push(new AddedGoalFromPlayerToGame('franck', gameId));
      history.push(new AddedGoalFromPlayerToGame('cédric', gameId));
      history.push(new AddedGoalFromPlayerToGame('franck', gameId));
      history.push(new AddedGoalFromPlayerToGame('gaëlle', gameId));
      history.push(new AddedGoalFromPlayerToGame('cédric', gameId));
      history.push(new AddedGoalFromPlayerToGame('cédric', gameId));
      history.push(new AddedGoalFromPlayerToGame('david', gameId));
      history.push(new AddedGoalFromPlayerToGame('cédric', gameId));
      history.push(new AddedGoalFromPlayerToGame('cédric', gameId));
      history.push(new AddedGoalFromPlayerToGame('cédric', gameId));
      history.push(new AddedGoalFromPlayerToGame('cédric', gameId));
      history.push(new AddedGoalFromPlayerToGame('franck', gameId));
      history.push(new AddedGoalFromPlayerToGame('cédric', gameId));
      history.push(new GameEnded(undefined, gameId));
      t = new Game(history);
      expect(t.winner).to.equal('blue');
      expect(t.pointsTeamBlue).to.equal(10);
      expect(t.pointsTeamRed).to.equal(5);
    });
  });
});
