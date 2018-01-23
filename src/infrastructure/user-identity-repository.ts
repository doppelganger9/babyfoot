import { UserId, UserIdentity, EventsStore, Event } from '..';

export class UnknownUserIdentity extends Error {
  userId: UserId;

  constructor(userId: UserId) {
    super();
    this.userId = userId;

    // see https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html
    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
  }
}

export class UserIdentityRepository {
  eventsStore: EventsStore;

  constructor(eventsStore: EventsStore) {
    this.eventsStore = eventsStore;
  }

  getAllEvents(userId: UserId): Array<Event> {
    var events: Array<Event> = this.eventsStore.getEventsOfAggregate(userId);
    if (!events.length) {
      throw new UnknownUserIdentity(userId);
    }

    return events;
  }

  getUserIdentity(userId: UserId): UserIdentity {
    var events: Array<Event> = this.getAllEvents(userId);
    return new UserIdentity(events);
  }
}
