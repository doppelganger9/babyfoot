import { GameId } from '../game-id';
import { GameEvent } from './game-event';

export class GameDateUpdated extends GameEvent {
  constructor(id: GameId, public date: Date) {
    super(undefined, id);
    Object.freeze(this);
  }
}
