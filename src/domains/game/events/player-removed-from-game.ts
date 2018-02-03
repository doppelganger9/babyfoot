import { GameEvent } from './game-event';
import { GameId, Player } from '../../..';

export class PlayerRemovedFromGame extends GameEvent {
  constructor(public player: Player, id: GameId) {
    super(undefined, id);
    Object.freeze(this);
  }
}
