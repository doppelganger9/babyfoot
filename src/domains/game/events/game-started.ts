import { GameEvent } from './game-event';
import { GameId } from '../../..';

export class GameStarted extends GameEvent {
  constructor(public date: Date = new Date(), id: GameId) {
    super(undefined, id);
    Object.freeze(this);
  }
}
