import { BFEventsStore, BFEventDontContainsAggregateId, BFEvent } from './event-store';
import { beforeEach, describe, expect, it } from 'vitest';
import { ValueType } from '../value-type';

describe('BFEventsStore', () => {
  let eventsStore: BFEventsStore;
  beforeEach(() => {
    eventsStore = new BFEventsStore();
  });

  class TestAggregateId extends ValueType {
    constructor(public id: string) {
      super();
    }
    public toString(): string {
      return 'Id:' + this.id;
    }
  }

  class TestEvent implements BFEvent<TestAggregateId> {
    constructor(
      public aggregateId: TestAggregateId,
      public num: number = 0,
    ) {
      this.aggregateId = aggregateId;
      this.num = num;
    }
    public getAggregateId(): TestAggregateId {
      return this.aggregateId;
    }
  }
  class BadEvent implements BFEvent {
    public getAggregateId(): void {
      return;
    }
  }

  it('When store event of aggregate Then can get this event of aggregate', () => {
    const aggregateId = new TestAggregateId('AggregateA');
    eventsStore.store(new TestEvent(aggregateId));

    const result = eventsStore.getEventsOfAggregate(aggregateId);

    expect(result).to.be.of.length(1);
    expect(result[0].getAggregateId()).to.equal(aggregateId);
    expect(result[0].getAggregateId().toString()).to.equal('Id:AggregateA');
  });

  it('When get this event of aggregate Then use equals and not operator', () => {
    const id = 'AggregateA';
    eventsStore.store(new TestEvent(new TestAggregateId(id)));

    const result = eventsStore.getEventsOfAggregate(new TestAggregateId(id));

    expect(result).to.be.of.length(1);
    expect(result[0].getAggregateId().id).to.equal(id);
  });

  it('Given events of several aggregates When getEventsOfAggregate Then return events of only this aggregate', () => {
    const aggregateId1 = new TestAggregateId('AggregateA');
    const aggregateId2 = new TestAggregateId('AggregateB');
    eventsStore.store(new TestEvent(aggregateId1));
    eventsStore.store(new TestEvent(aggregateId2));
    eventsStore.store(new TestEvent(aggregateId1));

    const result = eventsStore.getEventsOfAggregate(aggregateId1);
    // @ts-ignore
    const mapped = result.map((it: TestEvent) => it.aggregateId);
    expect(mapped).to.contain(aggregateId1).and.not.contain(aggregateId2);
    expect(result).to.have.length(2);
  });

  it('When store event without aggregateId Then throw exception', () => {
    expect(() => {
      eventsStore.store(new BadEvent());
    }).to.throw(BFEventDontContainsAggregateId);
  });

  it('Given several events When GetEventsOfAggregate Then return events and preserve order', () => {
    const aggregateId1 = new TestAggregateId('AggregateA');
    const aggregateId2 = new TestAggregateId('AggregateB');
    eventsStore.store(new TestEvent(aggregateId1, 1));
    eventsStore.store(new TestEvent(aggregateId1, 2));
    eventsStore.store(new TestEvent(aggregateId1, 3));

    const result = eventsStore.getEventsOfAggregate(aggregateId1);

    expect(result).to.have.length(3);
    // @ts-ignore
    expect(result.sort((a: TestEvent, b: TestEvent) => a.num - b.num) as any).to.deep.equals(result);
  });
});
