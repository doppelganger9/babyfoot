import { GameId } from '../game-id';

/**
 * NOTE, to extend Errors and preserve prototype chain,
 * see: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html
 */

export class MissingInitialDateTimeError extends Error {
  constructor(public gameId: GameId) {
    super(`initialDateTime is required to update "${gameId}"`);
    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
  }
}
