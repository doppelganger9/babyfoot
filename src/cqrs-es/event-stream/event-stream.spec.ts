import { EventListener, EventStream } from "..";
import { Event, Entity, UUID } from "..";
import { expect } from 'chai';

class TestListener implements EventListener {
  received: Array<Event<any>>;
  text: string;
  constructor(text: string) {
    this.text = text;
  }
  apply(event: Event<any>) {
    console.log(this.text + ' received event : ' + event);
  }
}
class TestEntity extends Entity {}
class TestEvent extends Event<TestEntity> {}

describe('EventStream', () => {

  let t: EventStream;
  let listener1: TestListener;
  let listener2: TestListener;

  before(() => {
    t = new EventStream();
    listener1 = new TestListener('listener ONE');
    listener2 = new TestListener('listener TWO');
  });

  it('should create an Event Stream with empty arrays', () => {
    expect(t.eventStore.length, 'eventStore should be empty').to.equal(0);
    expect(t.listeners.length, 'listeners should be empty').to.equal(0);
  });

  it('registerListener should work', () => {
    t.registerListener(listener1);
    expect(t.eventStore.length, 'eventStore should be empty').to.equal(0);
    expect(t.listeners.length, 'listeners contain one element').to.equal(1);
  });
  it('registerListener should work 2 times', () => {
    t.registerListener(listener2);
    expect(t.eventStore.length, 'eventStore should be empty').to.equal(0);
    expect(t.listeners.length, 'listeners contain 2 elements').to.equal(2);
  });
  it('emit should broadcast event to all listeners and save event in eventStore', () => {
    t.emit(new TestEvent(undefined, new TestEntity(new UUID('1'))));
    expect(t.eventStore.length, 'eventStore should contain 1 element').to.equal(
      1
    );
    expect(t.listeners.length, 'listeners contain 2 elements').to.equal(2);
  });
  it('unregister should only delete the one we want', () => {
    t.unregisterListener(listener1);
    expect(t.eventStore.length, 'eventStore contain one element').to.equal(1);
    expect(t.listeners.length, 'listeners contain one element').to.equal(1);
  });
});
