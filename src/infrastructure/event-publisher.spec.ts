import { EventPublisher } from './event-publisher';
import { BFEvent } from '..';
import { expect } from 'chai';

describe('EventPublisher', () => {
  let publisher: EventPublisher;
  beforeEach(() => {
    publisher = new EventPublisher();
  });

  class BFEventA implements BFEvent {
    private value: number;
    constructor() {
      this.value = 5;
    }
    public getAggregateId() {
      return this.value;
    }
  }
  class BFEventB implements BFEvent {
    public getAggregateId() {
      return null;
    }
  }

  it('Given handler When publish Then call handler', () => {
    let called = false;
    publisher.on(BFEventA, () => {
      called = true;
    });
    const eventA = new BFEventA();
    publisher.publish(eventA);

    expect(called).to.be.true;
    expect(eventA.getAggregateId()).to.equal(5);
  });

  it('Given different handlers When publish Then call right handler', () => {
    publisher.on(BFEventA, () => {
      throw new Error('Publish EventB, not EventA');
    });
    let eventBReceived = false;
    publisher.on(BFEventB, () => {
      eventBReceived = true;
    });

    const eventB = new BFEventB();
    publisher.publish(eventB);

    expect(eventBReceived).to.be.true;
    expect(eventB.getAggregateId()).to.be.null;
  });

  it('Given handler When publish Then pass event to action', () => {
    let eventReceived: any;
    publisher.on(BFEventA, event => {
      eventReceived = event;
    });

    publisher.publish(new BFEventA());
    expect(eventReceived).to.be.not.undefined;
    expect(eventReceived!.value).to.equal(5);
  });

  it('Given handler on all events When publish Then handler is called for all events', () => {
    let calledNb = 0;
    publisher.onAny(() => calledNb++);

    publisher.publish(new BFEventA());
    publisher.publish(new BFEventB());

    expect(calledNb).to.equal(2);
  });

  it('Given several global handlers When publish Then all handlers are called', () => {
    let handler1Called = false;
    publisher.onAny(() => {
      handler1Called = true;
    });
    let handler2Called = false;
    publisher.onAny(() => {
      handler2Called = true;
    });

    publisher.publish(new BFEventA());

    expect(handler1Called).to.be.true;
    expect(handler2Called).to.be.true;
  });
});
