import { GameId } from '../game-id';
import { GameEvent } from './game-event';

export class GameEnded extends GameEvent {
  constructor(public date: Date = new Date(), id: GameId) {
    super(undefined, id);
    Object.freeze(this);
  }
}
