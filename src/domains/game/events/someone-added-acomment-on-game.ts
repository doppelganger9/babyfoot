import { GameEvent } from './game-event';
import { GameId } from '../../..';

export class SomeoneAddedACommentOnGame extends GameEvent {
  constructor(public author: string, public comment: string, id: GameId) {
    super(undefined, id);
    Object.freeze(this);
  }
}
