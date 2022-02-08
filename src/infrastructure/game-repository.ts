import { BFEvent, BFEventsStore } from '..';
import { Game } from '../domains/game';
import { GameId } from '../domains/game';
import { GameListItemProjection } from '../domains/game/game-list-item-projection';
import { UnknownGameError } from './errors';

/**
 * This class stores all Game projections.
 * It basically recreates Aggregates from the stores events in the delegate BFEventsStore by filtering by ID.
 * It can also store other projections in a Map, with methods to access these simple projections.
 */
export class GamesRepository {
  constructor(private eventsStore: BFEventsStore, private projections: Map<string, any> = new Map<string, any>()) {
    this.projections.set('list', new Array<GameListItemProjection>());
  }

  /**
   * returns all events for a given GameId.
   * @param gameId filter
   */
  public getAllEvents(gameId: GameId): Array<BFEvent> {
    const events: Array<BFEvent> = this.eventsStore.getEventsOfAggregate(gameId);
    if (!events.length) {
      throw new UnknownGameError(gameId);
    }

    return events;
  }

  public save(projection: GameListItemProjection): void {
    this.projections.get('list').push(projection);
  }

  /**
   * returns the Game Aggregate for the given id.
   * The Game Aggregate is created from events (event sourcing).
   * @param gameId filter
   */
  public getGame(gameId: GameId): Game {
    const events: Array<BFEvent> = this.getAllEvents(gameId);
    return new Game(events);
  }

  /**
   * returns all the Game Aggregates.
   * The Game Aggregate list is created from all events (event sourcing).
   */
  public getGames(): Array<GameListItemProjection> {
    return this.projections.get('list');
  }
}
