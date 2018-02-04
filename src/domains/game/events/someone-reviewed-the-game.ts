import { GameId } from '../game-id';
import { GameEvent } from './game-event';

export class SomeoneReviewedTheGame extends GameEvent {
  constructor(public author: string, public review: string, public stars: number, public id: GameId) {
    super(undefined, id);
    Object.freeze(this);
  }
}
