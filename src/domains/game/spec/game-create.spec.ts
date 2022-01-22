import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { BFEvent, EventPublisher, generateUUID } from '../../..';
import { GameCreated } from '../events';
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
    it('update its initialDatetime projections', () => {
      const history: Array<BFEvent> = [];
      history.push(new GameCreated(gameId));
      t = new Game(history);
      expect(t.projection.initialDatetime).to.not.be.undefined;
    });
  });
});
