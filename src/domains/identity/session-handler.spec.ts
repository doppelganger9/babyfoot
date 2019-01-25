import { SessionsRepository, EventPublisher, SessionHandler, Session, UserId, SessionId } from '../..';
import { expect } from 'chai';
import { UserConnected, UserDisconnected } from './session';
import { BFEventsStore } from '../../infrastructure';

describe('Session Handler', () => {
  const sessionId = new SessionId('SessionA');
  const userId = new UserId('user1@mix-it.fr');

  let repository: any;
  let handler;
  let eventPublisher: any;
  beforeEach(() => {
    repository = new SessionsRepository(new BFEventsStore());
    handler = new SessionHandler(repository);
    eventPublisher = new EventPublisher();
    handler.register(eventPublisher);
  });

  it('When UserConnected Then store SessionProjection', () => {
    const userConnected = new UserConnected(
      sessionId,
      userId,
      new Date()
    );

    eventPublisher.publish(userConnected);

    expect(repository.getUserIdOfSession(sessionId)).to.equal(userId);
  });

  it('When UserDiconnected Then update SessionProjection and enable disconnected flag', () => {
    eventPublisher.publish(
      new UserConnected(sessionId, userId, new Date())
    );

    eventPublisher.publish(new UserDisconnected(sessionId, userId));

    expect(repository.getUserIdOfSession(sessionId)).to.be.null;
  });
});
