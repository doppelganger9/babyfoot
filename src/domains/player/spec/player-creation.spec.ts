import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';

import { Event, EventPublisher, generateUUID } from '../../..';
import { PlayerCreated } from '../events';
import { Player } from '../player';
import { PlayerId } from '../player-id';

chai.use(chaiAsPromised);
const { expect, assert } = chai;
describe('Player', () => {
  let t: Player;
  const playerId: PlayerId = new PlayerId('Player1');
  let eventsRaised = [];
  const fields = new Map<string, any>();
  fields.set('firstName', 'bob');
  fields.set('lastName', 'sponge');
  fields.set('email', 'sponge.bob@sea.com');

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

      const history: Array<Event> = [];
      history.push(new PlayerCreated(playerId, fields, 'fake_confirmation_token'));
      t = new Player(history);
      expect(t.projection.email).to.be.equal(fields.get('email'));
      expect(t.projection.firstName).to.be.equal(fields.get('firstName'));
      expect(t.projection.lastName).to.be.equal(fields.get('lastName'));
      expect(t.projection.avatar).to.be.equal(fields.get('avatar'));
      expect(t.projection.id.id).to.be.equal(playerId.id);
      expect(t.projection.isDeleted).to.be.false;
      expect(t.projection.isAccountConfirmed).to.be.false;
      expect(t.projection.confirmationToken).to.not.be.undefined;
    });
  });
});
