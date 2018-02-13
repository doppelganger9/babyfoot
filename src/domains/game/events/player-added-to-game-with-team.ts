import { GameId, TeamColors } from '../game-id';
import { GameEvent } from './game-event';
import { PlayerId } from '../player';

export class PlayerAddedToGameWithTeam extends GameEvent {
  constructor(public playerId: PlayerId, public team: TeamColors, id: GameId) {
    super(undefined, id);
    Object.freeze(this);
  }
}
