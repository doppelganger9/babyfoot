import { Event } from "../../..";
import { BankAccount } from "../entity";

export class BankAccountCreated extends Event<BankAccount> {
  bankAccountId: string;
  constructor(bankAccountId: string) {
    super(undefined, undefined, 'BankAccountCreated');
    this.bankAccountId = bankAccountId;
  }
}
export class BankAccountDeleted extends Event<BankAccount> {
  bankAccountId: string;
  constructor(bankAccountId: string) {
    super(undefined, undefined, 'BankAccountDeleted');
    this.bankAccountId = bankAccountId;
  }
}

export class BankAccountCredited extends Event<BankAccount> {
  bankAccountId: string;
  amount: number;
  constructor(bankAccountId: string, amount: number) {
    super(undefined, undefined, 'BankAccountCredited');
    this.amount = amount;
    this.bankAccountId = bankAccountId;
  }
}

export class BankAccountDebited extends Event<BankAccount> {
  bankAccountId: string;
  amount: number;
  constructor(bankAccountId: string, amount: number) {
    super(undefined, undefined, 'BankAccountDebited');
    this.amount = amount;
    this.bankAccountId = bankAccountId;
  }
}

// to track errors, then block the account?
export class BankAccountDebitForbidden extends Event<BankAccount> {
  bankAccountId: string;
  constructor(bankAccountId: string) {
    super(undefined, undefined, 'BankAccountDebitForbidden');
    this.bankAccountId = bankAccountId;
  }
}

// after a certain number of errors
export class BankAccountBlocked extends Event<BankAccount> {
  bankAccountId: string;
  until: Date;
  constructor(bankAccountId: string, until: Date) {
    super(undefined, undefined, 'BankAccountBlocked');
    this.until = until;
    this.bankAccountId = bankAccountId;
  }
}

// specific event that could be emitted to override the rules...
export class BankAccountUnblocked extends Event<BankAccount> {
  bankAccountId: string;
  constructor(bankAccountId: string) {
    super(undefined, undefined, 'BankAccountUnblocked');
    this.bankAccountId = bankAccountId;
  }
}
