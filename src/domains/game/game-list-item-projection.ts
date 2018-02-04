import { GameId } from './game-id';

export class GameListItemProjection {
  constructor(public gameId: GameId, public timestamp: Date) {}
}
