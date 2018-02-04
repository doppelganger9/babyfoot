import {
  TeamColors,
  Player,
  PositionValue,
  GameId
} from './game-id';
import {
  Event,
  ValueType,
  generateUUID,
  DecisionProjection,
  DecisionApplierFunction,
  EventPublisher,
} from '../..';
import {
  GameIsDeletedError,
  GameAlreadyStartedError,
  GameAlreadyEndedError,
  GameNotStartedError,
  PlayerAlreadyAddedError,
  UnknownPlayerError,
  MissingAuthorForReviewError,
  ReviewTooLongError,
  GameNotEndedError,
  IncorrectReviewStarsError,
} from './errors';
import {
  GameCreated,
  GameDeleted,
  GameEnded,
  GameStarted,
  GameUpdated,
  PlayerAddedToGameWithTeam,
  PlayerRemovedFromGame,
  PlayerChangedPositionOnGame,
  SomeoneReviewedTheGame,
  SomeoneAddedACommentOnGame,
  AddedGoalFromPlayerToGame
} from './events';

/*** AGGREGATE CONSTRUCTOR EVENT APPLIERS ***/
function applyGameCreated(this: DecisionProjection, event: GameCreated): void {
  // BEWARE: this is bound to the DecisionProjection object, not the Game instance.
  this.data.set('id', event.gameId);
  this.data.set('isDeleted', false);
  this.data.set('players', []);
  this.data.set('teamBlueMembers', []);
  this.data.set('teamRedMembers', []);
}

function applyGameDeleted(this: DecisionProjection, event: GameDeleted): void {
  this.data.set('isDeleted', true);
}

function applyGameStarted(this: DecisionProjection, event: GameStarted): void {
  this.data.set('currentStartDatetime', event.date);
  this.data.set('pointsTeamRed', 0);
  this.data.set('pointsTeamBlue', 0);
}

function applyGameEnded(this: DecisionProjection, event: GameEnded): void {
  this.data.set('currentEndDatetime', event.date);
  this.data.set(
    'duration',
    this.data.get('currentEndDatetime').getTime() -
      this.data.get('currentStartDatetime').getTime()
  );
}

function applyPlayerRemovedFromGame(
  this: DecisionProjection,
  event: PlayerRemovedFromGame
): void {
  this.data.set(
    'players',
    this.data.get('players').filter((it: string) => it !== event.player)
  );
  removePlayerIfPresentFromTeamInProjection(this, 'blue', event);
  removePlayerIfPresentFromTeamInProjection(this, 'red', event);
}

function removePlayerIfPresentFromTeamInProjection(
  dp: DecisionProjection,
  color: TeamColors,
  event: PlayerRemovedFromGame
) {
  const team =
    'team' +
    color.substring(0, 1).toUpperCase() +
    color.substring(1).toLowerCase() +
    'Members';
  if (dp.data.get(team).includes(event.player)) {
    dp.data.set(
      team,
      dp.data.get(team).filter((it: string) => it !== event.player)
    );
  }
}

function applyPlayerAddedToGameWithTeam(
  this: DecisionProjection,
  event: PlayerAddedToGameWithTeam
): void {
  if (!this.data.get('players').includes(event.player)) {
    this.data.get('players').push(event.player);
  }
  if (event.team === 'red') {
    if (!this.data.get('teamRedMembers').includes(event.player)) {
      this.data.get('teamRedMembers').push(event.player);
    }
    removePlayerIfPresentFromTeamInProjection(this, 'blue', event);
  } else {
    if (!this.data.get('teamBlueMembers').includes(event.player)) {
      this.data.get('teamBlueMembers').push(event.player);
    }
    removePlayerIfPresentFromTeamInProjection(this, 'red', event);
  }
}

function applyAddedGoalFromPlayerToGame(
  this: DecisionProjection,
  event: AddedGoalFromPlayerToGame
): void {
  if (this.data.get('teamRedMembers').includes(event.player)) {
    this.data.set('pointsTeamRed', this.data.get('pointsTeamRed') + 1);
  } else {
    this.data.set('pointsTeamBlue', this.data.get('pointsTeamBlue') + 1);
  }
  this.data.set(
    'winner',
    this.data.get('pointsTeamRed') > this.data.get('pointsTeamBlue')
      ? 'red'
      : this.data.get('pointsTeamRed') === this.data.get('pointsTeamBlue')
        ? undefined
        : 'blue'
  );
}

function applyPlayerChangedPositionOnGame(
  this: DecisionProjection,
  event: PlayerChangedPositionOnGame
): void {
  console.error('not implemented yet');
}

function applySomeoneAddedACommentOnGame(
  this: DecisionProjection,
  event: SomeoneAddedACommentOnGame
): void {
  console.error('not implemented yet');
}

function applySomeoneReviewedTheGame(
  this: DecisionProjection,
  event: SomeoneReviewedTheGame
): void {
  console.error('not implemented yet');
}

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
      .register('GameCreated', applyGameCreated as DecisionApplierFunction)
      .register('GameDeleted', applyGameDeleted as DecisionApplierFunction)
      .register('GameStarted', applyGameStarted as DecisionApplierFunction)
      .register('GameEnded', applyGameEnded as DecisionApplierFunction)
      .register('PlayerRemovedFromGame', applyPlayerRemovedFromGame as DecisionApplierFunction)
      .register('PlayerAddedToGameWithTeam', applyPlayerAddedToGameWithTeam as DecisionApplierFunction)
      .register('AddedGoalFromPlayerToGame', applyAddedGoalFromPlayerToGame as DecisionApplierFunction)
      .register('PlayerChangedPositionOnGame', applyPlayerChangedPositionOnGame as DecisionApplierFunction)
      .register('SomeoneAddedACommentOnGame', applySomeoneAddedACommentOnGame as DecisionApplierFunction)
      .register('SomeoneReviewedTheGame', applySomeoneReviewedTheGame as DecisionApplierFunction)
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

  addPlayerToGame(
    eventPublisher: EventPublisher,
    player: Player,
    team: TeamColors
  ): void {
    if (this.isDeleted) throw new GameIsDeletedError(this.id);
    if (this.currentEndDatetime) throw new GameAlreadyEndedError(this.id);
    if (
      this.players!.includes(player) &&
      team === 'red' &&
      this.teamRedMembers!.includes(player)
    )
      throw new PlayerAlreadyAddedError(this.id, player, 'red');
    if (
      this.players!.includes(player) &&
      team === 'blue' &&
      this.teamBlueMembers!.includes(player)
    )
      throw new PlayerAlreadyAddedError(this.id, player, 'blue');

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
