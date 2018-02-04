import { Event, EventsStore } from '..';
import { Game } from '../domains/game/game';
import { GameId } from '../domains/game/game-id';
import { GameListItemProjection } from '../domains/game/game-list-item-projection';
import { UnknownGameError } from './errors';

/**
 * This class stores all Game projections.
 * It basically recreates Aggregates from the stores events in the delegate EventsStore by filtering by ID.
 * It can also store other projections in a Map, with methods to access these simple projections.
 */
export class GamesRepository {
  constructor(
    private eventsStore: EventsStore,
    private projections: Map<string, any> = new Map<string, any>()
  ) {
    this.projections.set('list', new Array<GameListItemProjection>());
  }

  /**
   * returns all events for a given GameId.
   * @param gameId filter
   */
  getAllEvents(gameId: GameId): Array<Event> {
    var events: Array<Event> = this.eventsStore.getEventsOfAggregate(gameId);
    if (!events.length) {
      throw new UnknownGameError(gameId);
    }

    return events;
  }

  save(projection: GameListItemProjection): void {
    this.projections.get('list').push(projection);
  }

  /**
   * returns the Game Aggregate for the given id.
   * The Game Aggregate is created from events (event sourcing).
   * @param gameId filter
   */
  getGame(gameId: GameId): Game {
    var events: Event[] = this.getAllEvents(gameId);
    return new Game(events);
  }

  /**
   * returns all the Game Aggregates.
   * The Game Aggregate list is created from all events (event sourcing).
   */
  getGames(): Array<GameListItemProjection> {
    return this.projections.get('list');
  }
}
