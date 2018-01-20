import { EventEmitter } from 'events';

export class EventPublisher {
  eventEmitter = new EventEmitter();

  on(eventType:any, action: (...args: any[]) => void): EventPublisher {
    this.eventEmitter.on(eventType.name, action);
    return this;
  }

  onAny(action: (...args: any[]) => void) {
    this.eventEmitter.on('*', action);
    return this;
  }

  publish(event: string|symbol) {
    this.eventEmitter.emit('*', event);

    var eventName = event.constructor.name;
    this.eventEmitter.emit(eventName, event);
  }

  static create() {
    return new EventPublisher();
  }
}
