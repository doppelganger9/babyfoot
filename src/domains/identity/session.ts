import { ValueType } from "../../value-type";
import { Event } from "../../infrastructure/event-store";
import { DecisionProjection } from "../decision-projection";
import { generateUUID } from '../../id-generator';
import { UserId, DecisionApplierFunction } from "../../index";

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

  logOut(publishEvent: (event: Event)=>void) {
    if (this.projection.data.get('isDisconnected')) {
      return;
    }

    publishEvent(new UserDisconnected(this.projection.data.get('sessionId'), this.projection.data.get('userId')));
  }

  static logIn(publishEvent: any, userId: UserId) {
    const sessionId: SessionId = new SessionId(generateUUID());
    publishEvent(new UserConnected(sessionId, userId, new Date()));

    return sessionId;
  }

  static create(events: Array<Event> | Event) {
    return new Session(events);
  }
}
