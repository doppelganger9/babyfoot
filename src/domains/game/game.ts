import { DecisionApplierFunction, DecisionProjection, Event, EventPublisher } from '../..';
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
import { GameId, Player, PositionValue, TeamColors } from './game-id';
import { GameEventsApplier } from './game-events-applier';


/************** VALUE TYPES **************/
// see errors/*.ts
// se game-id.ts
/************** EVENTS **************/
// see events.ts
/************** AGGREGATES **************/
export class Game {
  projection: DecisionProjection;

  // STATE = PROJECTIONS
  get id(): GameId {
    return this.projection.data.get('id');
  }

  get isDeleted(): boolean {
    return this.projection.data.get('isDeleted');
  }

  get initialDatetime(): Date {
    return this.projection.data.get('initialDatetime');
  }

  get currentStartDatetime(): Date {
    return this.projection.data.get('currentStartDatetime');
  }

  get currentEndDatetime(): Date {
    return this.projection.data.get('currentEndDatetime');
  }

  get duration(): number {
    return this.projection.data.get('duration');
  }

  get pointsTeamRed(): number {
    return this.projection.data.get('pointsTeamRed');
  }

  get pointsTeamBlue(): number {
    return this.projection.data.get('pointsTeamBlue');
  }

  get winner(): TeamColors {
    return this.projection.data.get('winner');
  }

  get teamRedMembers(): Array<string> {
    return this.projection.data.get('teamRedMembers');
  }

  get teamBlueMembers(): Array<string> {
    return this.projection.data.get('teamBlueMembers');
  }

  get players(): Array<string> {
    return this.projection.data.get('players');
  }

  constructor(events: Array<Event> | Event) {
    this.projection = new DecisionProjection()
      .register('GameCreated', GameEventsApplier.applyGameCreated as DecisionApplierFunction)
      .register('GameDeleted', GameEventsApplier.applyGameDeleted as DecisionApplierFunction)
      .register('GameStarted', GameEventsApplier.applyGameStarted as DecisionApplierFunction)
      .register('GameEnded', GameEventsApplier.applyGameEnded as DecisionApplierFunction)
      .register('PlayerRemovedFromGame', GameEventsApplier.applyPlayerRemovedFromGame as DecisionApplierFunction)
      .register('PlayerAddedToGameWithTeam', GameEventsApplier.applyPlayerAddedToGameWithTeam as DecisionApplierFunction)
      .register('AddedGoalFromPlayerToGame', GameEventsApplier.applyAddedGoalFromPlayerToGame as DecisionApplierFunction)
      .register('PlayerChangedPositionOnGame', GameEventsApplier.applyPlayerChangedPositionOnGame as DecisionApplierFunction)
      .register('SomeoneAddedACommentOnGame', GameEventsApplier.applySomeoneAddedACommentOnGame as DecisionApplierFunction)
      .register('SomeoneReviewedTheGame', GameEventsApplier.applySomeoneReviewedTheGame as DecisionApplierFunction)
      .apply(events);
  }

  /************** COMMANDS **************/

  static createGame(eventPublisher: EventPublisher, id: string): void {
    const gameId = new GameId(id);
    // TODO: check if game already exists with this ID ?
    eventPublisher.publish(new GameCreated(gameId));
  }

  deleteGame(eventPublisher: EventPublisher): void {
    if (this.isDeleted) {
      return;
    }
    eventPublisher.publish(new GameDeleted(this.id));
  }

  startGame(eventPublisher: EventPublisher) {
    if (this.isDeleted) throw new GameIsDeletedError(this.id);
    if (this.currentEndDatetime) throw new GameAlreadyEndedError(this.id);
    if (this.currentStartDatetime) throw new GameAlreadyStartedError(this.id);
    const event = new GameStarted(undefined, this.id);
    eventPublisher.publish(event);
  }

