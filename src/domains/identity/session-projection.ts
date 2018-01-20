
export class SessionProjection {
  sessionId: any;
  userId: any;
  isEnabled: boolean;

  static SessionEnabled = true;
  static SessionDisabled = false;

  constructor(sessionId: any, userId: any, isEnabled: boolean) {
    this.sessionId = sessionId;
    this.userId = userId;
    this.isEnabled = isEnabled;
  }

  static create(sessionId: any, userId: any, isEnabled: boolean): SessionProjection {
    return new SessionProjection(sessionId, userId, isEnabled);
  }
}
