import { DecisionApplierFunction as DAF, Event, EventPublisher } from '../..';
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
  MissingInitialDateTimeError,
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
  GameDateUpdated,
} from './events';
import { GameDecisionProjection } from './game-decision-projection';
import { GameEventsApplier as GEA } from './game-events-applier';
import { GameId, PositionValue, TeamColors } from './game-id';
import { PlayerId } from '../player';

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
      .register('GameDateUpdated', GEA.applyGameDateUpdated as DAF)
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

  public addPlayerToGame(eventPublisher: EventPublisher, playerId: PlayerId, team: TeamColors): void {
    if (this.projection.isDeleted) {
      throw new GameIsDeletedError(this.projection.id);
    }
    if (this.projection.currentEndDatetime) {
      throw new GameAlreadyEndedError(this.projection.id);
    }
    this.throwErrorIfPlayerAlreadyInTeam(playerId, team, 'red', this.projection.teamRedMembers);
    this.throwErrorIfPlayerAlreadyInTeam(playerId, team, 'blue', this.projection.teamBlueMembers);
    const event = new PlayerAddedToGameWithTeam(playerId, team, this.projection.id);
    eventPublisher.publish(event);
  }

  public removePlayerFromGame(eventPublisher: EventPublisher, playerId: PlayerId): void {
    if (this.projection.isDeleted) {
      throw new GameIsDeletedError(this.projection.id);
    }
    if (this.projection.currentEndDatetime) {
      throw new GameAlreadyEndedError(this.projection.id);
    }
    if (!PlayerId.listIncludesId(this.projection.players!, playerId)) {
      throw new UnknownPlayerError(playerId);
    }

    const event = new PlayerRemovedFromGame(playerId, this.projection.id);
    eventPublisher.publish(event);
  }

  public addGoalFromPlayer(eventPublisher: EventPublisher, playerId: PlayerId): void {
    if (this.projection.isDeleted) {
      throw new GameIsDeletedError(this.projection.id);
    }
    if (!this.projection.currentStartDatetime) {
      throw new GameNotStartedError(this.projection.id);
    }
    if (this.projection.currentEndDatetime) {
      throw new GameAlreadyEndedError(this.projection.id);
    }
    if (!PlayerId.listIncludesId(this.projection.players!, playerId)) {
      throw new UnknownPlayerError(playerId);
    }
    const event = new AddedGoalFromPlayerToGame(playerId, this.projection.id);
    eventPublisher.publish(event);
  }

  public updateInitialDateTime(eventPublisher: EventPublisher, date: Date): void {
    if (!date) {
      throw new MissingInitialDateTimeError(this.projection.id);
    }
    if (this.projection.isDeleted) {
      throw new GameIsDeletedError(this.projection.id);
    }
    eventPublisher.publish(new GameDateUpdated(this.projection.id, date));
  }

  public changeUserPositionOnGame(eventPublisher: EventPublisher, playerId: PlayerId, position: PositionValue) {
    if (this.projection.isDeleted) {
      throw new GameIsDeletedError(this.projection.id);
    }
    if (!this.projection.currentStartDatetime) {
      throw new GameNotStartedError(this.projection.id);
    }
    if (this.projection.currentEndDatetime) {
      throw new GameAlreadyEndedError(this.projection.id);
    }
    if (!PlayerId.listIncludesId(this.projection.players!, playerId)) {
      throw new UnknownPlayerError(playerId);
    }

    const event = new PlayerChangedPositionOnGame(position, playerId, this.projection.id);
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
    playerId: PlayerId,
    targetTeam: TeamColors,
    team: TeamColors,
    teamMembers: Array<PlayerId>,
  ): void {
    if (PlayerId.listIncludesId(this.projection.players!, playerId) && targetTeam === team && PlayerId.listIncludesId(teamMembers!, playerId)) {
      throw new PlayerAlreadyAddedError(this.projection.id, playerId, team);
    }
  }

}
