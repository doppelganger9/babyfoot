import { GameEvent } from './game-event';
import { GameId } from '../../..';

export class SomeoneReviewedTheGame extends GameEvent {
  constructor(public author: string, public review: string, public stars: number, public id: GameId) {
    super(undefined, id);
    Object.freeze(this);
  }
}