  endGame(eventPublisher: EventPublisher) {
    if (this.isDeleted) throw new GameIsDeletedError(this.id);
    if (!this.currentStartDatetime) throw new GameNotStartedError(this.id);
    if (this.currentEndDatetime) throw new GameAlreadyEndedError(this.id);
    const event = new GameEnded(undefined, this.id);
    eventPublisher.publish(event);
  }

  private throwErrorIfPlayerAlreadyInTeam(player: Player, targetTeam: TeamColors, team: TeamColors, teamMembers: Array<Player>): void {
    if (
      this.players!.includes(player) &&
      targetTeam === team &&
      teamMembers!.includes(player)
    )
    throw new PlayerAlreadyAddedError(this.id, player, team);
  }

  addPlayerToGame(
    eventPublisher: EventPublisher,
    player: Player,
    team: TeamColors
  ): void {
    if (this.isDeleted) throw new GameIsDeletedError(this.id);
    if (this.currentEndDatetime) throw new GameAlreadyEndedError(this.id);
    this.throwErrorIfPlayerAlreadyInTeam(player, team, 'red', this.teamRedMembers);
    this.throwErrorIfPlayerAlreadyInTeam(player, team, 'blue', this.teamBlueMembers);
    const event = new PlayerAddedToGameWithTeam(player, team, this.id);
    eventPublisher.publish(event);
  }

  removePlayerFromGame(eventPublisher: EventPublisher, player: Player): void {
    if (this.isDeleted) throw new GameIsDeletedError(this.id);
    if (this.currentEndDatetime) throw new GameAlreadyEndedError(this.id);
    if (!this.players!.includes(player)) throw new UnknownPlayerError(player);

    const event = new PlayerRemovedFromGame(player, this.id);
    eventPublisher.publish(event);
  }

  addGoalFromPlayer(eventPublisher: EventPublisher, player: Player): void {
    if (this.isDeleted) throw new GameIsDeletedError(this.id);
    if (!this.currentStartDatetime) throw new GameNotStartedError(this.id);
    if (this.currentEndDatetime) throw new GameAlreadyEndedError(this.id);
    if (!this.players!.includes(player)) throw new UnknownPlayerError(player);
    const event = new AddedGoalFromPlayerToGame(player, this.id);
    eventPublisher.publish(event);
  }

  updateGame(eventPublisher: EventPublisher): void {
    throw new Error('not implemented');
  }

  changeUserPositionOnGame(
    eventPublisher: EventPublisher,
    player: string,
    position: PositionValue
  ) {
    if (this.isDeleted) throw new GameIsDeletedError(this.id);
    if (!this.currentStartDatetime) throw new GameNotStartedError(this.id);
    if (this.currentEndDatetime) throw new GameAlreadyEndedError(this.id);
    if (!this.players!.includes(player)) throw new UnknownPlayerError(player);

    const event = new PlayerChangedPositionOnGame(position, player, this.id);
    eventPublisher.publish(event);
  }
  commentGame(eventPublisher: EventPublisher, comment: string, author: string) {
    if (this.isDeleted) throw new GameIsDeletedError(this.id);
    if (!this.currentStartDatetime) throw new GameNotStartedError(this.id);
    if (this.currentEndDatetime) throw new GameAlreadyEndedError(this.id);

    const event = new SomeoneAddedACommentOnGame(author, comment, this.id);
    eventPublisher.publish(event);
  }
  reviewGame(
    eventPublisher: EventPublisher,
    review: string,
    stars: number,
    author: string
  ) {
    if (this.isDeleted) throw new GameIsDeletedError(this.id);
    if (stars <= 0) throw new IncorrectReviewStarsError(this.id, stars);
    if (stars > 5) throw new IncorrectReviewStarsError(this.id, stars);
    if (!author) throw new MissingAuthorForReviewError(this.id);
    if (review && review.length > 500)
      throw new ReviewTooLongError(this.id, review.length);
    if (
      !this.currentEndDatetime ||
      this.currentEndDatetime.getTime() > new Date().getTime()
    )
      throw new GameNotEndedError(this.id);

    const event = new SomeoneReviewedTheGame(author, review, stars, this.id);
    eventPublisher.publish(event);
  }
}
