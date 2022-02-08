import { expect } from 'chai';
import { UserIdentityRepository } from '.';
import { UserId, UnknownUserIdentity, UserRegistered, BFEventsStore } from '..';

describe('UserIdentities Repository', () => {
  let repository: any;
  let eventsStore: any;
  beforeEach(() => {
    eventsStore = new BFEventsStore();
    repository = new UserIdentityRepository(eventsStore);
  });

  it('Given UserRegistered When getUserIdentity Then return UserIdentity aggregate', () => {
    const userRegistered = new UserRegistered(new UserId('user@mix-it.fr'));
    eventsStore.store(userRegistered);

    const user = repository.getUserIdentity(userRegistered.userId);

    expect(user).not.to.empty;
  });

  it('Given no events When getUserIdentity Then throw UnknownUserIdentity', () => {
    expect(() => {
      repository.getUserIdentity(new UserId('badUser@d.com'));
    }).to.throw(UnknownUserIdentity);
  });
});
