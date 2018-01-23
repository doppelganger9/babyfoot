import { Event } from "..";

export type DecisionApplierFunction = (
  this: DecisionProjection,
  event: Event
) => void;

export class DecisionProjection {
  data: Map<string, any>;
  handlers: Map<string, (event: Event) => void>;
  constructor() {
    this.handlers = new Map<string, DecisionApplierFunction>();
    this.data = new Map<string, any>();
  }

  register(
    eventType: string,
    action: DecisionApplierFunction
  ): DecisionProjection {
    this.handlers.set(eventType, action);

    return this;
  }

  apply(events: Array<Event> | Event): DecisionProjection {
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
