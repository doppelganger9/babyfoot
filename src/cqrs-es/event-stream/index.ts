import { Event, Entity, UUID } from '..';

export interface EventListener {
  apply(event: Event<any>) : void;
}

export class EventStream {
  listeners: Array<EventListener>;
  eventStore: Array<Event<any>>; //any /* damn, my Event with Generics forces me here to only have one type ... */ >;

  constructor() {
    this.eventStore = [];
    this.listeners = [];
  }

  emit(event: Event<any>) {
    // save this event to the store
    this.eventStore.push(event);
    // broadcast this event to all listeners (without filering yet).
    this.listeners.forEach(x => x.apply(event));
  }

  registerListener(listener: EventListener) {
    // do not allow duplicates
    if (this.listeners.filter(x => x === listener).length > 0) {
      throw new Error('already registered this listener');
    }
    this.listeners.push(listener);
  }

  unregisterListener(listener: EventListener) {
    let indexFound: number = undefined;
    const listenersFound = this.listeners.filter((x, index) => {
      if (x === listener) {
        indexFound = index;
        return 1;
      } else {
        return 0;
      }
    });
    if (listenersFound.length <= 0) {
      throw new Error('No listener found');
    }
    this.listeners.splice(indexFound, 1);
  }
}
