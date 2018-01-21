import { ValueType, UserId, DecisionApplierFunction, EventPublisher, DecisionProjection, generateUUID, Event } from "../..";

/************** VALUE TYPES **************/

export class SessionId extends ValueType {

  id: string;

  constructor(id: string) {
    super();
    this.id = id;
  }

  toString(): string {
    return 'Session:' + this.id;
  }
}

/************** EVENTS **************/

export class UserConnected implements Event<SessionId> {
  sessionId: SessionId;
  userId: UserId;
  connectedAt: Date;

  constructor(sessionId: SessionId, userId: UserId, connectedAt: Date) {
    this.sessionId = sessionId;
    this.userId = userId;
    this.connectedAt = connectedAt;

    Object.freeze(this);
  }

  getAggregateId(): SessionId {
    return this.sessionId;
  }
}

export class UserDisconnected implements Event {
  sessionId: SessionId;
  userId: UserId;
  constructor(
    sessionId: SessionId,
    userId: UserId
  ) {
    this.sessionId = sessionId;
    this.userId = userId;

    Object.freeze(this);
  }

  getAggregateId() {
    return this.sessionId;
  }
}

/************** AGGREGATE **************/

export class Session {
  projection: DecisionProjection;

  constructor(events: Array<Event> | Event) {
    this.projection = DecisionProjection
      .create()
      .register('UserConnected', function (this: DecisionProjection, event: UserConnected): void {
        this.data.set('userId', event.userId);
        this.data.set('sessionId', event.sessionId);
      } as DecisionApplierFunction)
      .register('UserDisconnected', function (this: DecisionProjection, event: UserDisconnected): void {
        this.data.set('isDisconnected', true);
      } as DecisionApplierFunction)
      .apply(events);
  }

  logOut(publishEvent: EventPublisher): void {
    if (this.projection.data.get('isDisconnected')) {
      return;
    }

    publishEvent.publish(new UserDisconnected(this.projection.data.get('sessionId'), this.projection.data.get('userId')));
  }

  static logIn(publishEvent: EventPublisher, userId: UserId): SessionId {
    const sessionId: SessionId = new SessionId(generateUUID());
    publishEvent.publish(new UserConnected(sessionId, userId, new Date()));

    return sessionId;
  }

  static create(events: Array<Event> | Event): Session {
    return new Session(events);
  }
}
