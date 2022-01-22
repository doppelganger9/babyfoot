import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { BFEvent, EventPublisher, generateUUID } from '../../..';
import { PlayerCreated } from '../events';
import { Player } from '../player';
import { PlayerId } from '../player-id';

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

  describe('.create should', () => {
    it('create an instance from history', () => {
      t = new Player([]);
      expect(t).not.to.be.null;
      expect(t).not.to.be.undefined;
    });
  });

  describe('.createPlayer should', () => {
    it('emit PlayerCreated', () => {
      Player.createPlayer(simpleEventPublisher, fields);
      expect(eventsRaised.length).to.equal(1);
      expect(eventsRaised[0]).to.be.instanceOf(PlayerCreated);
    });
    it('update its projections', () => {

      const history: Array<BFEvent> = [];
      history.push(new PlayerCreated(playerId, fields));
      t = new Player(history);
      expect(t.projection.email).to.be.equal(fields.get('email'));
      expect(t.projection.displayName).to.be.equal(fields.get('displayName'));
      expect(t.projection.avatar).to.be.equal(fields.get('avatar'));
      expect(t.projection.id.id).to.be.equal(playerId.id);
      expect(t.projection.isDeleted).to.be.false;
    });
  });
});
