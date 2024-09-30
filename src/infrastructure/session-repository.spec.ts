import { BFEventsStore } from './event-store';
import { beforeEach, describe, expect, it } from 'vitest';
import { SessionsRepository } from './session-repository';
import { SessionProjection } from '../domains/identity/session-projection';
import { SessionId, UserConnected } from '../domains/identity/session';
import { UserId } from '../domains/user-id';
import { UnknownSession } from '..';

describe('Sessions Repository', () => {
  const sessionId = new SessionId('SessionA');
  const userId = new UserId('user1@mix-it.fr');

  let eventsStore: any;
  let repository: any;
  beforeEach(() => {
    eventsStore = new BFEventsStore();
    repository = new SessionsRepository(eventsStore);
  });

  it('Given no projections When getUserIdOfSession Then return empty', () => {
    const userIdForSession = repository.getUserIdOfSession(sessionId);

    expect(userIdForSession).to.be.null;
  });

  it('Given several user connected When getUserIdOfSession Then userId of this session', () => {
    repository.save(new SessionProjection(sessionId, userId, SessionProjection.SESSION_ENABLED));
    repository.save(
      new SessionProjection(new SessionId('SessionB'), new UserId('user2@mix-it.fr'), SessionProjection.SESSION_ENABLED),
    );

    expect(repository.getUserIdOfSession(sessionId)).to.eql(userId);
  });

  it('Given user disconnected When getUserIdOfSession Then return empty', () => {
    repository.save(new SessionProjection(sessionId, userId, SessionProjection.SESSION_DISABLED));

    expect(repository.getUserIdOfSession(sessionId)).to.be.null;
  });

  it('Given already projection When save same projection Then update projection', () => {
    repository.save(new SessionProjection(sessionId, userId, SessionProjection.SESSION_ENABLED));

    repository.save(new SessionProjection(sessionId, userId, SessionProjection.SESSION_DISABLED));

    expect(repository.getUserIdOfSession(sessionId)).to.be.null;
  });

  it('Given UserConnected When getSession Then return Session aggregate', () => {
    const userConnected = new UserConnected(sessionId, userId, new Date());
    eventsStore.store(userConnected);

    const userSession = repository.getSession(userConnected.sessionId);

    expect(userSession).not.to.empty;
  });

  it('Given no events When getSession Then throw UnknownSession', () => {
    expect(() => {
      repository.getSession(sessionId);
    }).to.throw(UnknownSession);
  });
});
