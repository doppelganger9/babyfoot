import { Player, TeamColors } from ".";

export abstract class Event {}

export abstract class GameEvent extends Event {
  timestamp: Date;
  constructor(timestamp: Date = new Date()) {
    super();
    this.timestamp = timestamp;
  }
}

export class GameCreated extends GameEvent {}
export class GameDeleted extends GameEvent {}
export class GameUpdated extends GameEvent {}
export class GameStarted extends GameEvent {
  date: Date;
  constructor(date: Date = new Date()) {
    super();
    this.date = date;
  }
}
export class GameEnded extends GameEvent {
  date: Date;
  constructor(date: Date = new Date()) {
    super();
    this.date = date;
  }
}
export class PlayerAddedToGameWithTeam extends GameEvent {
  player: Player;
  team: TeamColors;
  constructor(player: Player, team: TeamColors) {
    super();
    this.player = player;
    this.team = team;
  }
}
export class PlayerRemovedFromGame extends GameEvent {
  player: Player;
  constructor(player: Player) {
    super();
    this.player = player;
  }
}
export class AddedGoalFromPlayerToGame extends GameEvent {
  player: Player;
  constructor(player: Player) {
    super();
    this.player = player;
  }
}
