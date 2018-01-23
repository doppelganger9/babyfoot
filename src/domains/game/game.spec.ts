import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
const { expect, assert } = chai;
import { Game, GameId } from '.';
import { GameCreated, GameDeleted, GameEnded, GameStarted, GameUpdated, PlayerAddedToGameWithTeam, PlayerRemovedFromGame, AddedGoalFromPlayerToGame } from './events';
import { Event, EventPublisher, generateUUID } from '../..';

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

  describe('GameId', () => {
    it('When create GameId Then toString returns id', () => {
      expect(gameId.toString()).to.eql('Game:game1');
    });
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

  });
  describe('.removePlayerFromGame should', () => {
    it('not remove an unknown player from a game', () => {
      let history: Array<Event> = [];
      history.push(new GameCreated(gameId));
      t = new Game(history);
      expect(() => t.removePlayerFromGame(simpleEventPublisher, 'toto')).to.throw(Error, /unknown/);
    });
    it('remove an existing red team player from a game', () => {
      let history: Array<Event> = [];
      history.push(new GameCreated(gameId));
      history.push(new PlayerAddedToGameWithTeam('toto', 'red', gameId));
      t = new Game(history);
      t.removePlayerFromGame(simpleEventPublisher, 'toto');
      expect(eventsRaised.length).to.equal(1);
      expect(eventsRaised.pop()).to.be.an.instanceOf(PlayerRemovedFromGame);
      // projections assertions (move this in other tests dedicated to apply/projections?)
      // expect(t.players.includes('toto')).to.be.false;
      // expect(t.teamRedMembers.includes('toto')).to.be.false;
      // expect(t.teamBlueMembers.includes('toto')).to.be.false;
    });
    it('remove an existing blue team player from a game', () => {
      let history: Array<Event> = [];
      history.push(new GameCreated(gameId));
      history.push(new PlayerAddedToGameWithTeam('toto', 'blue', gameId));
      t = new Game(history);
      t.removePlayerFromGame(simpleEventPublisher, 'toto');
      expect(eventsRaised.length).to.equal(1);
      expect(eventsRaised.pop()).to.be.an.instanceOf(PlayerRemovedFromGame);
      // projections assertions (move this in other tests dedicated to apply/projections?)
      // expect(t.players.includes('toto')).to.be.false;
      // expect(t.teamRedMembers.includes('toto')).to.be.false;
      // expect(t.teamBlueMembers.includes('toto')).to.be.false;
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
      // projections assertions (move this in other tests dedicated to apply/projections?)
      // expect(t.players.includes('toto')).to.be.true;
      // expect(t.teamRedMembers.includes('toto')).to.be.true;
      // expect(t.teamBlueMembers.includes('toto')).to.be.false;
    });
    it('add a new blue player to a new game', () => {
      let history: Array<Event> = [];
      history.push(new GameCreated(gameId));
      t = new Game(history);
      t.addPlayerToGame(simpleEventPublisher, 'toto', 'blue');
      expect(eventsRaised.length).to.equal(1);
      expect(eventsRaised.pop()).to.be.an.instanceOf(PlayerAddedToGameWithTeam);
      // projections assertions (move this in other tests dedicated to apply/projections?)
      // expect(t.players.includes('toto')).to.be.true;
      // expect(t.teamBlueMembers.includes('toto')).to.be.true;
      // expect(t.teamRedMembers.includes('toto')).to.be.false;
    });
    it('not add a player to a deleted game', () => {
      let history: Array<Event> = [];
      history.push(new GameCreated(gameId));
      history.push(new GameDeleted(gameId));
      t = new Game(history);
      expect(() => t.addPlayerToGame(simpleEventPublisher, 'toto', 'blue')).to.throw(Error, /deleted/);
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
      // projections assertions (move this in other tests dedicated to apply/projections?)
      // expect(t.players.includes('toto')).to.be.true;
      // expect(t.teamBlueMembers.includes('toto')).to.be.true;
      // expect(t.teamRedMembers.includes('toto')).to.be.false;

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
      // projections assertions (move this in other tests dedicated to apply/projections?)
      // expect(t.players.includes('toto')).to.be.true;
      // expect(t.teamBlueMembers.includes('toto')).to.be.false;
      // expect(t.teamRedMembers.includes('toto')).to.be.true;

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
      //const e = history.pop();
      //expect(e).to.be.an.instanceOf(GameStarted);
      // NOTE the above test fails? why?
    });

  });
  describe('.addGoalFromPlayer should', () => {
    it("not add a point to an unknown scoring player", () => {
      let history: Array<Event> = [];
      history.push(new GameCreated(gameId));
      history.push(new GameStarted(undefined, gameId));
      t = new Game(history);
      expect(() =>
        t.addGoalFromPlayer(simpleEventPublisher, 'cédric')
      ).to.throw(Error, /unknown/);
    });
    it("not add a point to the scoring player's team if the game is deleted", () => {
      let history: Array<Event> = [];
      history.push(new GameCreated(gameId));
      history.push(new PlayerAddedToGameWithTeam('cédric', 'blue', gameId));
      history.push(new GameDeleted(gameId));
      t = new Game(history);
      expect(() =>
        t.addGoalFromPlayer(simpleEventPublisher, 'cédric')
      ).to.throw(Error, /deleted/);
    });
    it("not add a point to the scoring player's team if the game is ended", () => {
      let history: Array<Event> = [];
      history.push(new GameCreated(gameId));
      history.push(new PlayerAddedToGameWithTeam('cédric', 'blue', gameId));
      history.push(new GameStarted(undefined, gameId));
      history.push(new GameEnded(undefined, gameId));
      t = new Game(history);
      expect(() =>
        t.addGoalFromPlayer(simpleEventPublisher, 'cédric')
      ).to.throw(Error, /ended/);
    });
    it("add a point to the scoring player's team", () => {
      let history: Array<Event> = [];
      history.push(new GameCreated(gameId));
      history.push(new PlayerAddedToGameWithTeam('cédric', 'blue', gameId));
      history.push(new GameStarted(undefined, gameId));
      t = new Game(history);
      t.addGoalFromPlayer(simpleEventPublisher, 'cédric');
      expect(eventsRaised.length).to.equal(1);
      expect(eventsRaised.pop()).to.be.an.instanceOf(AddedGoalFromPlayerToGame);
      // expect(t.winner).to.equal('blue');
      // expect(t.pointsTeamBlue).to.equal(1);
      // expect(t.pointsTeamRed).to.equal(0);
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
