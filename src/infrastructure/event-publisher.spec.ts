import { EventPublisher } from './event-publisher';
import { Event } from '..';
import { expect } from 'chai';

describe('EventPublisher', () => {
  let publisher: EventPublisher;
  beforeEach(() => {
    publisher = new EventPublisher();
  });

  class EventA implements Event {
    private value: number;
    constructor() {
      this.value = 5;
    }
    public getAggregateId() {
      return this.value;
    }
  }
  class EventB implements Event {
    public getAggregateId() {
      return null;
    }
  }

  it('Given handler When publish Then call handler', () => {
    let called = false;
    publisher.on(EventA, () => called = true);
    const eventA = new EventA();
    publisher.publish(eventA);

    expect(called).to.be.true;
    expect(eventA.getAggregateId()).to.equal(5);
  });

  it('Given different handlers When publish Then call right handler', () => {
    publisher.on(EventA, () => { throw new Error('Publish EventB, not EventA'); });
    let eventBReceived = false;
    publisher.on(EventB, () => eventBReceived = true);

    const eventB = new EventB();
    publisher.publish(eventB);

    expect(eventBReceived).to.be.true;
    expect(eventB.getAggregateId()).to.be.null;
  });

  it('Given handler When publish Then pass event to action', () => {
    let eventReceived;
    publisher.on(EventA, event => eventReceived = event);

    publisher.publish(new EventA());

    expect(eventReceived.value).to.equal(5);
  });

  it('Given handler on all events When publish Then handler is called for all events', () => {
    let calledNb = 0;
    publisher.onAny(() => calledNb++);

    publisher.publish(new EventA());
    publisher.publish(new EventB());

    expect(calledNb).to.equal(2);
  });

  it('Given several global handlers When publish Then all handlers are called', () => {
    let handler1Called = false;
    publisher.onAny(() => handler1Called = true );
    let handler2Called = false;
    publisher.onAny(() => handler2Called = true);

    publisher.publish(new EventA());

    expect(handler1Called).to.be.true;
    expect(handler2Called).to.be.true;
  });
});
