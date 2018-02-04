import { GameId } from "../..";

/**
 * This class is a custom Error.
 * NOTE: In typescript there is a problem with the prototype chain, so we need a little hack to keep it.
 * see https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html
 */
export class UnknownGameError extends Error {
  constructor(public gameId: GameId) {
    super();
    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
  }
}
