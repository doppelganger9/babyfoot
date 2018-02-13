import { PlayerId } from '../player-id';
import { Event } from '../../..';

export abstract class PlayerEvent implements Event {
  constructor(public timestamp: Date = new Date(), public playerId: PlayerId) {}

  public getAggregateId(): PlayerId {
    return this.playerId;
  }
}
