import { Command, EventApplier, EventStream, ProjectionStore } from '../../..';
import {
  BankAccountBlocked,
  BankAccountUnblocked,
  BankAccountDebitForbidden,
  BankAccountDebited,
  BankAccount,
} from '../..';

export class DebitAccountCommand extends Command<BankAccount>
  implements EventApplier<BankAccount, BankAccountDebited> {
  apply(
    event: BankAccountDebited,
    projections: ProjectionStore<BankAccount>
  ): void {
    const foundItem: BankAccount | undefined = projections.getById(
      event.bankAccountId
    );
    if (foundItem) {
      const mutated = Object.assign({}, foundItem);
      mutated.balance -= event.amount;
      projections.mutate(mutated);
    } else {
      throw new Error('inconsistent projections!');
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
    // Other decisions like a check if the current balance - asked credit will still be >=0 and if account is currently blocked
    if (foundItem.blockCountdown === 0) {
      if (!foundItem.blockedUntil) {
        const now = new Date();
        const ONE_HOUR__ms =
          1 /* hours */ *
          60 /* minutes */ *
          60 /* seconds */ *
          1000 /* milliseconds */;
        const oneHourFromNow = new Date(now.getTime() + ONE_HOUR__ms);

        eventStream.emit(
          new BankAccountBlocked(foundItem.id.value, oneHourFromNow)
        );
        throw new Error('account blocked until ' + oneHourFromNow);
      } else {
        if (foundItem.blockedUntil.getTime() > new Date().getTime()) {
          throw new Error('account blocked until ' + foundItem.blockedUntil);
        } else {
          // NOTE: Maybe this will mess up if other events follow ? or not...
          eventStream.emit(new BankAccountUnblocked(foundItem.id.value));
        }
      }
    } else if (foundItem.balance - amount < 0) {
      // just to implement a blocking mechanism.
      eventStream.emit(new BankAccountDebitForbidden(foundItem.id.value));
      throw new Error('insufficient balance');
    }
    eventStream.emit(
      new BankAccountDebited(
        foundItem.id.value /* NOTE : in fact I would prefer an immutable copy here or just the ID, I don't need to send a full projection object inside the event */,
        amount
      )
    );
  }
}
