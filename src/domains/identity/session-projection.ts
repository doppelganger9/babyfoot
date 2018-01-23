import { SessionId, UserId } from "../..";

/**
 * This class represents a projection of a Session.
 *
 * This is the QUERY side of a Session.
 */
export class SessionProjection {
  sessionId: SessionId;
  userId: UserId;
  isEnabled: boolean;

  static SessionEnabled = true;
  static SessionDisabled = false;

  constructor(sessionId: SessionId, userId: UserId, isEnabled: boolean) {
    this.sessionId = sessionId;
    this.userId = userId;
    this.isEnabled = isEnabled;
  }
}
