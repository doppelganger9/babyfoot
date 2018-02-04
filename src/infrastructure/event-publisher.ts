import { EventEmitter } from 'events';
import { Event } from '..';

export class EventPublisher {
  private eventEmitter: EventEmitter;
  constructor() {
    this.eventEmitter = new EventEmitter();
  }

  public on(eventType: any, action: (...args: Array<any>) => void): EventPublisher {
    this.eventEmitter.on(eventType.name, action);
    return this;
  }

  public onAny(action: (...args: Array<any>) => void) {
    this.eventEmitter.on('*', action);
    return this;
  }

  public publish(event: Event): void {
    this.eventEmitter.emit('*', event);

    const eventName = event.constructor.name;
    this.eventEmitter.emit(eventName, event);
  }
}
