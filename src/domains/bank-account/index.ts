import { Entity, UUID, Event, EventStream, EventListener } from '../../cqrs-es';

// client app or UI will use this to both have access
// to Commands(Writes) and Queries(Reads)
export class BankAccountDomain implements EventListener {
  projections: Array<BankAccount>;
  eventStream: EventStream;

  constructor(eventStream: EventStream) {
    this.eventStream = eventStream;
    this.projections = [];
  }

  createAccount(id: string): void {
    // Decision based on projections (based on past events)
    if (!id) {
      throw new Error('id must be provided');
    }
    if (this.projections.filter(it => it.id.value === id).length > 0) {
      throw new Error('account with this ID already exists');
    }
    this.eventStream.emit(new BankAccountCreated(id));
  }

  deleteAccount(id: string): void {
    // Decision based on projections (based on past events)
    if (!id) {
      throw new Error('id must be provided');
    }
    const foundItem = this.projections.find(it => it.id.value === id);
    if (!foundItem) {
      // TODO : or the projections could be inconsistent ?
      throw new Error('account with this ID does not exist');
    }
    this.eventStream.emit(new BankAccountDeleted(id));
  }

  creditAccount(id:string, amount: number): void {
    // Decision based on projections (based on past events and rules, relations, etc.)
    if (amount <= 0) {
      throw new Error('amount must be > 0');
    }
    if (!id) {
      throw new Error('id must be provided');
    }
    const foundItem = this.projections.find(it => it.id.value === id);
    if (!foundItem) { // TODO : or the projections could be inconsistent ?
      throw new Error('account with this ID does not exist');
    }
    // always allow to add money to an account :-D \o/ \o\ /o/ \o/
    this.eventStream.emit(new BankAccountCredited(
      foundItem.id.value/* NOTE : in fact I would prefer an immutable copy here or just the ID, I don't need to send a full projection object inside the event */,
      amount
    ));
  }

  debitAccount(id:string, amount: number): void {
    // Decision based on projections (based on past events and rules, relations, etc.)
    if (amount <= 0) {
      throw new Error('amount must be > 0');
    }
    if (!id) {
      throw new Error('id must be provided');
    }
    const foundItem = this.projections.find(it => it.id.value === id);
    if (!foundItem) { // TODO : or the projections could be inconsistent ?
      throw new Error('account with this ID does not exist');
    }
    // Other decisions like a check if the current balance - asked credit will still be >=0 and if account is currently blocked
    if (foundItem.blockCountdown === 0) {
      if (!foundItem.blockedUntil) {

        const now = new Date();
        const ONE_HOUR__ms = 1 /* hours */ * 60 /* minutes */ * 60 /* seconds */ * 1000 /* milliseconds */;
        const oneHourFromNow = new Date(now.getTime() + ONE_HOUR__ms);

        this.eventStream.emit(new BankAccountBlocked(foundItem.id.value, oneHourFromNow));
        throw new Error('account blocked until ' + oneHourFromNow);
      } else {
        if (foundItem.blockedUntil.getTime() > new Date().getTime()) {
          throw new Error('account blocked until ' + foundItem.blockedUntil);
        } else {
          // NOTE: Maybe this will mess up if other events follow ? or not...
          this.eventStream.emit(new BankAccountUnblocked(foundItem.id.value));
        }
      }
    } else if (foundItem.balance - amount < 0) {
      // just to implement a blocking mechanism.
      this.eventStream.emit(new BankAccountDebitForbidden(foundItem));
      throw new Error('insufficient balance');
    }
    this.eventStream.emit(new BankAccountDebited(
      foundItem.id.value/* NOTE : in fact I would prefer an immutable copy here or just the ID, I don't need to send a full projection object inside the event */,
      amount
    ));
  }

  getAccount(id: string): BankAccount {
    // NOTE: maybe reconstruct all projections under some special circumstances ?
    return this.projections.filter(it => it.id.value === id).pop();
  }

  fromScratch(events: Array<Event<BankAccount>> = []) {
    if (events.length > 0) {
      // first apply all the events in the list
      events.forEach(it => this.apply(it));
    }
  }

