import { EventPublisher } from './event-publisher';
import { expect } from 'chai';

describe('EventPublisher', () => {
  var publisher;
  beforeEach(() => {
    publisher = EventPublisher.create();
  });

  class EventA {
    value: number;
    constructor() {
      this.value = 5;
    }
  };
  class EventB {
    constructor() { }
  };

  it('Given handler When publish Then call handler', () => {
    let called = false;
    publisher.on(EventA, () => called = true);

    publisher.publish(new EventA());

    expect(called).to.be.true;
  });

  it('Given different handlers When publish Then call right handler', () => {
    publisher.on(EventA, () => { throw new Error('Publish EventB, not EventA') });
    let eventBReceived = false;
    publisher.on(EventB, () => eventBReceived = true);

    publisher.publish(new EventB());

    expect(eventBReceived).to.be.true;
  });

  it('Given handler When publish Then pass event to action', () => {
    let eventReceived;
    publisher.on(EventA, (event) => eventReceived = event);

    publisher.publish(new EventA());

    expect(eventReceived.value).to.equal(5);
  });

  it('Given handler on all events When publish Then handler is called for all events', () => {
    let calledNb = 0;
    publisher.onAny(() =>calledNb++);

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
