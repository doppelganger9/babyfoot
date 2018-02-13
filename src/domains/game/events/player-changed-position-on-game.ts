import { GameId, PositionValue } from '../game-id';
import { PlayerId } from '../player';
import { GameEvent } from './game-event';

export class PlayerChangedPositionOnGame extends GameEvent {
  constructor(public position: PositionValue, public playerId: PlayerId, id: GameId) {
    super(undefined, id);
    Object.freeze(this);
  }
}
