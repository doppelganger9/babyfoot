import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { BFEvent, EventPublisher, generateUUID } from '../../..';
import { PlayerCreated, PlayerDeleted } from '../events';
import { Player } from '../player';
import { PlayerId } from '../player-id';
import { PlayerIsDeletedError } from '..';

chai.use(chaiAsPromised);
const { expect, assert } = chai;
describe('Player', () => {
  let t: Player;
  const playerId: PlayerId = new PlayerId('Player1');
  let eventsRaised: Array<any> = [];
  const fields = new Map<string, any>();
  fields.set('displayName', 'bob sponge');
  fields.set('email', 'sponge.bob@sea.com');

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

  describe('.delete should', () => {
    it('emit PlayerDeleted', () => {
      const history: Array<BFEvent> = [];
      history.push(new PlayerCreated(playerId, fields));
      t = new Player(history);
      t.deletePlayer(simpleEventPublisher);
      expect(eventsRaised.length).to.equal(1);
      expect(eventsRaised[0]).to.be.instanceOf(PlayerDeleted);
    });
    it('do nothing more if Player is already deleted', () => {
      const history: Array<BFEvent> = [];
      history.push(new PlayerCreated(playerId, fields));
      history.push(new PlayerDeleted(playerId));
      t = new Player(history);
      t.deletePlayer(simpleEventPublisher);
      expect(eventsRaised.length).to.equal(0);
    });
    it('update its projections', () => {
      const history: Array<BFEvent> = [];
      history.push(new PlayerCreated(playerId, fields));
      history.push(new PlayerDeleted(playerId));
      t = new Player(history);
      expect(t.projection.email).to.be.equal(fields.get('email'));
      expect(t.projection.displayName).to.be.equal(fields.get('displayName'));
      expect(t.projection.avatar).to.be.equal(fields.get('avatar'));
      expect(t.projection.id.id).to.be.equal(playerId.id);
      expect(t.projection.isDeleted).to.be.true;
    });
  });
});
