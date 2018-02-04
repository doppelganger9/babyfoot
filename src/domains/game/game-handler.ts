import { Game } from '.';
import {
  GamesRepository,
  Event,
  EventPublisher,
  GameCreated
} from '../..';
import { GameListItemProjection } from './game-list-item-projection';

/**
 * This class is used to map events to a projections repository.
 *
 * It listens for Game events and creates/updates projections.
 *
 * The persistence responsibility is on a dedicated Repository class
 * which is injected in this class' constructor.
 */
export class GameHandler {

  constructor(private gamesRepository: GamesRepository) {}

  public saveProjection(event: GameCreated) {
    const projection = new GameListItemProjection(
      event.gameId,
      event.timestamp,
    );
    this.gamesRepository.save(projection);
  }

  public register(eventPublisher: EventPublisher) {
    eventPublisher
      .on(GameCreated, (event: GameCreated) => {
        this.saveProjection(event);
      });
  }
}
