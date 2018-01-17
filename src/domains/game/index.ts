import { UserEntity } from '../user';

export abstract class Event {}

export type PositionValue = 'goal' | 'defenseurs' | 'demis' | 'attaquants';
export type TeamColors = 'red' | 'blue';
export type Player = string;

/************** EVENTS **************/

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
/************** AGGREGATES **************/

function generateUUID() {
  // Public Domain/MIT
  var d = new Date().getTime();
  if (
    typeof performance !== 'undefined' &&
    typeof performance.now === 'function'
  ) {
    d += performance.now(); //use high-precision timer if available
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = ((d + Math.random() * 16) % 16) | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export class Game {
  // STATE = PROJECTIONS
  id?: string;
  isDeleted: boolean = true;
  initialDatetime?: Date;
  currentStartDatetime?: Date;
  currentEndDatetime?: Date;
  duration?: number;
  pointsTeamRed?: number;
  pointsTeamBlue?: number;
  winner?: 'red' | 'blue';
  teamRedMembers?: Array<string>;
  teamBlueMembers?: Array<string>;
  players?: Array<string>;

  constructor(history: Array<Event>) {
    if (history) {
      history.forEach(x => this.apply(x));
    }
  }

  apply(event: Event) {
    //event
    if (event instanceof GameCreated) {
      this.id = generateUUID();
      this.isDeleted = false;
      this.players = [];
      this.teamBlueMembers = [];
      this.teamRedMembers = [];
    } else if (event instanceof GameDeleted) {
      this.isDeleted = true;
    } else if (event instanceof GameStarted) {
      this.currentStartDatetime = event.date;
      this.pointsTeamRed = 0;
      this.pointsTeamBlue = 0;
    } else if (event instanceof GameEnded) {
      this.currentEndDatetime = event.date;
      this.duration =
        this.currentEndDatetime.getTime() -
        this.currentStartDatetime!.getTime();
    } else if (event instanceof PlayerRemovedFromGame) {
      this.players = this.players!.filter(it => it !== event.player);
      if (this.teamBlueMembers!.includes(event.player)) {
        this.teamBlueMembers = this.teamBlueMembers!.filter(
          it => it !== event.player
        );
      }
      if (this.teamRedMembers!.includes(event.player)) {
        this.teamRedMembers = this.teamRedMembers!.filter(
          it => it !== event.player
        );
      }
    } else if (event instanceof PlayerAddedToGameWithTeam) {
      this.players!.push(event.player);
      if (event.team === 'red') {
        this.teamRedMembers!.push(event.player);
        if (this.teamBlueMembers!.includes(event.player)) {
          this.teamBlueMembers = this.teamBlueMembers!.filter(
            it => it !== event.player
          );
        }
      } else {
        this.teamBlueMembers!.push(event.player);
        if (this.teamRedMembers!.includes(event.player)) {
          this.teamRedMembers = this.teamRedMembers!.filter(
            it => it !== event.player
          );
        }
      }
    } else if (event instanceof AddedGoalFromPlayerToGame) {
      if (this.teamRedMembers!.includes(event.player)) {
        this.pointsTeamRed!++;
      } else {
        this.pointsTeamBlue!++;
      }
      this.winner =
        this.pointsTeamRed! > this.pointsTeamBlue!
          ? 'red'
          : this.pointsTeamRed === this.pointsTeamBlue ? undefined : 'blue';
    }
  }

  /************** COMMANDS **************/

  static createGame(history: Array<Event>): Game {
    const g = new Game(history);

    const event = new GameCreated();
    history.push(event);
    g.apply(event);
    return g;
  }

  deleteGame(history: Array<Event>): void {
    // no need to pass an ID, if the command is on the Aggregate himself.
    if (this.isDeleted) {
      return;
    }
    const event = new GameDeleted();
    history.push(event);
    this.apply(event);
  }

  startGame(history: Array<Event>) {
    const event = new GameStarted();
    history.push(event);
    this.apply(event);
  }

  endGame(history: Array<Event>) {
    if (!this.currentStartDatetime) {
      throw new Error('you cannot end a game which has not even started');
    }
    const event = new GameEnded();
    history.push(event);
    this.apply(event);
  }

  addPlayerToGame(
    history: Array<Event>,
    player: Player,
    team: TeamColors
  ): void {
    if (this.isDeleted) throw new Error('game is deleted');
    if (this.currentEndDatetime) throw new Error('game has ended');
    if (
      this.players!.includes(player) &&
      team === 'red' &&
      this.teamRedMembers!.includes(player)
    )
      throw new Error('this player was already added to team red');
    if (
      this.players!.includes(player) &&
      team === 'blue' &&
      this.teamBlueMembers!.includes(player)
    )
      throw new Error('this player was already added to team blue');

    const event = new PlayerAddedToGameWithTeam(player, team);
    history.push(event);
    this.apply(event);
  }

  removePlayerFromGame(history: Array<Event>, player: Player): void {
    if (this.isDeleted) throw new Error('game is deleted');
    if (this.currentEndDatetime) throw new Error('game has ended');
    if (!this.players!.includes(player)) throw new Error('unknown player');

    const event = new PlayerRemovedFromGame(player);
    history.push(event);
    this.apply(event);
  }

  addGoalFromPlayer(history: Array<Event>, player: Player): void {
    if (this.isDeleted) throw new Error('game is deleted');
    if (!this.currentStartDatetime) throw new Error('game has not started');
    if (this.currentEndDatetime) throw new Error('game has ended');
    if (!this.players!.includes(player)) throw new Error('unknown player');
    const event = new AddedGoalFromPlayerToGame(player);
    history.push(event);
    this.apply(event);
  }

  updateGame(history: Array<Event>): void {}

  changeUserPositionOnGame(history: Array<Event>) {}
  //commentGame(history: Array<Event>) {}
  //reviewGame(history: Array<Event>) {}
}
