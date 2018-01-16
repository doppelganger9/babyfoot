import { Command, EventApplier, EventStream, ProjectionStore } from '../../..';
import { BankAccountCredited, BankAccount } from '../..';

export class CreditAccountCommand extends Command<BankAccount>
  implements EventApplier<BankAccount, BankAccountCredited> {
  apply(
    event: BankAccountCredited,
    projections: ProjectionStore<BankAccount>
  ): void {
    const foundItem: BankAccount | undefined = projections.getById(
      event.bankAccountId
    );
    if (foundItem) {
      const mutated = Object.assign({}, foundItem);
      mutated.balance += event.amount;
      projections.mutate(mutated);
    } else {
      // nothing found ? this should not happen as command should already have checked it.
      throw new Error('projections inconsistency!');
    }
  }

  command(
    id: string,
    amount: number,
    projections: ProjectionStore<BankAccount>,
    eventStream: EventStream
  ): void {
    // Decision based on projections (based on past events and rules, relations, etc.)
    if (amount <= 0) {
      throw new Error('amount must be > 0');
    }
    if (!id) {
      throw new Error('id must be provided');
    }
    const foundItem = projections.getById(id);
    if (!foundItem) {
      // TODO : or the projections could be inconsistent ?
      throw new Error('account with this ID does not exist');
    }
    // always allow to add money to an account :-D \o/ \o\ /o/ \o/
    eventStream.emit(
      new BankAccountCredited(
        foundItem.id.value /* NOTE : in fact I would prefer an immutable copy here or just the ID, I don't need to send a full projection object inside the event */,
        amount
      )
    );
  }
}
