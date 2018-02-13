import { ValueType, EventPublisher, DecisionProjection, Event, generateUUID } from '../..';
import { DecisionApplierFunction as DAF } from '../..';
import { PlayerDecisionProjection } from './player-decision-projection';
import { PlayerEventsApplier as PEA } from './player-events-applier';
import { PlayerId } from './player-id';
import { PlayerCreated, PlayerDeleted, PlayerUpdated, PlayerConfirmedAccount } from './events';
import { PlayerAccountConfirmationDidNotMatchError } from './errors/confirmation-token-did-not-match-error';
import { PlayerIsDeletedError } from './errors/player-is-deleted-error';

export class Player {
  public static createPlayer(eventPublisher: EventPublisher, fields: Map<string, any>): void {
    // Id generation with high entropy lessens the chance of generating collision
    const playerId = new PlayerId(generateUUID());
    eventPublisher.publish(new PlayerCreated(playerId, fields));
  }
  public projection: PlayerDecisionProjection;

  constructor(events: Array<Event> | Event) {
    this.projection = new PlayerDecisionProjection()
      .register('PlayerCreated', PEA.applyPlayerCreated as DAF)
      .register('PlayerDeleted', PEA.applyPlayerDeleted as DAF)
      .register('PlayerConfirmedAccount', PEA.applyPlayerConfirmedAccount as DAF)
      .register('PlayerUpdated', PEA.applyPlayerUpdated as DAF)
      .apply(events);
  }

  /************** COMMANDS **************/

  public deletePlayer(eventPublisher: EventPublisher): void {
    if (this.projection.isDeleted) {
      return;
    }
    eventPublisher.publish(new PlayerDeleted(this.projection.id));
  }

  public updatePlayer(eventPublisher: EventPublisher, fields: Map<string, any>) {
    if (this.projection.isDeleted) {
      throw new PlayerIsDeletedError(this.projection.id);
    }
    const event = new PlayerUpdated(this.projection.id, fields);
    eventPublisher.publish(event);
  }

  public confirmAccount(eventPublisher: EventPublisher, token: string) {
    if (this.projection.isDeleted) {
      throw new PlayerIsDeletedError(this.projection.id);
    }
    if (this.projection.confirmationToken !== token) {
      // TODO what to do here ?
      throw new PlayerAccountConfirmationDidNotMatchError(this.projection.id, token);
    }
    const event = new PlayerConfirmedAccount(this.projection.id, this.projection.email, token);
    eventPublisher.publish(event);
  }
}
