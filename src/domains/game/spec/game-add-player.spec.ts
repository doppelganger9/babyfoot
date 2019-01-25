import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';

import { BFEvent, EventPublisher } from '../../..';
import { GameCreated, GameDeleted, GameEnded, GameStarted, PlayerAddedToGameWithTeam } from '../events';
import { Game } from '../game';
import { GameId } from '../game-id';
import { PlayerId } from '../../player';

chai.use(chaiAsPromised);
const { expect, assert } = chai;
describe('Game', () => {
  let t: Game;
  const gameId: GameId = new GameId('game1');
  let eventsRaised: any[] = [];
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

  describe('.addPlayerToGameWithTeam should', () => {
    it('add a new red player to a new game', () => {
      const history: Array<BFEvent> = [];
      history.push(new GameCreated(gameId));
      t = new Game(history);
      t.addPlayerToGame(simpleEventPublisher, new PlayerId('toto'), 'red');
      expect(eventsRaised.length).to.equal(1);
      expect(eventsRaised.pop()).to.be.an.instanceOf(PlayerAddedToGameWithTeam);
    });
    it('should update the decision projection to add the red player', () => {
      const history: Array<BFEvent> = [];
      history.push(new GameCreated(gameId));
      history.push(new PlayerAddedToGameWithTeam(new PlayerId('toto'), 'red', gameId));
      t = new Game(history);
      // projections assertions (move this in other tests dedicated to apply/projections?)
      expect(t.projection.players.filter(x => x.id === 'toto').length).to.equal(1);
      expect(t.projection.teamRedMembers.filter(x => x.id === 'toto').length).to.equal(1);
      expect(t.projection.teamBlueMembers.filter(x => x.id === 'toto').length).to.equal(0);
    });
    it('should not update the decision projection to add the red player if it is already in this team', () => {
      const history: Array<BFEvent> = [];
      history.push(new GameCreated(gameId));
      history.push(new PlayerAddedToGameWithTeam(new PlayerId('toto'), 'red', gameId));
      history.push(new PlayerAddedToGameWithTeam(new PlayerId('toto'), 'red', gameId));
      t = new Game(history);
      // projections assertions (move this in other tests dedicated to apply/projections?)
      expect(t.projection.players.filter(x => x.id === 'toto').length).to.equal(1);
      expect(t.projection.players.length).to.equal(1);
      expect(t.projection.teamRedMembers.length).to.equal(1);
      expect(t.projection.teamRedMembers.filter(x => x.id === 'toto').length).to.equal(1);
      expect(t.projection.teamBlueMembers.length).to.equal(0);
      expect(t.projection.teamBlueMembers.filter(x => x.id === 'toto').length).to.equal(0);
    });

    it('add a new blue player to a new game', () => {
      const history: Array<BFEvent> = [];
      history.push(new GameCreated(gameId));
      t = new Game(history);
      t.addPlayerToGame(simpleEventPublisher, new PlayerId('toto'), 'blue');
      expect(eventsRaised.length).to.equal(1);
      expect(eventsRaised.pop()).to.be.an.instanceOf(PlayerAddedToGameWithTeam);
    });
    it('should update the decision projection to add the blue player', () => {
      const history: Array<BFEvent> = [];
      history.push(new GameCreated(gameId));
      history.push(new PlayerAddedToGameWithTeam(new PlayerId('toto'), 'blue', gameId));
      t = new Game(history);
      // projections assertions (move this in other tests dedicated to apply/projections?)
      expect(t.projection.players.filter(x => x.id === 'toto').length).to.equal(1);
      expect(t.projection.teamRedMembers.filter(x => x.id === 'toto').length).to.equal(0);
      expect(t.projection.teamBlueMembers.filter(x => x.id === 'toto').length).to.equal(1);
    });
    it('should not update the decision projection to add the blue player if it is already in this team', () => {
      const history: Array<BFEvent> = [];
      history.push(new GameCreated(gameId));
      history.push(new PlayerAddedToGameWithTeam(new PlayerId('toto'), 'blue', gameId));
      history.push(new PlayerAddedToGameWithTeam(new PlayerId('toto'), 'blue', gameId));
      t = new Game(history);
      // projections assertions (move this in other tests dedicated to apply/projections?)
      expect(t.projection.players.filter(x => x.id === 'toto').length).to.equal(1);
      expect(t.projection.players.length).to.equal(1);
      expect(t.projection.teamRedMembers.length).to.equal(0);
      expect(t.projection.teamRedMembers.filter(x => x.id === 'toto').length).to.equal(0);
      expect(t.projection.teamBlueMembers.length).to.equal(1);
      expect(t.projection.teamBlueMembers.filter(x => x.id === 'toto').length).to.equal(1);
    });

    it('not add a player to a deleted game', () => {
      const history: Array<BFEvent> = [];
      history.push(new GameCreated(gameId));
      history.push(new GameDeleted(gameId));
      t = new Game(history);
      expect(() =>
        t.addPlayerToGame(simpleEventPublisher, new PlayerId('toto'), 'blue')
      ).to.throw(Error, /deleted/);
    });
    it('not add a player to a game that is ended', () => {
      const history: Array<BFEvent> = [];
      history.push(new GameCreated(gameId));
      history.push(new GameStarted(undefined, gameId));
      history.push(new GameEnded(undefined, gameId));
      t = new Game(history);
      expect(() =>
        t.addPlayerToGame(simpleEventPublisher, new PlayerId('toto'), 'blue')
      ).to.throw(Error, /ended/);
    });
    it('not add a red player previously added to the red team', () => {
      const history: Array<BFEvent> = [];
      history.push(new GameCreated(gameId));
      history.push(new PlayerAddedToGameWithTeam(new PlayerId('toto'), 'red', gameId));
      t = new Game(history);
      expect(() =>
        t.addPlayerToGame(simpleEventPublisher, new PlayerId('toto'), 'red')
      ).to.throw(Error, /already/);
    });
    it('not add a blue player previously added to the blue team', () => {
      const history: Array<BFEvent> = [];
      history.push(new GameCreated(gameId));
      history.push(new PlayerAddedToGameWithTeam(new PlayerId('toto'), 'blue', gameId));
      t = new Game(history);
      expect(() =>
        t.addPlayerToGame(simpleEventPublisher, new PlayerId('toto'), 'blue')
      ).to.throw(Error, /already/);
    });
    it('switch team for a player previously added to other team (blue to red)', () => {
      const history: Array<BFEvent> = [];
      history.push(new GameCreated(gameId));
      history.push(new PlayerAddedToGameWithTeam(new PlayerId('toto'), 'red', gameId));
      t = new Game(history);
      expect(t.projection.players.filter(x => x.id === 'toto').length).to.equal(1);
      expect(t.projection.teamBlueMembers.filter(x => x.id === 'toto').length).to.equal(0);
      expect(t.projection.teamRedMembers.filter(x => x.id === 'toto').length).to.equal(1);

      t.addPlayerToGame(simpleEventPublisher, new PlayerId('toto'), 'blue');

      expect(eventsRaised.length).to.equal(1);
      expect(eventsRaised.pop()).to.be.an.instanceOf(PlayerAddedToGameWithTeam);
    });
    it('update projections when switching team for a player previously added to other team (blue to red)', () => {
      const history: Array<BFEvent> = [];
      history.push(new GameCreated(gameId));
      history.push(new PlayerAddedToGameWithTeam(new PlayerId('toto'), 'red', gameId));
      history.push(new PlayerAddedToGameWithTeam(new PlayerId('toto'), 'blue', gameId));
      t = new Game(history);
      // projections assertions (move this in other tests dedicated to apply/projections?)
      expect(t.projection.players.filter(x => x.id === 'toto').length).to.equal(1);
      expect(t.projection.teamBlueMembers.filter(x => x.id === 'toto').length).to.equal(1);
      expect(t.projection.teamRedMembers.filter(x => x.id === 'toto').length).to.equal(0);
    });
    it('switch team for a player previously added to other team (red to blue)', () => {
      const history: Array<BFEvent> = [];
      history.push(new GameCreated(gameId));
      history.push(new PlayerAddedToGameWithTeam(new PlayerId('toto'), 'blue', gameId));
      t = new Game(history);
      expect(t.projection.players.filter(x => x.id === 'toto').length).to.equal(1);
      expect(t.projection.teamBlueMembers.filter(x => x.id === 'toto').length).to.equal(1);
      expect(t.projection.teamRedMembers.filter(x => x.id === 'toto').length).to.equal(0);

      t.addPlayerToGame(simpleEventPublisher, new PlayerId('toto'), 'red');

      expect(eventsRaised.length).to.equal(1);
      expect(eventsRaised.pop()).to.be.an.instanceOf(PlayerAddedToGameWithTeam);
    });

    it('switch team for a player previously added to other team (red to blue)', () => {
      const history: Array<BFEvent> = [];
      history.push(new GameCreated(gameId));
      history.push(new PlayerAddedToGameWithTeam(new PlayerId('toto'), 'blue', gameId));
      history.push(new PlayerAddedToGameWithTeam(new PlayerId('toto'), 'red', gameId));
      t = new Game(history);
      expect(t.projection.players.filter(x => x.id === 'toto').length).to.equal(1);
      expect(t.projection.teamBlueMembers.filter(x => x.id === 'toto').length).to.equal(0);
      expect(t.projection.teamRedMembers.filter(x => x.id === 'toto').length).to.equal(1);
    });
    it('not add a player more than once in the players list', () => {
      const history: Array<BFEvent> = [];
      history.push(new GameCreated(gameId));
      history.push(new PlayerAddedToGameWithTeam(new PlayerId('toto'), 'blue', gameId));
      history.push(new PlayerAddedToGameWithTeam(new PlayerId('toto'), 'red', gameId));
      t = new Game(history);
      expect(t.projection.players.filter(x => x.id === 'toto').length).to.equal(1);
      expect(t.projection.players.length).to.be.equal(1);
      expect(t.projection.teamBlueMembers.filter(x => x.id === 'toto').length).to.equal(0);
      expect(t.projection.teamRedMembers.filter(x => x.id === 'toto').length).to.equal(1);
    });
  });
});
