import { PlayerId } from '../player-id';
import { BFEvent } from '../../..';

export abstract class PlayerEvent implements BFEvent {
  constructor(public timestamp: Date = new Date(), public playerId: PlayerId) {}

  public getAggregateId(): PlayerId {
    return this.playerId;
  }
}
