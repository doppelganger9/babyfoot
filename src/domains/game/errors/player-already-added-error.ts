import { GameId, TeamColors } from '../game-id';
import { PlayerId } from '../../player';

/**
 * NOTE, to extend Errors and preserve prototype chain,
 * see: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html
 */

export class PlayerAlreadyAddedError extends Error {
  constructor(
    public gameId: GameId,
    public playerId: PlayerId,
    public team: TeamColors
  ) {
    super(
      `player "${playerId}" has already been added to team "${team}" in ${gameId}"`
    );
    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
  }
}
