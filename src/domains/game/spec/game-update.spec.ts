import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';

import { Event, EventPublisher, GameUpdated } from '../../..';
import { GameAlreadyEndedError, GameIsDeletedError } from '../errors';
import { GameCreated, GameDeleted, GameEnded, GameStarted } from '../events';
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

  describe('.update should', () => {
    it('emit a GameUpdated and then throw an Error because it is not yet fully implemented', () => {
      const history: Array<Event> = [];
      history.push(new GameCreated(gameId));
      history.push(new GameStarted(new Date(), gameId));
      t = new Game(history);
      expect(() => { t.updateGame(simpleEventPublisher); }).to.throw(Error, /not implemented/);
      expect(eventsRaised.length).to.equal(1);
      expect(eventsRaised[0]).to.be.instanceof(GameUpdated);
    });
  });
});
