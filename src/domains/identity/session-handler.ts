import { SessionProjection, Session } from '.';
import {
  SessionsRepository,
  Event,
  EventPublisher,
  UserConnected,
  UserDisconnected
} from '../..';

export class SessionHandler {
  sessionsRepository: SessionsRepository;

  constructor(sessionsRepository: SessionsRepository) {
    this.sessionsRepository = sessionsRepository;
  }

  saveProjection(event: UserConnected | UserDisconnected, isEnabled: boolean) {
    var projection = SessionProjection.create(
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

  static create(sessionsRepository: SessionsRepository): SessionHandler {
    return new SessionHandler(sessionsRepository);
  }
}
