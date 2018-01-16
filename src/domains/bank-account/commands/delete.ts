import { Command, EventApplier, EventStream, ProjectionStore } from '../../..';
import { BankAccountDeleted, BankAccount } from '../..';

export class DeleteAccountCommand extends Command<BankAccount>
  implements EventApplier<BankAccount, BankAccountDeleted> {
  apply(
    event: BankAccountDeleted,
    projections: ProjectionStore<BankAccount>
  ): void {
    projections.removeById(event.bankAccountId);
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
    const foundItem = projections.getById(id);
    if (!foundItem) {
      // TODO : or the projections could be inconsistent ?
      throw new Error('account with this ID does not exist');
    }
    eventStream.emit(new BankAccountDeleted(id));
  }
}
