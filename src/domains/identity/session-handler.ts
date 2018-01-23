import { SessionProjection, Session } from '.';
import {
  SessionsRepository,
  Event,
  EventPublisher,
  UserConnected,
  UserDisconnected
} from '../..';

/**
 * This class is used to map events to a projections repository.
 *
 * It listens for Session events and creates/updates projections.
 *
 * The persistence responsibility is on a dedicated Repository class
 * which is injected in this class' constructor.
 */
export class SessionHandler {
  sessionsRepository: SessionsRepository;

  constructor(sessionsRepository: SessionsRepository) {
    this.sessionsRepository = sessionsRepository;
  }

  saveProjection(event: UserConnected | UserDisconnected, isEnabled: boolean) {
    var projection = new SessionProjection(
      event.sessionId,
      event.userId,
      isEnabled
    );
    this.sessionsRepository.save(projection);
  }

  register(eventPublisher: EventPublisher) {
    eventPublisher
      .on(UserConnected, (event: UserConnected) => {
        this.saveProjection(event, SessionProjection.SessionEnabled);
      })
      .on(UserDisconnected, (event: UserDisconnected) => {
        this.saveProjection(event, SessionProjection.SessionDisabled);
      });
  }
}
