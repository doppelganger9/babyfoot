import { GameId } from '../game-id';

/**
 * NOTE, to extend Errors and preserve prototype chain,
 * see: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html
 */

export class IncorrectReviewStarsError extends Error {
  constructor(public gameId: GameId, public stars: number) {
    super(`incorrect number of stars ${stars} for review on "${gameId}"`);
    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
  }
}
