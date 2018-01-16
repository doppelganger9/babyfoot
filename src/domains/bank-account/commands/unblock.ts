import { Command, EventApplier, EventStream, ProjectionStore } from '../../..';
import { BankAccount, BankAccountUnblocked } from '../..';

export class UnblockAccountCommand extends Command<BankAccount>
  implements EventApplier<BankAccount, BankAccountUnblocked> {
  apply(
    event: BankAccountUnblocked,
    projections: ProjectionStore<BankAccount>
  ): void {
    const foundItem: BankAccount | undefined = projections.getById(
      event.bankAccountId
    );
    if (foundItem) {
      const mutated = Object.assign({}, foundItem);
      mutated.blockedUntil = undefined;
      mutated.blockCountdown = 3;
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
