import { Command, EventApplier, ProjectionStore } from '../../..';
import { BankAccount, BankAccountBlocked } from '../..';

export class BlockAccountCommand extends Command<BankAccount>
  implements EventApplier<BankAccount, BankAccountBlocked> {
  apply(
    event: BankAccountBlocked,
    projections: ProjectionStore<BankAccount>
  ): void {
    const foundItem: BankAccount | undefined = projections.getById(event.bankAccountId);
    if (foundItem) {
      const mutated: BankAccount = Object.assign({}, foundItem);
      mutated.blockedUntil = (event as BankAccountBlocked).until;
      mutated.blockCountdown = 0;
      projections.mutate(mutated);
    } else {
      throw new Error('inconsistent projections!');
    }
  }

  command() {
    throw new Error('not implemented');
  }
}
