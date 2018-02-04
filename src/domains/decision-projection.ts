import { Event } from '..';

export type DecisionApplierFunction = (
  this: DecisionProjection,
  event: Event
) => void;

export class DecisionProjection {
  constructor(
    public data: Map<string, any> = new Map<string, DecisionApplierFunction>(),
    public handlers: Map<string, (event: Event) => void> = new Map<string,any>(),
  ) {}

  public register(
    eventType: string,
    action: DecisionApplierFunction,
  ): DecisionProjection {
    this.handlers.set(eventType, action);

    return this;
  }

  public apply(events: Array<Event> | Event): DecisionProjection {
    if (events instanceof Array) {
      events.forEach(it => this.apply(it));
      return this;
    }

    const event: Event = events;
    const typeName = event.constructor.name;

    const handler: DecisionApplierFunction | undefined = this.handlers.get(
      typeName
    );
    if (handler) {
      handler.call(this, event);
    }

    return this;
  }
}
