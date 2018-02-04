import { DecisionApplierFunction as DAF, Event, EventPublisher, GameUpdated } from '../..';
import {
  GameAlreadyEndedError,
  GameAlreadyStartedError,
  GameIsDeletedError,
  GameNotEndedError,
  GameNotStartedError,
  IncorrectReviewStarsError,
  MissingAuthorForReviewError,
  PlayerAlreadyAddedError,
  ReviewTooLongError,
  UnknownPlayerError,
} from './errors';
import {
  AddedGoalFromPlayerToGame,
  GameCreated,
  GameDeleted,
  GameEnded,
  GameStarted,
  PlayerAddedToGameWithTeam,
  PlayerChangedPositionOnGame,
  PlayerRemovedFromGame,
  SomeoneAddedACommentOnGame,
  SomeoneReviewedTheGame,
} from './events';
import { GameDecisionProjection } from './game-decision-projection';
import { GameEventsApplier as GEA } from './game-events-applier';
import { GameId, Player, PositionValue, TeamColors } from './game-id';

export class Game {
  public static createGame(eventPublisher: EventPublisher, id: string): void {
    const gameId = new GameId(id);
    // TODO: check if game already exists with this ID ?
    eventPublisher.publish(new GameCreated(gameId));
  }
  public projection: GameDecisionProjection;

  constructor(events: Array<Event> | Event) {
    this.projection = new GameDecisionProjection()
      .register('GameCreated', GEA.applyGameCreated as DAF)
      .register('GameDeleted', GEA.applyGameDeleted as DAF)
      .register('GameStarted', GEA.applyGameStarted as DAF)
      .register('GameEnded', GEA.applyGameEnded as DAF)
      .register('PlayerRemovedFromGame', GEA.applyPlayerRemovedFromGame as DAF)
      .register('PlayerAddedToGameWithTeam', GEA.applyPlayerAddedToGameWithTeam as DAF)
      .register('AddedGoalFromPlayerToGame', GEA.applyAddedGoalFromPlayerToGame as DAF)
      .register('PlayerChangedPositionOnGame', GEA.applyPlayerChangedPositionOnGame as DAF)
      .register('SomeoneAddedACommentOnGame', GEA.applySomeoneAddedACommentOnGame as DAF)
      .register('SomeoneReviewedTheGame', GEA.applySomeoneReviewedTheGame as DAF)
      .apply(events);
  }

  /************** COMMANDS **************/

  public deleteGame(eventPublisher: EventPublisher): void {
    if (this.projection.isDeleted) {
      return;
    }
    eventPublisher.publish(new GameDeleted(this.projection.id));
  }

  public startGame(eventPublisher: EventPublisher) {
    if (this.projection.isDeleted) {
      throw new GameIsDeletedError(this.projection.id);
    }
    if (this.projection.currentEndDatetime) {
      throw new GameAlreadyEndedError(this.projection.id);
    }
    if (this.projection.currentStartDatetime) {
      throw new GameAlreadyStartedError(this.projection.id);
    }
    const event = new GameStarted(undefined, this.projection.id);
    eventPublisher.publish(event);
  }

  public endGame(eventPublisher: EventPublisher) {
    if (this.projection.isDeleted) {
      throw new GameIsDeletedError(this.projection.id);
    }
    if (!this.projection.currentStartDatetime) {
      throw new GameNotStartedError(this.projection.id);
    }
    if (this.projection.currentEndDatetime) {
      throw new GameAlreadyEndedError(this.projection.id);
    }
    const event = new GameEnded(undefined, this.projection.id);
    eventPublisher.publish(event);
  }

  public addPlayerToGame(eventPublisher: EventPublisher, player: Player, team: TeamColors): void {
    if (this.projection.isDeleted) {
      throw new GameIsDeletedError(this.projection.id);
    }
    if (this.projection.currentEndDatetime) {
      throw new GameAlreadyEndedError(this.projection.id);
    }
    this.throwErrorIfPlayerAlreadyInTeam(player, team, 'red', this.projection.teamRedMembers);
    this.throwErrorIfPlayerAlreadyInTeam(player, team, 'blue', this.projection.teamBlueMembers);
    const event = new PlayerAddedToGameWithTeam(player, team, this.projection.id);
    eventPublisher.publish(event);
  }

