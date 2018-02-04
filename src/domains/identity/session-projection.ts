import { SessionId, UserId } from '../..';

/**
 * This class represents a projection of a Session.
 *
 * This is the QUERY side of a Session.
 */
export class SessionProjection {
  public static SESSION_ENABLED = true;
  public static SESSION_DISABLED = false;

  constructor(public sessionId: SessionId, public userId: UserId, public isEnabled: boolean) {
  }
}
