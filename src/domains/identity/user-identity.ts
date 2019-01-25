import {
  UserId,
  Session,
  DecisionProjection,
  BFEvent,
  DecisionApplierFunction,
  SessionId,
  EventPublisher
} from '../..';

export class UserRegistered implements BFEvent {
  constructor(public userId: UserId) {
    Object.freeze(this);
  }
  public getAggregateId() {
    return this.userId;
  }
}

export class UserIdentity {

  public static register(eventPublisher: EventPublisher, email: string): void {
    const id = new UserId(email);
    eventPublisher.publish(new UserRegistered(id));
  }

  public projection: DecisionProjection;

  constructor(events: Array<BFEvent>) {
    this.projection = new DecisionProjection()
      .register('UserRegistered', function(
        this: DecisionProjection,
        event: UserRegistered
      ): void {
        this.data.set('id', event.userId);
      } as DecisionApplierFunction)
      .apply(events);
  }

  public logIn(publishEvent: EventPublisher): SessionId {
    return Session.logIn(publishEvent, this.projection.data.get('id'));
  }
}
