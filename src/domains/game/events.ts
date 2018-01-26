import { Player, TeamColors, GameId } from '.';
import { Event, PositionValue } from '../..';

export abstract class GameEvent implements Event {
  constructor(public timestamp: Date = new Date(), public gameId: GameId) {
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
  constructor(public date: Date = new Date(), id: GameId) {
    super(undefined, id);
    Object.freeze(this);
  }
}
export class GameEnded extends GameEvent {
  constructor(public date: Date = new Date(), id: GameId) {
    super(undefined, id);
    Object.freeze(this);
  }
}
export class PlayerAddedToGameWithTeam extends GameEvent {
  constructor(public player: Player, public team: TeamColors, id: GameId) {
    super(undefined, id);
    Object.freeze(this);
  }
}
export class PlayerRemovedFromGame extends GameEvent {
  constructor(public player: Player, id: GameId) {
    super(undefined, id);
    Object.freeze(this);
  }
}
export class AddedGoalFromPlayerToGame extends GameEvent {
  constructor(public player: Player, id: GameId) {
    super(undefined, id);
    Object.freeze(this);
  }
}

export class PlayerChangedPositionOnGame extends GameEvent {
  constructor(public position: PositionValue, public player: Player, id: GameId) {
    super(undefined, id);
    Object.freeze(this);
  }
}

export class SomeoneAddedACommentOnGame extends GameEvent {
  constructor(public author: string, public comment: string, id: GameId) {
    super(undefined, id);
    Object.freeze(this);
  }
}

export class SomeoneReviewedTheGame extends GameEvent {
  constructor(public author: string, public review: string, public stars: number, public id: GameId) {
    super(undefined, id);
    Object.freeze(this);
  }
}
