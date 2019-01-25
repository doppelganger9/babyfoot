import { PlayerId } from "../../player";

/**
 * NOTE, to extend Errors and preserve prototype chain,
 * see: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html
 */

export class UnknownPlayerError extends Error {
  constructor(public playerId: PlayerId) {
    super(`unknown player "${playerId}"`);
    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
  }
}
