import {
  AddedGoalFromPlayerToGame,
  EventPublisher,
  PlayerAddedToGameWithTeam,
  PlayerChangedPositionOnGame,
  PlayerRemovedFromGame,
} from '../..';
import { PlayersRepository } from '../../infrastructure/player-repository';

export type PlayerRelatedEvent =
  | PlayerAddedToGameWithTeam
  | PlayerChangedPositionOnGame
  | PlayerRemovedFromGame
  | AddedGoalFromPlayerToGame;

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

  public updateProjection(event: PlayerRelatedEvent) {
    // TODO what do we really need to save as projection data here ?

    // const projection = new PlayerInGameProjection(event.playerId);
    // this.playersRepository.save(projection);
    const player = this.playersRepository.getPlayer(event.gameId);
    player.projection.apply(event);
  }

  public register(eventPublisher: EventPublisher) {
    eventPublisher
      .on(PlayerAddedToGameWithTeam, (event: PlayerAddedToGameWithTeam) => {
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
