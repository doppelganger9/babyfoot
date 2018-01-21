import { Player, TeamColors, GameId } from '.';
import { Event } from '../..';

export abstract class GameEvent implements Event {
  timestamp: Date;
  gameId: GameId;
  constructor(timestamp: Date = new Date(), id: GameId) {
    this.gameId = id;
    this.timestamp = timestamp;
  }

  getAggregateId(): GameId {
    return this.gameId;
  }
}

export class GameCreated extends GameEvent {
  constructor(id: GameId) {
    super(undefined, id);
    Object.freeze(this);
  }
}
export class GameDeleted extends GameEvent {
  constructor(id: GameId) {
    super(undefined, id);
    Object.freeze(this);
  }
}
export class GameUpdated extends GameEvent {
  constructor(id: GameId) {
    super(undefined, id);
    Object.freeze(this);
  }
}
export class GameStarted extends GameEvent {
  date: Date;
  constructor(date: Date = new Date(), id: GameId) {
    super(undefined, id);
    this.date = date;
    Object.freeze(this);
  }
}
export class GameEnded extends GameEvent {
  date: Date;
  constructor(date: Date = new Date(), id: GameId) {
    super(undefined, id);
    this.date = date;
    Object.freeze(this);
  }
}
export class PlayerAddedToGameWithTeam extends GameEvent {
  player: Player;
  team: TeamColors;
  constructor(player: Player, team: TeamColors, id: GameId) {
    super(undefined, id);
    this.player = player;
    this.team = team;
    Object.freeze(this);
  }
}
export class PlayerRemovedFromGame extends GameEvent {
  player: Player;
  constructor(player: Player, id: GameId) {
    super(undefined, id);
    this.player = player;
    Object.freeze(this);
  }
}
export class AddedGoalFromPlayerToGame extends GameEvent {
  player: Player;
  constructor(player: Player, id: GameId) {
    super(undefined, id);
    this.player = player;
    Object.freeze(this);
  }
}
