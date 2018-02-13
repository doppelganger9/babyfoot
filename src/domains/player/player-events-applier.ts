import { DecisionProjection } from '..';
import { PlayerConfirmedAccount, PlayerCreated, PlayerDeleted, PlayerUpdated } from './events';
import { generateUUID } from '../..';

export class PlayerEventsApplier {
  public static applyPlayerCreated(this: DecisionProjection, event: PlayerCreated): void {
    event.fields.forEach((v, k) => {
      this.data.set(k, v);
    });
    this.data.set('id', event.playerId);
    this.data.set('isDeleted', false);
    this.data.set('confirmationToken', generateUUID());
    this.data.set('creationDate', new Date());
    this.data.set('lastUpdateDate', new Date());
    this.data.set('isAccountConfirmed', false);
  }
  public static applyPlayerDeleted(this: DecisionProjection, event: PlayerDeleted): void {
    this.data.set('isDeleted', true);
    this.data.set('lastUpdateDate', new Date());
  }
  public static applyPlayerConfirmedAccount(this: DecisionProjection, event: PlayerConfirmedAccount): void {
    this.data.set('accountConfirmationDate', new Date());
    this.data.set('isAccountConfirmed', true);
    this.data.set('lastUpdateDate', new Date());
  }
  public static applyPlayerUpdated(this: DecisionProjection, event: PlayerUpdated): void {
    event.fields.forEach((v, k) => {
      this.data.set(k, v);
    });
    this.data.set('lastUpdateDate', new Date());
  }
}
