import { ValueType } from '../value-type';

export class UserEmailCannotBeEmpty extends Error {
  constructor() {
    super();
    // see https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html
    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
  }
}

export class UserId extends ValueType {
  constructor(public email: string) {
    super();
    if (!email) {
      throw new UserEmailCannotBeEmpty();
    }
  }

  public toString() {
    return 'UserId:' + this.email;
  }
}