  apply(event: Event<BankAccount> = null) {
    if (!event) {
      return;
    }
    // apply new event
    if (event.name === 'BankAccountCreated') {
      // "immutable" copy of entity passed in event.
      // If I want to remove the entity from being in the event, I can.
      const newAccount = new BankAccount((event as BankAccountCreated).bankAccountId, 0);
      this.projections.push(newAccount);

    } else if (event.name === 'BankAccountDeleted') {
      const foundItemIndex: number = this.projections.findIndex(it => it.id.value === (event as BankAccountDeleted).bankAccountId);
      this.projections.splice(foundItemIndex, 1);

    } else if (event.name === 'BankAccountCredited') {
      const foundItem: BankAccount = this.projections.find(it => it.id.value === (event as BankAccountCredited).bankAccountId);
      foundItem.balance += (event as BankAccountCredited).amount;

    } else if (event.name === 'BankAccountDebited') {
      const foundItem: BankAccount = this.projections.find(it => it.id.value === (event as BankAccountDebited).bankAccountId);
      foundItem.balance -= (event as BankAccountDebited).amount;

    } else if (event.name === 'BankAccountDebitForbidden') {
      const foundItem: BankAccount = this.projections.find(it => it.id.value === (event as BankAccountDebitForbidden).entity.id.value);
      foundItem.blockCountdown --;

    } else if (event.name === 'BankAccountBlocked') {
      const foundItem: BankAccount = this.projections.find(it => it.id.value === (event as BankAccountBlocked).bankAccountId);
      foundItem.blockedUntil = (event as BankAccountBlocked).until;
      foundItem.blockCountdown = 0;

    } else if (event.name === 'BankAccountUnblocked') {
      const foundItem: BankAccount = this.projections.find(it => it.id.value === (event as BankAccountUnblocked).bankAccountId);
      foundItem.blockedUntil = undefined;
      foundItem.blockCountdown = 3;
    }
  }
}

// Entity / Projection / Aggregate ?
export class BankAccount extends Entity {
  balance: number;
  blockCountdown: number;
  blockedUntil: Date;

  constructor(id: string, balance: number) {
    super(new UUID(id));
    this.balance = 0;
    this.blockCountdown = 3;
    this.blockedUntil = undefined;
  }
}

export class BankAccountCreated extends Event<BankAccount> {
  bankAccountId: string;
  constructor(bankAccountId: string) {
    super(undefined, null, 'BankAccountCreated');
    this.bankAccountId = bankAccountId;
  }
}
export class BankAccountDeleted extends Event<BankAccount> {
  bankAccountId: string;
  constructor(bankAccountId : string) {
    super(undefined, null, 'BankAccountDeleted');
    this.bankAccountId = bankAccountId;
  }
}

export class BankAccountCredited extends Event<BankAccount> {
  bankAccountId: string;
  amount: number;
  constructor(bankAccountId: string, amount: number) {
    super(undefined, null, 'BankAccountCredited');
    this.amount = amount;
    this.bankAccountId = bankAccountId;
  }
}

export class BankAccountDebited extends Event<BankAccount> {
  bankAccountId: string;
  amount: number;
  constructor(bankAccountId: string, amount: number) {
    super(undefined, null, 'BankAccountDebited');
    this.amount = amount;
    this.bankAccountId = bankAccountId;
  }
}

// to track errors, then block the account?
export class BankAccountDebitForbidden extends Event<BankAccount> {
  constructor(entity: BankAccount) {
    super(undefined, entity, 'BankAccountDebitForbidden');
  }
}

// after a certain number of errors
export class BankAccountBlocked extends Event<BankAccount> {
  bankAccountId: string;
  until: Date;
  constructor(bankAccountId: string, until: Date) {
    super(undefined, null, 'BankAccountBlocked');
    this.until = until;
    this.bankAccountId = bankAccountId;
  }
}

// specific event that could be emitted to override the rules...
export class BankAccountUnblocked extends Event<BankAccount> {
  bankAccountId: string;
  constructor(bankAccountId: string) {
    super(undefined, null, 'BankAccountUnblocked');
    this.bankAccountId = bankAccountId;
  }
}
