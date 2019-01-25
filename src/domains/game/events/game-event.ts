import { GameId } from '../game-id';
import { BFEvent } from '../../..';

export abstract class GameEvent implements BFEvent {
  constructor(public timestamp: Date = new Date(), public gameId: GameId) {}

  public getAggregateId(): GameId {
    return this.gameId;
  }
}
