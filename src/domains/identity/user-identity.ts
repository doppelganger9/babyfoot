import { UserId, Session, DecisionProjection, Event, DecisionApplierFunction, SessionId } from "../..";


export class UserRegistered implements Event {
  userId: UserId;

  constructor(userId: UserId) {
    this.userId = userId;

    Object.freeze(this);
  }

  getAggregateId() {
    return this.userId;
  }
}

export class UserIdentity {
  projection: DecisionProjection;

  constructor(events: Array<Event>) {
    this.projection = DecisionProjection.create()
      .register('UserRegistered', function (this: DecisionProjection, event: UserRegistered): void {
        this.data.set('id', event.userId);
      } as DecisionApplierFunction)
      .apply(events);
  }

  logIn(publishEvent: (event: Event) => void): SessionId {
    return Session.logIn(publishEvent, this.projection.data.get('id'));
  }

  static register(publishEvent: (event: Event) => void, email: string): void {
    var id = new UserId(email);
    publishEvent(new UserRegistered(id));
  }

  static create(events: Array<Event>): UserIdentity {
    return new UserIdentity(events);
  }
}
