import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';

import { BFEvent, EventPublisher, generateUUID } from '../../..';
import { PlayerCreated, PlayerDeleted, PlayerUpdated } from '../events';
import { Player } from '../player';
import { PlayerId } from '../player-id';
import { PlayerIsDeletedError } from '..';

chai.use(chaiAsPromised);
const { expect, assert } = chai;
describe('Player', () => {
  let t: Player;
  const playerId: PlayerId = new PlayerId('Player1');
  let eventsRaised: any[] = [];
  const fields = new Map<string, any>();
  fields.set('displayName', 'bob sponge');
  fields.set('email', 'sponge.bob@sea.com');
  const changedFields = new Map<string, any>();
  changedFields.set('displayName', 'BOB sponge');
  changedFields.set('email', 'sponge.bob.2@sea.com');
  changedFields.set('avatar', 'the last air bender');

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

  describe('.updatePlayer should', () => {
    it('emit PlayerUpdated', () => {
      const history: Array<BFEvent> = [];
      history.push(new PlayerCreated(playerId, fields));
      t = new Player(history);
      t.updatePlayer(simpleEventPublisher, changedFields);
      expect(eventsRaised.length).to.equal(1);
      expect(eventsRaised[0]).to.be.instanceOf(PlayerUpdated);
    });
    it('throw PlayerIdDeleted when trying to confirm a deleted player', () => {
      const history: Array<BFEvent> = [];
      history.push(new PlayerCreated(playerId, fields));
      history.push(new PlayerDeleted(playerId));
      t = new Player(history);
      expect(() => t.updatePlayer(simpleEventPublisher, changedFields)).to.throw(PlayerIsDeletedError);
      expect(eventsRaised.length).to.equal(0);
    });
    it('update its projections', () => {
      const history: Array<BFEvent> = [];
      history.push(new PlayerCreated(playerId, fields));
      history.push(new PlayerUpdated(playerId, changedFields));
      t = new Player(history);
      expect(t.projection.email).to.be.equal(changedFields.get('email'));
      expect(t.projection.displayName).to.be.equal(changedFields.get('displayName'));
      expect(t.projection.avatar).to.be.equal(changedFields.get('avatar'));
    });
  });
});
