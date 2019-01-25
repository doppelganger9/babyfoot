import { PlayerId } from '..';
/**
 * NOTE, to extend Errors and preserve prototype chain,
 * see: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html
 */

export class PlayerIsDeletedError extends Error {
  constructor(public playerId: PlayerId) {
    super(`Player is deleted "${playerId}"`);
    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
  }
}
