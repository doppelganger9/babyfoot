import { DecisionApplierFunction, DecisionProjection, BFEvent } from '../..';
import { GameId, TeamColors } from './game-id';
import { Player, PlayerId } from '../player';

export class GameDecisionProjection {
  private projection: DecisionProjection; // composition not inheritance
  constructor(
    data?: Map<string, any>,
    handlers?: Map<string, (event: BFEvent<any>) => void>
  ) {
    this.projection = new DecisionProjection(data, handlers);
  }

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

  get teamRedMembers(): Array<PlayerId> {
    return this.projection.data.get('teamRedMembers');
  }

  get teamBlueMembers(): Array<PlayerId> {
    return this.projection.data.get('teamBlueMembers');
  }

  get players(): Array<PlayerId> {
    return this.projection.data.get('players');
  }

  public register(
    eventType: string,
    action: DecisionApplierFunction
  ): GameDecisionProjection {
    this.projection.register(eventType, action);
    return this;
  }

  public apply(events: Array<BFEvent> | BFEvent): GameDecisionProjection {
    this.projection.apply(events);
    return this;
  }
}
