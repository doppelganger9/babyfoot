
import { expect } from 'chai';
import { UserIdentityRepository } from '.';
import { UserId, UnknownUserIdentity, UserRegistered, EventsStore } from '..';

describe('UserIdentities Repository', () => {
  let repository;
  let eventsStore;
  beforeEach(() => {
    eventsStore = EventsStore.create();
    repository = UserIdentityRepository.create(eventsStore);
  });

  it('Given UserRegistered When getUserIdentity Then return UserIdentity aggregate', () => {
    var userRegistered = new UserRegistered(
      new UserId('user@mix-it.fr')
    );
    eventsStore.store(userRegistered);

    var user = repository.getUserIdentity(userRegistered.userId);

    expect(user).not.to.empty;
  });

  it('Given no events When getUserIdentity Then throw UnknownUserIdentity', () => {
    expect(() => {
      repository.getUserIdentity(new UserId('badUser@d.com'));
    }).to.throw(UnknownUserIdentity);
  });
});
