import { EventEmitter } from 'events';
import { Event } from '..';

export class EventPublisher {
  eventEmitter: EventEmitter;
  constructor() {
    this.eventEmitter = new EventEmitter();
  }

  on(eventType: any, action: (...args: any[]) => void): EventPublisher {
    this.eventEmitter.on(eventType.name, action);
    return this;
  }

  onAny(action: (...args: any[]) => void) {
    this.eventEmitter.on('*', action);
    return this;
  }

  publish(event: Event): void {
    this.eventEmitter.emit('*', event);

    const eventName = event.constructor.name;
    this.eventEmitter.emit(eventName, event);
  }
}
