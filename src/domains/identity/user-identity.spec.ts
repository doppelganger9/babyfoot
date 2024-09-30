import { beforeEach, describe, expect, it } from 'vitest';
import { BFEvent, UserRegistered, UserId, UserEmailCannotBeEmpty, EventPublisher } from '../..';
import { UserIdentity } from '.';
import { UserConnected } from './session';

describe('User Identity Aggregate', () => {
  const email = 'user@mix-it.fr';

  let eventsRaised: Array<any> = [];
  class SimpleEventPublisher extends EventPublisher {
    constructor() {
      super();
    }

    public publish(event: BFEvent) {
      eventsRaised.push(event);
    }
   }

  const publishEvent = new SimpleEventPublisher();

  beforeEach(() => {
    eventsRaised = [];
  });

  it('When register user Then raise userRegistered event', () => {
    UserIdentity.register(publishEvent, email);

    const expectedEvent = new UserRegistered(new UserId(email));
    expect(eventsRaised).to.deep.include(expectedEvent);
  });

  it('Given UserRegistered When log in Then raise UserConnected event', () => {
    const id = new UserId(email);
    const user = new UserIdentity([new UserRegistered(id)]);

    user.logIn(publishEvent);

    expect(eventsRaised).to.have.length(1);
    const event: BFEvent = eventsRaised[0];
    expect(event).to.be.an.instanceof(UserConnected);
    expect((event as UserConnected).userId).to.equal(id);
    expect((event as UserConnected).connectedAt.getTime() - new Date().getTime()).to.within(-5, 5);
    expect((event as UserConnected).sessionId).not.to.be.empty;
  });

  it('When log in Then return sessionId', () => {
    const id = new UserId(email);
    const user = new UserIdentity([new UserRegistered(id)]);

    const result = user.logIn(publishEvent);

    const event = eventsRaised[0];
    expect(result).to.equal(eventsRaised[0].sessionId);
  });

  it('When create UserRegistered Then aggregateId is userId', () => {
    const id = new UserId(email);
    const event = new UserRegistered(id);

    expect(event.getAggregateId()).to.equal(id);
  });

  it('When register user with empty email Then throw UserEmailCannotBeEmpty exception', () => {
    expect(() => {
      UserIdentity.register(publishEvent, '');
    }).to.throw(UserEmailCannotBeEmpty);
  });
});
