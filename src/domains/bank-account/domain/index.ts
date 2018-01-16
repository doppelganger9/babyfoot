import {
  Entity,
  UUID,
  Event,
  EventStream,
  EventListener,
  EventApplier,
  ProjectionStore
} from '../../../cqrs-es';
import {
  BankAccount,
  BankAccountCreated,
  BankAccountDeleted,
  BankAccountCredited,
  BankAccountBlocked,
  BankAccountUnblocked,
  BankAccountDebitForbidden,
  BankAccountDebited
} from '../..';
import {
  CreateAccountCommand,
  DeleteAccountCommand,
  CreditAccountCommand,
  DebitAccountCommand,
  BlockAccountCommand,
  UnblockAccountCommand,
  ForbidDebitAccountCommand
} from '../commands';
import { Command } from '../../../index';


// client app or UI will use this to both have access
// to Commands(Writes) and Queries(Reads)
export class BankAccountDomain implements EventListener {
  projections: ProjectionStore<BankAccount>;
  eventStream: EventStream;
  appliers: Array<EventApplier<BankAccount, Event<BankAccount>>>;
  commands: Map<string, Command<BankAccount>>;

  constructor(eventStream: EventStream) {
    this.eventStream = eventStream;
    this.projections = new ProjectionStore<BankAccount>();
    this.appliers = [];
    this.commands = new Map();
    this.commands.set('CreateAccount', new CreateAccountCommand());
    this.commands.set('DeleteAccount', new DeleteAccountCommand());
    this.commands.set('CreditAccount', new CreditAccountCommand());
    this.commands.set('DebitAccount', new DebitAccountCommand());
    this.commands.set('ForbidDebitAccount', new ForbidDebitAccountCommand());
    this.commands.set('BlockAccount', new BlockAccountCommand());
    this.commands.set('UnblockAccount', new UnblockAccountCommand());
  }

  createAccount(id: string): void {
    // delegate pattern
    (this.commands.get('CreateAccount') as CreateAccountCommand).command(
      id,
      this.projections,
      this.eventStream
    );
  }

  deleteAccount(id: string): void {
    (this.commands.get('DeleteAccount') as DeleteAccountCommand).command(
      id,
      this.projections,
      this.eventStream
    );
  }

  creditAccount(id: string, amount: number): void {
    (this.commands.get('CreditAccount') as CreditAccountCommand).command(
      id,
      amount,
      this.projections,
      this.eventStream
    );
  }

  debitAccount(id: string, amount: number): void {
    (this.commands.get('DebitAccount') as DebitAccountCommand).command(
      id,
      amount,
      this.projections,
      this.eventStream
    );
  }

  getAccount(id: string): BankAccount | undefined {
    return this.projections.getById(id);
  }

  fromScratch(events: Array<Event<BankAccount>> = []) {
    if (events.length > 0) {
      // first apply all the events in the list
      events.forEach(it => this.apply(it));
    }
  }

  apply(event: Event<BankAccount> | null = null) {
    if (!event) {
      return;
    }
    // apply new event
    const eventHandlers: any = {
      BankAccountCreated: this.commands.get('CreateAccount'),
      BankAccountDeleted: this.commands.get('DeleteAccount'),
      BankAccountCredited: this.commands.get('CreditAccount'),
      BankAccountDebited: this.commands.get('DebitAccount'),
      BankAccountDebitForbidden: this.commands.get('ForbidDebitAccount'),
      BankAccountBlocked: this.commands.get('BlockAccount'),
      BankAccountUnblocked: this.commands.get('UnblockAccount')
    };
    (eventHandlers[event.name] as EventApplier<
      any,
      any
    >).apply(event, this.projections);
  }
}
