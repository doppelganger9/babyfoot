import { GameId } from ".";

export class GameListItemProjection {
  constructor(public gameId: GameId, public timestamp: Date) {}
}
