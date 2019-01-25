import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';

import { BFEvent, EventPublisher } from '../../..';
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

  describe('.removePlayerFromGame should', () => {
    it('not remove an unknown player from a game', () => {
      const history: Array<BFEvent> = [];
      history.push(new GameCreated(gameId));
      t = new Game(history);
      expect(() =>
        t.removePlayerFromGame(simpleEventPublisher, new PlayerId('toto'))
      ).to.throw(Error, /unknown/);
    });
    it('not remove a player from a deleted game', () => {
      const history: Array<BFEvent> = [];
      history.push(new GameCreated(gameId));
      history.push(new GameDeleted(gameId));
      t = new Game(history);
      expect(() =>
        t.removePlayerFromGame(simpleEventPublisher, new PlayerId('toto'))
      ).to.throw(GameIsDeletedError);
    });
    it('not remove a player from an already ended game', () => {
      const history: Array<BFEvent> = [];
      history.push(new GameCreated(gameId));
      history.push(new GameStarted(undefined, gameId));
      history.push(new GameEnded(undefined, gameId));
      t = new Game(history);
      expect(() =>
        t.removePlayerFromGame(simpleEventPublisher, new PlayerId('toto'))
      ).to.throw(GameAlreadyEndedError);
    });
    it('remove an existing red team player from a game', () => {
      const history: Array<BFEvent> = [];
      history.push(new GameCreated(gameId));
      history.push(new PlayerAddedToGameWithTeam(new PlayerId('toto'), 'red', gameId));
      t = new Game(history);
      t.removePlayerFromGame(simpleEventPublisher, new PlayerId('toto'));
      expect(eventsRaised.length).to.equal(1);
      expect(eventsRaised.pop()).to.be.an.instanceOf(PlayerRemovedFromGame);
    });
    it('should remove the red player from decision projections', () => {
      const history: Array<BFEvent> = [];
      history.push(new GameCreated(gameId));
      history.push(new PlayerAddedToGameWithTeam(new PlayerId('toto'), 'red', gameId));
      history.push(new PlayerRemovedFromGame(new PlayerId('toto'), gameId));
      t = new Game(history);
      expect(PlayerId.listIncludesId(t.projection.players, new PlayerId('toto'))).to.be.false;
      expect(PlayerId.listIncludesId(t.projection.teamRedMembers, new PlayerId('toto'))).to.be.false;
      expect(PlayerId.listIncludesId(t.projection.teamBlueMembers, new PlayerId('toto'))).to.be.false;
    });
    it('should remove the blue player from decision projections', () => {
      const history: Array<BFEvent> = [];
      history.push(new GameCreated(gameId));
      history.push(new PlayerAddedToGameWithTeam(new PlayerId('toto'), 'blue', gameId));
      history.push(new PlayerRemovedFromGame(new PlayerId('toto'), gameId));
      t = new Game(history);
      expect(PlayerId.listIncludesId(t.projection.players, new PlayerId('toto'))).to.be.false;
      expect(PlayerId.listIncludesId(t.projection.teamRedMembers, new PlayerId('toto'))).to.be.false;
      expect(PlayerId.listIncludesId(t.projection.teamBlueMembers, new PlayerId('toto'))).to.be.false;
    });
    it('remove an existing blue team player from a game', () => {
      const history: Array<BFEvent> = [];
      history.push(new GameCreated(gameId));
      history.push(new PlayerAddedToGameWithTeam(new PlayerId('toto'), 'blue', gameId));
      t = new Game(history);
      t.removePlayerFromGame(simpleEventPublisher, new PlayerId('toto'));
      expect(eventsRaised.length).to.equal(1);
      expect(eventsRaised.pop()).to.be.an.instanceOf(PlayerRemovedFromGame);
    });
  });
});
