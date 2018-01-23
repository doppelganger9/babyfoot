import { Session, UserConnected, UserDisconnected, SessionId } from './session';
//import { UserIdentity } from '../user-identity';
import { UserId } from '../user-id';
import { expect } from 'chai';
import { EventPublisher, Event } from '../..';

describe('Session Aggregate', () => {
  const userId = new UserId('user@mix-it.fr');
  const sessionId = new SessionId('SessionA');

  let eventsRaised = [];
  class SimpleEventPublisher extends EventPublisher {
    constructor() {
      super();

    }
    publish(evt: Event): void {
      eventsRaised.push(evt);
    }
  }
  const publishEvent = new SimpleEventPublisher();

  beforeEach(() => {
    eventsRaised = [];
  });

  it('When create SessionId Then toString return id', () => {
    expect(sessionId.toString()).to.eql('Session:SessionA');
  });

  it('When user logout Then raise UserDisconnected event', () => {
    var userSession = new Session(
      new UserConnected(sessionId, userId, new Date())
    );

    userSession.logOut(publishEvent);

    var expectedEvent = new UserDisconnected(sessionId, userId);
    expect(JSON.stringify(eventsRaised[0])).to.equal(JSON.stringify(expectedEvent));
  });

  it('Given user disconnected When user log out Then nothing', () => {
    var userSession = new Session([
      new UserConnected(sessionId, userId, new Date()),
      new UserDisconnected(sessionId, userId)
    ]);

    userSession.logOut(publishEvent);

    expect(eventsRaised).to.be.empty;
  });

  it('When create UserConnected Then aggregateId is sessionId', () => {
    var event = new UserConnected(sessionId, userId, new Date());

    expect(event.getAggregateId()).to.equal(sessionId);
  });

  it('When create UserDisconnected Then aggregateId is sessionId', () => {
    var event = new UserDisconnected(sessionId, userId);

    expect(event.getAggregateId()).to.equal(sessionId);
  });
});
