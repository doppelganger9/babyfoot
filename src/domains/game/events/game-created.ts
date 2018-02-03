import { GameEvent } from './game-event';
import { GameId } from '../../..';

export class GameCreated extends GameEvent {
  constructor(id: GameId) {
    super(undefined, id);
    Object.freeze(this);
  }
}
