import { Event, EventsStore } from '..';
import { Player } from '../domains/player/player';
import { PlayerId } from '../domains/player/player-id';
import { UnknownPlayerError } from './errors';

export class PlayerListItemProjection {
  public firstName: string;
  public lastName: string;
  public avatar: string;
  public isDeleted: boolean;
  public isConfirmed: boolean;
  public gender: 'M' | 'F';
  constructor(public playerId: PlayerId) {
    this.firstName = '';
    this.lastName = '';
    this.avatar = '';
    this.isConfirmed = false;
    this.isDeleted = false;
    this.gender = 'M';
  }
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
    const list: Array<PlayerListItemProjection> = this.projections.get('list');
    if (list.filter(e => e.playerId.id === projection.playerId.id).length > 0) {
      // update
      const filteredList = list.filter(e => e.playerId.id !== projection.playerId.id);
      filteredList.push(projection);
      this.projections.set('list', filteredList);
    } else {
      // add
      list.push(projection);
      this.projections.set('list', list);
    }
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

  public getPlayerFromList(playerId: PlayerId): PlayerListItemProjection {
    return this.projections
      .get('list')
      .filter((x: PlayerListItemProjection) => x.playerId.id === playerId.id)
      .pop();
  }
}
