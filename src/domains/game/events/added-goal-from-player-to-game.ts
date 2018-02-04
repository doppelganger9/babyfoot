import { GameId, Player } from '../game-id';
import { GameEvent } from './game-event';

export class AddedGoalFromPlayerToGame extends GameEvent {
  constructor(public player: Player, id: GameId) {
    super(undefined, id);
    Object.freeze(this);
  }
}
