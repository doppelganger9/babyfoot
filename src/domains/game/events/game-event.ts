import { GameId } from '../game-id';
import { Event } from '../../..';

export abstract class GameEvent implements Event {
  constructor(public timestamp: Date = new Date(), public gameId: GameId) {}

  getAggregateId(): GameId {
    return this.gameId;
  }
}
