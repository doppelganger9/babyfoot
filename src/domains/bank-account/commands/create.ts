import { Command, EventApplier, EventStream, ProjectionStore } from '../../..';
import { BankAccountCreated, BankAccount } from '../..';

const STARTING_BALANCE: number = 0;

export class CreateAccountCommand extends Command<BankAccount>
  implements EventApplier<BankAccount, BankAccountCreated> {
  apply(
    event: BankAccountCreated,
    projections: ProjectionStore<BankAccount>
  ): void {
    const newAccount = new BankAccount(event.bankAccountId, STARTING_BALANCE);
    projections.add(newAccount);
  }

  command(
    id: string,
    projections: ProjectionStore<BankAccount>,
    eventStream: EventStream
  ): void {
    // Decision based on projections (based on past events)
    if (!id) {
      throw new Error('id must be provided');
    }
    if (projections.getById(id)) {
      throw new Error('account with this ID already exists');
    }
    eventStream.emit(new BankAccountCreated(id));
  }
}
