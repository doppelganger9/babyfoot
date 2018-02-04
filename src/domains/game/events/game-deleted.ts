import { GameId } from '../game-id';
import { GameEvent } from './game-event';

export class GameDeleted extends GameEvent {
  constructor(id: GameId) {
    super(undefined, id);
    Object.freeze(this);
  }
}
