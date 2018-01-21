export interface Event<T = any> {
  getAggregateId(): T;
}

export class EventDontContainsAggregateId extends Error {
  eventName: string;
  constructor(eventName: string) {
    super();
    this.eventName = eventName;
    // see https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html
    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
  }
}

export class EventsStore {
  events: Array<Event>;
  constructor() {
    this.events = [];
    //need to capture "this" as that method will be called by EventEmitter which will bind itself as this...
    // see :https://ponyfoo.com/articles/binding-methods-to-class-instance-objects
    this.store = this.store.bind(this);
  }

  store(event: Event): void {
    if (!event.getAggregateId()) {
      throw new EventDontContainsAggregateId(event.constructor.name);
    }
    this.events.push(event);
  }

  getEventsOfAggregate(aggregateId: any): Array<Event> {
    return this.events.filter(
      (it: Event) =>
        JSON.stringify(it.getAggregateId()) === JSON.stringify(aggregateId)
    );
  }

  static create(): EventsStore {
    return new EventsStore();
  }
}
