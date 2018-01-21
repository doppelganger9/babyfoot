
import { expect } from 'chai';
import { Event, UserRegistered, UserId, UserEmailCannotBeEmpty } from '../..';
import { UserIdentity } from '.';
import { UserConnected } from './session';

describe('User Identity Aggregate', function() {
  const email = 'user@mix-it.fr';

  let eventsRaised = [];
  const publishEvent = function publishEvent(evt: Event) {
    eventsRaised.push(evt);
  };

  beforeEach(function() {
    eventsRaised = [];
  });

  it('When register user Then raise userRegistered event', function() {
    UserIdentity.register(publishEvent, email);

    var expectedEvent = new UserRegistered(new UserId(email));
    expect(eventsRaised).to.deep.include(expectedEvent);
  });

  it('Given UserRegistered When log in Then raise UserConnected event', function() {
    var id = new UserId(email);
    var user = UserIdentity.create([new UserRegistered(id)]);

    user.logIn(publishEvent);

    expect(eventsRaised).to.have.length(1);
    var event: Event = eventsRaised[0];
    expect(event).to.be.an.instanceof(UserConnected);
    expect((event as UserConnected).userId).to.equal(id);
    expect((event as UserConnected).connectedAt.getTime() - new Date().getTime()).to.within(-5, 5);
    expect((event as UserConnected).sessionId).not.to.be.empty;
  });

  it('When log in Then return sessionId', function() {
    var id = new UserId(email);
    var user = UserIdentity.create([new UserRegistered(id)]);

    var result = user.logIn(publishEvent);

    var event = eventsRaised[0];
    expect(result).to.equal(eventsRaised[0].sessionId);
  });

  it('When create UserRegistered Then aggregateId is userId', function() {
    var id = new UserId(email);
    var event = new UserRegistered(id);

    expect(event.getAggregateId()).to.equal(id);
  });

  it('When register user with empty email Then throw UserEmailCannotBeEmpty exception', function() {
    expect(() => {
      UserIdentity.register(publishEvent, '');
    }).to.throw(UserEmailCannotBeEmpty);
  });
});
