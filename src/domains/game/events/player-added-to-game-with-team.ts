import { GameEvent } from './game-event';
import { GameId, TeamColors, Player } from '../../..';

export class PlayerAddedToGameWithTeam extends GameEvent {
  constructor(public player: Player, public team: TeamColors, id: GameId) {
    super(undefined, id);
    Object.freeze(this);
  }
}
