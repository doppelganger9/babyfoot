import { GameId, Player } from '../game-id';
import { GameEvent } from './game-event';

export class PlayerRemovedFromGame extends GameEvent {
  constructor(public player: Player, id: GameId) {
    super(undefined, id);
    Object.freeze(this);
  }
}
