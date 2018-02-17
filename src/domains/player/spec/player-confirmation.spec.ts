import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';

import { Event, EventPublisher, generateUUID } from '../../..';
import { PlayerCreated, PlayerConfirmedAccount, PlayerDeleted } from '../events';
import { Player } from '../player';
import { PlayerId } from '../player-id';
import { PlayerAccountConfirmationDidNotMatchError, PlayerIsDeletedError } from '..';

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
  const confirmationToken = 'fake_confirmation_token';

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

  describe('.confirmAccount should', () => {
    it('emit PlayerConfirmedAccount', () => {
      const history: Array<Event> = [];
      history.push(new PlayerCreated(playerId, fields, confirmationToken));
      t = new Player(history);
      t.confirmAccount(simpleEventPublisher, confirmationToken);
      expect(eventsRaised.length).to.equal(1);
      expect(eventsRaised[0]).to.be.instanceOf(PlayerConfirmedAccount);
    });
    it('throw PlayerAccountConfirmationDidNotMatchError when token is not the one sent by email', () => {
      const history: Array<Event> = [];
      history.push(new PlayerCreated(playerId, fields, confirmationToken));
      t = new Player(history);
      expect(() =>
        t.confirmAccount(simpleEventPublisher, 'token'),
      ).to.throw(PlayerAccountConfirmationDidNotMatchError);
      expect(eventsRaised.length).to.equal(0);
    });
    it('throw PlayerIdDeleted when trying to confirm a deleted player', () => {
      const history: Array<Event> = [];
      history.push(new PlayerCreated(playerId, fields, confirmationToken));
      history.push(new PlayerDeleted(playerId));
      t = new Player(history);
      expect(() =>
        t.confirmAccount(simpleEventPublisher, 'token'),
      ).to.throw(PlayerIsDeletedError);
      expect(eventsRaised.length).to.equal(0);
    });
    it('update its projections', () => {
      const history: Array<Event> = [];
      history.push(new PlayerCreated(playerId, fields, confirmationToken));
      history.push(new PlayerConfirmedAccount(playerId, fields.get('email'), 'token'));
      t = new Player(history);
      expect(t.projection.email).to.be.equal(fields.get('email'));
      expect(t.projection.firstName).to.be.equal(fields.get('firstName'));
      expect(t.projection.lastName).to.be.equal(fields.get('lastName'));
      expect(t.projection.avatar).to.be.equal(fields.get('avatar'));
      expect(t.projection.isAccountConfirmed).to.be.true;
      expect(t.projection.id.id).to.be.equal(playerId.id);
      expect(t.projection.isDeleted).to.be.false;
      expect(t.projection.confirmationToken).to.not.be.undefined;
    });
  });
});
