import { EventsStore, EventDontContainsAggregateId, Event } from './event-store';
import { ValueType } from '../value-type';
import { expect } from 'chai';

describe('EventsStore', () => {
  let eventsStore : EventsStore;
  beforeEach(() => {
    eventsStore = EventsStore.create();
  });

  class AggregateId extends ValueType {
    id: string;
    constructor(id: string) {
      super();
      this.id = id;
    }
    toString(): string {
      return 'Id:' + this.id;
    }
  }

  class TestEvent implements Event<AggregateId> {
    aggregateId: AggregateId;
    num: number;
    constructor(aggregateId: AggregateId, num: number = 0) {
      this.aggregateId = aggregateId;
      this.num = num;
    }
    getAggregateId(): AggregateId {
      return this.aggregateId;
    }
  }
  class BadEvent implements Event {
    getAggregateId(): void {
    }
  }

  it('When store event of aggregate Then can get this event of aggregate', () => {
    const aggregateId = new AggregateId('AggregateA');
    eventsStore.store(new TestEvent(aggregateId));

    const result = eventsStore.getEventsOfAggregate(aggregateId);

    expect(result).to.be.of.length(1);
    expect(result[0].getAggregateId()).to.equal(aggregateId);
  });

  it('When get this event of aggregate Then use equals and not operator', () => {
    var id = 'AggregateA';
    eventsStore.store(new TestEvent(new AggregateId(id)));

    const result = eventsStore.getEventsOfAggregate(new AggregateId(id));

    expect(result).to.be.of.length(1);
    expect(result[0].getAggregateId().id).to.equal(id);
  });

  it('Given events of several aggregates When getEventsOfAggregate Then return events of only this aggregate', () => {
    const aggregateId1 = new AggregateId('AggregateA');
    const aggregateId2 = new AggregateId('AggregateB');
    eventsStore.store(new TestEvent(aggregateId1));
    eventsStore.store(new TestEvent(aggregateId2));
    eventsStore.store(new TestEvent(aggregateId1));

    const result = eventsStore.getEventsOfAggregate(aggregateId1);
    const mapped = result.map((it: TestEvent) => it.aggregateId);
    expect(mapped)
      .to.contain(aggregateId1)
      .and.not.contain(aggregateId2);
    expect(result).to.have.length(2);
  });

  it('When store event without aggregateId Then throw exception', () => {
    expect(() => {
      eventsStore.store(new BadEvent());
    }).to.throw(EventDontContainsAggregateId);
  });

  it('Given several events When GetEventsOfAggregate Then return events and preserve order', () => {
    const aggregateId1 = new AggregateId('AggregateA');
    const aggregateId2 = new AggregateId('AggregateB');
    eventsStore.store(new TestEvent(aggregateId1, 1));
    eventsStore.store(new TestEvent(aggregateId1, 2));
    eventsStore.store(new TestEvent(aggregateId1, 3));

    const result = eventsStore.getEventsOfAggregate(aggregateId1);

    expect(result).to.have.length(3);
    expect(result.sort((a:TestEvent,b:TestEvent) => a.num - b.num)).to.deep.equals(result);
  });
});
