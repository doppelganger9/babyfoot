import { Session, UserConnected, UserDisconnected, SessionId } from './session';
import { beforeEach, describe, expect, it } from 'vitest';
import { UserId } from '../user-id';
import { EventPublisher, BFEvent } from '../..';

describe('Session Aggregate', () => {
  const userId = new UserId('user@mix-it.fr');
  const sessionId = new SessionId('SessionA');

  let eventsRaised: Array<any> = [];
  class SimpleEventPublisher extends EventPublisher {
    constructor() {
      super();

    }
    public publish(evt: BFEvent): void {
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
    const userSession = new Session(
      new UserConnected(sessionId, userId, new Date())
    );

    userSession.logOut(publishEvent);

    const expectedEvent = new UserDisconnected(sessionId, userId);
    expect(JSON.stringify(eventsRaised[0])).to.equal(JSON.stringify(expectedEvent));
  });

  it('Given user disconnected When user log out Then nothing', () => {
    const userSession = new Session([
      new UserConnected(sessionId, userId, new Date()),
      new UserDisconnected(sessionId, userId)
    ]);

    userSession.logOut(publishEvent);

    expect(eventsRaised).to.be.empty;
  });

  it('When create UserConnected Then aggregateId is sessionId', () => {
    const event = new UserConnected(sessionId, userId, new Date());

    expect(event.getAggregateId()).to.equal(sessionId);
  });

  it('When create UserDisconnected Then aggregateId is sessionId', () => {
    const event = new UserDisconnected(sessionId, userId);

    expect(event.getAggregateId()).to.equal(sessionId);
  });
});
