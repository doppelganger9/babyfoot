import { Event, EventsStore } from '..';
import { Player } from '../domains/player/player';
import { PlayerId } from '../domains/player/player-id';
import { UnknownPlayerError } from './errors';

export class PlayerListItemProjection {
  constructor(public playerId: PlayerId) {}
  // TODO later... inspiratin from GameListItemProjection
}

/**
 * This class stores all Player projections.
 * It basically recreates Aggregates from the stores events in the delegate EventsStore by filtering by ID.
 * It can also store other projections in a Map, with methods to access these simple projections.
 */
export class PlayersRepository {
  constructor(private eventsStore: EventsStore = new EventsStore(), private projections: Map<string, any> = new Map<string, any>()) {
    this.projections.set('list', new Array<PlayerListItemProjection>());
  }

  /**
   * returns all events for a given PlayerId.
   * @param PlayerId filter
   */
  public getAllEvents(playerId: PlayerId): Array<Event> {
    const events: Array<Event> = this.eventsStore.getEventsOfAggregate(playerId);
    if (!events.length) {
      throw new UnknownPlayerError(playerId);
    }

    return events;
  }

  public save(projection: PlayerListItemProjection): void {
    this.projections.get('list').push(projection);
  }

  /**
   * returns the Player Aggregate for the given id.
   * The Player Aggregate is created from events (event sourcing).
   * @param PlayerId filter
   */
  public getPlayer(playerId: PlayerId): Player {
    const events: Array<Event> = this.getAllEvents(playerId);
    return new Player(events);
  }

  /**
   * returns all the Player Aggregates.
   * The Player Aggregate list is created from all events (event sourcing).
   */
  public getPlayers(): Array<PlayerListItemProjection> {
    return this.projections.get('list');
  }
}
