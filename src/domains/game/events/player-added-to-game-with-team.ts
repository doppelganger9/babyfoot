import { GameId, Player, TeamColors } from '../game-id';
import { GameEvent } from './game-event';

export class PlayerAddedToGameWithTeam extends GameEvent {
  constructor(public player: Player, public team: TeamColors, id: GameId) {
    super(undefined, id);
    Object.freeze(this);
  }
}
