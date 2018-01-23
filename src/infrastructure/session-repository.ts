import { UserId, Event, SessionId, EventsStore, Session, SessionProjection } from '..';

/**
 * This class is a custom Error.
 * NOTE: In typescript there is a problem with the prototype chain, so we need a little hack to keep it.
 * see https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html
 */
export class UnknownSession extends Error {
  sessionId: SessionId;

  constructor(sessionId: SessionId) {
    super();
    this.sessionId = sessionId;
    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
  }
}

/**
 * This class stores all Session projections.
 */
export class SessionsRepository {
  projections = new Map();
  eventsStore: EventsStore;

  constructor(eventsStore: EventsStore) {
    this.eventsStore = eventsStore;
  }

  /**
   * return the UserId linked to a SessionId in the repository
   * @param sessionId the id to search for
   */
  getUserIdOfSession(sessionId: SessionId): UserId | null {
    var projection = this.projections.get(sessionId);
    if (!projection || !projection.isEnabled) {
      return null;
    }

    return projection.userId;
  }

  /**
   * @param projection projection to save in repository
   */
  save(projection: SessionProjection): void {
    this.projections.set(projection.sessionId, projection);
  }

  /**
   * returns all events for a given SessionId.
   * @param sessionId filter
   */
  getAllEvents(sessionId: SessionId): Array<Event> {
    var events: Array<Event> = this.eventsStore.getEventsOfAggregate(sessionId);
    if (!events.length) {
      throw new UnknownSession(sessionId);
    }

    return events;
  }

  /**
   * returns the Session Aggregate for the given id.
   * The Session Aggregate is created from events (event sourcing).
   * @param sessionId filter
   */
  getSession(sessionId: SessionId): Session {
    var events: Event[] = this.getAllEvents(sessionId);
    return new Session(events);
  }
}
