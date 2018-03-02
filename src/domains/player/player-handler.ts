import {
  AddedGoalFromPlayerToGame,
  EventPublisher,
  PlayerAddedToGameWithTeam,
  PlayerChangedPositionOnGame,
  PlayerRemovedFromGame,
} from '../..';
import { PlayersRepository, PlayerListItemProjection } from '../../infrastructure/player-repository';
import { PlayerCreated, PlayerUpdated, PlayerDeleted, PlayerConfirmedAccount, PlayerEvent } from '.';

export type PlayerRelatedEvent =
  | PlayerAddedToGameWithTeam
  | PlayerChangedPositionOnGame
  | PlayerRemovedFromGame
  | AddedGoalFromPlayerToGame
  ;

/**
 * This class is used to map events to a projections repository.
 *
 * It listens for Player related events and creates/updates projections.
 *
 * The persistence responsibility is on a dedicated Repository class
 * which is injected in this class' constructor.
 */
export class PlayerHandler {
  constructor(public playersRepository: PlayersRepository) {}

  public updateProjection(event: PlayerRelatedEvent | PlayerEvent) {
    const player = this.playersRepository.getPlayer(event.playerId);

    const projection = new PlayerListItemProjection(event.playerId);
    projection.avatar = player.projection.avatar;
    projection.firstName = player.projection.firstName;
    projection.lastName = player.projection.lastName;
    projection.isConfirmed = player.projection.isAccountConfirmed;
    projection.isDeleted = player.projection.isDeleted;
    projection.gender = player.projection.gender;

    this.playersRepository.save(projection);

    // TODO maybe apply events not already applied (PlayerRelatedEvents) ?
    // player.projection.apply(event);
  }

  public register(eventPublisher: EventPublisher) {
    eventPublisher
      .on(PlayerCreated, (event: PlayerCreated) => {
        this.updateProjection(event);
      })
      .on(PlayerUpdated, (event: PlayerUpdated) => {
        this.updateProjection(event);
      })
      .on(PlayerDeleted, (event: PlayerDeleted) => {
        this.updateProjection(event);
      })
      .on(PlayerConfirmedAccount, (event: PlayerConfirmedAccount) => {
        this.updateProjection(event);
      })
      .on(PlayerChangedPositionOnGame, (event: PlayerChangedPositionOnGame) => {
        this.updateProjection(event);
      })
      .on(PlayerRemovedFromGame, (event: PlayerRemovedFromGame) => {
        this.updateProjection(event);
      })
      .on(AddedGoalFromPlayerToGame, (event: AddedGoalFromPlayerToGame) => {
        this.updateProjection(event);
      });
  }
}
