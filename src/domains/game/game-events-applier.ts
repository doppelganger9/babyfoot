import { DecisionProjection } from '../..';
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
  SomeoneReviewedTheGame
} from './events';
import { TeamColors } from './game-id';

export class GameEventsApplier {

  /*** AGGREGATE CONSTRUCTOR EVENT APPLIERS ***/
  public static applyGameCreated(
    this: DecisionProjection,
    event: GameCreated
  ): void {
    // BEWARE: this is bound to the DecisionProjection object, not the Game instance.
    this.data.set('id', event.gameId);
    this.data.set('isDeleted', false);
    this.data.set('players', []);
    this.data.set('teamBlueMembers', []);
    this.data.set('teamRedMembers', []);
    this.data.set('initialDatetime', new Date());
  }

  public static applyGameDeleted(
    this: DecisionProjection,
    event: GameDeleted
  ): void {
    this.data.set('isDeleted', true);
  }

  public static applyGameStarted(
    this: DecisionProjection,
    event: GameStarted
  ): void {
    this.data.set('currentStartDatetime', event.date);
    this.data.set('pointsTeamRed', 0);
    this.data.set('pointsTeamBlue', 0);
  }

  public static applyGameEnded(
    this: DecisionProjection,
    event: GameEnded
  ): void {
    this.data.set('currentEndDatetime', event.date);
    this.data.set(
      'duration',
      this.data.get('currentEndDatetime').getTime() -
        this.data.get('currentStartDatetime').getTime()
    );
  }

  public static applyPlayerRemovedFromGame(
    this: DecisionProjection,
    event: PlayerRemovedFromGame
  ): void {
    this.data.set(
      'players',
      this.data.get('players').filter((it: string) => it !== event.player)
    );
    GameEventsApplier.removePlayerIfPresentFromTeamInProjection(
      this,
      'blue',
      event
    );
    GameEventsApplier.removePlayerIfPresentFromTeamInProjection(
      this,
      'red',
      event
    );
  }

  public static removePlayerIfPresentFromTeamInProjection(
    dp: DecisionProjection,
    color: TeamColors,
    event: PlayerRemovedFromGame
  ) {
    const team = GameEventsApplier.teamKey(color);
    if (dp.data.get(team).includes(event.player)) {
      dp.data.set(
        team,
        dp.data.get(team).filter((it: string) => it !== event.player)
      );
    }
  }

  public static applyPlayerAddedToGameWithTeam(
    this: DecisionProjection,
    event: PlayerAddedToGameWithTeam
  ): void {
    if (!this.data.get('players').includes(event.player)) {
      this.data.get('players').push(event.player);
    }
    GameEventsApplier.applyListedPlayerAddedToGameForTeam(this, event, 'red');
    GameEventsApplier.applyListedPlayerAddedToGameForTeam(this, event, 'blue');
  }

  public static applyAddedGoalFromPlayerToGame(
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

  public static applyPlayerChangedPositionOnGame(
    this: DecisionProjection,
    event: PlayerChangedPositionOnGame
  ): void {
    console.error('not implemented yet');
  }

  public static applySomeoneAddedACommentOnGame(
    this: DecisionProjection,
    event: SomeoneAddedACommentOnGame
  ): void {
    console.error('not implemented yet');
  }

  public static applySomeoneReviewedTheGame(
    this: DecisionProjection,
    event: SomeoneReviewedTheGame
  ): void {
    console.error('not implemented yet');
  }

private static teamKey(color: TeamColors): string {
    return `team${color.substring(0, 1).toUpperCase()}${color
      .substring(1)
      .toLowerCase()}Members`;
  }

  private static applyListedPlayerAddedToGameForTeam(
    dp: DecisionProjection,
    event: any,
    team: TeamColors
  ) {
    const otherTeam: TeamColors = team === 'red' ? 'blue' : 'red';
    if (event.team === team) {
      if (
        !dp.data.get(GameEventsApplier.teamKey(team)).includes(event.player)
      ) {
        dp.data.get(GameEventsApplier.teamKey(team)).push(event.player);
      }
      GameEventsApplier.removePlayerIfPresentFromTeamInProjection(
        dp,
        otherTeam,
        event
      );
    }
  }
}
