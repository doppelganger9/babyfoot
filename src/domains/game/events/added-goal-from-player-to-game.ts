import { PlayerId } from '..';
import { GameId } from '../game-id';
import { GameEvent } from './game-event';

export class AddedGoalFromPlayerToGame extends GameEvent {
  constructor(public playerId: PlayerId, id: GameId) {
    super(undefined, id);
    Object.freeze(this);
  }
}
