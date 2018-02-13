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

  public saveProjection(event: PlayerRelatedEvent) {
    // TODO what do we really need to save as projection data here ?

    // const projection = new PlayerInGameProjection(event.playerId);
    // this.playersRepository.save(projection);
  }

  public register(eventPublisher: EventPublisher) {
    eventPublisher
      .on(PlayerAddedToGameWithTeam, (event: PlayerAddedToGameWithTeam) => {
        this.saveProjection(event);
      })
      .on(PlayerChangedPositionOnGame, (event: PlayerChangedPositionOnGame) => {
        this.saveProjection(event);
      })
      .on(PlayerRemovedFromGame, (event: PlayerRemovedFromGame) => {
        this.saveProjection(event);
      })
      .on(AddedGoalFromPlayerToGame, (event: AddedGoalFromPlayerToGame) => {
        this.saveProjection(event);
      });
  }
}
