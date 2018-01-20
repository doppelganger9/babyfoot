import { UserId } from './user-id';
import { expect } from 'chai';
import { UserEmailCannotBeEmpty } from '../index';

describe('UserId', () => {
  const email = 'user@mix-it.fr';

  it('When create UserId Then toString return email', () => {
    const id = new UserId(email);

    expect(id.toString()).to.eql('UserId:' + email);
  });

  it('When create UserId with empty email Then throw UserEmailCannotBeEmpty exception', () => {
    expect(() => {
      new UserId('');
    }).to.throw(UserEmailCannotBeEmpty);
  });
});
