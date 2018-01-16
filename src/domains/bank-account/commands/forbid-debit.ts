import { Command, EventApplier, EventStream, ProjectionStore } from '../../..';
import { BankAccountDebitForbidden, BankAccount } from '../..';

export class ForbidDebitAccountCommand extends Command<BankAccount>
  implements EventApplier<BankAccount, BankAccountDebitForbidden> {
  apply(
    event: BankAccountDebitForbidden,
    projections: ProjectionStore<BankAccount>
  ): void {
    const foundItem: BankAccount | undefined = projections.getById(
      event.bankAccountId
    );
    if (foundItem) {
      const mutated = Object.assign({}, foundItem);
      mutated.blockCountdown--;
      projections.mutate(mutated);
    } else {
      // nothing found ? this should not happen as command should already have checked it.
      throw new Error('projections inconsistency!');
    }
  }

  command(
    projections: ProjectionStore<BankAccount>,
    eventStream: EventStream
  ): void {
    throw new Error('not implemented');
  }
}
