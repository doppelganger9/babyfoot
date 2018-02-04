import { GameId } from '../game-id';
import { GameEvent } from './game-event';

export class SomeoneAddedACommentOnGame extends GameEvent {
  constructor(public author: string, public comment: string, id: GameId) {
    super(undefined, id);
    Object.freeze(this);
  }
}
