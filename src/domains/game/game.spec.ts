import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
const { expect, assert } = chai;
import { Game } from '.';
import { Event, GameCreated, GameDeleted, GameEnded, GameStarted, GameUpdated, PlayerAddedToGameWithTeam, PlayerRemovedFromGame, AddedGoalFromPlayerToGame } from './events';

describe('Game', () => {
  let t: Game;

  describe('.createGame should', () => {
    it('emit GameCreated', () => {
      let history: Array<Event> = [];
      t = Game.createGame(history);
      expect(t).not.to.be.null;
      expect(t).not.to.be.undefined;
      expect(history.length).to.equal(1);
      expect(history.pop()).to.be.instanceOf(GameCreated);
    });
  });

  describe('.deleteGame should', () => {
    it('emit GameDeleted', () => {
      let history: Array<Event> = [];
      history.push(new GameCreated());
      t = new Game(history);
      t.deleteGame(history);
      expect(history.length).to.equal(2);
      expect(history.pop()).to.be.instanceOf(GameDeleted);
    });
    it('not emit GameDeleted on an already deleted Game', () => {
      let history: Array<Event> = [];
      history.push(new GameCreated());
      t = new Game(history);
      t.deleteGame(history);
      t.deleteGame(history);
      expect(history.length).to.equal(2);
      expect(history.pop()).to.be.instanceOf(GameDeleted);
    });

  });

  describe('.startGame should', () => {

    it('emit GameStarted', () => {
      let history: Array<Event> = [];
      history.push(new GameCreated());
      t = new Game(history);
      t.startGame(history);
      expect(history.length).to.equal(2);
      expect(history.pop()).to.be.instanceOf(GameStarted);
    });

  });
  describe('.removePlayerFromGame should', () => {
    it('not remove an unknown player from a game', () => {
      let history: Array<Event> = [];
      history.push(new GameCreated());
      t = new Game(history);
      expect(() => t.removePlayerFromGame(history, 'toto')).to.throw(Error, /unknown/);
    });
    it('remove an existing red team player from a game', () => {
      let history: Array<Event> = [];
      history.push(new GameCreated());
      history.push(new PlayerAddedToGameWithTeam('toto', 'red'));
      t = new Game(history);
      t.removePlayerFromGame(history, 'toto');
      expect(history.length).to.equal(3);
      expect(history.pop()).to.be.an.instanceOf(PlayerRemovedFromGame);
      // projections assertions (move this in other tests dedicated to apply/projections?)
      expect(t.players.includes('toto')).to.be.false;
      expect(t.teamRedMembers.includes('toto')).to.be.false;
      expect(t.teamBlueMembers.includes('toto')).to.be.false;
    });
    it('remove an existing blue team player from a game', () => {
      let history: Array<Event> = [];
      history.push(new GameCreated());
      history.push(new PlayerAddedToGameWithTeam('toto', 'blue'));
      t = new Game(history);
      t.removePlayerFromGame(history, 'toto');
      expect(history.length).to.equal(3);
      expect(history.pop()).to.be.an.instanceOf(PlayerRemovedFromGame);
      // projections assertions (move this in other tests dedicated to apply/projections?)
      expect(t.players.includes('toto')).to.be.false;
      expect(t.teamRedMembers.includes('toto')).to.be.false;
      expect(t.teamBlueMembers.includes('toto')).to.be.false;
    });
  });
  describe('.addPlayerToGameWithTeam should', () => {
    it('add a new red player to a new game', () => {
      let history: Array<Event> = [];
      history.push(new GameCreated());
      t = new Game(history);
      t.addPlayerToGame(history, 'toto', 'red');
      expect(history.length).to.equal(2);
      expect(history.pop()).to.be.an.instanceOf(PlayerAddedToGameWithTeam);
      // projections assertions (move this in other tests dedicated to apply/projections?)
      expect(t.players.includes('toto')).to.be.true;
      expect(t.teamRedMembers.includes('toto')).to.be.true;
      expect(t.teamBlueMembers.includes('toto')).to.be.false;
    });
    it('add a new blue player to a new game', () => {
      let history: Array<Event> = [];
      history.push(new GameCreated());
      t = new Game(history);
      t.addPlayerToGame(history, 'toto', 'blue');
      expect(history.length).to.equal(2);
      expect(history.pop()).to.be.an.instanceOf(PlayerAddedToGameWithTeam);
      // projections assertions (move this in other tests dedicated to apply/projections?)
      expect(t.players.includes('toto')).to.be.true;
      expect(t.teamBlueMembers.includes('toto')).to.be.true;
      expect(t.teamRedMembers.includes('toto')).to.be.false;
    });
    it('not add a player to a deleted game', () => {
      let history: Array<Event> = [];
      history.push(new GameCreated());
      history.push(new GameDeleted());
      t = new Game(history);
      expect(() => t.addPlayerToGame(history, 'toto', 'blue')).to.throw(Error, /deleted/);
    });
    it('not add a player to a game that is ended', () => {
      let history: Array<Event> = [];
      history.push(new GameCreated());
      history.push(new GameStarted());
      history.push(new GameEnded());
      t = new Game(history);
      expect(() =>
        t.addPlayerToGame(history, 'toto', 'blue')
      ).to.throw(Error, /ended/);
    });
    it('not add a red player previously added to the red team', () => {
      let history: Array<Event> = [];
      history.push(new GameCreated());
      history.push(new PlayerAddedToGameWithTeam('toto', 'red'));
      t = new Game(history);
      expect(() =>
        t.addPlayerToGame(history, 'toto', 'red')
      ).to.throw(Error, /already/);
    });
    it('not add a blue player previously added to the blue team', () => {
      let history: Array<Event> = [];
      history.push(new GameCreated());
      history.push(new PlayerAddedToGameWithTeam('toto', 'blue'));
      t = new Game(history);
      expect(() =>
        t.addPlayerToGame(history, 'toto', 'blue')
      ).to.throw(Error, /already/);

    });
    it('switch team for a player previously added to other team (blue to red)', () => {
      let history: Array<Event> = [];
      history.push(new GameCreated());
      history.push(new PlayerAddedToGameWithTeam('toto', 'red'));
      t = new Game(history);
      expect(t.players.includes('toto')).to.be.true;
      expect(t.teamBlueMembers.includes('toto')).to.be.false;
      expect(t.teamRedMembers.includes('toto')).to.be.true;

      t.addPlayerToGame(history, 'toto', 'blue')

      expect(history.length).to.equal(3);
      expect(history.pop()).to.be.an.instanceOf(PlayerAddedToGameWithTeam);
      // projections assertions (move this in other tests dedicated to apply/projections?)
      expect(t.players.includes('toto')).to.be.true;
      expect(t.teamBlueMembers.includes('toto')).to.be.true;
      expect(t.teamRedMembers.includes('toto')).to.be.false;

    });
    it('switch team for a player previously added to other team (red to blue)', () => {
      let history: Array<Event> = [];
      history.push(new GameCreated());
      history.push(new PlayerAddedToGameWithTeam('toto', 'blue'));
      t = new Game(history);
      expect(t.players.includes('toto')).to.be.true;
      expect(t.teamBlueMembers.includes('toto')).to.be.true;
      expect(t.teamRedMembers.includes('toto')).to.be.false;

      t.addPlayerToGame(history, 'toto', 'red');

      expect(history.length).to.equal(3);
      expect(history.pop()).to.be.an.instanceOf(PlayerAddedToGameWithTeam);
      // projections assertions (move this in other tests dedicated to apply/projections?)
      expect(t.players.includes('toto')).to.be.true;
      expect(t.teamBlueMembers.includes('toto')).to.be.false;
      expect(t.teamRedMembers.includes('toto')).to.be.true;

    });
  });

  describe('.endGame should', () => {
    it('emit GameEnded on an existing and started Game', () => {
      let history: Array<Event> = [];
      history.push(new GameCreated());
      history.push(new GameStarted(new Date()));
      t = new Game(history);
      t.endGame(history);
      expect(history.length).to.equal(3);
      expect(history.pop()).to.be.an.instanceOf(GameEnded);
    });

    it('not emit GameEnded on an existing but not yet started Game', () => {
      let history: Array<Event> = [];
      history.push(new GameCreated());
      t = new Game(history);
      expect(() => t.endGame(history)).to.throw(Error);
      expect(history.length).to.equal(1);
      //const e = history.pop();
      //expect(e).to.be.an.instanceOf(GameStarted);
      // NOTE the above test fails? why?
    });

  });
  describe('.addGoalFromPlayer should', () => {
    it("not add a point to an unknown scoring player", () => {
      let history: Array<Event> = [];
      history.push(new GameCreated());
      history.push(new GameStarted());
      t = new Game(history);
      expect(() =>
        t.addGoalFromPlayer(history, 'cédric')
      ).to.throw(Error, /unknown/);
    });
    it("not add a point to the scoring player's team if the game is deleted", () => {
      let history: Array<Event> = [];
      history.push(new GameCreated());
      history.push(new PlayerAddedToGameWithTeam('cédric', 'blue'));
      history.push(new GameDeleted());
      t = new Game(history);
      expect(() =>
        t.addGoalFromPlayer(history, 'cédric')
      ).to.throw(Error, /deleted/);
    });
    it("not add a point to the scoring player's team if the game is ended", () => {
      let history: Array<Event> = [];
      history.push(new GameCreated());
      history.push(new PlayerAddedToGameWithTeam('cédric', 'blue'));
      history.push(new GameStarted());
      history.push(new GameEnded());
      t = new Game(history);
      expect(() => t.addGoalFromPlayer(history, 'cédric')).to.throw(Error, /ended/);
    });
    it("add a point to the scoring player's team", () => {
      let history: Array<Event> = [];
      history.push(new GameCreated());
      history.push(new PlayerAddedToGameWithTeam('cédric', 'blue'));
      history.push(new GameStarted());
      t = new Game(history);
      t.addGoalFromPlayer(history, 'cédric');
      expect(history.length).to.equal(4);
      expect(history.pop()).to.be.an.instanceOf(AddedGoalFromPlayerToGame);
      expect(t.winner).to.equal('blue');
      expect(t.pointsTeamBlue).to.equal(1);
      expect(t.pointsTeamRed).to.equal(0);
    });
  });
  describe('happy path', () => {
    it('should work from event history', () => {
      let history: Array<Event> = [];
      history.push(new GameCreated());
      history.push(new PlayerAddedToGameWithTeam('cédric', 'blue'));
      history.push(new PlayerAddedToGameWithTeam('david', 'blue'));
      history.push(new PlayerAddedToGameWithTeam('franck', 'red'));
      history.push(new PlayerAddedToGameWithTeam('gaëlle', 'red'));
      history.push(new GameStarted());
      history.push(new AddedGoalFromPlayerToGame('cédric'));
      history.push(new AddedGoalFromPlayerToGame('franck'));
      history.push(new AddedGoalFromPlayerToGame('franck'));
      history.push(new AddedGoalFromPlayerToGame('cédric'));
      history.push(new AddedGoalFromPlayerToGame('franck'));
      history.push(new AddedGoalFromPlayerToGame('gaëlle'));
      history.push(new AddedGoalFromPlayerToGame('cédric'));
      history.push(new AddedGoalFromPlayerToGame('cédric'));
      history.push(new AddedGoalFromPlayerToGame('david'));
      history.push(new AddedGoalFromPlayerToGame('cédric'));
      history.push(new AddedGoalFromPlayerToGame('cédric'));
      history.push(new AddedGoalFromPlayerToGame('cédric'));
      history.push(new AddedGoalFromPlayerToGame('cédric'));
      history.push(new AddedGoalFromPlayerToGame('franck'));
      history.push(new AddedGoalFromPlayerToGame('cédric'));
      history.push(new GameEnded());
      t = new Game(history);
      expect(t.winner).to.equal('blue');
      expect(t.pointsTeamBlue).to.equal(10);
      expect(t.pointsTeamRed).to.equal(5);
    });

        it('should work with commands', () => {
          let history: Array<Event> = [];
          t = Game.createGame(history);
          t.addPlayerToGame(history, 'cédric', 'blue');
          t.addPlayerToGame(history, 'david', 'blue');
          t.addPlayerToGame(history, 'franck', 'red');
          t.addPlayerToGame(history, 'gaëlle', 'red');
          t.startGame(history);
          t.addGoalFromPlayer(history, 'cédric');
          t.addGoalFromPlayer(history, 'franck');
          t.addGoalFromPlayer(history, 'franck');
          t.addGoalFromPlayer(history, 'cédric');
          t.addGoalFromPlayer(history, 'franck');
          t.addGoalFromPlayer(history, 'gaëlle');
          t.addGoalFromPlayer(history, 'cédric');
          t.addGoalFromPlayer(history, 'cédric');
          t.addGoalFromPlayer(history, 'david');
          t.addGoalFromPlayer(history, 'cédric');
          t.addGoalFromPlayer(history, 'cédric');
          t.addGoalFromPlayer(history, 'cédric');
          t.addGoalFromPlayer(history, 'cédric');
          t.addGoalFromPlayer(history, 'franck');
          t.addGoalFromPlayer(history, 'cédric');
          t.endGame(history);
          expect(t.winner).to.equal('blue');
          expect(t.pointsTeamBlue).to.equal(10);
          expect(t.pointsTeamRed).to.equal(5);
        });
  });
});
