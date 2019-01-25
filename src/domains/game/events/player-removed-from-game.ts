import { GameId } from '../game-id';
import { PlayerId } from '../../player';
import { GameEvent } from './game-event';

export class PlayerRemovedFromGame extends GameEvent {
  constructor(public playerId: PlayerId, id: GameId) {
    super(undefined, id);
    Object.freeze(this);
  }
}
