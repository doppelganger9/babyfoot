export interface BFEvent<T = any> {
  getAggregateId(): T;
}

export class BFEventDontContainsAggregateId extends Error {
  constructor(public eventName: string) {
    super();
    // see https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html
    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
  }
}

export class BFEventsStore {
  public events: Array<BFEvent>;
  constructor() {
    this.events = [];
    // need to capture "this" as that method will be called by EventEmitter which will bind itself as this...
    // see :https://ponyfoo.com/articles/binding-methods-to-class-instance-objects
    this.store = this.store.bind(this);
  }

  public store(event: BFEvent): void {
    if (!event.getAggregateId()) {
      throw new BFEventDontContainsAggregateId(event.constructor.name);
    }
    this.events.push(event);
  }

  public getEventsOfAggregate(aggregateId: any): Array<BFEvent> {
    return this.events.filter(
      (it: BFEvent) =>
        JSON.stringify(it.getAggregateId()) === JSON.stringify(aggregateId)
    );
  }
}
