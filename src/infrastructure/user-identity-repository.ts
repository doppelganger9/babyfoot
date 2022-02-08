import { UserId, UserIdentity, BFEventsStore, BFEvent } from '..';

export class UnknownUserIdentity extends Error {
  constructor(public userId: UserId) {
    super();

    // see https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html
    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
  }
}

export class UserIdentityRepository {
  constructor(public eventsStore: BFEventsStore) {}

  public getAllEvents(userId: UserId): Array<BFEvent> {
    const events: Array<BFEvent> = this.eventsStore.getEventsOfAggregate(userId);
    if (!events.length) {
      throw new UnknownUserIdentity(userId);
    }

    return events;
  }

  public getUserIdentity(userId: UserId): UserIdentity {
    const events: Array<BFEvent> = this.getAllEvents(userId);
    return new UserIdentity(events);
  }
}