  public removePlayerFromGame(eventPublisher: EventPublisher, player: Player): void {
    if (this.projection.isDeleted) {
      throw new GameIsDeletedError(this.projection.id);
    }
    if (this.projection.currentEndDatetime) {
      throw new GameAlreadyEndedError(this.projection.id);
    }
    if (!this.projection.players!.includes(player)) {
      throw new UnknownPlayerError(player);
    }

    const event = new PlayerRemovedFromGame(player, this.projection.id);
    eventPublisher.publish(event);
  }

  public addGoalFromPlayer(eventPublisher: EventPublisher, player: Player): void {
    if (this.projection.isDeleted) {
      throw new GameIsDeletedError(this.projection.id);
    }
    if (!this.projection.currentStartDatetime) {
      throw new GameNotStartedError(this.projection.id);
    }
    if (this.projection.currentEndDatetime) {
      throw new GameAlreadyEndedError(this.projection.id);
    }
    if (!this.projection.players!.includes(player)) {
      throw new UnknownPlayerError(player);
    }
    const event = new AddedGoalFromPlayerToGame(player, this.projection.id);
    eventPublisher.publish(event);
  }

  public updateGame(eventPublisher: EventPublisher): void {
    eventPublisher.publish(new GameUpdated(this.projection.id));
    throw new Error('not implemented');
  }

  public changeUserPositionOnGame(eventPublisher: EventPublisher, player: string, position: PositionValue) {
    if (this.projection.isDeleted) {
      throw new GameIsDeletedError(this.projection.id);
    }
    if (!this.projection.currentStartDatetime) {
      throw new GameNotStartedError(this.projection.id);
    }
    if (this.projection.currentEndDatetime) {
      throw new GameAlreadyEndedError(this.projection.id);
    }
    if (!this.projection.players!.includes(player)) {
      throw new UnknownPlayerError(player);
    }

    const event = new PlayerChangedPositionOnGame(position, player, this.projection.id);
    eventPublisher.publish(event);
  }

  public commentGame(eventPublisher: EventPublisher, comment: string, author: string) {
    if (this.projection.isDeleted) {
      throw new GameIsDeletedError(this.projection.id);
    }
    if (!this.projection.currentStartDatetime) {
      throw new GameNotStartedError(this.projection.id);
    }
    if (this.projection.currentEndDatetime) {
      throw new GameAlreadyEndedError(this.projection.id);
    }

    const event = new SomeoneAddedACommentOnGame(author, comment, this.projection.id);
    eventPublisher.publish(event);
  }

  public reviewGame(eventPublisher: EventPublisher, review: string, stars: number, author: string) {
    if (this.projection.isDeleted) {
      throw new GameIsDeletedError(this.projection.id);
    }
    if (stars <= 0) {
      throw new IncorrectReviewStarsError(this.projection.id, stars);
    }
    if (stars > 5) {
      throw new IncorrectReviewStarsError(this.projection.id, stars);
    }
    if (!author) {
      throw new MissingAuthorForReviewError(this.projection.id);
    }
    if (review && review.length > 500) {
      throw new ReviewTooLongError(this.projection.id, review.length);
    }
    if (!this.projection.currentEndDatetime || this.projection.currentEndDatetime.getTime() > new Date().getTime()) {
      throw new GameNotEndedError(this.projection.id);
    }
    const event = new SomeoneReviewedTheGame(author, review, stars, this.projection.id);
    eventPublisher.publish(event);
  }

  private throwErrorIfPlayerAlreadyInTeam(
    player: Player,
    targetTeam: TeamColors,
    team: TeamColors,
    teamMembers: Array<Player>,
  ): void {
    if (this.projection.players!.includes(player) && targetTeam === team && teamMembers!.includes(player)) {
      throw new PlayerAlreadyAddedError(this.projection.id, player, team);
    }
  }
}
