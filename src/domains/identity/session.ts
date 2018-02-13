import {
  ValueType,
  UserId,
  DecisionApplierFunction,
  EventPublisher,
  DecisionProjection,
  generateUUID,
  Event,
} from '../..';

/************** VALUE TYPES **************/

export class SessionId extends ValueType {
  constructor(public id: string) {
    super();
  }

  public toString(): string {
    return 'Session:' + this.id;
  }
}

/************** EVENTS **************/

export class UserConnected implements Event<SessionId> {
  constructor(public sessionId: SessionId, public userId: UserId, public connectedAt: Date) {
    Object.freeze(this);
  }

  public getAggregateId(): SessionId {
    return this.sessionId;
  }
}

export class UserDisconnected implements Event {
  constructor(public sessionId: SessionId, public userId: UserId) {
    Object.freeze(this);
  }

  public getAggregateId() {
    return this.sessionId;
  }
}

/************** AGGREGATE **************/

export class Session {
  // Command
  public static logIn(publishEvent: EventPublisher, userId: UserId): SessionId {
    const sessionId: SessionId = new SessionId(generateUUID());
    publishEvent.publish(new UserConnected(sessionId, userId, new Date()));

    return sessionId;
  }

  public projection: DecisionProjection;

  constructor(events: Array<Event> | Event) {
    this.projection = new DecisionProjection()
      .register('UserConnected', function(this: DecisionProjection, event: UserConnected): void {
        // warning, "this" is bound to the DecisionProjection.
        this.data.set('userId', event.userId);
        this.data.set('sessionId', event.sessionId);
      } as DecisionApplierFunction)
      .register('UserDisconnected', function(this: DecisionProjection, event: UserDisconnected): void {
        this.data.set('isDisconnected', true);
      } as DecisionApplierFunction)
      .apply(events);
  }

  // Command
  public logOut(publishEvent: EventPublisher): void {
    if (this.projection.data.get('isDisconnected')) {
      return;
    }

    publishEvent.publish(
      new UserDisconnected(this.projection.data.get('sessionId'), this.projection.data.get('userId')),
    );
  }
}
