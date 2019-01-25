import { SessionProjection, Session } from '.';
import {
  SessionsRepository,
  BFEvent,
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
  constructor(public sessionsRepository: SessionsRepository) {
  }

  public saveProjection(event: UserConnected | UserDisconnected, isEnabled: boolean) {
    const projection = new SessionProjection(
      event.sessionId,
      event.userId,
      isEnabled
    );
    this.sessionsRepository.save(projection);
  }

  public register(eventPublisher: EventPublisher) {
    eventPublisher
      .on(UserConnected, (event: UserConnected) => {
        this.saveProjection(event, SessionProjection.SESSION_ENABLED);
      })
      .on(UserDisconnected, (event: UserDisconnected) => {
        this.saveProjection(event, SessionProjection.SESSION_DISABLED);
      });
  }
}
