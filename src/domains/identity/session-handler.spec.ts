import { SessionsRepository, EventPublisher, SessionHandler, Session, UserId, SessionId } from '../..';
import { expect } from 'chai';
import { UserConnected, UserDisconnected } from './session';

describe('Session Handler', () => {
  const sessionId = new SessionId('SessionA');
  const userId = new UserId('user1@mix-it.fr');

  let repository;
  let handler;
  let eventPublisher;
  beforeEach(() => {
    repository = SessionsRepository.create(null);// null ???
    handler = SessionHandler.create(repository);
    eventPublisher = EventPublisher.create();
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
