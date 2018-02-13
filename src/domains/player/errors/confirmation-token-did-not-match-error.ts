
import { PlayerId } from '../player-id';

/**
 * NOTE, to extend Errors and preserve prototype chain,
 * see: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html
 */

export class PlayerAccountConfirmationDidNotMatchError extends Error {
  constructor(public playerId: PlayerId, public token: string) {
    super(`Player account confirmation token "${token}" for "${playerId}" did not match token sent by email`);
    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
  }
}
