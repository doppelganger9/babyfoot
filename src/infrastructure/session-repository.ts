import { EventsStore } from "./event-store";

import { Session } from '../domains/identity/session';
import { UserId, Event } from "../index";

export class UnknownSession extends Error {
  sessionId: string;

  constructor(sessionId: string) {
    super();
    this.sessionId = sessionId;

    // see https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html
    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
  }
}

export class SessionsRepository {
  projections = new Map();
  eventsStore: EventsStore;

  constructor(eventsStore: EventsStore) {
    this.eventsStore = eventsStore;
  }

  getUserIdOfSession(sessionId: string): UserId | null {
    var projection = this.projections.get(sessionId);
    if (!projection || !projection.isEnabled) {
      return null;
    }

    return projection.userId;
  }

  save(projection: any): void {
    this.projections.set(projection.sessionId, projection);
  };

  getAllEvents(sessionId: string): Array<Event> {
    var events: Array<Event> = this.eventsStore.getEventsOfAggregate(sessionId);
    if (!events.length) {
      throw new UnknownSession(sessionId);
    }

    return events;
  };

  getSession(sessionId: string): Session {
    var events: Event[] = this.getAllEvents(sessionId);
    return Session.create(events);
  };

  static create(eventsStore: EventsStore) : SessionsRepository {
    return new SessionsRepository(eventsStore);
  }
}
