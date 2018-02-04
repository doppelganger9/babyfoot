import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';

import { Event, EventPublisher } from '../../..';
import { GameAlreadyEndedError, GameIsDeletedError } from '../errors';
import {
  GameCreated,
  GameDeleted,
  GameEnded,
  GameStarted,
  PlayerAddedToGameWithTeam,
  PlayerRemovedFromGame
} from '../events';
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

  describe('.removePlayerFromGame should', () => {
    it('not remove an unknown player from a game', () => {
      const history: Array<Event> = [];
      history.push(new GameCreated(gameId));
      t = new Game(history);
      expect(() =>
        t.removePlayerFromGame(simpleEventPublisher, 'toto')
      ).to.throw(Error, /unknown/);
    });
    it('not remove a player from a deleted game', () => {
      const history: Array<Event> = [];
      history.push(new GameCreated(gameId));
      history.push(new GameDeleted(gameId));
      t = new Game(history);
      expect(() =>
        t.removePlayerFromGame(simpleEventPublisher, 'toto')
      ).to.throw(GameIsDeletedError);
    });
    it('not remove a player from an already ended game', () => {
      const history: Array<Event> = [];
      history.push(new GameCreated(gameId));
      history.push(new GameStarted(undefined, gameId));
      history.push(new GameEnded(undefined, gameId));
      t = new Game(history);
      expect(() =>
        t.removePlayerFromGame(simpleEventPublisher, 'toto')
      ).to.throw(GameAlreadyEndedError);
    });
    it('remove an existing red team player from a game', () => {
      const history: Array<Event> = [];
      history.push(new GameCreated(gameId));
      history.push(new PlayerAddedToGameWithTeam('toto', 'red', gameId));
      t = new Game(history);
      t.removePlayerFromGame(simpleEventPublisher, 'toto');
      expect(eventsRaised.length).to.equal(1);
      expect(eventsRaised.pop()).to.be.an.instanceOf(PlayerRemovedFromGame);
    });
    it('should remove the red player from decision projections', () => {
      const history: Array<Event> = [];
      history.push(new GameCreated(gameId));
      history.push(new PlayerAddedToGameWithTeam('toto', 'red', gameId));
      history.push(new PlayerRemovedFromGame('toto', gameId));
      t = new Game(history);
      expect(t.projection.players.includes('toto')).to.be.false;
      expect(t.projection.teamRedMembers.includes('toto')).to.be.false;
      expect(t.projection.teamBlueMembers.includes('toto')).to.be.false;
    });
    it('should remove the blue player from decision projections', () => {
      const history: Array<Event> = [];
      history.push(new GameCreated(gameId));
      history.push(new PlayerAddedToGameWithTeam('toto', 'blue', gameId));
      history.push(new PlayerRemovedFromGame('toto', gameId));
      t = new Game(history);
      expect(t.projection.players.includes('toto')).to.be.false;
      expect(t.projection.teamRedMembers.includes('toto')).to.be.false;
      expect(t.projection.teamBlueMembers.includes('toto')).to.be.false;
    });
    it('remove an existing blue team player from a game', () => {
      const history: Array<Event> = [];
      history.push(new GameCreated(gameId));
      history.push(new PlayerAddedToGameWithTeam('toto', 'blue', gameId));
      t = new Game(history);
      t.removePlayerFromGame(simpleEventPublisher, 'toto');
      expect(eventsRaised.length).to.equal(1);
      expect(eventsRaised.pop()).to.be.an.instanceOf(PlayerRemovedFromGame);
    });
  });
});
