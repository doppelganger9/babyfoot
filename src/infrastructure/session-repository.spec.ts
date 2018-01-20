import { EventsStore } from './event-store';
import { SessionsRepository } from './session-repository';
import { SessionProjection } from '../domains/identity/session-projection';
import { Session, SessionId, UserConnected } from '../domains/identity/session';
import { UserId } from '../domains/user-id';
import { expect } from 'chai';
import { UnknownSession } from '..';

describe('Sessions Repository', function() {
  const sessionId = new SessionId('SessionA');
  const userId = new UserId('user1@mix-it.fr');

  let eventsStore;
  let repository;
  beforeEach(function() {
    eventsStore = EventsStore.create();
    repository = SessionsRepository.create(eventsStore);
  });

  it('Given no projections When getUserIdOfSession Then return empty', function() {
    const userId = repository.getUserIdOfSession(sessionId);

    expect(userId).to.be.null;
  });

  it('Given several user connected When getUserIdOfSession Then userId of this session', function() {
    repository.save(
      SessionProjection.create(
        sessionId,
        userId,
        SessionProjection.SessionEnabled
      )
    );
    repository.save(
      SessionProjection.create(
        new SessionId('SessionB'),
        new UserId('user2@mix-it.fr'),
        SessionProjection.SessionEnabled
      )
    );

    expect(repository.getUserIdOfSession(sessionId)).to.eql(userId);
  });

  it('Given user disconnected When getUserIdOfSession Then return empty', function() {
    repository.save(
      SessionProjection.create(
        sessionId,
        userId,
        SessionProjection.SessionDisabled
      )
    );

    expect(repository.getUserIdOfSession(sessionId)).to.be.null;
  });

  it('Given already projection When save same projection Then update projection', function() {
    repository.save(
      SessionProjection.create(
        sessionId,
        userId,
        SessionProjection.SessionEnabled
      )
    );

    repository.save(
      SessionProjection.create(
        sessionId,
        userId,
        SessionProjection.SessionDisabled
      )
    );

    expect(repository.getUserIdOfSession(sessionId)).to.be.null;
  });

  it('Given UserConnected When getSession Then return Session aggregate', function() {
    const userConnected = new UserConnected(
      sessionId,
      userId,
      new Date()
    );
    eventsStore.store(userConnected);

    var userSession = repository.getSession(userConnected.sessionId);

    expect(userSession).not.to.empty;
  });

  it('Given no events When getSession Then throw UnknownSession', function() {
    expect(function() {
      repository.getSession(sessionId);
    }).to.throw(UnknownSession);
  });
});
