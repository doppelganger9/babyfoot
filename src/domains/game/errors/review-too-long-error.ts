import { GameId } from '../..';

/**
 * NOTE, to extend Errors and preserve prototype chain,
 * see: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html
 */

export class ReviewTooLongError extends Error {
  constructor(public gameId: GameId, public length: number) {
    super(`submitted review is too long (${length}) for "${gameId}"`);
    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
  }
}
