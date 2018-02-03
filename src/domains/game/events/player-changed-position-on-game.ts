import { GameEvent } from './game-event';
import { GameId, PositionValue, Player } from '../../..';

export class PlayerChangedPositionOnGame extends GameEvent {
  constructor(public position: PositionValue, public player: Player, id: GameId) {
    super(undefined, id);
    Object.freeze(this);
  }
}
